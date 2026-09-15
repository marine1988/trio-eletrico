// audit/sanity-toggle.mjs — compara a geometria com e sem overlay.css activo
// (regressão: a home não pode mudar de layout; a contacto só desce o topo)
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://localhost:3000';
const PROBE = () => {
  const R = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { y: Math.round(b.top + window.scrollY), h: Math.round(b.height) }; };
  return {
    mainPadTop: getComputedStyle(document.querySelector('main')).paddingTop,
    heroTop: R('main > .hero') ? R('main > .hero').y : null,
    heroPadTop: document.querySelector('main > .hero') ? getComputedStyle(document.querySelector('main > .hero')).paddingTop : null,
    h1Top: R('h1'),
    firstSection: document.querySelector('main > section') ? document.querySelector('main > section').className : null,
    firstSectionTop: R('main > section') ? R('main > section').y : null,
    contactInfoH2Top: R('.contacto-info h2'),
    areasTitleTop: R('#areas-title'),
    areasTop: R('#areas'),
    docHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
  };
};
const browser = await chromium.launch({ args: ['--no-sandbox'] });
for (const [pg, vw, vh] of [['/', 375, 667], ['/', 1280, 800], ['/contacto.html', 375, 667], ['/contacto.html', 1280, 800]]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, hasTouch: vw < 768, isMobile: vw < 768 });
  const page = await ctx.newPage();
  await page.goto(BASE + pg, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  await page.evaluate(() => { document.querySelectorAll('.reveal').forEach((e) => e.classList.add('revealed')); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.waitForTimeout(250);
  const off = await page.evaluate(() => {
    const s = [...document.styleSheets].find((x) => x.href && x.href.includes('overlays.css'));
    if (s) s.disabled = true;
    return true;
  });
  await page.waitForTimeout(150);
  const without = await page.evaluate(PROBE);
  await page.evaluate(() => { const s = [...document.styleSheets].find((x) => x.href && x.href.includes('overlays.css')); if (s) s.disabled = false; });
  await page.waitForTimeout(150);
  const withSheet = await page.evaluate(PROBE);
  const keys = Object.keys(withSheet);
  const diffs = keys.filter((k) => JSON.stringify(withSheet[k]) !== JSON.stringify(without[k]));
  console.log(`\n${pg} ${vw}x${vh} (sheet ${off ? 'toggled' : '?'}) — campos alterados: ${diffs.join(', ') || 'NENHUM'}`);
  for (const k of keys) if (diffs.includes(k)) console.log(`   ${k}: sem=${JSON.stringify(without[k])} com=${JSON.stringify(withSheet[k])}`);
  await ctx.close();
}
await browser.close();
