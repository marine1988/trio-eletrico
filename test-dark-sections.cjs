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
    
    // Scroll to the team section
    await page.evaluate(() => {
        document.getElementById('sobre').scrollIntoView();
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/dark-team-section.png' });
    
    // Scroll to FAQ
    await page.evaluate(() => {
        document.getElementById('faq').scrollIntoView();
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/dark-faq-section.png' });
    
    // Scroll to contact
    await page.evaluate(() => {
        document.getElementById('contacto').scrollIntoView();
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/dark-contact-section.png' });
    
    await browser.close();
    console.log('Screenshots saved');
})();
