const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://localhost:8000');
    await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    });
    await page.waitForTimeout(300);
    
    // Scroll to the team section
    await page.evaluate(() => {
        document.getElementById('sobre').scrollIntoView();
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/dark-team-final.png' });
    
    // Scroll to porquenos
    await page.evaluate(() => {
        document.getElementById('porquenos').scrollIntoView();
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/dark-features-final.png' });
    
    // Scroll to FAQ
    await page.evaluate(() => {
        document.getElementById('faq').scrollIntoView();
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/dark-faq-final.png' });
    
    // Scroll to contact
    await page.evaluate(() => {
        document.getElementById('contacto').scrollIntoView();
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/dark-contact-final.png' });
    
    await browser.close();
    console.log('Screenshots saved');
})();
