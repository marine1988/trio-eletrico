from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # Test at various viewport widths to find the problem zone
    for vp in [320, 360, 375, 390, 412, 480, 560, 768]:
        page = browser.new_page(viewport={'width': vp, 'height': 812})
        page.goto('file:///home/roger/.hermes/profiles/coder/workspace/trio-eletrico/index.html')
        page.wait_for_load_state('networkidle')
        
        page.evaluate('document.querySelector(".contacto-form").scrollIntoView()')
        time.sleep(0.3)
        
        data = page.evaluate('''() => {
            const vp = window.innerWidth;
            const form = document.querySelector('.contacto-form');
            const btn = document.querySelector('button[type="submit"]');
            const container = document.querySelector('.contacto .container');
            
            const formRect = form.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();
            const containerRect = container ? container.getBoundingClientRect() : null;
            
            const formCS = getComputedStyle(form);
            const containerCS = container ? getComputedStyle(container) : null;
            
            return {
                vp: vp,
                form_padding: formCS.padding,
                form_x: Math.round(formRect.x),
                form_w: Math.round(formRect.width),
                container_padding: containerCS ? containerCS.padding : 'N/A',
                btn_x: Math.round(btnRect.x),
                btn_w: Math.round(btnRect.width),
                btn_space_left: Math.round(btnRect.x),
                btn_space_right: Math.round(vp - (btnRect.x + btnRect.width))
            };
        }''')
        
        print(f"VP={data['vp']:>4}px | container_pad={data['container_padding']:>12} | form_pad={data['form_padding']:>18} | form_x={data['form_x']:>3} form_w={data['form_w']:>3} | btn_x={data['btn_x']:>3} btn_w={data['btn_w']:>3} | L={data['btn_space_left']:>3} R={data['btn_space_right']:>3}")
        
        page.close()
    
    browser.close()
