from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto('file:///home/roger/.hermes/profiles/coder/workspace/trio-eletrico/contacto.html')
    page.wait_for_load_state('networkidle')
    
    page.evaluate('document.querySelector(".contacto-form") ? document.querySelector(".contacto-form").scrollIntoView() : null')
    time.sleep(0.5)
    
    data = page.evaluate('''() => {
        const vp = window.innerWidth;
        const form = document.querySelector('.contacto-form');
        const btn = document.querySelector('button[type="submit"]');
        const container = document.querySelector('.contact-section .container');
        
        const formRect = form ? form.getBoundingClientRect() : null;
        const btnRect = btn ? btn.getBoundingClientRect() : null;
        const containerRect = container ? container.getBoundingClientRect() : null;
        const formCS = form ? getComputedStyle(form) : null;
        const containerCS = container ? getComputedStyle(container) : null;
        
        return {
            vp: vp,
            container_padding: containerCS ? containerCS.padding : 'N/A',
            form_padding: formCS ? formCS.padding : 'N/A',
            form_x: formRect ? Math.round(formRect.x) : 'N/A',
            form_w: formRect ? Math.round(formRect.width) : 'N/A',
            btn_x: btnRect ? Math.round(btnRect.x) : 'N/A',
            btn_w: btnRect ? Math.round(btnRect.width) : 'N/A',
            btn_space_left: btnRect ? Math.round(btnRect.x) : 'N/A',
            btn_space_right: btnRect ? Math.round(vp - (btnRect.x + btnRect.width)) : 'N/A'
        };
    }''')
    
    print(f"contacto.html @ 375px:")
    print(f"  Container padding: {data['container_padding']}")
    print(f"  Form padding: {data['form_padding']}")
    print(f"  Form: x={data['form_x']}, w={data['form_w']}")
    print(f"  Button: x={data['btn_x']}, w={data['btn_w']}")
    print(f"  Button space: L={data['btn_space_left']}px, R={data['btn_space_right']}px")
    
    page.screenshot(path='/tmp/contacto-page-fixed-375.png', full_page=False)
    print('\nScreenshot saved')
    
    browser.close()
