/**
 * Spacing Audit Script for Trio Elétrico
 * Measures padding, margin, gap, and other spacing properties across all sections
 * at 3 breakpoints: desktop (1440x900), tablet (768x1024), mobile (375x667)
 */

import { chromium } from 'playwright';

const BREAKPOINTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

const SECTIONS = [
  { id: 'hero', selector: '#hero', name: 'Hero' },
  { id: 'sobre', selector: '#sobre', name: 'Sobre' },
  { id: 'servicos', selector: '#servicos', name: 'Serviços' },
  { id: 'areas', selector: '#areas', name: 'Áreas de Atuação' },
  { id: 'galeria', selector: '#galeria', name: 'Galeria' },
  { id: 'porquenos', selector: '#porquenos', name: 'Porquê Nós' },
  { id: 'depoimentos', selector: '#depoimentos', name: 'Depoimentos' },
  { id: 'faq', selector: '#faq', name: 'FAQ' },
  { id: 'contacto', selector: '#contacto', name: 'Contacto' },
];

// Additional pages to check
const PAGES = [
  { name: 'index', url: 'http://localhost:3000/' },
  { name: 'contacto', url: 'http://localhost:3000/contacto.html' },
];

// Elements that commonly have spacing issues
const ELEMENT_SELECTORS = {
  hero: [
    '.hero-title', '.hero-subtitle', '.hero-cta', '.hero-cta a',
    '.hero-stats', '.hero-stat', '.hero-content', '.hero-description',
    '.hero-badge', '.hero-image', '.hero-illustration',
    'h1', 'h2', '.btn',
  ],
  sobre: [
    '.empresa-info', '.empresa-info-row', '.info-card', '.sobre-content',
    '.sobre-text', '.sobre-image', '.sobre-list',
    'h2', '.section-header', '.section-subtitle',
  ],
  servicos: [
    '.servicos-grid', '.servico-card', '.servico-icon',
    '.servico-title', '.servico-description',
    'h2', '.section-header',
  ],
  areas: [
    '.map-container', '.map-svg', '.areas-content',
    '.areas-list', '.areas-map',
    'h2', '.section-header',
  ],
  galeria: [
    '.galeria-grid', '.galeria-item', '.galeria-image',
    '.galeria-caption', '.gallery-item',
    'h2', '.section-header',
  ],
  porquenos: [
    '.porquenos-grid', '.porquenos-card', '.feature-card',
    '.feature-icon', '.feature-title', '.feature-description',
    'h2', '.section-header',
  ],
  depoimentos: [
    '.depoimentos-carousel', '.depoimento-card', '.testimonial-card',
    '.testimonial-text', '.testimonial-author', '.testimonial-role',
    '.depoimentos-dots', '.carousel-nav',
    'h2', '.section-header',
  ],
  faq: [
    '.faq-list', '.faq-item', '.faq-question', '.faq-answer',
    'h2', '.section-header',
  ],
  contacto: [
    '.contact-form', '.form-group', '.form-label', '.form-input',
    '.contact-info', '.contact-item', '.contact-map',
    'h2', '.section-header',
  ],
};

// Spacing properties to measure
const SPACING_PROPS = [
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
];

async function measureElement(page, selector, context) {
  const el = await page.$(selector);
  if (!el) return null;

  try {
    const style = await page.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const result = {};
      for (const prop of SPACING_PROPS) {
        result[prop] = cs[prop];
      }
      // Also check gap (for flex/grid parents)
      const parent = el.parentElement;
      if (parent) {
        const parentCs = window.getComputedStyle(parent);
        result['parentGap'] = parentCs.gap;
        result['parentDisplay'] = parentCs.display;
      }
      // Check box-sizing
      result['boxSizing'] = cs.boxSizing;
      // Element dimensions
      const rect = el.getBoundingClientRect();
      result['width'] = rect.width;
      result['height'] = rect.height;
      // Check for overflow
      result['overflow'] = cs.overflow;
      result['overflowX'] = cs.overflowX;
      result['overflowY'] = cs.overflowY;
      return result;
    }, el);

    return { selector, matches: 1, measurements: style };
  } catch {
    return { selector, matches: 0, error: 'evaluation_failed' };
  }
}

async function measureAllElements(page, selectors, sectionName) {
  const results = [];
  for (const sel of selectors) {
    const count = await page.evaluate((sel) => {
      return document.querySelectorAll(sel).length;
    }, sel);

    if (count === 0) continue;

    // Measure first matching element
    const el = await page.$(sel);
    if (!el) continue;

    try {
      const style = await page.evaluate((el, s) => {
        const cs = window.getComputedStyle(el);
        const result = {};
        for (const prop of SPACING_PROPS) {
          result[prop] = cs[prop];
        }
        const parent = el.parentElement;
        if (parent) {
          const parentCs = window.getComputedStyle(parent);
          result['parentGap'] = parentCs.gap;
          result['parentDisplay'] = parentCs.display;
        }
        result['boxSizing'] = cs.boxSizing;
        const rect = el.getBoundingClientRect();
        result['width'] = Math.round(rect.width);
        result['height'] = Math.round(rect.height);
        result['overflow'] = cs.overflow;
        result['overflowX'] = cs.overflowX;
        result['overflowY'] = cs.overflowY;
        // Check text alignment
        result['textAlign'] = cs.textAlign;
        // Check display
        result['display'] = cs.display;
        // Check position
        result['position'] = cs.position;
        return result;
      }, el);

      results.push({
        selector: s,
        count,
        measurements: style,
      });
    } catch {
      results.push({
        selector: sel,
        count,
        error: 'evaluation_failed',
      });
    }
  }
  return results;
}

function detectSpacingIssues(measurements, sectionName) {
  const issues = [];

  for (const m of measurements) {
    const pad = m.measurements;
    if (!pad) continue;

    const padT = parseInt(pad.paddingTop) || 0;
    const padR = parseInt(pad.paddingRight) || 0;
    const padB = parseInt(pad.paddingBottom) || 0;
    const padL = parseInt(pad.paddingLeft) || 0;

    const marginT = parseInt(pad.marginTop) || 0;
    const marginR = parseInt(pad.marginRight) || 0;
    const marginB = parseInt(pad.marginBottom) || 0;
    const marginL = parseInt(pad.marginLeft) || 0;

    // Check for very small padding on large elements
    if (pad.width > 400 && (padT < 16 || padB < 16)) {
      issues.push({
        severity: 'warning',
        selector: m.selector,
        element: `${m.count}x element(s)`,
        description: `Padding vertical pequeno (${padT}px/${padB}px) para elemento largo (${pad.width}px)`,
        values: { paddingTop: padT, paddingBottom: padB },
        recommendation: 'Considerar padding vertical >= 24px',
      });
    }

    // Check for asymmetrical padding (top != bottom)
    if (Math.abs(padT - padB) > 20 && (padT > 20 || padB > 20)) {
      issues.push({
        severity: 'info',
        selector: m.selector,
        element: `${m.count}x element(s)`,
        description: `Padding vertical assimétrico: top=${padT}px, bottom=${padB}px (diferença: ${Math.abs(padT - padB)}px)`,
        values: { paddingTop: padT, paddingBottom: padB },
      });
    }

    // Check for horizontal overflow
    if (pad.overflowX === 'visible' || pad.overflowY === 'visible') {
      issues.push({
        severity: 'warning',
        selector: m.selector,
        element: `${m.count}x element(s)`,
        description: `Overflow visível: overflowX=${pad.overflowX}, overflowY=${pad.overflowY}`,
        values: { overflowX: pad.overflowX, overflowY: pad.overflowY },
        recommendation: 'Verificar se causa scroll horizontal ou cut-off de conteúdo',
      });
    }

    // Check for very large margins
    if (marginT > 100 || marginB > 100) {
      issues.push({
        severity: 'info',
        selector: m.selector,
        element: `${m.count}x element(s)`,
        description: `Margem vertical grande: top=${marginT}px, bottom=${marginB}px`,
        values: { marginTop: marginT, marginBottom: marginB },
      });
    }

    // Check for zero padding on cards/containers
    if ((padT === 0 && padB === 0 && padL === 0 && padR === 0) &&
        m.selector.includes('card') && m.count > 0) {
      issues.push({
        severity: 'warning',
        selector: m.selector,
        element: `${m.count}x element(s)`,
        description: 'Card sem padding interno',
        values: { padding: '0' },
        recommendation: 'Considerar padding de 16-24px em cards',
      });
    }

    // Check for asymmetric horizontal padding
    if (padL !== padR && (padL > 10 || padR > 10) && Math.abs(padL - padR) > 10) {
      issues.push({
        severity: 'info',
        selector: m.selector,
        element: `${m.count}x element(s)`,
        description: `Padding horizontal assimétrico: left=${padL}px, right=${padR}px`,
        values: { paddingLeft: padL, paddingRight: padR },
      });
    }

    // Section-level: check if padding is reasonable
    if (sectionName && (m.selector === `#${sectionName.toLowerCase().replace('é', 'e').replace('õ', 'o').replace('ç', 'c').replace('ã', 'a')}` || 
                         m.selector.includes('section') || m.selector.includes('.section'))) {
      if (padT < 40 || padB < 40) {
        issues.push({
          severity: 'warning',
          selector: m.selector,
          element: `Section ${sectionName}`,
          description: `Padding vertical da secção pequeno: top=${padT}px, bottom=${padB}px (recomendado >= 40px cada)`,
          values: { paddingTop: padT, paddingBottom: padB },
          recommendation: 'Secções devem ter padding vertical generoso (48-64px)',
        });
      }
    }
  }

  return issues;
}

async function runAudit() {
  console.log('=== TRIO ELÉTRICO SPACING AUDIT ===\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const allResults = [];
  const allIssues = [];

  for (const pageConfig of PAGES) {
    console.log(`\n--- Página: ${pageConfig.name} ---`);

    for (const bp of BREAKPOINTS) {
      console.log(`  Breakpoint: ${bp.name} (${bp.width}x${bp.height})`);

      const context = await browser.newContext({
        viewport: { width: bp.width, height: bp.height },
      });

      const page = await context.newPage();
      await page.goto(pageConfig.url, { waitUntil: 'networkidle' });

      // Wait for fonts to load
      await page.evaluate(async () => {
        await document.fonts?.ready;
        await new Promise(r => setTimeout(r, 500));
      });

      // Screenshot full page
      const fullScreenPath = `/tmp/audit_${pageConfig.name}_${bp.name}_full.png`;
      await page.screenshot({ path: fullScreenPath, fullPage: false });
      console.log(`    Screenshot: ${fullScreenPath}`);

      // Scroll to each section and take screenshots + measurements
      for (const section of SECTIONS) {
        const sectionEl = await page.$(section.selector);
        if (!sectionEl) continue;

        // Scroll section into view
        await sectionEl.scrollIntoViewIfNeeded();
        await new Promise(r => setTimeout(r, 200));

        // Screenshot section
        const sectionScreenPath = `/tmp/audit_${pageConfig.name}_${bp.name}_${section.id}.png`;
        try {
          const rect = await sectionEl.boundingBox();
          if (rect) {
            await page.screenshot({
              path: sectionScreenPath,
              clip: { x: 0, y: rect.y, width: bp.width, height: Math.max(rect.height, bp.height) },
            });
          }
        } catch {
          await page.screenshot({ path: sectionScreenPath, fullPage: false });
        }

        // Get selectors for this section
        const selectors = ELEMENT_SELECTORS[section.id] || [];
        const measurements = await measureAllElements(page, selectors, section.name);

        // Detect issues
        const issues = detectSpacingIssues(measurements, section.name);

        // Also check the section container itself
        const sectionMeasurements = await measureAllElements(
          page,
          [section.selector, `${section.selector} .section-header`, `${section.selector} h2`],
          section.name
        );
        const sectionIssues = detectSpacingIssues(sectionMeasurements, section.name);
        issues.push(...sectionIssues);

        // Log summary
        if (issues.length > 0) {
          console.log(`    [${section.name}] ${issues.length} issue(s) found`);
          for (const issue of issues.slice(0, 3)) {
            console.log(`      - ${issue.severity.toUpperCase()}: ${issue.description.substring(0, 100)}`);
          }
        }

        allResults.push({
          page: pageConfig.name,
          breakpoint: bp.name,
          viewport: `${bp.width}x${bp.height}`,
          section: section.name,
          sectionId: section.id,
          screenshots: sectionScreenPath,
          measurements,
          issues,
        });

        allIssues.push(...issues.map(i => ({
          ...i,
          page: pageConfig.name,
          breakpoint: bp.name,
          section: section.name,
        })));
      }

      // Check header/nav
      const navMeasurements = await measureAllElements(page, [
        'header', 'nav', '.navbar', '.header', '.mobile-menu', '.hamburger',
      ], 'Header');
      const navIssues = detectSpacingIssues(navMeasurements, null);

      allResults.push({
        page: pageConfig.name,
        breakpoint: bp.name,
        viewport: `${bp.width}x${bp.height}`,
        section: 'Header/Nav',
        sectionId: 'header',
        screenshots: `/tmp/audit_${pageConfig.name}_${bp.name}_header.png`,
        measurements: navMeasurements,
        issues: navIssues,
      });
      allIssues.push(...navIssues.map(i => ({ ...i, page: pageConfig.name, breakpoint: bp.name, section: 'Header/Nav' })));

      // Check footer
      const footerMeasurements = await measureAllElements(page, [
        'footer', '.footer', '.site-footer',
      ], 'Footer');
      const footerIssues = detectSpacingIssues(footerMeasurements, null);

      allResults.push({
        page: pageConfig.name,
        breakpoint: bp.name,
        viewport: `${bp.width}x${bp.height}`,
        section: 'Footer',
        sectionId: 'footer',
        screenshots: `/tmp/audit_${pageConfig.name}_${bp.name}_footer.png`,
        measurements: footerMeasurements,
        issues: footerIssues,
      });
      allIssues.push(...footerIssues.map(i => ({ ...i, page: pageConfig.name, breakpoint: bp.name, section: 'Footer' })));

      await context.close();
    }
  }

  await browser.close();

  // Save results
  const fs = await import('fs');
  const outputPath = '/home/roger/.hermes/profiles/coder/workspace/trio-eletrico/spacing-audit-results.json';
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    pages: PAGES.map(p => p.name),
    breakpoints: BREAKPOINTS.map(b => b.name),
    totalIssues: allIssues.length,
    issuesByBreakpoint: {
      desktop: allIssues.filter(i => i.breakpoint === 'desktop').length,
      tablet: allIssues.filter(i => i.breakpoint === 'tablet').length,
      mobile: allIssues.filter(i => i.breakpoint === 'mobile').length,
    },
    issuesBySection: (() => {
      const bySection = {};
      for (const issue of allIssues) {
        bySection[issue.section] = (bySection[issue.section] || 0) + 1;
      }
      return bySection;
    })(),
    issues: allIssues,
    fullResults: allResults,
  }, null, 2), 'utf-8');

  console.log(`\n=== AUDIT COMPLETE ===`);
  console.log(`Results saved to: ${outputPath}`);
  console.log(`Total issues found: ${allIssues.length}`);
  console.log(`By breakpoint: desktop=${allIssues.filter(i => i.breakpoint === 'desktop').length}, ` +
    `tablet=${allIssues.filter(i => i.breakpoint === 'tablet').length}, ` +
    `mobile=${allIssues.filter(i => i.breakpoint === 'mobile').length}`);

  // Print top issues
  const critical = allIssues.filter(i => i.severity === 'warning').slice(0, 20);
  if (critical.length > 0) {
    console.log(`\nTop ${Math.min(20, critical.length)} issues:`);
    critical.forEach((issue, i) => {
      console.log(`  ${i + 1}. [${issue.breakpoint.toUpperCase()}][${issue.section}] ${issue.description.substring(0, 120)}`);
    });
  }
}

runAudit().catch(err => {
  console.error('AUDIT FAILED:', err);
  process.exit(1);
});
