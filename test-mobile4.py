from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    for url_name, filename in [('index.html', 'index'), ('contacto.html', 'contacto')]:
        for vp in [375, 480]:
            page = browser.new_page(viewport={'width': vp, 'height': 812})
            page.goto(f'file:///home/roger/.hermes/profiles/coder/workspace/trio-eletrico/{url_name}')
            page.wait_for_load_state('networkidle')
            
            # Scroll to contacto section
            page.evaluate('document.getElementById("contacto") ? document.getElementById("contacto").scrollIntoView() : null')
            time.sleep(0.5)
            
            # Check all wide elements for edge touching
            issues = page.evaluate('''() => {
                const viewport = window.innerWidth;
                const results = [];
                const all = document.querySelectorAll('.contacto *');
                all.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > viewport * 0.85) {
                        const sl = Math.round(rect.x);
                        const sr = Math.round(viewport - (rect.x + rect.width));
                        if (sl < 8 || sr < 8) {
                            results.push({
                                tag: el.tagName, 
                                cls: el.className.toString().substring(0,60), 
                                x: sl, w: Math.round(rect.width), right: sr
                            });
                        }
                    }
                });
                return results;
            }''')
            
            print(f'{filename} @ {vp}px: Elements near edges:')
            if issues:
                for iss in issues:
                    print(f'  {iss}')
            else:
                print(f'  None found')
            
            # Check container padding
            cp = page.evaluate('''() => {
                const c = document.querySelector('.contacto .container');
                if (!c) return 'no container in .contacto';
                const cs = getComputedStyle(c);
                return cs.padding;
            }''')
            print(f'  Container padding: {cp}')
            
            # Check contacto-form padding
            fp = page.evaluate('''() => {
                const f = document.querySelector('.contacto-form');
                if (!f) return 'no .contacto-form';
                const cs = getComputedStyle(f);
                return cs.padding;
            }''')
            print(f'  contacto-form padding: {fp}')
            
            page.close()
    
    browser.close()
