import re
with open('css/style.css','r') as f:
    css = f.read()
css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
css = re.sub(r'\s+', ' ', css)
css = re.sub(r'\s*{\s*', '{', css)
css = re.sub(r'\s*}\s*', '}', css)
css = re.sub(r'\s*:\s*', ':', css)
css = re.sub(r'\s*;\s*', ';', css)
css = re.sub(r'\s*,\s*', ',', css)
css = re.sub(r';}', '}', css)
css = css.strip()
with open('css/style.min.css','w') as f:
    f.write(css)
print(f'Minified: {len(css)} bytes')
