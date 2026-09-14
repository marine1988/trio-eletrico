from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto('file:///home/roger/.hermes/profiles/coder/workspace/trio-eletrico/index.html')
    page.wait_for_load_state('networkidle')
    
    # Check ALL sections for elements touching edges
    issues = page.evaluate('''() => {
        const vp = window.innerWidth;
        const results = [];
        
        // Check all direct children of container in each section
        const sections = document.querySelectorAll('section');
        sections.forEach((sec, si) => {
            const id = sec.id || sec.className.substring(0, 40);
            const container = sec.querySelector('.container');
            if (!container) {
                // Section without container - check if children touch edges
                const children = sec.children;
                for (let c of children) {
                    const rect = c.getBoundingClientRect();
                    if (rect.width > vp * 0.9) {
                        results.push({
                            section: id,
                            el: c.tagName + '.' + c.className.substring(0, 40),
                            x: Math.round(rect.x),
                            w: Math.round(rect.width),
                            right: Math.round(vp - (rect.x + rect.width)),
                            issue: rect.x < 5 || (vp - (rect.x + rect.width)) < 5 ? 'TOUCHING' : 'OK'
                        });
                    }
                }
            }
        });
        
        // Check hero buttons
        const heroBtns = document.querySelectorAll('.hero-actions .btn, .btn-hero');
        heroBtns.forEach((btn, i) => {
            const rect = btn.getBoundingClientRect();
            if (rect.width > 0) {
                results.push({
                    section: 'hero',
                    el: 'btn-' + btn.textContent.trim().substring(0, 20),
                    x: Math.round(rect.x),
                    w: Math.round(rect.width),
                    right: Math.round(vp - (rect.x + rect.width)),
                    issue: (rect.x < 10 || (vp - (rect.x + rect.width)) < 10) ? 'CHECK' : 'OK'
                });
            }
        });
        
        // Check all btn-full elements
        const fullBtns = document.querySelectorAll('.btn-full');
        fullBtns.forEach((btn, i) => {
            const rect = btn.getBoundingClientRect();
            if (rect.width > 0) {
                results.push({
                    section: 'btn-full[' + i + ']',
                    el: btn.textContent.trim().substring(0, 30),
                    x: Math.round(rect.x),
                    w: Math.round(rect.width),
                    right: Math.round(vp - (rect.x + rect.width)),
                    issue: (rect.x < 10 || (vp - (rect.x + rect.width)) < 10) ? 'TOUCHING' : 'OK'
                });
            }
        });
        
        return results;
    }''')
    
    print("Element spacing audit @ 375px:")
    for r in issues:
        status = r.get('issue', '')
        marker = '  ***' if status == 'TOUCHING' else ''
        print(f"  {r['section']:>20}: {r['el']:>30} x={r['x']:>4} w={r['w']:>4} right={r['right']:>4}{marker}")
    
    browser.close()
