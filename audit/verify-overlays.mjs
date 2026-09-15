// audit/verify-overlays.mjs — verificação dedicada: sobreposições de elementos
// position:fixed (header fixo, .sticky-cta-mobile, WhatsApp botão/tooltip) sobre
// conteúdo essencial. Não depende do audit.mjs (script de terceiros).
//
// Uso: node audit/verify-overlays.mjs [baseUrl] [outJson]
//   default: http://localhost:3000  ->  audit/overlays-verify.json
//
// METODOLOGIA (explícita, para o relatório):
//  1. Elementos fixed visíveis (position:fixed, display!=none, visibility!=hidden,
//     opacity>0.05, rect>0) são "overlays". Classificados: header | cta | whatsapp |
//     tooltip | outro.
//  2. "Conteúdo essencial" = h1..h4, p, a, button, input, select, textarea, label
//     visíveis, com texto (ou controlo de formulário), rect >= 16x16, fora do
//     próprio overlay e fora de .sr-only.
//  3. Para cada estado de scroll, para cada elemento essencial que intersecta o
//     viewport, mede-se a fracção coberta por overlays com uma grelha de 5x5 pontos
//     avaliada com document.elementFromPoint() (contabiliza z-index e
//     pointer-events — um overlay com pointer-events:none não bloqueia cliques).
//     coveredFraction = pontos cujo topo é um overlay / 25.
//     "bloqueado" = coveredFraction >= 0.5 (elemento maioritariamente tapado).
//  4. Estados medidos: topo da página, fundo da página (scroll máximo) e, depois,
//     salto para cada âncora interna existente (#contacto, #faq, #areas, ...) com
//     espera de estabilização do scroll. O salto de âncora é o cenário real em que
//     o header fixo tapa conteúdo.
//  5. Extras: interseções overlay↔overlay (header/cta/whatsapp/tooltip); tooltip
//     dentro do viewport depois de hover na bolha WhatsApp; o centro do
//     .sticky-cta-mobile tem de continuar a receber o evento (clicável); elementos
//     essenciais mais altos que a "faixa limpa" (viewport - header - reserva
//     inferior) são reportados como unreachable.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2] || 'http://localhost:3000';
const OUT = process.argv[3] || 'audit/overlays-verify.json';

const VIEWPORTS = [
  { name: 'mob-320', width: 320, height: 568 },
  { name: 'mob-360', width: 360, height: 640 },
  { name: 'mob-375', width: 375, height: 667 },
  { name: 'mob-390', width: 390, height: 844 },
  { name: 'mob-414', width: 414, height: 896 },
  { name: 'tab-768', width: 768, height: 1024 },
  { name: 'desk-1280', width: 1280, height: 800 },
  { name: 'desk-1440', width: 1440, height: 900 },
];
const PAGES = [
  { name: 'home', url: '/' },
  { name: 'contacto', url: '/contacto.html' },
];
const TOL = 2; // tolerância em px: interseções < TOL não contam (sub-pixel/sombra)

// ---- código injectado na página -------------------------------------------
const INSTALL = () => {
  const OVERLAY_SEL = 'header.header, .sticky-cta-mobile, .whatsapp-wrapper, .whatsapp-float, .whatsapp-tooltip';
  const ESS_SEL = 'h1,h2,h3,h4,p,a,button,input,select,textarea,label';
  const R = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom, top: r.top, left: r.left };
  };
  const sel = (el) => {
    if (!el || el.nodeType !== 1) return '?';
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      const c = el.className.trim().split(/\s+/).slice(0, 2).join('.');
      if (c) s += '.' + c;
    }
    return s;
  };
  const vis = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) <= 0.05) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  window.__ov = { OVERLAY_SEL, ESS_SEL, R, sel, vis };
  window.__ovCount = {};
  window.__count = (k) => { window.__ovCount[k] = (window.__ovCount[k] || 0) + 1; return window.__ovCount; };
};

const SNAPSHOT = () => {
  const { OVERLAY_SEL, ESS_SEL, R, sel, vis } = window.__ov;
  const TOL = 2; // mesma tolerância do teste (px): interseções menores não contam
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  // 1. overlays fixed
  const overlays = [...document.querySelectorAll('body *')]
    .filter((el) => getComputedStyle(el).position === 'fixed' && vis(el))
    .map((el) => {
      const cs = getComputedStyle(el);
      return {
        el: sel(el),
        kind: el.matches('header.header') ? 'header'
          : el.matches('.sticky-cta-mobile') ? 'cta'
          : el.matches('.whatsapp-wrapper') ? 'whatsapp'
          : el.matches('.whatsapp-tooltip') ? 'tooltip'
          : el.matches('.whatsapp-float') ? 'whatsapp-float' : 'other',
        rect: R(el),
        z: cs.zIndex,
        pointerEvents: cs.pointerEvents,
        opacity: cs.opacity,
      };
    });

  // 2. conteúdo essencial
  const ess = [];
  for (const el of document.querySelectorAll(ESS_SEL)) {
    if (!vis(el)) continue;
    if (el.classList.contains('sr-only')) continue;
    if (el.closest(OVERLAY_SEL)) continue;               // dentro de um overlay (ex.: links do header)
    if (el.tagName === 'INPUT' && el.type === 'hidden') continue;
    const r = R(el);
    if (r.w < 16 || r.h < 16) continue;
    if (r.bottom < 0 || r.top > vh) continue;             // fora do viewport
    const txt = (el.getAttribute('aria-label') || el.textContent || el.value || el.placeholder || '').trim();
    const interactive = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);
    if (!txt && !interactive) continue;
    ess.push({ el, rect: r, txt: txt.slice(0, 34), interactive, tag: el.tagName });
  }

  // 3. cobertura por elementFromPoint (grelha 5x5)
  const cov = [];
  for (const e of ess) {
    let hit = 0, n = 0, topOverlays = {};
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const px = Math.round(e.rect.left + (e.rect.w * (i + 1)) / 6);
        const py = Math.round(e.rect.top + (e.rect.h * (j + 1)) / 6);
        if (px < 0 || py < 0 || px >= vw || py >= vh) continue;
        n++;
        const top = document.elementFromPoint(px, py);
        if (!top) continue;
        const host = top.closest ? top.closest(OVERLAY_SEL) : null;
        if (host) {
          hit++;
          const k = host.matches('header.header') ? 'header'
            : host.matches('.sticky-cta-mobile') ? 'cta'
            : host.matches('.whatsapp-tooltip') ? 'tooltip'
            : host.matches('.whatsapp-wrapper, .whatsapp-float') ? 'whatsapp' : 'other';
          topOverlays[k] = (topOverlays[k] || 0) + 1;
        }
      }
    }
    if (n === 0) continue;
    const frac = hit / n;
    if (frac > 0) cov.push({ el: sel(e.el), text: e.txt, rect: { x: Math.round(e.rect.x), y: Math.round(e.rect.y), w: Math.round(e.rect.w), h: Math.round(e.rect.h) }, interactive: e.interactive, coveredPoints: hit, points: n, coveredFraction: +frac.toFixed(2), by: topOverlays });
  }

  // 4. interseções geométricas bruta overlay x essencial
  const inter = [];
  for (const o of overlays) {
    if (o.pointerEvents === 'none') continue;
    for (const e of ess) {
      const ox = Math.min(o.rect.right, e.rect.right) - Math.max(o.rect.left, e.rect.left);
      const oy = Math.min(o.rect.bottom, e.rect.bottom) - Math.max(o.rect.top, e.rect.top);
      if (ox > TOL && oy > TOL) inter.push({ overlay: o.kind, el: sel(e.el), text: e.txt, area: Math.round(ox * oy) });
    }
  }

  // 5. overlay x overlay
  const oo = [];
  for (let i = 0; i < overlays.length; i++) {
    for (let j = i + 1; j < overlays.length; j++) {
      const a = overlays[i], b = overlays[j];
      if (a.el === b.el || (a.kind === 'whatsapp' && b.kind === 'whatsapp-float') || (a.kind === 'whatsapp-float' && b.kind === 'whatsapp')) continue;
      const ox = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
      const oy = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
      const contains = (a.kind === 'whatsapp' && b.kind === 'tooltip') || (a.kind === 'tooltip' && b.kind === 'whatsapp');
      if (ox > TOL && oy > TOL && !contains) oo.push({ a: a.kind, b: b.kind, overlapArea: Math.round(ox * oy) });
    }
  }

  // 6. header rect (para o teste de âncoras)
  const hdr = document.querySelector('header.header');
  const hdrRect = hdr ? R(hdr) : null;
  const underHeader = [];
  if (hdrRect) {
    for (const e of ess) {
      if (e.rect.top < hdrRect.bottom - TOL && e.rect.bottom > hdrRect.top + TOL && e.rect.top < hdrRect.bottom) {
        if (e.rect.top >= hdrRect.top + TOL && e.rect.top < hdrRect.bottom - TOL) underHeader.push({ el: sel(e.el), text: e.txt, y: Math.round(e.rect.y), hdrBottom: Math.round(hdrRect.bottom) });
      }
    }
  }

  // 7. CTA clicável? centro do rect tem de receber o próprio CTA
  let ctaClickable = null;
  const cta = document.querySelector('.sticky-cta-mobile');
  if (cta && vis(cta)) {
    const r = R(cta);
    const cx = Math.round(r.left + r.w / 2), cy = Math.round(r.top + r.h / 2);
    const top = (cx >= 0 && cy >= 0 && cx < vw && cy < vh) ? document.elementFromPoint(cx, cy) : null;
    ctaClickable = { visible: true, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) }, receivesEvent: !!(top && cta.contains(top)), topEl: top ? sel(top) : null };
  }

  // 8. tooltip dentro do viewport (só se estiver visível, ex.: após hover)
  const tip = document.querySelector('.whatsapp-tooltip');
  let tooltip = null;
  if (tip && vis(tip)) {
    const r = R(tip);
    tooltip = { rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) }, insideViewport: r.left >= -1 && r.right <= vw + 1 && r.top >= -1 && r.bottom <= vh + 1, offLeft: r.left < -1 ? Math.round(-r.left) : 0, offRight: r.right > vw + 1 ? Math.round(r.right - vw) : 0 };
  }

  // 9. faixa limpa vertical: altura, e elementos essenciais maiores que ela
  const bandTop = hdrRect ? hdrRect.bottom : 0;
  const bottomReserve = overlays.filter((o) => o.kind === 'cta' || o.kind === 'whatsapp')
    .reduce((m, o) => Math.max(m, vh - o.rect.top + (o.kind === 'cta' ? 0 : 0)), 0);
  const bandH = vh - bandTop - bottomReserve;
  const unreach = ess.filter((e) => e.rect.h > bandH).map((e) => ({ el: sel(e.el), text: e.txt, h: Math.round(e.rect.h) }));

  return {
    url: location.pathname,
    vw, vh,
    scrollY: Math.round(window.scrollY),
    maxScroll: Math.round(document.documentElement.scrollHeight - vh),
    docHeight: document.documentElement.scrollHeight,
    overlays,
    ctaClickable,
    tooltip,
    covered: cov,
    blocked: cov.filter((c) => c.coveredFraction >= 0.5),
    interactions: inter,
    overlayVsOverlay: oo,
    underHeader,
    cleanBand: { top: Math.round(bandTop), bottomReserve: Math.round(bottomReserve), height: Math.round(bandH) },
    unreachableTallerThanBand: unreach,
  };
};

// ---- helpers de scroll ----------------------------------------------------
const settle = async (page) => {
  let last = -1;
  for (let i = 0; i < 30; i++) {
    const y = await page.evaluate(() => Math.round(window.scrollY));
    if (y === last) return y;
    last = y;
    await page.waitForTimeout(60);
  }
  return last;
};

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const report = { base: BASE, generatedAt: new Date().toISOString(), tolerance_px: TOL, runs: [] };

for (const vp of VIEWPORTS) {
  for (const pg of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, hasTouch: vp.width < 768, isMobile: vp.width < 768 });
    const page = await ctx.newPage();
    const rec = { page: pg.name, viewport: vp.name, width: vp.width, height: vp.height, states: {}, summary: {} };
    try {
      await page.goto(BASE + pg.url, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(600);
      // Modo baseline: desliga só css/overlays.css nesta página, para medir o
      // A/B isolado da minha camada (o resto do site fica igual ao do run "com").
      if (process.env.VERIFY_DISABLE_OVERLAYS === '1') {
        await page.evaluate(() => {
          const s = [...document.styleSheets].find((x) => x.href && x.href.includes('overlays.css'));
          if (s) s.disabled = true;
          window.__overlaysDisabled = !!s;
        });
        rec.overlaysSheetDisabled = await page.evaluate(() => window.__overlaysDisabled);
        await page.waitForTimeout(200);
      }
      await page.evaluate(INSTALL);
      await page.evaluate(() => { document.querySelectorAll('.reveal').forEach((e) => e.classList.add('revealed')); });
      await page.waitForTimeout(300);

      const states = [];
      const measure = async (name) => {
        const snap = await page.evaluate(SNAPSHOT);
        const st = await page.evaluate(() => window.__ovAnchor || null);
        rec.states[name] = {
          scrollY: snap.scrollY,
          coveredCount: snap.covered.length,
          blockedCount: snap.blocked.length,
          blocked: snap.blocked,
          interactionCount: snap.interactions.length,
          interactions: snap.interactions.slice(0, 12),
          overlayVsOverlay: snap.overlayVsOverlay,
          underHeader: snap.underHeader,
          anchorTarget: st,
          ctaClickable: snap.ctaClickable,
          cleanBand: snap.cleanBand,
          unreachableTallerThanBand: snap.unreachableTallerThanBand.length,
          unreachable: snap.unreachableTallerThanBand.slice(0, 6),
          overlays: snap.overlays.map((o) => ({ kind: o.kind, el: o.el, rect: { x: Math.round(o.rect.x), y: Math.round(o.rect.y), w: Math.round(o.rect.w), h: Math.round(o.rect.h) }, z: o.z, pe: o.pointerEvents })),
        };
        states.push([name]);
      };

      // (a) topo
      await page.evaluate(() => { window.__ovAnchor = null; window.scrollTo({ top: 0, behavior: 'instant' }); });
      await settle(page);
      await measure('top');
      // (b) âncoras internas existentes
      const anchors = await page.evaluate(() => [...document.querySelectorAll('[id]')].filter((e) => ['contacto', 'faq', 'areas', 'servicos', 'galeria', 'depoimentos', 'sobre', 'porquenos', 'form'].includes(e.id)).map((e) => e.id));
      for (const a of anchors) {
        await page.evaluate((h) => { history.replaceState(null, '', location.pathname); location.hash = h; }, a);
        await settle(page);
        await settle(page);
        await page.evaluate((h) => {
          const t = document.getElementById(h);
          const hr = document.querySelector('header.header').getBoundingClientRect();
          window.__ovAnchor = t ? { id: h, top: Math.round(t.getBoundingClientRect().top), headerBottom: Math.round(hr.bottom), targetUnderHeader: t.getBoundingClientRect().top < hr.bottom - 2 } : { id: h, missing: true };
        }, a);
        await measure('anchor#' + a);
      }
      // (c) fundo
      await page.evaluate(() => { window.__ovAnchor = null; window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); });
      await settle(page);
      await measure('bottom');
      // (d) clique real no CTA mobile (caminho JS: scrollTo behavior smooth)
      const hasCta = await page.evaluate(() => !!document.querySelector('.sticky-cta-mobile'));
      if (hasCta) {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await settle(page);
        try {
          await page.click('.sticky-cta-mobile', { timeout: 4000 });
          await settle(page);
          await settle(page);
          await page.evaluate(() => {
            const t = document.getElementById('contacto');
            const hr = document.querySelector('header.header').getBoundingClientRect();
            window.__ovAnchor = t ? { id: 'contacto', viaClick: true, top: Math.round(t.getBoundingClientRect().top), headerBottom: Math.round(hr.bottom), targetUnderHeader: t.getBoundingClientRect().top < hr.bottom - 2 } : { id: 'contacto', missing: true, viaClick: true };
          });
          await measure('click-cta');
        } catch (e) {
          rec.states['click-cta'] = { error: e.message.slice(0, 140) };
        }
      }

      // (d) tooltip sob hover (só onde o tooltip não está escondido)
      const hasTip = await page.evaluate(() => !!document.querySelector('.whatsapp-tooltip'));
      if (hasTip) {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await settle(page);
        try {
          // mouse.move em vez de page.hover(): a bolha tem animação infinita e o
          // Playwright considera o elemento instável (hover falha por timeout).
          const c = await page.evaluate(() => {
            const r = document.querySelector('.whatsapp-float').getBoundingClientRect();
            return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
          });
          await page.mouse.move(c.x - 6, c.y - 6);
          await page.mouse.move(c.x, c.y);
          await page.waitForTimeout(500);
          const tip = await page.evaluate(SNAPSHOT);
          rec.states['hover-tooltip'] = {
            scrollY: tip.scrollY,
            tooltip: tip.tooltip,
            tooltipVisible: !!tip.tooltip,
            blocked: tip.blocked,
            blockedCount: tip.blocked.length,
            coveredCount: tip.covered.length,
          };
        } catch (e) {
          rec.states['hover-tooltip'] = { error: e.message.slice(0, 120) };
        }
        await page.mouse.move(1, 1);
      }

      // resumo
      const st = Object.entries(rec.states).filter(([k]) => k !== 'hover-tooltip');
      const anchorStates = st.filter(([k]) => k.startsWith('anchor'));
      rec.summary = {
        statesMeasured: st.length,
        totalBlocked: st.reduce((s, [, v]) => s + (v.blockedCount || 0), 0),
        totalCoveredPartial: st.reduce((s, [, v]) => s + (v.coveredCount || 0), 0),
        totalInteractions: st.reduce((s, [, v]) => s + (v.interactionCount || 0), 0),
        overlayVsOverlay: st.reduce((s, [, v]) => s + (v.overlayVsOverlay || []).length, 0),
        anchorsTested: anchorStates.length,
        anchorTargetsUnderHeader: anchorStates.filter(([, v]) => v.anchorTarget && v.anchorTarget.targetUnderHeader).length,
        anchorTargetsMissing: anchorStates.filter(([, v]) => v.anchorTarget && v.anchorTarget.missing).length,
        anchorLandingTops: anchorStates.map(([k, v]) => `${k}=${v.anchorTarget ? v.anchorTarget.top : '?'}`),
        underHeaderAfterAnchorsRaw: anchorStates.reduce((s, [, v]) => s + v.underHeader.length, 0),
        underHeaderAtTop: (rec.states.top?.underHeader || []).length,
        underHeaderAtBottom: (rec.states.bottom?.underHeader || []).length,
        ctaClickableAtTop: rec.states.top?.ctaClickable ? rec.states.top.ctaClickable.receivesEvent : null,
        ctaClickableAtBottom: rec.states.bottom?.ctaClickable ? rec.states.bottom.ctaClickable.receivesEvent : null,
        tooltipVisibleOnHover: rec.states['hover-tooltip'] ? !!rec.states['hover-tooltip'].tooltipVisible : null,
        tooltipInsideViewport: rec.states['hover-tooltip']?.tooltip ? rec.states['hover-tooltip'].tooltip.insideViewport : null,
        unreachableTallerThanBand: Math.max(...st.map(([, v]) => v.unreachableTallerThanBand || 0), 0),
      };
    } catch (e) {
      rec.error = e.message.slice(0, 200);
    }
    console.log(
      `${rec.page.padEnd(9)} ${vp.name.padEnd(10)} ` +
      (rec.error ? 'ERRO: ' + rec.error
        : `blocked=${rec.summary.totalBlocked} coveredPartial=${rec.summary.totalCoveredPartial} inter=${rec.summary.totalInteractions} ovlXovl=${rec.summary.overlayVsOverlay} anchorTargetHdr=${rec.summary.anchorTargetsUnderHeader}/${rec.summary.anchorsTested} hdr@top=${rec.summary.underHeaderAtTop} hdr@bottom=${rec.summary.underHeaderAtBottom} ctaClick=${rec.summary.ctaClickableAtTop}/${rec.summary.ctaClickableAtBottom} tip=${rec.summary.tooltipVisibleOnHover}/${rec.summary.tooltipInsideViewport}`)
    );
    report.runs.push(rec);
    await ctx.close();
  }
}
await browser.close();
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(report, null, 1));

const agg = {
  runs: 0,
  totalBlockedAnyState: 0,
  totalBlockedByKind: {},
  blockedByKindAtTop: {},
  blockedByKindAtBottom: {},
  blockedByKindAtLanding: {},   // estados 'anchor#*' + 'click-cta'
  blockedByKindAtHover: {},
  interactiveBlockedAtLanding: [],
  interactiveBlockedAtBottom: [],
  blockedAtTop: [],
  overlayVsOverlay: [],
  anchorTargetsUnderHeader: [],
  ctaNotClickable: [],
  tipOutside: [],
  tipNeverVisible: [],
  unreachable: [],
  rawInteractionsAtTop: 0,
  rawInteractionsAtBottom: 0,
};
const kindTag = (label) => `${label.page}-${label.viewport}/${label.state}`;
const bump = (obj, k) => { obj[k] = (obj[k] || 0) + 1; };

for (const r of report.runs) {
  if (r.error) continue;
  agg.runs++;
  const states = Object.entries(r.states);
  for (const [name, v] of states) {
    if (v.error) continue;
    const isTop = name === 'top';
    const isBottom = name === 'bottom';
    const isLanding = name.startsWith('anchor') || name === 'click-cta';
    const isHover = name === 'hover-tooltip';
    for (const b of v.blocked || []) {
      agg.totalBlockedAnyState++;
      for (const k of Object.keys(b.by || {})) {
        bump(agg.totalBlockedByKind, k);
        if (isHover) bump(agg.blockedByKindAtHover, k);
        else if (isTop) bump(agg.blockedByKindAtTop, k);
        else if (isBottom) bump(agg.blockedByKindAtBottom, k);
        else if (isLanding) bump(agg.blockedByKindAtLanding, k);
      }
      if (isTop) agg.blockedAtTop.push({ where: kindTag({ ...r, state: name }), el: b.el, text: b.text, by: b.by });
      if (isBottom && b.interactive) agg.interactiveBlockedAtBottom.push({ where: kindTag({ ...r, state: name }), el: b.el, text: b.text, by: b.by });
      if (isLanding && b.interactive) agg.interactiveBlockedAtLanding.push({ where: kindTag({ ...r, state: name }), el: b.el, text: b.text, by: b.by });
    }
    for (const o of v.overlayVsOverlay || []) agg.overlayVsOverlay.push({ where: kindTag({ ...r, state: name }), a: o.a, b: o.b });
    if (isLanding && v.anchorTarget && v.anchorTarget.targetUnderHeader) agg.anchorTargetsUnderHeader.push({ where: kindTag({ ...r, state: name }), top: v.anchorTarget.top, hdrBottom: v.anchorTarget.headerBottom });
    if (v.ctaClickable && v.ctaClickable.visible && !v.ctaClickable.receivesEvent) agg.ctaNotClickable.push(kindTag({ ...r, state: name }));
    if (v.interactionCount != null) { if (isTop) agg.rawInteractionsAtTop += v.interactionCount; if (isBottom) agg.rawInteractionsAtBottom += v.interactionCount; }
    if ((v.unreachableTallerThanBand || 0) > 0) agg.unreachable.push({ where: kindTag({ ...r, state: name }), n: v.unreachableTallerThanBand, list: v.unreachable });
  }
  const tip = r.states['hover-tooltip'];
  if (tip && tip.tooltip && !tip.tooltip.insideViewport) agg.tipOutside.push(`${r.page}-${r.viewport}`);
  if (tip && tip.tooltipVisible === false) agg.tipNeverVisible.push(`${r.page}-${r.viewport}`);
}

// regras de aceitação — apenas classes corrigíveis por CSS (o resto é
// geometria inerente de um header/barra fixos sobre conteúdo que faz scroll)
const blockedByHeaderAtTop = agg.blockedAtTop.filter((x) => (x.by || {}).header).length;
const ctaBlockedInteractiveBottom = agg.interactiveBlockedAtBottom.filter((x) => (x.by || {}).cta).length;
const pass = {
  R1_nadaBloqueadoPeloHeaderNoTopo: blockedByHeaderAtTop === 0,
  R2_destinosDeAncoraAbaixoDoHeader: agg.anchorTargetsUnderHeader.length === 0,
  R3_semColisaoEntreOverlays: agg.overlayVsOverlay.length === 0,
  R4_ctaSempreClicavel: agg.ctaNotClickable.length === 0,
  R5_tooltipDentroDoViewport: agg.tipOutside.length === 0,
  R6_semControlosTapadosPelaBarraNoFundoDaPagina: ctaBlockedInteractiveBottom === 0,
  R7_informativo_interseccoesBrutasNoTopo: agg.rawInteractionsAtTop,
  R8_informativo_interseccoesBrutasNoFundo: agg.rawInteractionsAtBottom,
  R9_informativo_bloqueadosPorOverlay: agg.totalBlockedByKind,
};
agg.pass = pass;
console.log('\n== AGREGADO ==');
console.log(JSON.stringify(agg, null, 1));
console.log('\n== REGRAS ==');
for (const [k, v] of Object.entries(pass)) console.log(`  ${k}: ${typeof v === 'boolean' ? (v ? 'PASS' : 'FAIL') : v}`);
console.log(`\nJSON -> ${OUT}`);
