/**
 * SPACING AUDIT SCRIPT
 * Captura bounding boxes e verifica spacing em múltiplos breakpoints.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/roger/.hermes/profiles/coder/workspace/trio-eletrico/screenshots/audit';

const BREAKPOINTS = [
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile-480', width: 480, height: 800 },
  { name: 'mobile-375', width: 375, height: 667 },
];

const PAGES = [
  { file: 'index.html', label: 'index' },
  { file: 'contacto.html', label: 'contacto' },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function auditPage(browser, bp, pgFile, pgLabel, results) {
  const url = `http://localhost:3000/${pgFile}`;
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: bp.width, height: bp.height });
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  
  // Screenshot full page
  const ssDir = path.join(SCREENSHOT_DIR, bp.name);
  ensureDir(ssDir);
  await page.screenshot({ path: path.join(ssDir, `${pgLabel}-full.png`), fullPage: true });

  // Check key elements
  const checks = [
    // Hero section (index only)
    ...(pgLabel === 'index' ? [
      { name: 'hero-actions', selector: '.hero-actions' },
      { name: 'hero-btn-primary', selector: '.hero-actions .btn-primary' },
      { name: 'hero-btn-secondary', selector: '.hero-actions .btn-secondary' },
      { name: 'hero-stats', selector: '.hero-stats' },
      { name: 'hero-content', selector: '.hero-content' },
    ] : []),
    
    // Contact form (both pages)
    { name: 'contacto-form', selector: '.contacto-form' },
    { name: 'contacto-grid', selector: '.contacto-grid' },
    { name: 'btn-full-submit', selector: '.contacto-form .btn-full, .contacto-form button[type="submit"]' },
    { name: 'form-input', selector: '.contacto-form .form-group input' },
    { name: 'form-textarea', selector: '.contacto-form .form-group textarea' },
    
    // Nav btn
    { name: 'btn-nav', selector: '.btn-nav' },
    
    // Service cards
    { name: 'service-card', selector: '.service-card:first-child' },
    
    // Society cards
    { name: 'society-card', selector: '.society-card:first-child' },
    
    // Features grid
    { name: 'feature-card', selector: '.feature-card:first-child' },
    
    // WhatsApp float
    { name: 'whatsapp-float', selector: '.whatsapp-float' },
    
    // Container
    { name: 'container', selector: '.container:first-of-type' },
    
    // Body
    { name: 'body', selector: 'body' },
  ];

  for (const check of checks) {
    try {
      const el = await page.$(check.selector);
      if (!el) {
        results.push({
          page: pgLabel,
          breakpoint: bp.name,
          element: check.name,
          selector: check.selector,
          exists: false,
        });
        continue;
      }
      
      const box = await el.boundingBox();
      const computedStyle = await page.evaluate((sel) => {
        const e = document.querySelector(sel);
        if (!e) return null;
        const cs = window.getComputedStyle(e);
        return {
          paddingLeft: cs.paddingLeft,
          paddingRight: cs.paddingRight,
          marginLeft: cs.marginLeft,
          marginRight: cs.marginRight,
          width: cs.width,
          display: cs.display,
          position: cs.position,
        };
      }, check.selector);

      if (!box || !computedStyle) continue;

      const viewportWidth = bp.width;
      const distLeft = box.x;
      const distRight = viewportWidth - (box.x + box.width);
      
      const issue = [];
      
      // Detect elements touching edges (0px gap)
      if (distLeft <= 1) issue.push(`LEFT edge: ${distLeft.toFixed(1)}px from viewport`);
      if (distRight <= 1) issue.push(`RIGHT edge: ${distRight.toFixed(1)}px from viewport`);
      
      // For full-width buttons, check if they overflow
      if (check.name === 'btn-full-submit' && distLeft < 16) issue.push(`Submit btn only ${distLeft.toFixed(0)}px from left edge`);
      if (check.name === 'hero-btn-primary' && distLeft < 12) issue.push(`Hero btn only ${distLeft.toFixed(0)}px from left`);

      results.push({
        page: pgLabel,
        breakpoint: bp.name,
        element: check.name,
        selector: check.selector,
        exists: true,
        box: { x: box.x, y: box.y, w: box.width, h: box.height },
        computed: computedStyle,
        distLeft: distLeft.toFixed(1),
        distRight: distRight.toFixed(1),
        issues: issue,
      });
    } catch (e) {
      results.push({
        page: pgLabel,
        breakpoint: bp.name,
        element: check.name,
        selector: check.selector,
        error: e.message,
      });
    }
  }

  // Screenshot specific sections
  if (pgLabel === 'index') {
    const heroEl = await page.$('#hero');
    if (heroEl) {
      await heroEl.screenshot({ path: path.join(ssDir, 'index-hero.png') });
    }
  }
  
  const contactEl = await page.$('#contacto');
  if (contactEl) {
    await contactEl.screenshot({ path: path.join(ssDir, `${pgLabel}-contact.png`) });
  }

  // Check if mobile menu button exists at 480
  if (bp.width <= 480) {
    const navToggle = await page.$('.nav-toggle');
    if (navToggle) {
      const box = await navToggle.boundingBox();
      results.push({
        page: pgLabel,
        breakpoint: bp.name,
        element: 'nav-toggle',
        selector: '.nav-toggle',
        exists: true,
        box: { x: box.x, y: box.y, w: box.width, h: box.height },
      });
    }

    // Open the mobile menu and screenshot
    const toggle = await page.$('.nav-toggle');
    if (toggle) {
      await toggle.click();
      await page.waitForTimeout(500);
      const navEl = await page.$('.nav.open, nav.open');
      if (navEl) {
        await navEl.screenshot({ path: path.join(ssDir, `${pgLabel}-nav-open.png`) });
        results.push({
          page: pgLabel,
          breakpoint: bp.name,
          element: 'nav-open',
          screenshot: `${ssDir}/${pgLabel}-nav-open.png`,
        });
      }
    }
  }

  await page.close();
}

async function main() {
  ensureDir(SCREENSHOT_DIR);
  
  const browser = await chromium.launch();
  
  const results = [];
  
  for (const bp of BREAKPOINTS) {
    for (const pg of PAGES) {
      console.log(`Auditing ${pg.label} @ ${bp.name} (${bp.width}x${bp.height})...`);
      await auditPage(browser, bp, pg.file, pg.label, results);
    }
  }
  
  await browser.close();
  
  // Write results
  const outputPath = path.join(SCREENSHOT_DIR, 'audit-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('\n========== SPACING AUDIT SUMMARY ==========\n');
  
  const withIssues = results.filter(r => r.issues && r.issues.length > 0);
  if (withIssues.length === 0) {
    console.log('NO SPACING ISSUES FOUND!');
  } else {
    console.log(`FOUND ${withIssues.length} ELEMENTS WITH SPACING ISSUES:\n`);
    for (const r of withIssues) {
      console.log(`  [${r.page}] [${r.breakpoint}] ${r.element}`);
      console.log(`    Selector: ${r.selector}`);
      console.log(`    Box: x=${r.box?.x?.toFixed(1)}, w=${r.box?.w?.toFixed(1)}`);
      console.log(`    Distances: left=${r.distLeft}px, right=${r.distRight}px`);
      console.log(`    Issues: ${r.issues.join('; ')}`);
      console.log('');
    }
  }
  
  // Print all elements for reference
  console.log('\n========== ALL ELEMENTS ==========\n');
  for (const r of results) {
    if (r.exists && r.box) {
      console.log(`  [${r.page}][${r.breakpoint}] ${r.element}: x=${r.box.x?.toFixed(0)}, w=${r.box.w?.toFixed(0)}, left=${r.distLeft}px, right=${r.distRight}px`);
    }
  }
  
  console.log(`\nFull results: ${outputPath}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}`);
}

main().catch(e => { console.error(e); process.exit(1); });
