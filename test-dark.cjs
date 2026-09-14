const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:8000');
    await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/desktop-1440-dark-fixed.png', fullPage: true });
    await browser.close();
    console.log('Screenshot saved');
})();
