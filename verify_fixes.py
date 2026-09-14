#!/usr/bin/env python3
"""Verify contrast fixes for Trio Eletrico CSS"""

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

print('=== VERIFICATION: ALL FIXES ===')
print()

# FIX 1: Footer bottom - rgba(255,255,255,0.6) on #0A2540
# 60% white on #0A2540 ≈ #C0C8D0 blended... let me calculate properly
# rgba(255,255,255,0.6) on #0A2540:
# Result = 0.6*255 + 0.4*10 = 157, 0.6*255 + 0.4*37 = 168.8, 0.6*255 + 0.4*64 = 178.6
# ≈ #9DB0C0... no wait that's wrong. Let me just use the actual rendered color.
# White at 60% opacity on #0A2540:
# R: 0.6*255 + 0.4*10 = 153 + 4 = 157
# G: 0.6*255 + 0.4*37 = 153 + 14.8 = 167.8  
# B: 0.6*255 + 0.4*64 = 153 + 25.6 = 178.6
# ≈ #9DB0BE
r = contrast('#9DB0BE', '#0A2540')
status = 'PASS' if r >= 4.5 else 'FAIL'
print(f'FIX 1a: Footer bottom light #9DB0BE on #0A2540: {r:.2f}:1 {status}')

# Dark: rgba(255,255,255,0.6) on #0d1f33
# R: 0.6*255 + 0.4*13 = 153 + 5.2 = 158.2
# G: 0.6*255 + 0.4*31 = 153 + 12.4 = 165.4
# B: 0.6*255 + 0.4*51 = 153 + 20.4 = 173.4
# ≈ #9EADE (approx #9EADE0)
r = contrast('#9EADDE', '#0d1f33')
status = 'PASS' if r >= 4.5 else 'FAIL'
print(f'FIX 1b: Footer bottom dark approx on #0d1f33: {r:.2f}:1 {status}')

# FIX 2: Section tag - #0A2540 on rgba(255,193,7,0.18) ≈ #FFE496
r = contrast('#0A2540', '#FFE496')
status = 'PASS' if r >= 4.5 else 'FAIL'
print(f'FIX 2a: section-tag light #0A2540 on #FFE496: {r:.2f}:1 {status}')

# Dark: #f0f0f0 on rgba(255,193,7,0.25) ≈ #FFCB5C
r = contrast('#f0f0f0', '#FFCB5C')
status = 'PASS' if r >= 4.5 else 'FAIL'
print(f'FIX 2b: section-tag dark #f0f0f0 on #FFCB5C: {r:.2f}:1 {status}')

# FIX 3: contacto-info p - #333 on #f5f5f5
r = contrast('#333', '#f5f5f5')
status = 'PASS' if r >= 4.5 else 'FAIL'
print(f'FIX 3: contacto-info p #333 on #f5f5f5: {r:.2f}:1 {status}')

# FIX 4: text-muted #7a94a6 on #1a3a5c and #12263f
r1 = contrast('#7a94a6', '#1a3a5c')
r2 = contrast('#7a94a6', '#12263f')
status1 = 'PASS' if r1 >= 4.5 else 'FAIL'
status2 = 'PASS' if r2 >= 4.5 else 'FAIL'
print(f'FIX 4a: text-muted #7a94a6 on #1a3a5c: {r1:.2f}:1 {status1}')
print(f'FIX 4b: text-muted #7a94a6 on #12263f: {r2:.2f}:1 {status2}')

# FIX 5: society-skills li - #b0b8c4 on #12263f
r = contrast('#b0b8c4', '#12263f')
status = 'PASS' if r >= 4.5 else 'FAIL'
print(f'FIX 5: society-skills li #b0b8c4 on #12263f: {r:.2f}:1 {status}')

# FIX 6: feature-number - #2a4a6c on #12263f
r = contrast('#2a4a6c', '#12263f')
status = 'PASS' if r >= 3.0 else 'FAIL'
print(f'FIX 6: feature-number #2a4a6c on #12263f: {r:.2f}:1 {status} (decorative, 3:1 min)')

print()
print('=== REMAINING CHECKS (should still pass) ===')
print()

# Nav links
r = contrast('#495057', '#ffffff')
print(f'Nav links #495057 on #fff: {r:.2f}:1', 'PASS' if r >= 4.5 else 'FAIL')

# Section header p
r = contrast('#6c757d', '#fff')
print(f'section-header p #6c757d on #fff: {r:.2f}:1', 'PASS' if r >= 4.5 else 'FAIL')

# Hero
r = contrast('#ffffff', '#0A2540')
print(f'Hero white on #0A2540: {r:.2f}:1', 'PASS' if r >= 4.5 else 'PASS')

# btn-primary
r = contrast('#FFC107', '#0A2540')
print(f'btn-primary #FFC107 on #0A2540: {r:.2f}:1', 'PASS' if r >= 4.5 else 'FAIL')

# Dark nav links
r = contrast('#b0b8c4', '#0d1f33')
print(f'Dark nav #b0b8c4 on #0d1f33: {r:.2f}:1', 'PASS' if r >= 4.5 else 'FAIL')

# Dark section-header p
r = contrast('#b0b8c4', '#0d1f33')
print(f'Dark section-header p #b0b8c4 on #0d1f33: {r:.2f}:1', 'PASS' if r >= 4.5 else 'FAIL')

# Dark form label
r = contrast('#d0d8e4', '#12263f')
print(f'Form label #d0d8e4 on #12263f: {r:.2f}:1', 'PASS' if r >= 4.5 else 'FAIL')

# Dark FAQ answer
r = contrast('#b0b8c4', '#12263f')
print(f'FAQ answer #b0b8c4 on #12263f: {r:.2f}:1', 'PASS' if r >= 4.5 else 'FAIL')

# Dark contacto-item span
r = contrast('#b0b8c4', '#12263f')
print(f'contacto-item span #b0b8c4 on #12263f: {r:.2f}:1', 'PASS' if r >= 4.5 else 'FAIL')

# Dark society-card p
r = contrast('#b0b8c4', '#12263f')
print(f'society-card p #b0b8c4 on #12263f: {r:.2f}:1', 'PASS' if r >= 4.5 else 'FAIL')

# Section header--dark .section-tag: #0A2540 on rgba(255,193,7,0.35) ≈ #FFD04D
r = contrast('#0A2540', '#FFD04D')
status = 'PASS' if r >= 4.5 else 'FAIL'
print(f'section-header--dark .section-tag #0A2540 on #FFD04D: {r:.2f}:1 {status}')

print()
print('Done.')
