/**
 * Spacing Audit Script v2 for Trio Elétrico
 * Uses a broad-spectrum approach: measures ALL visible elements in each section
 */

import { chromium } from 'playwright';
import fs from 'fs';

const BREAKPOINTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

const SECTIONS = [
  { id: 'hero', selector: '#hero', name: 'Hero', cssClass: '.hero' },
  { id: 'sobre', selector: '#sobre', name: 'Sobre', cssClass: '.sobre' },
  { id: 'servicos', selector: '#servicos', name: 'Serviços', cssClass: '.servicos' },
  { id: 'areas', selector: '#areas', name: 'Áreas de Atuação', cssClass: '.areas' },
  { id: 'galeria', selector: '#galeria', name: 'Galeria', cssClass: '.galeria' },
  { id: 'porquenos', selector: '#porquenos', name: 'Porquê Nós', cssClass: '.porquenos' },
  { id: 'depoimentos', selector: '#depoimentos', name: 'Depoimentos', cssClass: '.depoimentos' },
  { id: 'faq', selector: '#faq', name: 'FAQ', cssClass: '.faq' },
  { id: 'contacto', selector: '#contacto', name: 'Contacto', cssClass: '.contacto' },
];

const SPACING_PROPS = [
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
];

function pxToInt(px) {
  if (!px || px === 'auto') return -1;
  return parseInt(px) || 0;
}

// --- Evaluate functions (run in browser context) ---

function sectionMeasureFn(props, sel) {
  const el = document.querySelector(sel);
  if (!el) return null;
  const cs = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const result = {
    selector: sel,
    tag: el.tagName,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
  for (const prop of props) {
    result[prop] = cs[prop];
  }
  result['boxSizing'] = cs.boxSizing;
  result['display'] = cs.display;
  result['overflowX'] = cs.overflowX;
  result['overflowY'] = cs.overflowY;
  result['childCount'] = el.children.length;
  return result;
}

function childMeasureFn(props, sel) {
  const section = document.querySelector(sel);
  if (!section) return [];
  const results = [];

  for (const child of section.children) {
    const cs = window.getComputedStyle(child);
    const rect = child.getBoundingClientRect();
    const childResult = {
      parent: section.tagName,
      tag: child.tagName,
      classes: child.className,
      id: child.id,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
    for (const prop of props) {
      childResult[prop] = cs[prop];
    }
    childResult['boxSizing'] = cs.boxSizing;
    childResult['display'] = cs.display;
    childResult['overflowX'] = cs.overflowX;
    childResult['overflowY'] = cs.overflowY;
    childResult['gap'] = cs.gap;
    childResult['justifyContent'] = cs.justifyContent;
    childResult['alignItems'] = cs.alignItems;
    childResult['flexDirection'] = cs.flexDirection;
    childResult['position'] = cs.position;
    results.push(childResult);
  }

  for (const child of section.children) {
    const cs = window.getComputedStyle(child);
    if (cs.display === 'flex' || cs.display === 'grid' || cs.display === 'inline-flex' || cs.display === 'inline-grid') {
      const grandResults = [];
      for (const grandchild of child.children) {
        const gcs = window.getComputedStyle(grandchild);
        const grec = grandchild.getBoundingClientRect();
        const gResult = {
          parentTag: child.tagName,
          parentClasses: child.className,
          tag: grandchild.tagName,
          classes: grandchild.className,
          id: grandchild.id,
          width: Math.round(grec.width),
          height: Math.round(grec.height),
        };
        for (const prop of props) {
          gResult[prop] = gcs[prop];
        }
        gResult['boxSizing'] = gcs.boxSizing;
        gResult['display'] = gcs.display;
        gResult['gap'] = gcs.gap;
        gResult['position'] = gcs.position;
        grandResults.push(gResult);
      }
      if (grandResults.length > 0) {
        results.push({
          _isContainer: true,
          containerTag: child.tagName,
          containerClasses: child.className,
          display: cs.display,
          gap: cs.gap,
          justifyContent: cs.justifyContent,
          alignItems: cs.alignItems,
          flexDirection: cs.flexDirection,
          gridTemplateColumns: cs.gridTemplateColumns,
          gridTemplateRows: cs.gridTemplateRows,
          columns: cs.columns,
          children: grandResults,
        });
      }
    }
  }

  return results;
}

function headerMeasureFn(props) {
  const header = document.querySelector('header, .header');
  if (!header) return null;
  const cs = window.getComputedStyle(header);
  const rect = header.getBoundingClientRect();
  const result = {
    selector: 'header',
    tag: header.tagName,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
  for (const prop of props) {
    result[prop] = cs[prop];
  }
  result['boxSizing'] = cs.boxSizing;
  result['display'] = cs.display;
  result['position'] = cs.position;
  result['zIndex'] = cs.zIndex;

  const children = [];
  for (const child of header.children) {
    const ccs = window.getComputedStyle(child);
    const crect = child.getBoundingClientRect();
    const cInfo = {
      tag: child.tagName,
      classes: child.className,
      id: child.id,
      width: Math.round(crect.width),
      height: Math.round(crect.height),
    };
    for (const prop of props) {
      cInfo[prop] = ccs[prop];
    }
    children.push(cInfo);
  }
  result.children = children;
  return result;
}

function footerMeasureFn(props) {
  const footer = document.querySelector('footer, .footer');
  if (!footer) return null;
  const cs = window.getComputedStyle(footer);
  const rect = footer.getBoundingClientRect();
  const result = {
    selector: 'footer',
    tag: footer.tagName,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
  for (const prop of props) {
    result[prop] = cs[prop];
  }
  result['boxSizing'] = cs.boxSizing;
  result['display'] = cs.display;
  result['position'] = cs.position;

  const children = [];
  for (const child of footer.children) {
    const ccs = window.getComputedStyle(child);
    const crect = child.getBoundingClientRect();
    const cInfo = {
      tag: child.tagName,
      classes: child.className,
      id: child.id,
      width: Math.round(crect.width),
      height: Math.round(crect.height),
    };
    for (const prop of props) {
      cInfo[prop] = ccs[prop];
    }
    children.push(cInfo);
  }
  result.children = children;
  return result;
}

// --- Issue detection ---

function detectIssues(sectionData, children, pageName, bpName, sectionName) {
  const issues = [];
  const padT = pxToInt(sectionData?.paddingTop);
  const padB = pxToInt(sectionData?.paddingBottom);

  if (sectionData) {
    if (padT === -1 || padT < 40) {
      issues.push({
        type: 'section-padding',
        severity: 'warning',
        page: pageName,
        breakpoint: bpName,
        section: sectionName,
        element: sectionData.selector,
        description: `Secção "${sectionName}": padding-top=${sectionData.paddingTop} (recomendado >= 40px)`,
        value: sectionData.paddingTop,
        recommended: '>= 40px',
      });
    }
    if (padB === -1 || padB < 40) {
      issues.push({
        type: 'section-padding',
        severity: 'warning',
        page: pageName,
        breakpoint: bpName,
        section: sectionName,
        element: sectionData.selector,
        description: `Secção "${sectionName}": padding-bottom=${sectionData.paddingBottom} (recomendado >= 40px)`,
        value: sectionData.paddingBottom,
        recommended: '>= 40px',
      });
    }
  }

  for (const child of children) {
    if (child._isContainer) {
      const gap = child.gap;
      if (gap && gap !== 'normal' && gap !== '0px') {
        const gapVal = parseInt(gap) || 0;
        if (gapVal < 16 && (child.children?.length || 0) > 2) {
          issues.push({
            type: 'container-gap',
            severity: 'warning',
            page: pageName,
            breakpoint: bpName,
            section: sectionName,
            element: `${child.containerTag}.${child.containerClasses}`,
            description: `Container: gap=${gap} com ${(child.children?.length || 0)} filhos`,
            value: gap,
            recommended: '>= 16px',
          });
        }
      }
      for (const gc of (child.children || [])) {
        const gcPadT = pxToInt(gc.paddingTop);
        if (gcPadT === -1 || gcPadT === 0) {
          issues.push({
            type: 'grid-child-padding',
            severity: 'info',
            page: pageName,
            breakpoint: bpName,
            section: sectionName,
            element: `${gc.tag}.${gc.classes}`,
            description: `Elemento em grid: padding-top=${gc.paddingTop}`,
            value: gc.paddingTop,
          });
        }
      }
      continue;
    }

    const padT = pxToInt(child.paddingTop);
    const padB = pxToInt(child.paddingBottom);
    const padL = pxToInt(child.paddingLeft);
    const padR = pxToInt(child.paddingRight);
    const classes = (child.classes || '').split(/\s+/).slice(0, 3).join(' ');
    const id = child.id || '';
    const elRef = id ? `#${id}` : `${child.tag}.${classes}`;

    if (child.tag && (child.tag.toLowerCase().includes('card') || child.tag === 'DIV') &&
        typeof child.classes === 'string' && child.classes.includes('card')) {
      if (padT < 16 && padB < 16) {
        issues.push({
          type: 'card-padding',
          severity: 'warning',
          page: pageName,
          breakpoint: bpName,
          section: sectionName,
          element: elRef,
          description: `Card: padding muito pequeno (${child.paddingTop}/${child.paddingBottom})`,
          value: `${child.paddingTop} ${child.paddingBottom}`,
          recommended: '>= 16-24px',
        });
      }
    }

    if (padT > 0 && padB > 0 && Math.abs(padT - padB) > 12) {
      issues.push({
        type: 'asymmetric-padding',
        severity: 'info',
        page: pageName,
        breakpoint: bpName,
        section: sectionName,
        element: elRef,
        description: `Assimetria: padding-top=${child.paddingTop}, padding-bottom=${child.paddingBottom}`,
        value: `${child.paddingTop} vs ${child.paddingBottom}`,
      });
    }

    if (child.overflowX && child.overflowX !== 'visible') {
      issues.push({
        type: 'overflow',
        severity: 'warning',
        page: pageName,
        breakpoint: bpName,
        section: sectionName,
        element: elRef,
        description: `overflowX=${child.overflowX}`,
        value: child.overflowX,
      });
    }

    const marginB = pxToInt(child.marginBottom);
    const marginT = pxToInt(child.marginTop);
    if (marginB > 80) {
      issues.push({
        type: 'large-margin',
        severity: 'info',
        page: pageName,
        breakpoint: bpName,
        section: sectionName,
        element: elRef,
        description: `Margem grande: margin-bottom=${child.marginBottom}`,
        value: child.marginBottom,
      });
    }

    if (child.tag === 'H1' || child.tag === 'H2' || child.tag === 'H3') {
      if (marginT > 40) {
        issues.push({
          type: 'heading-margin',
          severity: 'warning',
          page: pageName,
          breakpoint: bpName,
          section: sectionName,
          element: elRef,
          description: `${child.tag} com margin-top=${child.marginTop}`,
          value: child.marginTop,
        });
      }
    }
  }

  return issues;
}

function detectHeaderIssues(headerData, pageName, bpName) {
  const issues = [];
  if (!headerData) return issues;

  if (headerData.height === 'auto') {
    issues.push({
      type: 'header-height',
      severity: 'warning',
      page: pageName,
      breakpoint: bpName,
      section: 'Header',
      element: 'header',
      description: `Header height=${headerData.height} (não fixo)`,
      value: headerData.height,
      recommended: '60-80px',
    });
  }

  const padT = pxToInt(headerData.paddingTop);
  const padB = pxToInt(headerData.paddingBottom);
  if (padT > 0 || padB > 0) {
    issues.push({
      type: 'header-padding',
      severity: 'info',
      page: pageName,
      breakpoint: bpName,
      section: 'Header',
      element: 'header',
      description: `Header tem padding: top=${headerData.paddingTop} bottom=${headerData.paddingBottom}`,
      value: `${headerData.paddingTop} ${headerData.paddingBottom}`,
    });
  }

  return issues;
}

function detectFooterIssues(footerData, pageName, bpName) {
  const issues = [];
  if (!footerData) return issues;

  const padT = pxToInt(footerData.paddingTop);
  const padB = pxToInt(footerData.paddingBottom);
  if (Math.abs(padT - padB) > 12) {
    issues.push({
      type: 'footer-asymmetry',
      severity: 'warning',
      page: pageName,
      breakpoint: bpName,
      section: 'Footer',
      element: 'footer',
      description: `Footer padding assimétrico: top=${footerData.paddingTop} vs bottom=${footerData.paddingBottom}`,
      value: `${footerData.paddingTop} vs ${footerData.paddingBottom}`,
      recommended: 'igual (ex: 40px / 40px)',
    });
  }

  if (padB < 24) {
    issues.push({
      type: 'footer-padding',
      severity: 'info',
      page: pageName,
      breakpoint: bpName,
      section: 'Footer',
      element: 'footer',
      description: `Footer padding-bottom=${footerData.paddingBottom} (pode ser pequeno)`,
      value: footerData.paddingBottom,
      recommended: '>= 32px',
    });
  }

  return issues;
}

// --- Main ---

async function runAudit() {
  console.log('=== TRIO ELÉTRICO SPACING AUDIT v2 ===\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const allResults = {
    timestamp: new Date().toISOString(),
    pages: ['index', 'contacto'],
    breakpoints: BREAKPOINTS.map(b => b.name),
    issues: [],
    measurements: {},
    screenshots: [],
  };

  for (const pageName of ['index', 'contacto']) {
    console.log(`\n--- Página: ${pageName} ---`);
    const url = pageName === 'index' ? 'http://localhost:3000/' : 'http://localhost:3000/contacto.html';

    for (const bp of BREAKPOINTS) {
      console.log(`  Breakpoint: ${bp.name} (${bp.width}x${bp.height})`);
      const key = `${pageName}_${bp.name}`;

      const context = await browser.newContext({ viewport: { width: bp.width, height: bp.height } });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        await document.fonts?.ready;
        await new Promise(r => setTimeout(r, 500));
      });

      // Full page screenshot
      const fullPath = `/tmp/audit_${pageName}_${bp.name}_full.png`;
      await page.screenshot({ path: fullPath, fullPage: false });
      allResults.screenshots.push(fullPath);
      console.log(`    Screenshot: ${fullPath}`);

      // Section measurements
      for (const section of SECTIONS) {
        const sectionEl = await page.$(section.selector);
        if (!sectionEl) continue;

        await sectionEl.scrollIntoViewIfNeeded();
        await new Promise(r => setTimeout(r, 150));

        const sectionData = await page.evaluate(sectionMeasureFn, { props: SPACING_PROPS, sel: section.selector });

        if (!sectionData) continue;

        const childData = await page.evaluate(childMeasureFn, { props: SPACING_PROPS, sel: section.selector });

        allResults.measurements[key] = allResults.measurements[key] || {};
        allResults.measurements[key][section.id] = {
          section: sectionData,
          children: childData,
        };

        // Section screenshot
        const sectionScreenPath = `/tmp/audit_${pageName}_${bp.name}_${section.id}.png`;
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
        allResults.screenshots.push(sectionScreenPath);

        const issues = detectIssues(sectionData, childData, pageName, bp.name, section.name);
        allResults.issues.push(...issues);
        console.log(`    [${section.name}] ${childData.length} elements, ${issues.length} issue(s)`);
      }

      // Header
      const headerData = await page.evaluate(headerMeasureFn, SPACING_PROPS);
      if (headerData) {
        const headerIssues = detectHeaderIssues(headerData, pageName, bp.name);
        allResults.issues.push(...headerIssues);
        allResults.measurements[key] = allResults.measurements[key] || {};
        allResults.measurements[key].header = headerData;
      }

      // Footer
      const footerData = await page.evaluate(footerMeasureFn, SPACING_PROPS);
      if (footerData) {
        const footerIssues = detectFooterIssues(footerData, pageName, bp.name);
        allResults.issues.push(...footerIssues);
        allResults.measurements[key] = allResults.measurements[key] || {};
        allResults.measurements[key].footer = footerData;
      }

      await context.close();
    }
  }

  await browser.close();

  // Save
  const outputPath = '/home/roger/.hermes/profiles/coder/workspace/trio-eletrico/spacing-audit-results.json';
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf-8');

  console.log(`\n=== AUDIT COMPLETE ===`);
  console.log(`Results: ${outputPath}`);
  console.log(`Total issues: ${allResults.issues.length}`);
  const byBP = {};
  for (const i of allResults.issues) {
    byBP[i.breakpoint] = (byBP[i.breakpoint] || 0) + 1;
  }
  for (const bp of ['desktop', 'tablet', 'mobile']) {
    console.log(`  ${bp}: ${byBP[bp] || 0}`);
  }
}

runAudit().catch(err => {
  console.error('AUDIT FAILED:', err.message);
  process.exit(1);
});
