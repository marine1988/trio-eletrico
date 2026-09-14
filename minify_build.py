#!/usr/bin/env python3
"""Minify CSS and JS for trio-eletrico, update HTML references, add versioning."""
import re
import os

BASE = os.path.dirname(os.path.abspath(__file__))

# --- Version ---
VERSION = "v1"

def minify_css(text):
    """Minify CSS, preserving /*! ... */ comments."""
    # Extract license/important comments first
    preserved = {}
    counter = [0]
    
    def save_license(match):
        key = f"__LICENSE_{counter[0]}__"
        preserved[key] = match.group(0)
        counter[0] += 1
        return key
    
    # Save /*! ... */ comments
    text = re.sub(r'/\*![^*]*\*+(?:[^/*][^*]*\*+)*/', save_license, text)
    
    # Remove normal comments
    text = re.sub(r'/\*[\s\S]*?\*/', '', text)
    
    # Remove whitespace: collapse multiple spaces/newlines
    text = re.sub(r'\s+', ' ', text)
    
    # Remove space around special chars
    text = re.sub(r'\s*([{}:;,>+~])\s*', r'\1', text)
    
    # Remove trailing semicolons before }
    text = re.sub(r';(?=\s*})', '', text)
    
    # Remove empty rules
    text = re.sub(r'\{[;\s]*\}', '', text)
    
    # Restore preserved comments
    for key, value in preserved.items():
        text = text.replace(key, value)
    
    return text.strip()


def minify_js(text):
    """Minify JS, preserving header comments (// or /* ... */ at start)."""
    preserved = []
    
    # Extract header comments (license)
    header_pattern = re.compile(r'^(/\*[\s\S]*?\*/\s*|//[^\n]*\n)*')
    header = header_pattern.match(text)
    if header:
        preserved.append(header.group(0))
        text = text[header.end():]
    
    # Remove line comments (but preserve URLs like http://)
    text = re.sub(r'//[^\n]*', '', text)
    
    # Remove block comments
    text = re.sub(r'/\*[\s\S]*?\*/', '', text)
    
    # Remove newlines and extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove space around operators and brackets
    # NOTE: excluded '-' and '%' because they corrupt string values like
    # rootMargin '-80px 0px -60% 0px' -> '-80px 0px-60%0px'
    text = re.sub(r'\s*([{}();,:=\+\*!<>&|\?\[\]\(\)])\s*', r'\1', text)
    
    # Clean up: multiple spaces
    text = re.sub(r'  +', ' ', text)
    text = text.strip()
    
    return ''.join(preserved) + text


# --- Step 1: Minify CSS ---
css_path = os.path.join(BASE, 'css', 'style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

minified_css = minify_css(css_content)
versioned_css_name = f'style.{VERSION}.min.css'

css_out_path = os.path.join(BASE, 'css', versioned_css_name)
with open(css_out_path, 'w', encoding='utf-8') as f:
    f.write(minified_css)

print(f"CSS: {css_path} ({len(css_content)} bytes) -> {css_out_path} ({len(minified_css)} bytes) "
      f"({100*len(minified_css)//len(css_content)}%)")

# --- Step 2: Minify JS ---
js_path = os.path.join(BASE, 'js', 'main.js')
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

minified_js = minify_js(js_content)
versioned_js_name = f'main.{VERSION}.min.js'

js_out_path = os.path.join(BASE, 'js', versioned_js_name)
with open(js_out_path, 'w', encoding='utf-8') as f:
    f.write(minified_js)

print(f"JS: {js_path} ({len(js_content)} bytes) -> {js_out_path} ({len(minified_js)} bytes) "
      f"({100*len(minified_js)//len(js_content)}%)")

# --- Step 3 & 4: Update index.html ---
index_path = os.path.join(BASE, 'index.html')
with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Update CSS reference
html = re.sub(
    r'<link rel="stylesheet" href="css/style\.css">',
    f'<link rel="stylesheet" href="css/{versioned_css_name}">',
    html
)

# Update noscript CSS reference
html = re.sub(
    r'<noscript><link rel="stylesheet" href="css/style\.css"></noscript>',
    f'<noscript><link rel="stylesheet" href="css/{versioned_css_name}"></noscript>',
    html
)

# Add theme-color meta after viewport meta
html = re.sub(
    r'(<meta name="viewport"[^>]*>)',
    r'\1\n    <meta name="theme-color" content="#0A2540">',
    html, count=1
)

# Add preload for versioned CSS
html = re.sub(
    r'(<link rel="preload" href="css/style\.css" as="style">)',
    f'<link rel="preload" href="css/{versioned_css_name}" as="style">',
    html, count=1
)

# Add JS script reference (before </body> if exists, otherwise find the noscript block area)
# Add JS reference after the last CSS/font link
js_script_tag = f'    <script src="js/{versioned_js_name}" defer></script>'
# Insert before the anti-FOUC script or before </head>
if '<script>' in html and '<script type="application/ld+json">' not in html.split('<script>')[1].split('</script>')[0] if '<script>' in html else False:
    # Insert before the anti-FOUC inline script
    html = re.sub(
        r'(    <!-- Anti-FOUC:)',
        js_script_tag + '\n\n    \\1',
        html, count=1
    )
else:
    # Insert before </head>
    html = re.sub(
        r'(</head>)',
        js_script_tag + '\n\\1',
        html, count=1
    )

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"index.html updated")

# --- Step 5: Update contacto.html ---
contacto_path = os.path.join(BASE, 'contacto.html')
with open(contacto_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Update CSS reference
html = re.sub(
    r'<link rel="stylesheet" href="css/style\.css">',
    f'<link rel="stylesheet" href="css/{versioned_css_name}">',
    html
)

# Update noscript CSS reference
html = re.sub(
    r'<noscript><link rel="stylesheet" href="css/style\.css"></noscript>',
    f'<noscript><link rel="stylesheet" href="css/{versioned_css_name}"></noscript>',
    html
)

# Add theme-color meta after viewport meta
html = re.sub(
    r'(<meta name="viewport"[^>]*>)',
    r'\1\n    <meta name="theme-color" content="#0A2540">',
    html, count=1
)

# Add preload for versioned CSS
html = re.sub(
    r'(<link rel="preload" href="css/style\.css" as="style">)',
    f'<link rel="preload" href="css/{versioned_css_name}" as="style">',
    html, count=1
)

# Add JS script reference
js_script_tag = f'    <script src="js/{versioned_js_name}" defer></script>'
html = re.sub(
    r'(</head>)',
    js_script_tag + '\n\\1',
    html, count=1
)

with open(contacto_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"contacto.html updated")

# --- Step 6: Create favicon.svg ---
favicon_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="4" fill="#0A2540"/>
  <text x="16" y="23" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="22" fill="#FFC107">T</text>
</svg>
'''

favicon_path = os.path.join(BASE, 'favicon.svg')
with open(favicon_path, 'w', encoding='utf-8') as f:
    f.write(favicon_svg)

# Add favicon link to both HTML files
for path in [index_path, contacto_path]:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Add favicon link after the title tag
    if 'favicon.svg' not in content:
        content = re.sub(
            r'(<title>[^<]*</title>)',
            r'\1\n\n    <link rel="icon" type="image/svg+xml" href="/favicon.svg">',
            content, count=1
        )
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)

print(f"favicon.svg created + added to both HTML files")

# --- Summary ---
print("\n--- SUMMARY ---")
import subprocess
for d in ['css', 'js']:
    result = subprocess.run(['ls', '-la', os.path.join(BASE, d)], capture_output=True, text=True)
    print(f"\n{d}/:")
    print(result.stdout)
