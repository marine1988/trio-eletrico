// audit/sanity-overlays.mjs — sanity check rápido da geometria dos overlays
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://localhost:3000';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
for (const [pg, vw, vh] of [['/', 375, 667], ['/', 320, 568], ['/contacto.html', 375, 667], ['/contacto.html', 768, 1024]]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, hasTouch: vw < 768, isMobile: vw < 768 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await page.goto(BASE + pg, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  await page.evaluate(() => { document.querySelectorAll('.reveal').forEach((e) => e.classList.add('revealed')); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.waitForTimeout(300);
  const d = await page.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), bottom: Math.round(b.bottom) }; };
    const cs = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e) : {}; };
    const main = document.querySelector('main');
    const first = main && main.firstElementChild;
    const fb = first ? first.getBoundingClientRect() : null;
    return {
      scrollBehavior: cs('html').scrollBehavior,
      heroPaddingTop: first ? getComputedStyle(first).paddingTop : null,
      mainPadTop: main ? getComputedStyle(main).paddingTop : null,
      firstChild: first ? first.className.slice(0, 30) + ' top=' + Math.round(fb.top) : null,
      h1Top: r('h1') ? r('h1').y : null,
      header: r('header.header'),
      headerZ: cs('header.header').zIndex,
      cta: r('.sticky-cta-mobile'),
      ctaZ: cs('.sticky-cta-mobile').zIndex,
      ctaPadBottom: cs('.sticky-cta-mobile').paddingBottom,
      wa: r('.whatsapp-wrapper'),
      waZ: cs('.whatsapp-wrapper').zIndex,
      waMarginBottom: cs('.whatsapp-wrapper').marginBottom,
      footerContainerPadBottom: document.querySelector('footer > .container') ? getComputedStyle(document.querySelector('footer > .container')).paddingBottom : null,
      scrollMarginTop: cs('#contacto') ? cs('#contacto').scrollMarginTop : null,
      hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      docW: document.documentElement.scrollWidth,
      vw: document.documentElement.clientWidth,
      docH: document.documentElement.scrollHeight,
    };
  });
  console.log(pg.padEnd(16), `${vw}x${vh}`.padEnd(9), JSON.stringify(d));
  if (errs.length) console.log('   pageerrors:', errs);
  await ctx.close();
}
await browser.close();
