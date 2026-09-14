const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch();
  const contexts = [
    { name: 'desktop-1440', w: 1440, h: 900 },
    { name: 'tablet-768', w: 768, h: 1024 },
    { name: 'mobile-375', w: 375, h: 667 },
    { name: 'iphone-390', w: 390, h: 844 },
  ];
  
  for (const ctx of contexts) {
    const context = await browser.newContext({ viewport: { width: ctx.w, height: ctx.h } });
    const page = await context.newPage();
    await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Force reveal all sections by removing the reveal class behavior
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.classList.add('revealed');
      });
    });
    
    // Scroll to bottom to trigger any lazy loading
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
    await page.screenshot({ path: `screenshots/${ctx.name}.png`, fullPage: true });
    console.log(`Done: ${ctx.name}.png`);
    await context.close();
  }
  await browser.close();
})();
