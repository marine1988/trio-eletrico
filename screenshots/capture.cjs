const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8000/');
  await page.waitForTimeout(2000);
  const sizes = [
    { name: 'desktop-1440', w: 1440, h: 900 },
    { name: 'tablet-768', w: 768, h: 1024 },
    { name: 'mobile-375', w: 375, h: 667 },
    { name: 'iphone-390', w: 390, h: 844 },
  ];
  for (const s of sizes) {
    await page.setViewportSize({ width: s.w, height: s.h });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `screenshots/${s.name}.png`, fullPage: true });
    console.log(`Done: ${s.name}.png`);
  }
  await browser.close();
})();
