#!/usr/bin/env python3
"""Replace placeholders and emojis with inline SVGs in index.html"""
import re

with open('index.html', 'r') as f:
    html = f.read()

# ============================================================
# 1. MAPA DE PORTUGAL
# ============================================================
portugal_map_svg = '''<svg width="550" height="500" viewBox="0 0 550 500" fill="none"
    xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="Mapa de Portugal com as cidades onde o Trio Elétrico atua"
    style="max-width:100%;height:auto;">
    <title>Mapa de Portugal — Áreas de Atuação do Trio Elétrico</title>
    <desc>Mapa de Portugal continental com seis marcadores nas cidades do Porto, Braga, Aveiro, Coimbra, Lisboa e Setúbal.</desc>

    <!-- Fundo suave -->
    <rect width="550" height="500" fill="#f8f9fa" rx="12"/>

    <!-- Contorno de Portugal continental (simplificado, mas reconhecível) -->
    <path d="
        M 175,30
        C 185,32 195,30 200,28
        C 205,26 215,24 220,22
        C 228,18 240,18 250,20
        C 260,22 270,18 280,16
        C 290,14 300,12 308,14
        C 315,16 322,14 328,18
        C 335,22 340,20 345,24
        C 350,28 355,26 358,30
        C 360,34 355,38 350,42
        C 345,46 348,52 350,58
        C 352,64 358,68 362,72
        C 366,76 360,82 358,88
        C 355,94 350,98 348,104
        C 346,110 340,114 338,120
        C 336,126 340,132 342,138
        C 344,144 340,150 338,156
        C 336,162 330,166 328,172
        C 326,178 330,184 332,190
        C 334,196 338,202 340,208
        C 342,214 348,220 350,226
        C 352,232 356,238 358,244
        C 360,250 358,256 354,262
        C 350,268 352,274 348,280
        C 344,286 340,292 338,298
        C 336,304 330,308 326,314
        C 322,320 320,326 316,332
        C 312,338 310,344 306,350
        C 302,356 298,362 294,368
        C 290,374 286,380 282,386
        C 278,392 274,398 270,404
        C 266,410 262,416 258,422
        C 254,428 250,434 246,440
        C 242,446 238,452 234,458
        C 230,464 226,470 220,476
        C 214,482 208,488 200,492
        C 192,496 186,498 180,496
        C 174,494 168,490 162,486
        C 156,482 150,476 144,472
        C 138,468 132,462 126,458
        C 120,454 114,448 108,442
        C 102,436 96,430 90,424
        C 84,418 78,412 72,406
        C 66,400 60,394 54,388
        C 48,382 42,376 36,370
        C 30,364 24,358 18,352
        C 12,346 6,340 2,334
        C -2,328 -4,322 -2,316
        C 0,310 6,304 10,298
        C 14,292 20,286 24,280
        C 28,274 34,268 38,262
        C 42,256 48,250 52,244
        C 56,238 62,232 66,226
        C 70,220 76,214 80,208
        C 84,202 90,196 94,190
        C 98,184 104,178 108,172
        C 112,166 118,160 122,154
        C 126,148 132,142 136,136
        C 140,130 146,124 150,118
        C 154,112 160,106 164,100
        C 168,94 174,88 178,82
        C 182,76 188,70 192,64
        C 196,58 202,52 206,46
        C 210,40 216,34 220,30
        C 214,28 208,30 200,28
        C 192,26 184,24 178,26
        C 172,28 168,30 175,30
        Z"
        fill="#e9ecef" stroke="#0A2540" stroke-width="2" stroke-linejoin="round"/>

    <!-- Ilha do Porto / norte litoral (subtle highlight) -->
    <ellipse cx="190" cy="55" rx="30" ry="15" fill="#dee2e6" opacity="0.4"/>

    <!-- Cidades e marcadores -->
    <!-- 1. Porto -->
    <g>
        <circle cx="215" cy="55" r="14" fill="#FFC107" stroke="#0A2540" stroke-width="2"/>
        <text x="215" y="60" text-anchor="middle" fill="#0A2540" font-size="12" font-weight="800" font-family="Inter, sans-serif">1</text>
        <text x="240" y="50" fill="#0A2540" font-size="11" font-weight="600" font-family="Inter, sans-serif">Porto</text>
    </g>

    <!-- 2. Braga -->
    <g>
        <circle cx="185" cy="38" r="12" fill="#FFC107" stroke="#0A2540" stroke-width="2"/>
        <text x="185" y="42" text-anchor="middle" fill="#0A2540" font-size="11" font-weight="800" font-family="Inter, sans-serif">2</text>
        <text x="148" y="34" fill="#0A2540" font-size="10" font-weight="600" font-family="Inter, sans-serif">Braga</text>
    </g>

    <!-- 3. Aveiro -->
    <g>
        <circle cx="230" cy="85" r="12" fill="#FFC107" stroke="#0A2540" stroke-width="2"/>
        <text x="230" y="89" text-anchor="middle" fill="#0A2540" font-size="11" font-weight="800" font-family="Inter, sans-serif">3</text>
        <text x="255" y="82" fill="#0A2540" font-size="10" font-weight="600" font-family="Inter, sans-serif">Aveiro</text>
    </g>

    <!-- 4. Coimbra -->
    <g>
        <circle cx="260" cy="115" r="12" fill="#FFC107" stroke="#0A2540" stroke-width="2"/>
        <text x="260" y="119" text-anchor="middle" fill="#0A2540" font-size="11" font-weight="800" font-family="Inter, sans-serif">4</text>
        <text x="285" y="112" fill="#0A2540" font-size="10" font-weight="600" font-family="Inter, sans-serif">Coimbra</text>
    </g>

    <!-- 5. Lisboa -->
    <g>
        <circle cx="245" cy="290" r="16" fill="#FFC107" stroke="#0A2540" stroke-width="2"/>
        <text x="245" y="296" text-anchor="middle" fill="#0A2540" font-size="14" font-weight="800" font-family="Inter, sans-serif">5</text>
        <text x="270" y="290" fill="#0A2540" font-size="11" font-weight="600" font-family="Inter, sans-serif">Lisboa</text>
    </g>

    <!-- 6. Setúbal -->
    <g>
        <circle cx="260" cy="320" r="12" fill="#FFC107" stroke="#0A2540" stroke-width="2"/>
        <text x="260" y="324" text-anchor="middle" fill="#0A2540" font-size="11" font-weight="800" font-family="Inter, sans-serif">6</text>
        <text x="285" y="322" fill="#0A2540" font-size="10" font-weight="600" font-family="Inter, sans-serif">Setúbal</text>
    </g>

    <!-- Legenda -->
    <g transform="translate(30, 440)">
        <rect width="490" height="40" rx="8" fill="#ffffff" stroke="#dee2e6" stroke-width="1"/>
        <text x="245" y="25" text-anchor="middle" fill="#0A2540" font-size="12" font-weight="600" font-family="Inter, sans-serif">
            Porto · Braga · Aveiro · Coimbra · Lisboa · Setúbal
        </text>
    </g>
</svg>'''

# Replace the areas section map placeholder
old_map = r'''<svg width="550" height="500" viewBox="0 0 550 500" fill="none"
                    xmlns="http://www.w3.org/2000/svg" aria-label="Mapa de Portugal com as áreas de atuação do Trio Elétrico marcadas"><rect width="550" height="500" fill="#0A2540"/><g transform="translate\(50, 150\)"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#FFC107" font-size="40" font-family="Inter, sans-serif" font-weight="bold">Mapa de Portugal</text></g></svg>'''

# Find the exact old SVG and replace
old_map_exact = '<svg width="550" height="500" viewBox="0 0 550 500" fill="none"\n                        xmlns="http://www.w3.org/2000/svg" aria-label="Mapa de Portugal com as áreas de atuação do Trio Elétrico marcadas"><rect width="550" height="500" fill="#0A2540"/><g transform="translate(50, 150)"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#FFC107" font-size="40" font-family="Inter, sans-serif" font-weight="bold">Mapa de Portugal</text></g></svg>'

html = html.replace(old_map_exact, portugal_map_svg.strip())
print("✓ Mapa substituído")

# ============================================================
# 2. SERVIÇOS — Emojis → SVGs inline
# ============================================================

# SVG icons for each service
service_icons = {
    'residential': '''<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M4 14L16 4L28 14V26C28 27.1 27.1 28 26 28H6C4.9 28 4 27.1 4 26V14Z" stroke="#0A2540" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13 28V18H19V28" stroke="#0A2540" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="16" cy="12" r="2" stroke="#FFC107" stroke-width="2"/>
    </svg>''',
    'commercial': '''<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="6" y="8" width="20" height="20" rx="2" stroke="#0A2540" stroke-width="2"/>
        <rect x="10" y="12" width="4" height="4" rx="0.5" stroke="#FFC107" stroke-width="1.5"/>
        <rect x="18" y="12" width="4" height="4" rx="0.5" stroke="#FFC107" stroke-width="1.5"/>
        <rect x="10" y="18" width="4" height="4" rx="0.5" stroke="#FFC107" stroke-width="1.5"/>
        <rect x="18" y="18" width="4" height="4" rx="0.5" stroke="#FFC107" stroke-width="1.5"/>
        <path d="M12 28V24H20V28" stroke="#0A2540" stroke-width="2"/>
    </svg>''',
    'industrial': '''<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M4 28L8 20H24L28 28H4Z" stroke="#0A2540" stroke-width="2" stroke-linejoin="round"/>
        <rect x="10" y="10" width="12" height="10" rx="1" stroke="#0A2540" stroke-width="2"/>
        <circle cx="16" cy="15" r="3" stroke="#FFC107" stroke-width="1.5"/>
        <path d="M8 14H6V20H8" stroke="#0A2540" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M24 14H26V20H24" stroke="#0A2540" stroke-width="1.5" stroke-linecap="round"/>
    </svg>''',
    'repairs': '''<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M16 4C14 4 12 6 12 8C12 9.5 13 11 14 12L6 20L8 22L16 14C15 15 14 16.5 14 18C14 21 17 24 20 24C23 24 26 21 26 18C26 15 23 12 20 12" stroke="#0A2540" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="16" cy="6" r="1" fill="#FFC107"/>
    </svg>''',
    'boletins': '''<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="8" y="4" width="16" height="24" rx="2" stroke="#0A2540" stroke-width="2"/>
        <line x1="12" y1="10" x2="20" y2="10" stroke="#0A2540" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="12" y1="14" x2="20" y2="14" stroke="#0A2540" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="12" y1="18" x2="17" y2="18" stroke="#0A2540" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M22 22L24 24L28 20" stroke="#FFC107" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>''',
    'solar': '''<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="16" cy="16" r="5" stroke="#FFC107" stroke-width="2"/>
        <path d="M16 3V6M16 26V29M3 16H6M26 16H29M7.05 7.05L9.17 9.17M22.83 22.83L24.95 24.95M24.95 7.05L22.83 9.17M9.17 22.83L7.05 24.95" stroke="#0A2540" stroke-width="2" stroke-linecap="round"/>
        <rect x="10" y="22" width="12" height="6" rx="1" stroke="#0A2540" stroke-width="1.5"/>
        <line x1="14" y1="22" x2="14" y2="28" stroke="#0A2540" stroke-width="1"/>
        <line x1="18" y1="22" x2="18" y2="28" stroke="#0A2540" stroke-width="1"/>
    </svg>'''
}

# Replace each service card's emoji icon
service_replacements = [
    ('<div class="service-icon" aria-hidden="true">🏠</div>', service_icons['residential']),
    ('<div class="service-icon" aria-hidden="true">🏢</div>', service_icons['commercial']),
    ('<div class="service-icon" aria-hidden="true">🏭</div>', service_icons['industrial']),
    ('<div class="service-icon" aria-hidden="true">🔧</div>', service_icons['repairs']),
    ('<div class="service-icon" aria-hidden="true">📋</div>', service_icons['boletins']),
    ('<div class="service-icon" aria-hidden="true">☀️</div>', service_icons['solar']),
]

for old, new in service_replacements:
    if old in html:
        html = html.replace(old, new)
        print(f"✓ Ícone de serviço substituído")
    else:
        print(f"⚠ Ícone de serviço não encontrado: {old[:40]}")

# ============================================================
# 3. EQUIPA — Substituir placehold.co por SVGs inline
# ============================================================

team_svgs = {
    'Carlos R.': '''<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Foto de Carlos Rocha, sócio e eletricista comercial">
        <defs>
            <linearGradient id="team-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#103d6a"/>
                <stop offset="100%" stop-color="#0A2540"/>
            </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#team-grad-2)"/>
        <circle cx="200" cy="150" r="60" fill="#1a5a90"/>
        <ellipse cx="200" cy="330" rx="90" ry="70" fill="#1a5a90"/>
        <circle cx="200" cy="150" r="45" fill="#FFC107" opacity="0.15"/>
        <text x="200" y="390" text-anchor="middle" fill="white" font-size="16" font-weight="600" font-family="Inter, sans-serif" opacity="0.7">Carlos Rocha</text>
    </svg>''',
    'João S.': '''<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Foto de João Silva, sócio e eletricista industrial">
        <defs>
            <linearGradient id="team-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#103d6a"/>
                <stop offset="100%" stop-color="#0A2540"/>
            </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#team-grad-3)"/>
        <circle cx="200" cy="150" r="60" fill="#1a5a90"/>
        <ellipse cx="200" cy="330" rx="90" ry="70" fill="#1a5a90"/>
        <circle cx="200" cy="150" r="45" fill="#FFC107" opacity="0.15"/>
        <text x="200" y="390" text-anchor="middle" fill="white" font-size="16" font-weight="600" font-family="Inter, sans-serif" opacity="0.7">João Silva</text>
    </svg>'''
}

# Replace Carlos
old_carlos = '<img src="https://placehold.co/400x400/0A2540/FFC107?text=Carlos+R." alt="Foto de Carlos Rocha, sócio e eletricista comercial" width="400" height="400" loading="lazy">'
html = html.replace(old_carlos, team_svgs['Carlos R.'])
print("✓ Imagem de Carlos substituída")

# Replace João
old_joao = '<img src="https://placehold.co/400x400/0A2540/FFC107?text=João+S." alt="Foto de João Silva, sócio e eletricista industrial" width="400" height="400" loading="lazy">'
html = html.replace(old_joao, team_svgs['João S.'])
print("✓ Imagem de João substituída")

# ============================================================
# 4. TESTEMUNHOS — Substituir SVGs simples por melhores com gradiente
# ============================================================

testimonial_svgs = {
    'M': '<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Avatar de Maria Fernandes">\n                            <defs><linearGradient id="grad-m" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0A2540"/><stop offset="100%" stop-color="#103d6a"/></linearGradient></defs>\n                            <rect width="60" height="60" rx="30" fill="url(#grad-m)"/>\n                            <circle cx="30" cy="30" r="28" fill="#FFC107" opacity="0.12"/>\n                            <text x="30" y="38" text-anchor="middle" fill="#FFC107" font-size="22" font-weight="800" font-family="Inter, sans-serif">M</text>\n                        </svg>',
    'P': '<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Avatar de Pedro Almeida">\n                            <defs><linearGradient id="grad-p" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0A2540"/><stop offset="100%" stop-color="#103d6a"/></linearGradient></defs>\n                            <rect width="60" height="60" rx="30" fill="url(#grad-p)"/>\n                            <circle cx="30" cy="30" r="28" fill="#FFC107" opacity="0.12"/>\n                            <text x="30" y="38" text-anchor="middle" fill="#FFC107" font-size="22" font-weight="800" font-family="Inter, sans-serif">P</text>\n                        </svg>',
    'A': '<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Avatar de Ana Rodrigues">\n                            <defs><linearGradient id="grad-a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0A2540"/><stop offset="100%" stop-color="#103d6a"/></linearGradient></defs>\n                            <rect width="60" height="60" rx="30" fill="url(#grad-a)"/>\n                            <circle cx="30" cy="30" r="28" fill="#FFC107" opacity="0.12"/>\n                            <text x="30" y="38" text-anchor="middle" fill="#FFC107" font-size="22" font-weight="800" font-family="Inter, sans-serif">A</text>\n                        </svg>',
    'R': '<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Avatar de Ricardo Sousa">\n                            <defs><linearGradient id="grad-r" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0A2540"/><stop offset="100%" stop-color="#103d6a"/></linearGradient></defs>\n                            <rect width="60" height="60" rx="30" fill="url(#grad-r)"/>\n                            <circle cx="30" cy="30" r="28" fill="#FFC107" opacity="0.12"/>\n                            <text x="30" y="38" text-anchor="middle" fill="#FFC107" font-size="22" font-weight="800" font-family="Inter, sans-serif">R</text>\n                        </svg>',
}

# Replace each testimonial avatar
# Maria
old_m = '''<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Foto de Maria Fernandes"><rect width="60" height="60" fill="#0A2540"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#FFC107" font-size="16" font-family="Inter, sans-serif" font-weight="bold">M</text></svg>'''
html = html.replace(old_m, testimonial_svgs['M'])
print("✓ Avatar Maria substituído")

# Pedro
old_p = '''<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Foto de Pedro Almeida"><rect width="60" height="60" fill="#0A2540"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#FFC107" font-size="16" font-family="Inter, sans-serif" font-weight="bold">P</text></svg>'''
html = html.replace(old_p, testimonial_svgs['P'])
print("✓ Avatar Pedro substituído")

# Ana
old_a = '''<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Foto de Ana Rodrigues"><rect width="60" height="60" fill="#0A2540"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#FFC107" font-size="16" font-family="Inter, sans-serif" font-weight="bold">A</text></svg>'''
html = html.replace(old_a, testimonial_svgs['A'])
print("✓ Avatar Ana substituído")

# Ricardo
old_r = '''<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Foto de Ricardo Sousa"><rect width="60" height="60" fill="#0A2540"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#FFC107" font-size="16" font-family="Inter, sans-serif" font-weight="bold">R</text></svg>'''
html = html.replace(old_r, testimonial_svgs['R'])
print("✓ Avatar Ricardo substituído")

# ============================================================
# 5. DIFERENCIAIS — Adicionar SVGs aos 6 cards
# ============================================================

diff_icons = {
    1: '''<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="4" y="2" width="20" height="24" rx="2" stroke="#0A2540" stroke-width="2"/>
            <circle cx="14" cy="12" r="4" stroke="#FFC107" stroke-width="1.5"/>
            <path d="M8 22H20" stroke="#0A2540" stroke-width="1.5" stroke-linecap="round"/>
        </svg>''',
    2: '''<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 6L14 2L24 6V22L14 26L4 22V6Z" stroke="#0A2540" stroke-width="2" stroke-linejoin="round"/>
            <path d="M4 6L14 12L24 6" stroke="#0A2540" stroke-width="2" stroke-linejoin="round"/>
            <line x1="14" y1="12" x2="14" y2="26" stroke="#0A2540" stroke-width="2"/>
        </svg>''',
    3: '''<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="14" cy="14" r="10" stroke="#0A2540" stroke-width="2"/>
            <path d="M10 14L13 17L18 11" stroke="#FFC107" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>''',
    4: '''<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M8 8C8 8 10 14 14 14C18 14 20 8 20 8" stroke="#0A2540" stroke-width="2" stroke-linecap="round"/>
            <path d="M6 20H22" stroke="#0A2540" stroke-width="2" stroke-linecap="round"/>
            <circle cx="10" cy="18" r="1.5" fill="#0A2540"/>
            <circle cx="14" cy="18" r="1.5" fill="#0A2540"/>
            <circle cx="18" cy="18" r="1.5" fill="#0A2540"/>
            <path d="M11 10L12 8H16L17 10" stroke="#FFC107" stroke-width="1.5"/>
        </svg>''',
    5: '''<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="14" cy="14" r="10" stroke="#0A2540" stroke-width="2"/>
            <path d="M14 8V14L18 16" stroke="#0A2540" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>''',
    6: '''<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="14" cy="14" r="10" stroke="#0A2540" stroke-width="2"/>
            <text x="14" y="20" text-anchor="middle" fill="#0A2540" font-size="14" font-weight="800" font-family="Inter, sans-serif">€</text>
        </svg>''',
}

for num, svg in diff_icons.items():
    # Find the feature card pattern: <div class="feature-number" aria-hidden="true">{num}</div>
    old_feature = f'<div class="feature-number" aria-hidden="true">{num}</div>'
    new_feature = svg
    if old_feature in html:
        html = html.replace(old_feature, new_feature)
        print(f"✓ Ícone diferencial {num} adicionado")
    else:
        print(f"⚠ Diferencial {num} não encontrado")

# ============================================================
# 6. FOOTER — Adicionar redes sociais (SVGs)
# ============================================================

footer_social = '''                <div class="footer-social">
                    <h4>Redes Sociais</h4>
                    <ul class="footer-social-list">
                        <li><a href="#" aria-label="Facebook do Trio Elétrico"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17 5H13C12.4 5 12 5.4 12 6V8H16L15.5 12H12V20H8V12H6V8H8V6C8 4.9 8.9 4 10 4H14V0H10C7.2 0 5 2.2 5 5V8H2V12H5V20H15V12H17L18 8H17V5Z" fill="#0A2540"/></svg></a></li>
                        <li><a href="#" aria-label="Instagram do Trio Elétrico"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2" y="2" width="16" height="16" rx="4" stroke="#0A2540" stroke-width="2"/><circle cx="10" cy="10" r="3.5" stroke="#0A2540" stroke-width="2"/><circle cx="15" cy="5" r="1" fill="#0A2540"/></svg></a></li>
                        <li><a href="#" aria-label="LinkedIn do Trio Elétrico"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2" y="2" width="16" height="16" rx="2" stroke="#0A2540" stroke-width="2"/><path d="M7 9V14" stroke="#0A2540" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="6.5" r="1.5" stroke="#0A2540" stroke-width="1.5"/><path d="M11 9C11 9 11.5 10 13 10C14.5 10 15 9 15 9V14" stroke="#0A2540" stroke-width="2" stroke-linecap="round"/></svg></a></li>
                        <li><a href="https://wa.me/351912345678" aria-label="WhatsApp do Trio Elétrico"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 1.5C5.3 1.5 1.5 5.3 1.5 10C1.5 11.7 2 13.3 2.9 14.6L2 18L5.5 17.1C6.7 17.9 8.1 18.3 10 18.3C14.7 18.3 18.5 14.5 18.5 10C18.5 5.3 14.7 1.5 10 1.5Z" fill="#25D366"/><path d="M13.4 11.3C13.1 11.1 11.6 10.4 11.3 10.3C11 10.2 10.8 10.2 10.6 10.5C10.4 10.8 9.8 11.4 9.6 11.6C9.4 11.8 9.2 11.9 9 11.7C8.8 11.6 8 11.1 7.2 10.3C6.5 9.6 6.1 8.8 6 8.6C5.8 8.4 5.9 8.3 6 8.2C6.1 8.1 6.3 7.9 6.4 7.8C6.5 7.7 6.6 7.6 6.7 7.4C6.7 7.2 6.6 7 6.5 6.8C6.4 6.6 5.8 5.1 5.6 4.5C5.4 4 5.2 4 5 4C4.9 4 4.7 4 4.5 4C4.3 4 3.9 4.1 3.6 4.5C3.3 4.9 2.5 5.8 2.5 7.6C2.5 9.4 3.7 11.2 3.9 11.5C4.1 11.8 6.3 15 10 16.3C13.4 17.5 13.4 17.3 13.7 17.2C14 17.1 15.4 16.3 15.8 15.4C16.2 14.5 16.2 13.8 16.1 13.6C16 13.5 15.8 13.5 13.4 11.3Z" fill="white"/></svg></a></li>
                    </ul>
                </div>'''

# Insert social section before footer-links in the footer
old_footer_grid_start = '<div class="footer-grid">\n                    <div class="footer-brand">'
html = html.replace(old_footer_grid_start, '<div class="footer-grid">\n                    ' + footer_social + '\n                    <div class="footer-brand">')
print("✓ Redes sociais adicionadas ao footer")

# ============================================================
# Write the updated HTML
# ============================================================
with open('index.html', 'w') as f:
    f.write(html)

print("\n✓ Todos os SVGs inline aplicados com sucesso!")
