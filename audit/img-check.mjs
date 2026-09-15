// audit/img-check.mjs — verificação isolada de imagens (sem concorrência)
// scroll lento + espera explícita por cada <img>, para distinguir flake de 404 real.
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:3000';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 375, height: 667 } });

const requests = [];
page.on('response', (r) => { if (r.request().resourceType() === 'image') requests.push([r.status(), r.url().slice(-50)]); });
page.on('requestfailed', (r) => { if (r.request().resourceType() === 'image') requests.push(['FAILED ' + (r.failure()?.errorText || ''), r.url().slice(-50)]); });

await page.goto(BASE + '/', { waitUntil: 'load' });

// scroll lento até ao fundo para disparar todos os lazy loads
const h = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 400) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(60);
}
// espera explícita: todos os img complete, até 15s
try {
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 });
} catch { /* segue e reporta */ }
await page.waitForTimeout(1000);

const imgs = await page.evaluate(() => [...document.images].map((i) => ({
  src: (i.currentSrc || i.src).slice(-46),
  complete: i.complete,
  nw: i.naturalWidth,
  nh: i.naturalHeight,
  loading: i.loading,
  inViewport: (() => { const r = i.getBoundingClientRect(); return r.width > 0 && r.height > 0; })(),
})));
console.log('respostas de imagem:', requests.length, '| não-200/falhas:', requests.filter(([s]) => s !== 200).length);
for (const [s, u] of requests.filter(([s]) => s !== 200)) console.log('   ✗', s, u);
console.log('\n<img> na página:', imgs.length);
const bad = imgs.filter((i) => !i.complete || (i.complete && i.nw === 0));
for (const i of imgs) {
  const flag = (!i.complete || i.nw === 0) ? '✗' : '✓';
  console.log(` ${flag} nw=${String(i.nw).padStart(4)} complete=${i.complete} loading=${i.loading} ${i.src}`);
}
console.log('\nRESULTADO:', bad.length === 0 ? 'TODAS AS IMAGENS OK' : `${bad.length} imagem(ns) com problema`);
await browser.close();
process.exit(bad.length === 0 ? 0 : 1);
