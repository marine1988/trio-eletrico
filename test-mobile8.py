from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto('file:///home/roger/.hermes/profiles/coder/workspace/trio-eletrico/index.html')
    page.wait_for_load_state('networkidle')
    
    page.evaluate('document.querySelector(".contacto-form").scrollIntoView()')
    time.sleep(0.5)
    
    data = page.evaluate('''() => {
        const vp = window.innerWidth;
        const form = document.querySelector('.contacto-form');
        const btn = document.querySelector('button[type="submit"]');
        const container = document.querySelector('.contacto .container');
        
        const formRect = form.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const formCS = getComputedStyle(form);
        const containerCS = getComputedStyle(container);
        
        return {
            vp: vp,
            container_padding: containerCS.padding,
            form_padding: formCS.padding,
            form_x: Math.round(formRect.x),
            form_w: Math.round(formRect.width),
            btn_x: Math.round(btnRect.x),
            btn_w: Math.round(btnRect.width),
            btn_space_left: Math.round(btnRect.x),
            btn_space_right: Math.round(vp - (btnRect.x + btnRect.width))
        };
    }''')
    
    print(f"After fix @ 375px:")
    print(f"  Container padding: {data['container_padding']}")
    print(f"  Form padding: {data['form_padding']}")
    print(f"  Form: x={data['form_x']}, w={data['form_w']}")
    print(f"  Button: x={data['btn_x']}, w={data['btn_w']}")
    print(f"  Button space: L={data['btn_space_left']}px, R={data['btn_space_right']}px")
    
    # Also test at 320px (smallest)
    page.set_viewport_size({'width': 320, 'height': 812})
    time.sleep(0.3)
    page.evaluate('document.querySelector(".contacto-form").scrollIntoView()')
    time.sleep(0.3)
    
    data2 = page.evaluate('''() => {
        const vp = window.innerWidth;
        const form = document.querySelector('.contacto-form');
        const btn = document.querySelector('button[type="submit"]');
        const formRect = form.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        const formCS = getComputedStyle(form);
        const containerCS = getComputedStyle(document.querySelector('.contacto .container'));
        return {
            vp: vp,
            container_padding: containerCS.padding,
            form_padding: formCS.padding,
            form_x: Math.round(formRect.x),
            form_w: Math.round(formRect.width),
            btn_x: Math.round(btnRect.x),
            btn_w: Math.round(btnRect.width),
            btn_space_left: Math.round(btnRect.x),
            btn_space_right: Math.round(vp - (btnRect.x + btnRect.width))
        };
    }''')
    
    print(f"\nAfter fix @ 320px:")
    print(f"  Container padding: {data2['container_padding']}")
    print(f"  Form padding: {data2['form_padding']}")
    print(f"  Form: x={data2['form_x']}, w={data2['form_w']}")
    print(f"  Button: x={data2['btn_x']}, w={data2['btn_w']}")
    print(f"  Button space: L={data2['btn_space_left']}px, R={data2['btn_space_right']}px")
    
    # Screenshot
    page.screenshot(path='/tmp/contacto-fixed-320.png', full_page=False)
    
    # Back to 375 for screenshot
    page.set_viewport_size({'width': 375, 'height': 812})
    time.sleep(0.3)
    page.evaluate('document.querySelector(".contacto-form").scrollIntoView()')
    time.sleep(0.3)
    page.screenshot(path='/tmp/contacto-fixed-375.png', full_page=False)
    
    print('\nScreenshots saved')
    
    browser.close()
