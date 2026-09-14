#!/usr/bin/env python3
"""Contrast checker for Trio Eletrico CSS"""

def hex_to_rgb(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = h[0]*2 + h[1]*2 + h[2]*2
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def lum(r, g, b):
    return 0.2126 * srgb_to_linear(r) + 0.7152 * srgb_to_linear(g) + 0.0722 * srgb_to_linear(b)

def contrast(h1, h2):
    rgb1 = hex_to_rgb(h1)
    rgb2 = hex_to_rgb(h2)
    l1 = lum(*rgb1)
    l2 = lum(*rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

print('=== LIGHT MODE CONTRASTS ===')
print()

# Nav links: #495057 on #ffffff
r = contrast('#495057', '#ffffff')
print(f'Nav links #495057 on #fff: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Section header p: #6c757d on #ffffff  
r = contrast('#6c757d', '#fff')
print(f'section-header p #6c757d on #fff: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Hero: #ffffff on #0A2540
r = contrast('#ffffff', '#0A2540')
print(f'Hero white on #0A2540: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Footer bottom: rgba(255,255,255,0.4) on #0A2540
# Approximate: mix white 40% with #0A2540 = roughly #697A8C
r = contrast('#697A8C', '#0A2540')
print(f'Footer bottom approx #697A8C on #0A2540: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Footer contact: rgba(255,255,255,0.6) on #0A2540
# 60% white mixed: approx #A3B1C0
r2 = contrast('#A3B1C0', '#0A2540')
print(f'Footer contact approx #A3B1C0 on #0A2540: {r2:.2f}:1', 'FAIL' if r2 < 4.5 else 'PASS')

# Testimonial location: rgba(255,255,255,0.5) on #0A2540 
r3 = contrast('#8D99A8', '#0A2540')
print(f'Testimonial location approx #8D99A8 on #0A2540: {r3:.2f}:1', 'FAIL' if r3 < 4.5 else 'PASS')

# Section tag: #e0a800 on rgba(255,193,7,0.15) ~ #fff3c4
r = contrast('#e0a800', '#fff3c4')
print(f'section-tag #e0a800 on #fff3c4: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Text muted: #555 on #f5f5f5
r = contrast('#555', '#f5f5f5')
print(f'text-muted #555 on #f5f5f5: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Text secondary: #333 on #fff
r = contrast('#333', '#fff')
print(f'text-secondary #333 on #fff: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Form input text: #343a40 on #fff
r = contrast('#343a40', '#fff')
print(f'Form input #343a40 on #fff: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Feature number: #e9ecef on #fff (decorative, not text - 3:1 ok)
r = contrast('#e9ecef', '#fff')
print(f'feature-number #e9ecef on #fff: {r:.2f}:1 (decorative, 3:1 minimum)')

# Society card p: #6c757d on #fff
r = contrast('#6c757d', '#fff')
print(f'.service-card p #6c757d on #fff: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Contacto info p: #6c757d on #f5f5f5
r = contrast('#6c757d', '#f5f5f5')
print(f'.contacto-info p #6c757d on #f5f5f5: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

print()
print('=== DARK MODE CONTRASTS ===')
print()

# Dark bg-primary #0d1f33, secondary #1a3a5c, tertiary #12263f
# Dark text: text-primary #f0f0f0, text-secondary #b0b8c4, text-muted #5a7482

# Nav links: #b0b8c4 on #0d1f33
r = contrast('#b0b8c4', '#0d1f33')
print(f'Nav links #b0b8c4 on #0d1f33: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Section header p: #b0b8c4 on #0d1f33
r = contrast('#b0b8c4', '#0d1f33')
print(f'.section-header p dark #b0b8c4 on #0d1f33: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Footer bottom: rgba(255,255,255,0.3) on #0d1f33
# 30% white on #0d1f33 ≈ #3A4A5C blended
r = contrast('#3A4A5C', '#0d1f33')
print(f'Footer bottom approx #3A4A5C on #0d1f33: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# text-muted #5a7482 on #1a3a5c
r = contrast('#5a7482', '#1a3a5c')
print(f'text-muted #5a7482 on #1a3a5c (bg-secondary): {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# text-muted #5a7482 on #12263f (bg-tertiary)
r = contrast('#5a7482', '#12263f')
print(f'text-muted #5a7482 on #12263f (bg-tertiary): {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Form label #d0d8e4 on #12263f
r = contrast('#d0d8e4', '#12263f')
print(f'Form label #d0d8e4 on #12263f: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Contacto item strong #d0d8e4 on #12263f
r = contrast('#d0d8e4', '#12263f')
print(f'.contacto-item strong #d0d8e4 on #12263f: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Contacto item span #b0b8c4 on #12263f
r = contrast('#b0b8c4', '#12263f')
print(f'.contacto-item span #b0b8c4 on #12263f: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# FAQ answer p #b0b8c4 on #12263f
r = contrast('#b0b8c4', '#12263f')
print(f'.faq-answer p #b0b8c4 on #12263f: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# FAQ question hover: #f0f0f0 on #1a3a5c
r = contrast('#f0f0f0', '#1a3a5c')
print(f'.faq-question:hover #f0f0f0 on #1a3a5c: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Society skills li: #5a7482 on #12263f
r = contrast('#5a7482', '#12263f')
print(f'.society-skills li #5a7482 on #12263f: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Society card > p dark: #b0b8c4 on #12263f
r = contrast('#b0b8c4', '#12263f')
print(f'.society-card > p #b0b8c4 on #12263f: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# feature number dark: #0d1f33 on #12263f
r = contrast('#0d1f33', '#12263f')
print(f'feature-number dark #0d1f33 on #12263f: {r:.2f}:1', 'FAIL' if r < 3.0 else 'PASS (decorative)')

# btn-primary #FFC107 on #0A2540
r = contrast('#FFC107', '#0A2540')
print(f'btn-primary #FFC107 on #0A2540: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# btn-nav #FFC107 on #0A2540
r = contrast('#FFC107', '#0A2540')
print(f'btn-nav #FFC107 on #0A2540: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# btn-primary:hover #e0a800 on #0A2540
r = contrast('#e0a800', '#0A2540')
print(f'btn-primary:hover #e0a800 on #0A2540: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Nav a:hover #FFC107 on #0A2540 (dark bg in tablet menu)
r = contrast('#FFC107', '#0A2540')
print(f'Nav a:hover #FFC107 on #0A2540: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Section tag dark: #FFC107 on rgba(255,193,7,0.2) ~ #ffe08e
r = contrast('#FFC107', '#ffe08e')
print(f'section-tag dark #FFC107 on #ffe08e: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Footer links a:hover #FFC107 on #0A2540
r = contrast('#FFC107', '#0A2540')
print(f'footer-links a:hover #FFC107 on #0A2540: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')

# Footer links a: rgba(255,255,255,0.6) on #0A2540
r = contrast('#9AA8B6', '#0A2540')
print(f'footer-links a approx #9AA8B6 on #0A2540: {r:.2f}:1', 'FAIL' if r < 4.5 else 'PASS')
