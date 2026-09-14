#!/usr/bin/env python3
"""Final verification of all contrast fixes"""

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

print('=== FINAL VERIFICATION ===')
print()

# FIX 1: Footer bottom - rgba(255,255,255,0.6) on #0A2540
# Approx blended: R=0.6*255+0.4*10=157, G=0.6*255+0.4*37=168, B=0.6*255+0.4*64=179
r = contrast('#9DB0B3', '#0A2540')
status = 'PASS' if r >= 4.5 else 'FAIL'
print(f'FIX 1a: Footer bottom light: {r:.2f}:1 {status}')

# Dark: rgba(255,255,255,0.6) on #0d1f33
# R=0.6*255+0.4*13=158, G=0.6*255+0.4*31=165, B=0.6*255+0.4*51=173
r = contrast('#9EADE5', '#0d1f33')
status = 'PASS' if r >= 4.5 else 'FAIL'
print(f'FIX 1b: Footer bottom dark: {r:.2f}:1 {status}')

# FIX 2: Section tag
# Light: #0A2540 on rgba(255,193,7,0.18) ≈ #FFE496
r = contrast('#0A2540', '#FFE496')
status = 'PASS' if r >= 4.5 else 'FAIL'
print(f'FIX 2a: section-tag light: {r:.2f}:1 {status}')

# Dark: #0d1f33 on rgba(255,193,7,0.28) ≈ #FFC84A
r = contrast('#0d1f33', '#FFC84A')
status = 'PASS' if r >= 4.5 else 'FAIL'
print(f'FIX 2b: section-tag dark #0d1f33 on #FFC84A: {r:.2f}:1 {status}')

# FIX 3: contacto-info p - #333 on #f5f5f5
r = contrast('#333', '#f5f5f5')
status = 'PASS' if r >= 4.5 else 'FAIL'
print(f'FIX 3: contacto-info p #333 on #f5f5f5: {r:.2f}:1 {status}')

# FIX 4: text-muted #8aa4b6 on #1a3a5c and #12263f
r1 = contrast('#8aa4b6', '#1a3a5c')
r2 = contrast('#8aa4b6', '#12263f')
status1 = 'PASS' if r1 >= 4.5 else 'FAIL'
status2 = 'PASS' if r2 >= 4.5 else 'FAIL'
print(f'FIX 4a: text-muted #8aa4b6 on #1a3a5c: {r1:.2f}:1 {status1}')
print(f'FIX 4b: text-muted #8aa4b6 on #12263f: {r2:.2f}:1 {status2}')

# FIX 5: society-skills li - #b0b8c4 on #12263f
r = contrast('#b0b8c4', '#12263f')
status = 'PASS' if r >= 4.5 else 'FAIL'
print(f'FIX 5: society-skills li #b0b8c4 on #12263f: {r:.2f}:1 {status}')

# FIX 6: feature-number - #8aa4b6 on #12263f
r = contrast('#8aa4b6', '#12263f')
status = 'PASS' if r >= 3.0 else 'FAIL'
print(f'FIX 6: feature-number #8aa4b6 on #12263f: {r:.2f}:1 {status} (decorative)')

print()
print('=== ALL REMAINING CRITICAL CHECKS ===')
print()

checks = [
    ('Nav links light', '#495057', '#ffffff', 4.5),
    ('Section header p light', '#6c757d', '#ffffff', 4.5),
    ('Hero text', '#ffffff', '#0A2540', 4.5),
    ('btn-primary', '#FFC107', '#0A2540', 4.5),
    ('btn-primary:hover', '#e0a800', '#0A2540', 4.5),
    ('Nav links dark', '#b0b8c4', '#0d1f33', 4.5),
    ('Section header p dark', '#b0b8c4', '#0d1f33', 4.5),
    ('Form label dark', '#d0d8e4', '#12263f', 4.5),
    ('FAQ answer dark', '#b0b8c4', '#12263f', 4.5),
    ('contacto-item span dark', '#b0b8c4', '#12263f', 4.5),
    ('society-card p dark', '#b0b8c4', '#12263f', 4.5),
    ('section-header--dark .section-tag', '#0A2540', '#FFD04D', 4.5),
    ('Footer contact light', '#A3B1C0', '#0A2540', 4.5),
    ('Testimonial location light', '#8D99A8', '#0A2540', 4.5),
    ('Footer links light', '#9AA8B6', '#0A2540', 4.5),
    ('Footer brand light', '#A3B1C0', '#0A2540', 4.5),
    ('Footer contact dark', '#9EADDE', '#0d1f33', 4.5),
    ('Footer links dark', '#9EADDE', '#0d1f33', 4.5),
    ('Footer brand dark', '#9EADDE', '#0d1f33', 4.5),
    ('Form input text', '#343a40', '#ffffff', 4.5),
    ('Text muted light', '#555', '#f5f5f5', 4.5),
    ('Text secondary light', '#333', '#ffffff', 4.5),
]

all_pass = True
for name, fg, bg, minimum in checks:
    r = contrast(fg, bg)
    status = 'PASS' if r >= minimum else 'FAIL'
    if status == 'FAIL':
        all_pass = False
    print(f'  {name}: {r:.2f}:1 (min {minimum}:1) {status}')

print()
if all_pass:
    print('ALL CHECKS PASSED!')
else:
    print('SOME CHECKS FAILED - see above')
