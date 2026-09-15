// tests/mobile.spec.js
// QA gate para os bugs reais que escaparam à suite anterior:
//  - overflow horizontal (contacto tinha +32px em TODOS os viewports)
//  - elementos a transbordar o viewport
//  - imagens 404 (naturalWidth 0)
//  - conteúdo essencial tapado por elementos position:fixed (header, sticky CTA, WhatsApp)
//  - tap targets < 44x44
//  - inputs de formulário com font-size < 16px (zoom automático no iOS)
//  - carrossel de depoimentos inoperável por teclado
//  - dark mode toggle sem efeito/persistência
import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { name: '320', width: 320, height: 568 },
  { name: '360', width: 360, height: 640 },
  { name: '375', width: 375, height: 667 },
  { name: '390', width: 390, height: 844 },
  { name: '414', width: 414, height: 896 },
  { name: '600', width: 600, height: 900 },
  { name: '768', width: 768, height: 1024 },
  { name: '769', width: 769, height: 1024 },
  { name: '820', width: 820, height: 1180 },
  { name: '900', width: 900, height: 1000 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 900 },
];

const PAGES = [
  { name: 'home', url: '/' },
  { name: 'contacto', url: '/contacto.html' },
];

// Elementos que NUNCA podem ficar cobertos por overlays fixos
const CRITICAL_SELECTORS = [
  '#contacto h2',
  '#contacto form button[type="submit"], #contacto form .btn-primary',
  '#contacto input#quick-nome, #contacto input#nome',
  '#faq h2',
  '#faq button.faq-question, #faq summary',
  'main section h2',
];

const LAYOUT_PROBE = (opts) => {
  const criticalSelectors = opts.critical;
  // WCAG 2.5.5 (AAA) exige 44x44 em alvos tácteis; em ponteiro (desktop) o
  // critério aplicável é o 2.5.8 (AA) de 24x24.
  const minTap = opts.minTap;
  const vw = document.documentElement.clientWidth;
  const out = { hScroll: 0, overflowRight: [], brokenImages: [], covered: [], tiny: [], smallFont: [], headerCoversHeading: [], headerOverflow: [] };

  out.hScroll = Math.max(0, document.documentElement.scrollWidth - vw);

  const scrollableAncestor = (el) => {
    let p = el.parentElement;
    while (p && p !== document.documentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return p;
      p = p.parentElement;
    }
    return null;
  };

  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };

  const describe = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (typeof el.className === 'string' && el.className.trim()) s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    return s;
  };

  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    // transbordo horizontal real (ignora o que vive dentro de um contentor com scroll/overflow)
    if (r.right > vw + 1 && r.width > 8 && !scrollableAncestor(el)) {
      out.overflowRight.push({ el: describe(el), right: Math.round(r.right), vw, by: Math.round(r.right - vw) });
    }
    // tap targets
    const tag = el.tagName;
    const isControl = tag === 'BUTTON' || tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA' ||
      (tag === 'A' && !el.closest('p') ) ;
    if (isControl && !el.classList.contains('skip-link')) {
      const min = Math.min(r.width, r.height);
      const text = (el.textContent || '').trim();
      if (min < minTap && (tag === 'BUTTON' || tag === 'A' || tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA')) {
        out.tiny.push({ el: describe(el), w: Math.round(r.width), h: Math.round(r.height), min, minTap, text: text.slice(0, 24) });
      }
    }
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) {
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 16) out.smallFont.push({ el: describe(el), fontSize: fs });
    }
  }

  for (const img of document.querySelectorAll('img')) {
    if (img.getBoundingClientRect().width === 0 && !img.complete) continue; // ainda lazy, fora do ecrã
    if (img.complete && img.naturalWidth === 0) {
      out.brokenImages.push({ src: (img.currentSrc || img.src || '').slice(-70), alt: img.alt.slice(0, 40) });
    }
  }

  // conteúdo essencial coberto por overlay fixo
  for (const sel of criticalSelectors) {
    for (const el of document.querySelectorAll(sel)) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) continue; // fora do ecrã actual: não é avaliável
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      if (!hit) continue;
      if (!(hit === el || el.contains(hit))) {
        out.covered.push({ el: describe(el), cobertoPor: describe(hit), sel });
      }
    }
  }

  // cabeçalhos de secção não podem ficar por baixo do header fixo
  const header = document.querySelector('header');
  if (header) {
    const hcs = getComputedStyle(header);
    if (hcs.position === 'fixed' || hcs.position === 'sticky') {
      const hr = header.getBoundingClientRect();
      for (const h of document.querySelectorAll('main section h2, main section h1')) {
        if (!visible(h)) continue;
        const r = h.getBoundingClientRect();
        if (r.top < hr.bottom - 2 && r.bottom > hr.top + 2) {
          out.headerCoversHeading.push({ el: describe(h), top: Math.round(r.top), headerBottom: Math.round(hr.bottom) });
        }
      }
      // a barra de navegação / logótipo / toggle têm de caber DENTRO do header
      // (regressão medida: em 769-820px o nav terminava 74px fora do container)
      const cont = header.querySelector('.container') || header;
      const cr = cont.getBoundingClientRect();
      for (const sel of ['nav', '.logo', '.theme-toggle', '.nav-toggle']) {
        for (const el of header.querySelectorAll(sel)) {
          if (!visible(el)) continue;
          const r = el.getBoundingClientRect();
          if (r.right > cr.right + 1 || r.left < cr.left - 1) {
            out.headerOverflow.push({ el: describe(el), right: Math.round(r.right), containerRight: Math.round(cr.right), over: Math.round(r.right - cr.right) });
          }
        }
      }
    }
  }

  return out;
};

for (const vp of VIEWPORTS) {
  for (const pg of PAGES) {
    test(`${pg.name} @ ${vp.name}px — layout sem overflow, overlays nem tap targets inválidos`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(pg.url, { waitUntil: 'load' });
      // força as animações reveal e garante que TODAS as imagens lazy terminaram
      await page.evaluate(() => {
        document.querySelectorAll('.reveal').forEach((e) => e.classList.add('revealed'));
        document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
      });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.evaluate(async () => {
        await Promise.all([...document.images].map((i) => (i.complete ? Promise.resolve() : i.decode().catch(() => {}))));
      });
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);

      const minTap = vp.width <= 768 ? 44 : 24;
      const res = await page.evaluate(LAYOUT_PROBE, { critical: CRITICAL_SELECTORS, minTap });

      expect(res.hScroll, `scroll horizontal de ${res.hScroll}px`).toBeLessThanOrEqual(1);
      expect(res.overflowRight, 'elementos a transbordar o viewport').toEqual([]);
      expect(res.brokenImages, 'imagens quebradas (404)').toEqual([]);
      expect(res.smallFont, 'inputs com font-size < 16px').toEqual([]);
      expect(res.tiny, `tap targets abaixo de ${minTap}px`).toEqual([]);
      expect(res.covered, 'conteúdo essencial coberto por overlay fixo').toEqual([]);
      expect(res.headerOverflow, 'navegação/logótipo a sair do header').toEqual([]);
    });
  }
}

// --- Depoimentos: no mobile legível por inteiro, no desktop carrossel navegável ---
for (const w of [320, 375, 768]) {
  test(`depoimentos legíveis por inteiro @ ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach((e) => e.classList.add('revealed'));
      document.getElementById('depoimentos')?.scrollIntoView({ block: 'start' });
    });
    await page.waitForTimeout(400);

    const r = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.testimonial-card')];
      return cards.map((c) => {
        const rect = c.getBoundingClientRect();
        const txt = c.querySelector('.testimonial-text');
        return {
          id: c.id,
          width: Math.round(rect.width),
          visible: getComputedStyle(c).display !== 'none' && rect.width > 0,
          truncated: txt ? txt.scrollWidth > txt.clientWidth + 1 : false,
          textLen: (txt?.textContent || '').trim().length,
        };
      });
    });

    expect(r.length, 'depoimentos no DOM').toBeGreaterThanOrEqual(4);
    for (const c of r) {
      expect(c.visible, `${c.id} não está visível em ${w}px`).toBe(true);
      expect(c.truncated, `${c.id} tem texto cortado em ${w}px`).toBe(false);
      // o bug original comprimia os cards a 122px (38% da largura); exigir
      // >=70% da viewport garante que nunca regride para colunas esmagadas.
      expect(c.width, `${c.id} demasiado estreito (${c.width}px) em ${w}px`).toBeGreaterThanOrEqual(Math.round(w * 0.7));
    }
  });
}

// --- Interacções (só nos viewports representativos) -------------------------
// O carrossel com dots só existe em >=1025px (em <=768px o components.css
// empilha os depoimentos a 1 por linha, por decisão medida: um carrossel
// horizontal a 320px transbordava o viewport em 24px).
for (const vp of [{ name: '1024', width: 1024, height: 768 }, { name: '1440', width: 1440, height: 900 }]) {
  test(`carrossel de depoimentos é navegável por teclado @ ${vp.name}px`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, 0));

    const dots = page.locator('.testimonials-dot');
    await expect(dots.first()).toBeVisible();
    expect(await dots.count()).toBeGreaterThan(1);

    const estadoInicial = await page.evaluate(() => {
      const track = document.querySelector('.carousel-track');
      const active = document.querySelector('.testimonials-dot.active');
      return {
        transform: track ? getComputedStyle(track).transform : null,
        activeIndex: active ? [...document.querySelectorAll('.testimonials-dot')].indexOf(active) : -1,
      };
    });

    const segundo = dots.nth(1);
    await segundo.scrollIntoViewIfNeeded();
    await segundo.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    const estadoDepois = await page.evaluate(() => {
      const track = document.querySelector('.carousel-track');
      const active = document.querySelector('.testimonials-dot.active');
      return {
        transform: track ? getComputedStyle(track).transform : null,
        activeIndex: active ? [...document.querySelectorAll('.testimonials-dot')].indexOf(active) : -1,
      };
    });

    const mudou = estadoDepois.transform !== estadoInicial.transform || estadoDepois.activeIndex !== estadoInicial.activeIndex;
    expect(mudou, `o carrossel não reagiu ao Enter (estado: ${JSON.stringify(estadoDepois)})`).toBe(true);
  });

  test(`dark mode toggle funciona e persiste @ ${vp.name}px`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/', { waitUntil: 'load' });

    const antes = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const toggle = page.locator('.theme-toggle').first();
    await expect(toggle).toBeVisible();
    await toggle.click();
    await page.waitForTimeout(300);
    const depois = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(depois).not.toBe(antes);
    expect(['dark', 'light']).toContain(depois);

    await page.reload({ waitUntil: 'load' });
    const aposReload = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(aposReload, 'o tema não persistiu após reload').toBe(depois);
  });
}

// O dark mode tem de funcionar também no layout mobile (é onde o toggle
// costuma ser esmagado pelo flex do header) e em ambas as páginas.
for (const pg of [{ n: 'home', url: '/' }, { n: 'contacto', url: '/contacto.html' }]) {
  test(`dark mode toggle @ 375px na página ${pg.n}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(pg.url, { waitUntil: 'load' });

    const toggle = page.locator('.theme-toggle').first();
    await expect(toggle).toBeVisible();
    const box = await toggle.boundingBox();
    expect(Math.round(box.width), 'toggle esmagado em mobile').toBeGreaterThanOrEqual(44);
    expect(Math.round(box.height)).toBeGreaterThanOrEqual(44);

    const antes = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await toggle.click();
    await page.waitForTimeout(300);
    const depois = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(depois).not.toBe(antes);

    // o tema tem de mudar cor visível de fundo do body (não só o atributo)
    const bgDepois = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await toggle.click();
    await page.waitForTimeout(300);
    const bgVolta = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bgDepois, 'o tema não alterou a cor de fundo').not.toBe(bgVolta);
  });
}
