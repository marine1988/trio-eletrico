import re

with open('css/style.min.css', 'r') as f:
    content = f.read()

# Search for various media query formats
for pattern in ['@media(max-width:480px)', '@media (max-width:480px)', '@media(max-width: 480px)', '@media (max-width: 480px)']:
    idx = content.find(pattern)
    if idx >= 0:
        print(f"Found '{pattern}' at position {idx}")
        # Show surrounding context
        print(content[idx:idx+100])
        break

# Also search for contacto-form in the whole file
cf_matches = list(re.finditer(r'\.contacto-form\{[^}]+\}', content))
print(f"\nAll .contacto-form rules ({len(cf_matches)}):")
for m in cf_matches:
    # Find which media query it's in by looking backwards
    start = max(0, m.start() - 200)
    context = content[start:m.end()]
    mq_match = re.search(r'@media[^{]+', context)
    mq = mq_match.group() if mq_match else '(base)'
    print(f"  {mq}: {m.group()}")

# Search for .container rules
cont_matches = list(re.finditer(r'\.container\{[^}]+\}', content))
print(f"\nAll .container rules ({len(cont_matches)}):")
for m in cont_matches:
    start = max(0, m.start() - 200)
    context = content[start:m.end()]
    mq_match = re.search(r'@media[^{]+', context)
    mq = mq_match.group() if mq_match else '(base)'
    print(f"  {mq}: {m.group()}")
