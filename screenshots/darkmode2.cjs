const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Force reveal all sections
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.classList.add('revealed');
    });
  });
  
  // Scroll to trigger lazy content
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });
  
  await page.waitForTimeout(500);

  // Switch to dark mode
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  
  // Try clicking the theme toggle button
  const btn = await page.$('button[class*="theme"], button[id*="theme"], [data-toggle-theme], .theme-toggle');
  if (btn) await btn.click();
  else {
    await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const b of btns) {
        if (b.textContent.includes('escuro') || b.textContent.includes('dark') || b.ariaLabel?.includes('escuro')) {
          b.click();
          break;
        }
      }
    });
  }
  
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/desktop-1440-dark.png', fullPage: true });
  console.log('Done: dark mode');
  await browser.close();
})();
