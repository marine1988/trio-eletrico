const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8000/');
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    const btn = document.querySelector('button[aria-label*=escuro]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/desktop-1440-dark.png', fullPage: true });
  console.log('Done: dark mode');
  await browser.close();
})();
