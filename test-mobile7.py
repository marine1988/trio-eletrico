from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto('file:///home/roger/.hermes/profiles/coder/workspace/trio-eletrico/index.html')
    page.wait_for_load_state('networkidle')
    
    # Check ALL elements in the contacto section for edge proximity
    data = page.evaluate('''() => {
        const vp = window.innerWidth;
        const results = [];
        
        // Check contacto-items
        const items = document.querySelectorAll('.contacto-item');
        items.forEach((item, i) => {
            const rect = item.getBoundingClientRect();
            const cs = getComputedStyle(item);
            results.push({
                el: `contacto-item[${i}]`,
                x: Math.round(rect.x),
                w: Math.round(rect.width),
                right: Math.round(vp - (rect.x + rect.width)),
                padding: cs.padding,
                margin: cs.margin
            });
        });
        
        // Check hero buttons
        const heroBtns = document.querySelectorAll('.hero-actions .btn');
        heroBtns.forEach((btn, i) => {
            const rect = btn.getBoundingClientRect();
            results.push({
                el: `hero-btn[${i}]`,
                x: Math.round(rect.x),
                w: Math.round(rect.width),
                right: Math.round(vp - (rect.x + rect.width)),
                text: btn.textContent.trim().substring(0, 30)
            });
        });
        
        // Check service cards
        const cards = document.querySelectorAll('.service-card');
        cards.forEach((card, i) => {
            if (i < 2) {  // just first 2
                const rect = card.getBoundingClientRect();
                const cs = getComputedStyle(card);
                results.push({
                    el: `service-card[${i}]`,
                    x: Math.round(rect.x),
                    w: Math.round(rect.width),
                    right: Math.round(vp - (rect.x + rect.width)),
                    padding: cs.padding
                });
            }
        });
        
        // Check section headers
        const headers = document.querySelectorAll('.section-header h2');
        headers.forEach((h, i) => {
            const rect = h.getBoundingClientRect();
            if (rect.width > 0) {
                results.push({
                    el: `section-header[${i}]`,
                    x: Math.round(rect.x),
                    w: Math.round(rect.width),
                    right: Math.round(vp - (rect.x + rect.width)),
                    text: h.textContent.trim().substring(0, 40)
                });
            }
        });
        
        return results;
    }''')
    
    for r in data:
        print(f"{r['el']:>25}: x={r.get('x',0):>4} w={r.get('w',0):>4} right={r.get('right',0):>4} {r.get('padding',''):>20} {r.get('text','')}")
    
    browser.close()
