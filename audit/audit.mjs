// audit/audit.mjs — auditoria automática multi-viewport do site Trio Elétrico
// Uso: node audit/audit.mjs [baseUrl]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2] || 'http://localhost:3000';
let VIEWPORTS = [
  { name: 'mob-320', width: 320, height: 568 },
  { name: 'mob-360', width: 360, height: 640 },
  { name: 'mob-375', width: 375, height: 667 },
  { name: 'mob-390', width: 390, height: 844 },
  { name: 'mob-414', width: 414, height: 896 },
  { name: 'mob-600', width: 600, height: 900 },
  { name: 'tab-768', width: 768, height: 1024 },
  { name: 'tab-769', width: 769, height: 1024 },
  { name: 'tab-820', width: 820, height: 1180 },
  { name: 'tab-900', width: 900, height: 1000 },
  { name: 'tab-1024', width: 1024, height: 768 },
  { name: 'desk-1280', width: 1280, height: 800 },
  { name: 'desk-1440', width: 1440, height: 900 },
];
// viewports extra: node audit/audit.mjs <base> "480x800,600x900" --tag=extra
const extra = process.argv[3];
let suffix = '';
if (extra) {
  const tag = (process.argv.find((a) => a.startsWith('--tag=')) || '--tag=extra').split('=')[1];
  suffix = '-' + tag;
  VIEWPORTS = extra.split(',').map((s) => {
    const [w, h] = s.split('x').map(Number);
    return { name: `w${w}${suffix}`, width: w, height: h };
  });
}
const PAGES = [
  { name: 'home', url: '/' },
  { name: 'contacto', url: '/contacto.html' },
];
const PROBE = () => {
  const R = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) };
  };
  const sel = (el) => {
    if (!el || el.nodeType !== 1) return '?';
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      const cls = el.className.trim().split(/\s+/).slice(0, 3).join('.');
      if (cls) s += '.' + cls;
    }
    const p = el.parentElement;
    if (p && p.tagName && p.tagName !== 'BODY' && p.tagName !== 'HTML') {
      let ps = p.tagName.toLowerCase();
      if (p.id) ps += '#' + p.id;
      if (p.className && typeof p.className === 'string') {
        const pc = p.className.trim().split(/\s+/).slice(0, 2).join('.');
        if (pc) ps += '.' + pc;
      }
      s = ps + ' > ' + s;
    }
    return s;
  };
  const vis = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const out = {
    url: location.pathname,
    vw,
    vh,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    docHeight: document.documentElement.scrollHeight,
    hScroll: document.documentElement.scrollWidth > vw + 1,
    styleSheets: [...document.styleSheets].map((s) => {
      let n = 0;
      try { n = s.cssRules ? s.cssRules.length : -1; } catch { n = -2; }
      return { href: s.href ? s.href.split('/').pop() : '(inline)', rules: n };
    }),
    overflowRight: [],
    overflowLeft: [],
    childOverflow: [],
    truncated: [],
    tinyTargets: [],
    fixedEls: [],
    forms: [],
    imgsBroken: [],
    overlapsHeader: [],
    classesNoRule: [],
    sections: [],
  };

  const all = [...document.querySelectorAll('body *')].filter(vis);
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 && r.width > 8) {
      out.overflowRight.push({ el: sel(el), rect: R(el), over: Math.round(r.right - vw), cs: { pos: getComputedStyle(el).position, of: getComputedStyle(el).overflowX } });
    }
    if (r.left < -1 && r.width > 8) {
      out.overflowLeft.push({ el: sel(el), rect: R(el), over: Math.round(-r.left) });
    }
    // texto cortado em elementos-folha
    if (el.childElementCount === 0 && (el.textContent || '').trim().length > 3) {
      if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
        const cs = getComputedStyle(el);
        out.truncated.push({ el: sel(el), text: (el.textContent || '').trim().slice(0, 40), cw: el.clientWidth, sw: el.scrollWidth, overflow: cs.overflowX, whiteSpace: cs.whiteSpace });
      }
    }
    // filho a sair do pai
    const p = el.parentElement;
    if (p && p !== document.body && p !== document.documentElement) {
      const pr = p.getBoundingClientRect();
      const pcs = getComputedStyle(p);
      if (pr.width > 40 && (r.right > pr.right + 1 || r.left < pr.left - 1)) {
        out.childOverflow.push({ el: sel(el), rect: R(el), parent: sel(p), parentRect: R(p), parentOverflow: pcs.overflowX });
      }
    }
    // alvos pequenos
    const tag = el.tagName;
    if (['A', 'BUTTON'].includes(tag)) {
      const r2 = el.getBoundingClientRect();
      if (r2.width < 44 || r2.height < 44) {
        out.tinyTargets.push({ el: sel(el), w: Math.round(r2.width), h: Math.round(r2.height) });
      }
    }
    // elementos fixed
    if (getComputedStyle(el).position === 'fixed') {
      out.fixedEls.push({ el: sel(el), rect: R(el), z: getComputedStyle(el).zIndex });
    }
    if (tag === 'IMG' && el.naturalWidth === 0) out.imgsBroken.push({ el: sel(el), src: (el.currentSrc || el.src || '').slice(-60) });
  }

  for (const el of document.querySelectorAll('input, select, textarea, button[type=submit], form')) {
    if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    out.forms.push({
      el: sel(el),
      tag: el.tagName,
      rect: R(el),
      fontFamily: cs.fontFamily.slice(0, 40),
      fontSize: cs.fontSize,
      bg: cs.backgroundColor,
      color: cs.color,
      border: cs.borderTopWidth + ' ' + cs.borderTopStyle,
      padding: cs.padding,
      width: cs.width,
      scrollW: el.scrollWidth,
      clientW: el.clientWidth,
      truncated: el.scrollWidth > el.clientWidth + 1,
      ph: el.placeholder || null,
    });
  }

  // sobreposição com o header (se fixed/sticky)
  const hdr = document.querySelector('header, .header');
  if (hdr) {
    const hr = hdr.getBoundingClientRect();
    const hcs = getComputedStyle(hdr);
    if (['fixed', 'sticky'].includes(hcs.position) && hr.height > 0) {
      for (const el of all) {
        if (hdr.contains(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.top < hr.bottom - 2 && r.bottom > hr.top + 2 && r.height > 12 && r.width > 40 && r.top > 0) {
          const txt = (el.textContent || '').trim().slice(0, 30);
          if (txt) out.overlapsHeader.push({ el: sel(el), rect: R(el), headerRect: R(hdr), text: txt });
        }
      }
    }
  }

  // secções
  for (const sec of document.querySelectorAll('section, footer, header')) {
    if (!vis(sec)) continue;
    const cs = getComputedStyle(sec);
    out.sections.push({ el: sel(sec), rect: R(sec), pad: cs.padding, display: cs.display, gridCols: cs.gridTemplateColumns.slice(0, 60) });
  }

  // classes sem regra CSS em nenhuma folha carregada
  const defined = new Set();
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    if (!rules) continue;
    for (const rule of rules) {
      if (rule.selectorText) {
        for (const m of rule.selectorText.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) defined.add(m[1]);
      } else if (rule.cssRules) {
        for (const r2 of rule.cssRules) {
          if (r2.selectorText) for (const m of r2.selectorText.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) defined.add(m[1]);
        }
      }
    }
  }
  const used = new Map();
  for (const el of document.querySelectorAll('[class]')) {
    for (const c of el.classList) used.set(c, (used.get(c) || 0) + 1);
  }
  for (const [c, n] of used) if (!defined.has(c)) out.classesNoRule.push({ cls: c, count: n });

  return out;
};

const OUT = path.join(process.cwd(), 'audit');
const TAG = process.env.AUDIT_TAG ? '-' + process.env.AUDIT_TAG : '';
const SCR = path.join(OUT, 'screens' + TAG);
fs.mkdirSync(SCR, { recursive: true });

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const report = { base: BASE, generatedAt: new Date().toISOString(), results: [] };

for (const vp of VIEWPORTS) {
  for (const pg of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, hasTouch: vp.width < 768, isMobile: vp.width < 768 });
    const page = await ctx.newPage();
    const logs = [];
    page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push({ type: m.type(), text: m.text().slice(0, 200) }); });
    page.on('pageerror', (e) => logs.push({ type: 'pageerror', text: String(e).slice(0, 200) }));
    page.on('requestfailed', (r) => logs.push({ type: 'requestfailed', text: r.url().slice(-70) + ' :: ' + (r.failure()?.errorText || '') }));
    page.on('response', (r) => { if (r.status() >= 400) logs.push({ type: 'http' + r.status(), text: r.url().slice(-70) }); });
    try {
      await page.goto(BASE + pg.url, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(900);
      // força reveal animations + carrega todas as imagens lazy antes de medir
      await page.evaluate(() => { document.querySelectorAll('.reveal').forEach((e) => e.classList.add('revealed')); });
      await page.evaluate(() => { document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; }); });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.evaluate(async () => {
        await Promise.all([...document.images].map((i) => (i.complete ? Promise.resolve() : i.decode().catch(() => {}))));
      });
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      const data = await page.evaluate(PROBE);
      data.viewport = vp.name;
      data.page = pg.name;
      data.console = logs;
      data.screenshot = `audit/screens${TAG}/${pg.name}-${vp.name}.png`;
      await page.screenshot({ path: path.join(SCR, `${pg.name}-${vp.name}.png`), fullPage: true });
      report.results.push(data);
      const flags = [];
      if (data.hScroll) flags.push(`H-SCROLL(+${data.docScrollWidth - data.vw}px)`);
      if (data.overflowRight.length) flags.push(`overflowR:${data.overflowRight.length}`);
      if (data.childOverflow.length) flags.push(`childOut:${data.childOverflow.length}`);
      if (data.truncated.length) flags.push(`truncated:${data.truncated.length}`);
      if (data.tinyTargets.length) flags.push(`tinyTap:${data.tinyTargets.length}`);
      if (data.classesNoRule.length) flags.push(`semCSS:${data.classesNoRule.length}`);
      if (data.overlapsHeader.length) flags.push(`headerOverlap:${data.overlapsHeader.length}`);
      if (data.imgsBroken.length) flags.push(`imgBroken:${data.imgsBroken.length}`);
      if (logs.filter((l) => l.type !== 'warning').length) flags.push(`console:${logs.filter((l) => l.type !== 'warning').length}`);
      console.log(`${pg.name.padEnd(9)} ${vp.name.padEnd(10)} ${flags.join(' | ') || 'OK'}`);
    } catch (e) {
      console.log(`${pg.name} ${vp.name} ERRO: ${e.message}`);
      report.results.push({ viewport: vp.name, page: pg.name, error: e.message });
    }
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(path.join(OUT, `audit-report${suffix}${TAG}.json`), JSON.stringify(report, null, 1));
console.log(`\nJSON -> audit/audit-report${suffix}${TAG}.json`);
