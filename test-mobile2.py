from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto('file:///home/roger/.hermes/profiles/coder/workspace/trio-eletrico/index.html')
    page.wait_for_load_state('networkidle')
    
    # Scroll to the form itself (not just the section)
    page.evaluate('document.querySelector(".contacto-form").scrollIntoView()')
    time.sleep(1)
    
    # Screenshot
    page.screenshot(path='/tmp/contacto-form-375.png', full_page=False)
    print('Screenshot saved to /tmp/contacto-form-375.png')
    
    # Get bounding boxes of key elements
    btn = page.locator('button[type="submit"]')
    box = btn.bounding_box()
    viewport = page.viewport_size
    
    if box:
        space_left = box['x']
        space_right = viewport['width'] - (box['x'] + box['width'])
        print(f'Button: x={box["x"]}, w={box["width"]}, space_left={space_left}px, space_right={space_right}px')
    
    # Check contacto-form bounding box
    form = page.locator('.contacto-form')
    fb = form.bounding_box()
    if fb:
        print(f'Form: x={fb["x"]}, w={fb["width"]}, space_left={fb["x"]}px, space_right={viewport["width"] - (fb["x"] + fb["width"])}px')
    
    # Also test at 480px
    page.set_viewport_size({'width': 480, 'height': 812})
    time.sleep(0.5)
    page.evaluate('document.querySelector(".contacto-form").scrollIntoView()')
    time.sleep(0.5)
    page.screenshot(path='/tmp/contacto-form-480.png', full_page=False)
    
    btn2 = page.locator('button[type="submit"]')
    box2 = btn2.bounding_box()
    vp2 = page.viewport_size
    if box2:
        sl2 = box2['x']
        sr2 = vp2['width'] - (box2['x'] + box2['width'])
        print(f'\\n480px viewport:')
        print(f'Button: x={box2["x"]}, w={box2["width"]}, space_left={sl2}px, space_right={sr2}px')
    
    form2 = page.locator('.contacto-form')
    fb2 = form2.bounding_box()
    if fb2:
        print(f'Form: x={fb2["x"]}, w={fb2["width"]}, space_left={fb2["x"]}px, space_right={vp2["width"] - (fb2["x"] + fb2["width"])}px')
    
    browser.close()
