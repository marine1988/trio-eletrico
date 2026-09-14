with open('css/style.min.css', 'r') as f:
    content = f.read()

# Find the position of the 480px media query
idx_480 = content.find('@media (max-width:480px)')
idx_375 = content.find('@media (max-width:375px)')

if idx_480 >= 0 and idx_375 >= 0:
    # Only replace within the 480px section
    before = content[:idx_480]
    section = content[idx_480:idx_375]
    after = content[idx_375:]
    
    # Replace in the 480px section only
    old = '.contacto-form{padding-bottom:80px}'
    new = '.contacto-form{padding:20px 20px 80px}'
    section_new = section.replace(old, new)
    
    # Also add .container{padding:0 24px} at the start of the media query
    # Find the opening brace of the media query
    brace_idx = section_new.find('{', section_new.find('@media (max-width:480px)'))
    if brace_idx >= 0:
        section_new = section_new[:brace_idx+1] + '.container{padding:0 24px}' + section_new[brace_idx+1:]
    
    content_new = before + section_new + after
    
    with open('css/style.min.css', 'w') as f:
        f.write(content_new)
    
    print('Done! Changes applied to style.min.css')
    print('  - contacto-form padding changed to 20px 20px 80px in @media (max-width:480px)')
    print('  - .container padding:0 24px added in @media (max-width:480px)')
else:
    print(f'ERROR: idx_480={idx_480}, idx_375={idx_375}')
