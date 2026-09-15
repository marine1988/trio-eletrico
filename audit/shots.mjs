// audit/shots.mjs — screenshots por secção (viewport real, sem fullPage) para inspeção visual
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2] || 'http://localhost:3000';
const OUT = path.join(process.cwd(), 'audit', 'sections');
fs.mkdirSync(OUT, { recursive: true });

const TARGETS = [
  { page: '/', name: 'home', vps: [{ n: '375', w: 375, h: 812 }, { n: '320', w: 320, h: 700 }, { n: '768', w: 768, h: 1024 }] },
  { page: '/contacto.html', name: 'contacto', vps: [{ n: '375', w: 375, h: 812 }, { n: '768', w: 768, h: 1024 }] },
];

const browser = await chromium.launch({ args: ['--no-sandbox'] });
for (const t of TARGETS) {
  for (const vp of t.vps) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.w < 768, hasTouch: vp.w < 768 });
    const page = await ctx.newPage();
    await page.goto(BASE + t.page, { waitUntil: 'load' });
    await page.evaluate(() => { document.querySelectorAll('.reveal').forEach((e) => e.classList.add('revealed')); });
    await page.waitForTimeout(1200);
    // lista de "blocos": filhos directos de main + header + footer
    const blocks = await page.evaluate(() => {
      const out = [];
      const push = (el, label) => {
        const r = el.getBoundingClientRect();
        if (r.height < 30) return;
        out.push({ label, sel: (el.id ? '#' + el.id : '') || (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName) });
      };
      const hdr = document.querySelector('header'); if (hdr) push(hdr, '00-header');
      const main = document.querySelector('main') || document.body;
      [...main.children].forEach((el, i) => push(el, String(i + 1).padStart(2, '0') + '-' + (el.id || el.className || el.tagName)));
      const ftr = document.querySelector('footer'); if (ftr) push(ftr, '99-footer');
      return out;
    });
    for (const b of blocks) {
      const el = await page.$(b.sel);
      if (!el) continue;
      const box = await el.boundingBox();
      if (!box || box.height < 30) continue;
      const safe = b.label.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 40);
      const file = path.join(OUT, `${t.name}-${vp.n}-${safe}.png`);
      try {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
        await el.screenshot({ path: file });
        console.log(`${t.name} ${vp.n} ${safe} ${Math.round(box.width)}x${Math.round(box.height)} -> ${path.basename(file)}`);
      } catch (e) { console.log(`skip ${safe}: ${e.message.slice(0, 60)}`); }
    }
    await ctx.close();
  }
}
await browser.close();
