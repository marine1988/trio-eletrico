// audit/diag-scroll.mjs — diagnóstico: o harness mede em scroll 0 real?
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://localhost:3000';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
for (const vp of [{ n: 'mob-375', w: 375, h: 667 }, { n: 'tab-768', w: 768, h: 1024 }]) {
  for (const pg of ['/', '/contacto.html']) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: vp.w < 768, isMobile: vp.w < 768 });
    const page = await ctx.newPage();
    await page.goto(BASE + pg, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    await page.evaluate(() => { document.querySelectorAll('.reveal').forEach((e) => e.classList.add('revealed')); window.scrollTo(0, document.body.scrollHeight); });
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => ({
      scrollY: Math.round(window.scrollY),
      docH: document.documentElement.scrollHeight,
      behavior: getComputedStyle(document.documentElement).scrollBehavior,
      headerBottom: Math.round(document.querySelector('header.header').getBoundingClientRect().bottom),
      areasTop: document.querySelector('#areas') ? Math.round(document.querySelector('#areas').getBoundingClientRect().top) : null,
      contactSecTop: document.querySelector('.contact-section') ? Math.round(document.querySelector('.contact-section').getBoundingClientRect().top) : null,
      containerTop: document.querySelector('.contact-section .container') ? Math.round(document.querySelector('.contact-section .container').getBoundingClientRect().top) : null,
    }));
    console.log(pg.padEnd(15), vp.n.padEnd(9), JSON.stringify(m));
    await ctx.close();
  }
}
await browser.close();
