from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto('file:///home/roger/.hermes/profiles/coder/workspace/trio-eletrico/index.html')
    page.wait_for_load_state('networkidle')
    
    # Scroll the submit button into view
    page.evaluate('document.querySelector("button[type=submit]").scrollIntoView({block: "center"})')
    time.sleep(1)
    
    # Screenshot
    page.screenshot(path='/tmp/contacto-btn-375.png', full_page=False)
    print('Screenshot saved')
    
    # Get computed styles
    btn = page.locator('button[type="submit"]')
    box = btn.bounding_box()
    viewport = page.viewport_size
    
    if box:
        space_left = box['x']
        space_right = viewport['width'] - (box['x'] + box['width'])
        print(f'Button: x={box["x"]}, y={box["y"]}, w={box["width"]}, h={box["height"]}')
        print(f'Space left: {space_left}px, Space right: {space_right}px')
    
    # Get computed style of contacto-form
    form_padding = page.evaluate('''() => {
        const f = document.querySelector('.contacto-form');
        const cs = getComputedStyle(f);
        return {padding: cs.padding, margin: cs.margin, width: f.offsetWidth, boundingRect: f.getBoundingClientRect()};
    }''')
    print(f'\ncontacto-form computed: {form_padding}')
    
    # Check container padding
    container_padding = page.evaluate('''() => {
        const c = document.querySelector('.contacto .container');
        if (!c) return 'no .contacto .container';
        const cs = getComputedStyle(c);
        return {padding: cs.padding, width: c.offsetWidth, rect: c.getBoundingClientRect()};
    }''')
    print(f'Container: {container_padding}')
    
    # Check if there are other elements touching edges
    touching = page.evaluate('''() => {
        const viewport = 375;
        const results = [];
        // Check all direct children of .contacto-grid
        const grid = document.querySelector('.contacto-grid');
        if (grid) {
            const children = grid.querySelectorAll('*');
            children.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width > viewport * 0.9 && rect.width <= viewport) {
                    // Wide element
                    if (rect.x <= 2 || (viewport - (rect.x + rect.width)) <= 2) {
                        results.push({tag: el.tagName, class: el.className, x: rect.x, w: rect.width, right: viewport - (rect.x + rect.width)});
                    }
                }
            });
        }
        return results;
    }''')
    print(f'\nElements touching edges: {touching}')
    
    browser.close()
