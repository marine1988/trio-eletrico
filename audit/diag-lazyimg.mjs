// audit/diag-lazyimg.mjs — confirma se os "imgsBroken" do harness são lazy-loading
import { chromium } from 'playwright';
const BASE = 'http://localhost:3000';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const check = async (label, scrollFn) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  await scrollFn(page);
  const r = await page.evaluate(() => [...document.images].map((i) => ({ alt: (i.alt || '').slice(0, 22), lazy: i.loading, nw: i.naturalWidth })).filter((x) => x.nw === 0));
  console.log(`${label.padEnd(46)} imgs sem carregar: ${r.length}`, JSON.stringify(r.slice(0, 3)));
  await ctx.close();
};
// 1. saltos instantâneos (o que o harness faz, com scroll-behavior:auto)
await check('salto instantâneo p/ fundo e p/ topo', async (p) => {
  await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await p.waitForTimeout(400);
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await p.waitForTimeout(300);
});
// 2. scroll progressivo (comportamento de um utilizador a percorrer a página)
await check('scroll progressivo até ao fundo', async (p) => {
  await p.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
  });
  await p.waitForTimeout(500);
});
// 3. scroll suave (scroll-behavior:smooth como estava antes) até ao fundo
await check('scroll suave (smooth) até ao fundo', async (p) => {
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'smooth'; window.scrollTo(0, document.body.scrollHeight); });
  await p.waitForTimeout(1500);
});
await browser.close();
