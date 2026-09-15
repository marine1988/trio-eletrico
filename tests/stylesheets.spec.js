// tests/stylesheets.spec.js
// Regressão do bug P0: contacto.html não carregava o CSS principal (style.v1.min.css)
// e as camadas de override (fixes/components/overlays/mobile) não estavam ligadas a nada.
// Este spec garante que ambas as páginas carregam TODAS as folhas, sem 404, e que
// nenhuma classe usada no markup fica sem regra CSS.
import { expect, test } from '@playwright/test';

const PAGES = [
  { name: 'home', url: '/' },
  { name: 'contacto', url: '/contacto.html' },
];

// Camadas obrigatórias (ordem importa: base -> overrides)
const REQUIRED_SHEETS = [
  'style.v1.min.css',
  'style.min.css',
  'fixes.css',
  'components.css',
  'overlays.css',
  'mobile.css',
];

// Classes que são apenas hooks de JS / estado dinâmico e não têm (nem precisam de)
// regras visuais próprias. Qualquer outra classe sem regra = regressão.
const JS_ONLY_CLASSES = ['js', 'scrolled', 'noSwipe', 'nav-open', 'revealed'];

for (const { name, url } of PAGES) {
  test.describe(`stylesheets @ ${name}`, () => {
    test('carrega as folhas de estilos obrigatórias', async ({ page }) => {
      const failed = [];
      page.on('response', (r) => {
        const u = r.url();
        if ((r.status() >= 400) && /\.(css|js|woff2?|svg|png|jpe?g|webp)(\?|$)/.test(u)) failed.push(`${r.status()} ${u}`);
      });
      page.on('requestfailed', (r) => {
        const u = r.url();
        if (/\.(css|js|woff2?|svg|png|jpe?g|webp)(\?|$)/.test(u)) failed.push(`FAILED ${u} :: ${r.failure()?.errorText}`);
      });

      await page.goto(url, { waitUntil: 'load' });

      const loaded = await page.evaluate(() =>
        [...document.styleSheets].map((s) => (s.href || '').split('/').pop().split('?')[0]).filter(Boolean),
      );

      for (const sheet of REQUIRED_SHEETS) {
        expect(loaded, `folha em falta: ${sheet}`).toContain(sheet);
      }
      expect(failed, 'recursos 404/falhados').toEqual([]);
    });

    test('nenhuma folha de estilos está vazia', async ({ page }) => {
      await page.goto(url, { waitUntil: 'load' });
      const empty = await page.evaluate(() => {
        const out = [];
        for (const s of document.styleSheets) {
          const file = (s.href || '').split('/').pop().split('?')[0];
          if (!file || file.startsWith('css2')) continue; // fontes externas (CORS: não inspeccionável)
          let rules = -1;
          try { rules = s.cssRules ? s.cssRules.length : -1; } catch { rules = -1; }
          if (rules === 0) out.push(file);
        }
        return out;
      });
      expect(empty, 'folhas carregadas sem regras').toEqual([]);
    });

    test('todas as classes usadas no markup têm regra CSS', async ({ page }) => {
      await page.goto(url, { waitUntil: 'load' });
      const semRegra = await page.evaluate(() => {
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
        const missing = new Set();
        for (const el of document.querySelectorAll('[class]')) {
          for (const c of el.classList) if (!defined.has(c)) missing.add(c);
        }
        return [...missing];
      });
      const inesperadas = semRegra.filter((c) => !JS_ONLY_CLASSES.includes(c));
      expect(inesperadas, 'classes sem qualquer regra CSS').toEqual([]);
    });
  });
}
