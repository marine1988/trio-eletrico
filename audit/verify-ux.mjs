// audit/verify-ux.mjs — verificação decisiva de sobreposições em ESTADOS REAIS de scroll
// (o screenshot de secção pinta os fixos por cima do recorte -> artefacto; aqui mede-se a verdade)
// Uso: node audit/verify-ux.mjs [base] [outJson]
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:3000';
const OUT = process.argv[3] || 'audit/ux-verify.json';
const SHOTS = 'audit/screens-ux';
fs.mkdirSync(SHOTS, { recursive: true });

const VPS = [
  { n: '320', w: 320, h: 568 },
  { n: '375', w: 375, h: 667 },
  { n: '768', w: 768, h: 1024 },
  { n: '1280', w: 1280, h: 800 },
];
const PAGES = [{ n: 'home', url: '/' }, { n: 'contacto', url: '/contacto.html' }];

const MEASURE = () => {
  const vis = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  };
  const name = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (typeof el.className === 'string' && el.className.trim()) s += '.' + el.className.trim().split(/\s+/)[0];
    return s;
  };
  const vh = window.innerHeight;
  const vw = document.documentElement.clientWidth;

  // overlays fixos visíveis
  const overlays = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' || !vis(el)) continue;
    if (cs.pointerEvents === 'none' && parseFloat(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) continue;
    overlays.push({ el: name(el), rect: { x: r.x, y: r.y, w: r.width, h: r.height, bottom: r.bottom, right: r.right } });
  }

  const coveredHalf = [];   // elementos com texto >=50% cobertos por um overlay fixo
  const blockedControls = []; // controlos totalmente visíveis cujo centro está coberto
  const essential = 'h1,h2,h3,h4,p,li,a,button,input,select,textarea,span,strong,label';
  const cta = overlays.find((o) => o.el.includes('sticky-cta'));
  const header = overlays.find((o) => o.el.includes('header'));
  const bandTop = header ? header.rect.bottom : 0;
  const bandBottom = cta ? cta.rect.y : vh;

  for (const el of document.querySelectorAll(essential)) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) continue; // fora do ecrã
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed') continue;
    const rect = { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom };
    const txt = (el.textContent || '').trim();
    // área coberta pelo overlay mais intrusivo (ignorando overlays que CONTÊM o elemento)
    for (const ov of overlays) {
      const elIsInsideOverlay = (() => {
        let p = el.parentElement;
        while (p) { if (ov.el.split('.')[0] === p.tagName.toLowerCase() && (ov.el.includes('#' + p.id) || ov.el.includes('.' + (p.className || '').trim().split(/\s+/)[0]))) return true; p = p.parentElement; }
        return false;
      })();
      if (elIsInsideOverlay) continue;
      const ox = Math.max(0, Math.min(rect.right, ov.rect.right) - Math.max(rect.x, ov.rect.x));
      const oy = Math.max(0, Math.min(rect.bottom, ov.rect.bottom) - Math.max(rect.y, ov.rect.y));
      const inter = ox * oy;
      const area = rect.w * rect.h;
      if (!area || !inter) continue;
      if (inter / area >= 0.5) {
        coveredHalf.push({ el: name(el), by: ov.el, ratio: +(inter / area).toFixed(2), text: txt.slice(0, 32) });
        break;
      }
    }
    // controlos TOTALMENTE visíveis na banda útil: o centro responde a outro elemento?
    if (['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) {
      const fullyUsable = rect.top >= bandTop - 1 && rect.bottom <= bandBottom + 1;
      if (!fullyUsable) continue;
      const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
      const hit = document.elementFromPoint(cx, cy);
      if (hit && !(hit === el || el.contains(hit))) {
        blockedControls.push({ el: name(el), by: name(hit), text: txt.slice(0, 24), cy: Math.round(cy) });
      }
    }
  }

  // cabeçalhos: visíveis abaixo do header fixo? (ignora os que estão dentro do header)
  let headingUnderHeader = [];
  const headerEl = document.querySelector('header');
  if (headerEl) {
    const hr = headerEl.getBoundingClientRect();
    if (getComputedStyle(headerEl).position === 'fixed') {
      for (const h of document.querySelectorAll('main h1, main h2, main section h2')) {
        if (!vis(h)) continue;
        const r = h.getBoundingClientRect();
        if (r.bottom < hr.bottom || r.top > vh) continue; // já passou o header / fora do ecrã
        if (r.top < hr.bottom - 2) headingUnderHeader.push({ el: name(h), top: Math.round(r.top), headerBottom: Math.round(hr.bottom) });
      }
    }
  }
  return { scrollY: Math.round(window.scrollY), viewport: { vw, vh }, overlays, coveredHalf, blockedControls, headingUnderHeader };
};

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const report = { base: BASE, generatedAt: new Date().toISOString(), states: [] };

for (const vp of VPS) {
  for (const pg of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.w < 768, hasTouch: vp.w < 768 });
    const page = await ctx.newPage();
    await page.goto(BASE + pg.url, { waitUntil: 'load' });
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach((e) => e.classList.add('revealed'));
      document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
    });
    await page.waitForTimeout(800);

    // âncoras internas da própria página
    const anchors = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"], a[href*=".html#"]')]
      .map((a) => a.getAttribute('href')).filter((h) => h && h.includes('#') && h.split('#')[1]).map((h) => h.split('#')[1]));
    const uniq = [...new Set(anchors)];

    const states = [{ label: 'top', action: null }, ...uniq.map((id) => ({ label: 'anchor#' + id, action: id })), { label: 'bottom', action: 'bottom' }];

    for (const st of states) {
      if (st.action === 'bottom') {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      } else if (st.action) {
        const ok = await page.evaluate((id) => {
          const t = document.getElementById(id);
          if (!t) return false;
          t.scrollIntoView({ behavior: 'instant', block: 'start' }); // simula o salto de âncora
          return true;
        }, st.action);
        if (!ok) continue;
      }
      await page.waitForTimeout(350);
      const m = await page.evaluate(MEASURE);
      const entry = { page: pg.n, vp: vp.n, state: st.label, ...m };
      report.states.push(entry);
      const problems = m.coveredHalf.length + m.blockedControls.length + m.headingUnderHeader.length;
      if (problems) {
        console.log(`${pg.n} ${vp.n} ${st.label.padEnd(18)} problemas=${problems} coveredHalf=${m.coveredHalf.length} blockedControls=${m.blockedControls.length} headingUnderHeader=${m.headingUnderHeader.length}`);
      }
      if (['top', 'anchor#faq', 'anchor#contacto', 'bottom'].includes(st.label)) {
        const f = `${SHOTS}/${pg.n}-${vp.n}-${st.label.replace('#', '_')}.png`;
        await page.screenshot({ path: f });
        entry.shot = f;
      }
    }
    await ctx.close();
  }
}
await browser.close();

// agregado
const agg = {
  states: report.states.length,
  totalCoveredHalf: report.states.reduce((a, s) => a + s.coveredHalf.length, 0),
  totalBlockedControls: report.states.reduce((a, s) => a + s.blockedControls.length, 0),
  totalHeadingUnderHeader: report.states.reduce((a, s) => a + s.headingUnderHeader.length, 0),
};
report.aggregate = agg;
fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
console.log('\n== AGREGADO ==');
console.log(JSON.stringify(agg, null, 1));
console.log(`\nJSON -> ${OUT} | screenshots -> ${SHOTS}/`);

// detalhe do que falhou (para accao imediata)
for (const s of report.states) {
  if (s.coveredHalf.length === 0 && s.blockedControls.length === 0 && s.headingUnderHeader.length === 0) continue;
  console.log(`\n--- ${s.page} ${s.vp} ${s.state} (scrollY=${s.scrollY})`);
  for (const x of s.headingUnderHeader.slice(0, 3)) console.log(`   heading sob header: ${x.el} top=${x.top} (header acaba ${x.headerBottom})`);
  for (const x of s.coveredHalf.slice(0, 4)) console.log(`   ${x.ratio * 100}% coberto: ${x.el} por ${x.by} [${x.text}]`);
  for (const x of s.blockedControls.slice(0, 4)) console.log(`   controlo bloqueado: ${x.el} por ${x.by} [${x.text}] cy=${x.cy}`);
}
process.exit(agg.totalCoveredHalf + agg.totalBlockedControls + agg.totalHeadingUnderHeader === 0 ? 0 : 1);
