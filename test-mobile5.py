from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto('file:///home/roger/.hermes/profiles/coder/workspace/trio-eletrico/contacto.html')
    page.wait_for_load_state('networkidle')
    
    # Scroll to form
    page.evaluate('document.querySelector(".contacto-form") ? document.querySelector(".contacto-form").scrollIntoView() : null')
    time.sleep(0.5)
    
    # Check all elements
    data = page.evaluate('''() => {
        const vp = window.innerWidth;
        const form = document.querySelector('.contacto-form');
        const container = document.querySelector('.contact-section .container');
        const grid = document.querySelector('.contacto-grid');
        const btn = document.querySelector('button[type="submit"]');
        
        const result = {
            viewport: vp,
            container: container ? {
                padding: getComputedStyle(container).padding,
                rect: container.getBoundingClientRect()
            } : 'NOT FOUND',
            grid: grid ? {
                padding: getComputedStyle(grid).padding,
                gap: getComputedStyle(grid).gap,
                rect: grid.getBoundingClientRect()
            } : 'NOT FOUND',
            form: form ? {
                padding: getComputedStyle(form).padding,
                rect: form.getBoundingClientRect()
            } : 'NOT FOUND',
            btn: btn ? {
                rect: btn.getBoundingClientRect(),
                computed_width: getComputedStyle(btn).width
            } : 'NOT FOUND'
        };
        
        if (result.btn && result.btn.rect) {
            result.btn.space_left = Math.round(result.btn.rect.x);
            result.btn.space_right = Math.round(vp - (result.btn.rect.x + result.btn.rect.width));
        }
        
        return result;
    }''')
    
    print(f"Viewport: {data['viewport']}px")
    print(f"Container: {data['container']}")
    print(f"Grid: {data['grid']}")
    print(f"Form: {data['form']}")
    print(f"Button: {data['btn']}")
    
    # Screenshot
    page.screenshot(path='/tmp/contacto-page-375.png', full_page=False)
    print('\nScreenshot saved')
    
    browser.close()
