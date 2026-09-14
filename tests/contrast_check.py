#!/usr/bin/env python3
"""WCAG 2.1 contrast ratio checker for Trio Elétrico design tokens."""

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def rl(hex_color):
    r, g, b = hex_to_rgb(hex_color)
    return 0.2126 * srgb_to_linear(r) + 0.7152 * srgb_to_linear(g) + 0.0722 * srgb_to_linear(b)

def contrast(hex1, hex2):
    l1, l2 = rl(hex1), rl(hex2)
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)

tests = [
    ("Amarelo #FFC107 sobre Azul #0A2540 (texto grande: stat-number 2rem bold)", "#FFC107", "#0A2540"),
    ("Branco #fff sobre Azul #0A2540 (header hero contato)", "#ffffff", "#0A2540"),
    ("Cinza #6c757d sobre #fff (text-muted, section-header p)", "#6c757d", "#ffffff"),
    ("Cinza #333 sobre #fff (text-secondary)", "#333333", "#ffffff"),
    ("Cinza #555 sobre #fff (faq-answer p)", "#555555", "#ffffff"),
    ("Branco sobre Amarelo #FFC107 (btn-primary)", "#ffffff", "#FFC107"),
    ("WhatsApp #fff sobre #25D366", "#ffffff", "#25D366"),
    ("Amarelo #FFC107 sobre #fff (section-tag 0.8rem bold)", "#FFC107", "#ffffff"),
    ("Dark: #b0b8c4 sobre #0d1f33 (text-secondary on bg)", "#b0b8c4", "#0d1f33"),
    ("Dark: #7a8492 sobre #0d1f33 (text-muted on bg)", "#7a8492", "#0d1f33"),
    ("Dark: #fff sobre #0d1f33 (white on bg)", "#ffffff", "#0d1f33"),
    ("Dark: #fff sobre #12263f (white on cards/form)", "#ffffff", "#12263f"),
    ("Dark: #b0b8c4 sobre #12263f (text on cards)", "#b0b8c4", "#12263f"),
    ("Dark: #FFC107 sobre #0d1f33 (accent on bg)", "#FFC107", "#0d1f33"),
]

print("WCAG AA: 4.5:1 normal text | 3:1 large (>=18pt bold / >=24pt)")
print("=" * 75)
for desc, fg, bg in tests:
    r = contrast(fg, bg)
    ok = "OK" if r >= 4.5 else ("LARGE" if r >= 3.0 else "FAIL")
    print(f"  {r:5.2f}:1  [{ok:5s}]  {desc}")
