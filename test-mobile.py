from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto('file:///home/roger/.hermes/profiles/coder/workspace/trio-eletrico/index.html')
    page.wait_for_load_state('networkidle')
    
    # Scroll to contacto section
    page.evaluate('document.getElementById("contacto").scrollIntoView()')
    time.sleep(1)
    
    # Get bounding boxes of key elements
    btn = page.locator('button[type="submit"]')
    box = btn.bounding_box()
    print(f'Submit button bounding box: {box}')
    
    viewport = page.viewport_size
    print(f'Viewport: {viewport}')
    
    if box:
        space_left = box['x']
        space_right = viewport['width'] - (box['x'] + box['width'])
        print(f'Space left of button: {space_left}px')
        print(f'Space right of button: {space_right}px')
    
    # Also check the form-group inputs
    inputs = page.locator('.form-group input, .form-group select, .form-group textarea')
    count = inputs.count()
    print(f'\nForm inputs count: {count}')
    for i in range(min(count, 3)):
        ib = inputs.nth(i).bounding_box()
        if ib:
            sl = ib['x']
            sr = viewport['width'] - (ib['x'] + ib['width'])
            print(f'  Input {i}: x={ib["x"]}, w={ib["width"]}, space_left={sl:.0f}px, space_right={sr:.0f}px')
    
    # Check contacto-form bounding box
    form = page.locator('.contacto-form')
    fb = form.bounding_box()
    if fb:
        print(f'\ncontacto-form: x={fb["x"]}, w={fb["width"]}')
        print(f'  Form space left: {fb["x"]}px')
        print(f'  Form space right: {viewport["width"] - (fb["x"] + fb["width"])}px')
    
    # Screenshot
    page.screenshot(path='/tmp/contacto-375.png', full_page=False)
    print('\nScreenshot saved to /tmp/contacto-375.png')
    
    browser.close()
