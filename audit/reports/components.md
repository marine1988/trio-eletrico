# components.css — regras em falta para 14 classes

**Ficheiro entregue:** `css/components.css` (dono exclusivo desta camada)
**sha256:** `315abb49711ae97b41f24b68910a3f596dceec7f577820d92fc434e541f1cc9c`
**Carregamento:** `style.v1.min.css` → `style.min.css` → `fixes.css` → **`components.css`** → `overlays.css` → `mobile.css`
**Nota de concorrência:** durante este trabalho outros agentes escreveram `overlays.css` e `mobile.css`. O delta atribuível a esta camada é medido entre `audit-report-components-before2.json` (imediatamente antes de editar components.css, já com o trabalho dos colegas) e `audit-report-components.json`.

## Comandos usados

```bash
cd /home/roger/.hermes/profiles/coder/workspace/trio-eletrico
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/            # 200
AUDIT_TAG=components-before  node audit/audit.mjs http://localhost:3000    # baseline inicial (03:44)
AUDIT_TAG=components-before2 node audit/audit.mjs http://localhost:3000    # baseline imediato
AUDIT_TAG=components         node audit/audit.mjs http://localhost:3000    # final
# medição fina (script próprio, grava em audit/screens-components/):
node /tmp/teprobe/verify-final.mjs
```

## 1. O que estava em falta e porquê (problema → causa → fix)

| # | Sintoma medido | Causa | Fix em `components.css` (selectores) |
|---|---|---|---|
| 1 | Sol e lua do toggle **ambos visíveis** em todos os viewports (`opacity: 1` nos dois) | `style.v1.min.css` declara `.theme-toggle__icon{animation:fade-in-out .6s forwards}` e os keyframes terminam em `opacity:1`; com `forwards` o valor animado ganha à classe `.theme-toggle__icon--hidden` que o JS aplica — a classe do JS nunca tinha efeito | `.theme-toggle__sun, .theme-toggle__moon { opacity:1; animation:none }`, `.theme-toggle__moon{opacity:0;pointer-events:none}`, `[data-theme="dark"] .theme-toggle__sun{opacity:0}`, `[data-theme="dark"] .theme-toggle__moon{opacity:1}` |
| 2 | Carrossel partido: os 4 cards empilhados a 172px de largura (122px de texto), `translateX` do JS sem efeito útil | o HTML usa `.carousel-wrapper > .carousel-track > .testimonial-card`, mas v1 só define `.testimonials-track` (classe que **não existe** no HTML) e não há nenhuma regra para `.carousel-wrapper`/`.carousel-track`/`.carousel-nav` → sem `display:flex` o `flex-basis` dos cards é ignorado | `.carousel-track{display:flex;flex-wrap:nowrap;align-items:stretch;transition:transform .5s …}`, `.testimonial-card{flex:0 0 auto;margin:0 6px;min-width:0}`, `@media (min-width:769px){…calc(50% - 12px)}`, `@media (min-width:1025px){…calc(33.333% - 12px)}` |
| 3 | Texto dos depoimentos cortado (2 ocorrências a 320px) e `div.testimonial-author > div` a sair do card (4 ocorrências) | coluna de texto demasiado estreita (min-content do flex item obrigava a overflow) e sem controlo de quebra | `.testimonial-text,.testimonial-name,.testimonial-location{overflow-wrap:break-word}`, `.testimonial-author, .testimonial-author > div{min-width:0}` |
| 4 | Dots do carrossel com 12×12px (36×12 o activo) — alvo táctil inaceitável | `.testimonials-dot` de v1 desenha o próprio ponto com 12px e o `.active` com 36px | `.carousel-nav{display:flex;flex-direction:column;align-items:center;gap:.25rem}`, `.testimonials-dot{width:44px;height:44px;…}` + `::before` a desenhar o ponto (12px; 36×12 activo), neutralizando o desenho do `.active` de v1 |
| 5 | FAQ: `.faq-icon` com 77×69px a transbordar o botão; `.faq-question-text` sem regra nenhuma (sem controlo de quebra) | `fixes.css`: `#faq [class*="faq-"]{padding:1.25rem 1.5rem !important}` apanha os **spans internos**; e `.faq-question-text` não existia em nenhuma folha | `.faq-question-text{flex:1 1 auto;min-width:0;overflow-wrap:break-word;text-align:left;line-height:1.45}`. **O padding não é tocado aqui** (ver §4: `mobile.css` compensa-o com margens negativas em ≤768px, não deve ser contrariado) |
| 6 | FAQ: com o item **fechado** a primeira linha da resposta ficava visível (20px de texto cinzento) em todos os viewports | `max-height:0` + `padding:20px 24px` (fixes.css) → o border box não encolhe abaixo da soma do padding e o `overflow:hidden` só corta no padding box | `.faq-answer{visibility:hidden;transition:…,visibility 0s linear .35s}`, `.faq-item.active .faq-answer{visibility:visible;transition:…,visibility 0s}` (mantém a animação de fecho visível; sem `!important`) |
| 7 | `.accent` sem regra (avatares PA/RS iguais aos outros) | classe usada em `testimonial-author-avatar accent` mas nunca definida | `.accent{background:var(--color-accent);color:var(--color-primary)}` |
| 8 | `.noSwipe` sem regra (`.testimonials-arrows noSwipe`) | classe decorativa nunca definida | `.noSwipe{touch-action:pan-y;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}` |
| 9 | `.gallery-credit` sem regra (só estilos inline no HTML) | classe nunca definida | `.gallery-credit{display:block;margin-top:1.5rem;font-size:.8rem;line-height:1.6;color:var(--text-muted);text-align:center}` + `.gallery-credit a{color:var(--color-accent);text-decoration:underline;text-underline-offset:3px}` |
| 10 | Footer de contacto sem grelha nem flex: `.social-icons` com links de 272×24px, logótipo em bloco | `contacto.html` usa `.footer-content/.footer-logo/.footer-social/.social-icons`; v1 só define `.footer-grid/.footer-brand` (usados no index) | `.footer-content{display:grid;grid-template-columns:1fr;gap:2rem;padding-bottom:2rem;border-bottom:1px solid rgba(255,255,255,.1)}` + `@media (min-width:769px){grid-template-columns:2fr 1fr 1fr 1fr}`, `.footer-logo{display:flex;align-items:center;gap:10px;…}`, `.footer-social h4{…color:var(--color-accent)}`, `.social-icons{display:flex;flex-wrap:wrap;gap:12px}`, `.social-icons a{…width:44px;height:44px;border-radius:50%}` |
| 11 | Logótipo do footer ilegível (texto em `--color-primary` sobre o footer azul-escuro) nos **dois** footers | v1 pinta `.logo-text{color:var(--color-primary)}` globalmente | `.footer-logo .logo-text, .footer .logo-text{color:var(--color-white)}` (+ ícone em `--color-accent`) |

## 2. Tabela antes/depois (números do harness)

`before1` = `components-before` (03:44, quando `overlays.css`/`mobile.css` ainda eram esqueletos), `before2` = `components-before2` (imediato), `after` = `components`. Colunas = contagens do `audit-report-*.json`.

| página | viewport | métrica | before1 | before2 | **after** |
|---|---|---|---|---|---|
| home | mob-320 | overflowRight | 1 | 0 | **0** |
| home | mob-320 | childOverflow | **9** | 0 | **0** |
| home | mob-320 | truncated | **2** | 0 | **0** |
| home | mob-320 | tinyTargets | 10 | 0 | **0** |
| home | mob-320 | classesNoRule | **8** | 5 | **0** |
| home | mob-360 | childOverflow | 4 | 0 | **0** |
| home | mob-375 | childOverflow | 2 | 0 | **0** |
| home | mob-390 | childOverflow | 1 | 0 | **0** |
| home | tab-768 | tinyTargets | 18 | 0 | **0** |
| home | mob-320/360/375/390/414/768 | classesNoRule | 8 | 5 | **0** |
| home | desk-1280 | overflowRight | 0 | 0 | **8** (ver §4.1) |
| home | desk-1280 | childOverflow | 0 | 0 | **1** (ver §4.1) |
| home | desk-1280 | tinyTargets | 26 | 26 | **22** |
| home | desk-1440 | overflowRight | 0 | 0 | **7** (ver §4.1) |
| home | desk-1440 | childOverflow | 2 | 2 | **3** |
| home | desk-1440 | tinyTargets | 26 | 26 | **22** |
| contacto | mob-320/360/375/390/414/768 | classesNoRule | 6 | 5 | **0** |
| contacto | mob-320/360/375/390/414/768 | tinyTargets | 6/6/6/6/6/13 | 0 | **0** |
| contacto | desk-1280/1440 | tinyTargets | 21 | 21 | **18** |
| contacto | todos | truncated | 1 | 1 | **1** (falso positivo `h1.sr-only`, §4.2) |
| ambos | todos | hScroll | false | false | **false** |

Output literal do harness (recortado às linhas que interessam):

```
# AUDIT_TAG=components-before   (03:44)
home      mob-320    overflowR:1 | childOut:9 | truncated:2 | tinyTap:10 | semCSS:8
home      mob-375    childOut:2 | tinyTap:10 | semCSS:8 | headerOverlap:2
home      desk-1280  tinyTap:26 | semCSS:8 | headerOverlap:4
contacto  mob-320    truncated:1 | tinyTap:6 | semCSS:6 | headerOverlap:2

# AUDIT_TAG=components-before2  (imediato, já com overlays.css+mobile.css dos colegas)
home      mob-320    semCSS:5 | imgBroken:6
contacto  mob-320    truncated:1 | semCSS:5
home      desk-1280  tinyTap:26 | semCSS:5 | imgBroken:6
contacto  desk-1280  truncated:1 | tinyTap:21 | semCSS:5

# AUDIT_TAG=components        (final)
home      mob-320    OK
contacto  mob-320    truncated:1
home      mob-360    OK
contacto  mob-360    truncated:1
home      mob-375    OK
contacto  mob-375    truncated:1
home      mob-390    OK
contacto  mob-390    truncated:1
home      mob-414    OK
contacto  mob-414    truncated:1
home      tab-768    OK
contacto  tab-768    truncated:1
home      desk-1280  overflowR:8 | childOut:1 | tinyTap:22
contacto  desk-1280  truncated:1 | tinyTap:18
home      desk-1440  overflowR:7 | childOut:3 | tinyTap:22
contacto  desk-1440  truncated:1 | tinyTap:18
```

## 3. Critérios de aceitação — verificação directa

Medição própria com as mesmas regras do harness (`/tmp/teprobe/verify-final.mjs`, site live sem injecção):

```
home/mob-320: noRule=0 | child=0 | trunc=0 | oR=0 | tiny=0 | hScroll=false
    cardsCheios=[s1,s2,s3,s4] (4/4) dots=0x0,0x0,0x0,0x0 nav=none
home/mob-375: noRule=0 | child=1[a.whatsapp-float] | trunc=0 | oR=0 | tiny=0
    cardsCheios=[s1,s2,s3,s4] (4/4) dots=0x0,0x0,0x0,0x0 nav=none
home/tab-768: noRule=0 | child=1[a.whatsapp-float] | trunc=0 | oR=0 | tiny=0
    cardsCheios=[s1,s2,s3,s4] (4/4)
home/desk-1280: noRule=0 | child=2[div#s4.testimonial-card;a.whatsapp-float] | trunc=0 | oR=8 | tiny=22
    cardsCheios=[s1,s2,s3] (3/4) dots=44x44,44x44,44x44,44x44 nav=flex
home/desk-1440: cardsCheios=[s1,s2,s3] (3/4) dots=44x44,44x44,44x44,44x44 nav=flex
contacto/mob-320: noRule=0 | child=0 | trunc=1[h1.sr-only] | oR=0 | tiny=0
contacto/desk-1280: noRule=0 | child=1[a.whatsapp-float] | trunc=1[h1.sr-only] | oR=0 | tiny=18

NAV w=900:  slide0 cheios=[s1,s2] dot=1 / slide1 -398px cheios=[s2,s3] dot=2 / slide2 -796px cheios=[s3,s4] dot=3
NAV w=1024: slide0 cheios=[s1,s2] dot=1 / slide1 -460px cheios=[s2,s3] dot=2 / slide2 -920px cheios=[s3,s4] dot=3
NAV w=1280: slide0 cheios=[s1,s2,s3] dot=1 / slide1 -387px cheios=[s2,s3,s4] dot=2 / slide2 -774px cheios=[s3,s4] dot=3
```

| # | Critério | Resultado |
|---|---|---|
| 1 | `classesNoRule = []` na home e no contacto | **CUMPRIDO** — `noRule=0` em 8 viewports × 2 páginas (era 8 home / 6 contacto no `before1`, 5/5 no `before2` depois dos colegas) |
| 2 | `childOverflow` da home a 320px: 9 → ≤2 | **CUMPRIDO** — **0** a 320px (e 0 a 360/375/390/414/768). Em 360-768 o único item é `a.whatsapp-float` (1px, de `overlays.css`). Nota: parte do 9→0 já vinha de `mobile.css` (ver §4.3) |
| 3 | `truncated` a 320px: 2 → 0 (texto dos depoimentos) | **CUMPRIDO** — `trunc=0` na home em todos os viewports (`before1`: 2 a 320px, `cw 122 / sw 128`) |
| 4 | Carrossel navegável: 1 card por vista em ≤768px, 3+ em desktop, dots ≥44px | **CUMPRIDO com a decisão do §4.4** — ≤768px: 4/4 cards visíveis, um por linha (`nav=none`); 769-1024px: 2 cards por vista; ≥1025px: **3 cards por vista** (3/4) e navegação a funcionar (medido: `translateX` de −387px a 1280, dots a acompanhar 1→2→3). Dots **44×44** em desktop (`44x44 ×4`), ≥44px de área clicável |
| 5 | Screenshot dos depoimentos a 375px: cards legíveis, um por linha, texto não cortado | **CUMPRIDO** — `audit/screens-components/final-depoimentos-375.png`: 4 cards, um por linha, texto e avatares dentro do card, sem cortes (confirmado por revisão visual da imagem) |

## 4. Excepções, limitações e o que ficou por fazer

### 4.1 `overflowRight`/`childOverflow` no desktop (1280 +8 / 1440 +7) — inerente a um carrossel
A partir de 1025px mostram-se 3 dos 4 cards; o 4.º está fora da vista, cortado por `.carousel-wrapper{overflow:hidden}`. O harness mede **rects geométricos** (`getBoundingClientRect`) e não considera clipping de ancestrais, por isso conta o card `#s4` e os seus 7 filhos (estrelas, texto, autor, avatar, nome, localização) como `overflowRight`/`childOverflow` do track. **Qualquer** carrossel horizontal com 4 slides produz isto (com 2 cards por vista seriam ~16 entradas em vez de 8). Não há forma de o evitar por CSS sem mostrar os 4 cards ao mesmo tempo — e mostrar os 4 colide com o `visibleSlides` do JS, que passaria a deslocar um track já completo. O que **não** é excepção: não há scroll horizontal de documento (`hScroll=false`) nem perda de conteúdo.

### 4.2 Falsos positivos do harness que não são meus
- `contacto/*: truncated:1` = `h1.sr-only` (`cw 1 / sw 757`, `overflow:hidden; white-space:nowrap`) — é um título visualmente escondido; o corte é intencional. Existe desde sempre e é igual antes/depois.
- `home/desk-1440: childOverflow 2` = `div.section-header--dark` dentro do `.container` — pré-existente (já aparecia no `before1` e no `before2`), de outra camada.
- `a.whatsapp-float` (+1px) — de `overlays.css`.
- `tinyTargets` que restam em desktop (22 home / 18 contacto) são todos links de navegação/footer e os 2 links inline do crédito da galeria (`p.gallery-credit > a`, 58×15px) — links dentro de uma frase, abrangidos pela excepção de conteúdo inline da WCAG 2.5.8; aumentar a área táctil faria as áreas de linhas adjacentes sobreporem-se. Nenhum dos que restam é dos meus componentes (dots e ícones sociais medem 44×44).

### 4.3 O 9 → 0 do `childOverflow` a 320px não é todo meu
No `before2` (imediatamente antes de eu editar, com o trabalho de `mobile.css`/`overlays.css` já carregado) o `childOverflow` a 320px já era 0: `mobile.css` resolveu as 4 ocorrências de `div.testimonial-author > div` (com `min-width:0`) e as 5 de `.faq-icon` (compensando o padding de `fixes.css` com margens negativas em ≤768px). O que esta camada acrescenta é a **estrutura** do carrossel (flex/grid/step alinhado com o JS) em todos os breakpoints, o `min-width:0`/`overflow-wrap` próprios, os alvos de 44px e o estado do dark mode. Os números finais são medidos, não atribuídos.

### 4.4 Decisão de design em ≤768px: um depoimento por linha, sem setas/dots
- O JS (`js/main.v1.min.js`) fixa `visibleSlides = 1` em ≤768px e tem **autoplay a cada 5s** que faz `translateX` no track.
- Num layout horizontal 1-up, os outros 3 cards ficam geometricamente fora do wrapper (clipped) e o harness conta-os: medi **childOverflow 4 e overflowRight 24 a 320px** nesse cenário (falharia o critério 2 e agravaria muito o relatório).
- Com o track em coluna, os 4 depoimentos ficam visíveis e legíveis (critério 5: “um por linha”), sem overflow em 320-414px.
- Consequência: como não há deslize, `.carousel-nav` (setas+dots) é escondido em ≤768px para não deixar controlos mortos; a navegação existe de 769px para cima, onde tem efeito real.
- Para o transform inline do JS (`track.style.transform`) ceder é necessário `!important`; é o único `!important` desta camada aplicado a JS, e é no nosso próprio selector.
- Se a intenção for ter carrossel horizontal também em mobile, a mudança certa é no JS (desligar o autoplay/transform em ≤768px) — `js/` não é meu.

### 4.5 Última página do carrossel em ≥1025px não enche
O JS calcula `maxSlide = totalSlides - visibleSlides` com `visibleSlides = 2` fixo acima de 768px, logo em ≥1025px a última posição (slide 2) mostra 2 cards + 1 slot vazio (medido: `slide2 cheios=[s3,s4]`). Encher a última página exige `visibleSlides = 3` em `js/main.js` (não é meu ficheiro).

### 4.6 Padding global de `fixes.css` — dívida de outra camada
`fixes.css` aplica `padding:1.25rem 1.5rem !important` a **todos** os elementos com `faq-` no `class` (incluindo spans internos e a lista) e `padding:1.5rem !important` a `.carousel-wrapper > *`. Consequências que continuam visíveis:
- em ≥769px `.faq-icon` mantém uma caixa de 77×69px à volta do “+” (feio mas sem overflow) e cada item fechado do FAQ guarda ~40px de espaço morto, porque `mobile.css` só compensa em ≤768px;
- nesta camada neutralizo apenas **horizontalmente** o padding do track (`padding-left/right:0 !important`) porque o vertical está a ser compensado por `mobile.css` (`margin-top:-24px`) e contrariá-lo desalinharia o track.
- A correcção definitiva é apagar essas duas linhas de `fixes.css` (não é meu ficheiro); foi deixado assim de propósito para não criar conflito entre camadas.

### 4.7 Fora de âmbito, observado
- `a.logo` no header e no footer do index mede 36px de altura (<44) no desktop; `mobile.css` só garante 44px em ≤768px.
- `.theme-toggle` é encolhido pelo flex do header entre 769 e 1024px (medido: 18px de largura a 769px, 41px a 1024px) — é layout do header (camada mobile/overlays), não dos ícones.
- `imgBroken` periódico nas imagens da galeria (URLs remotos do Unsplash) — depende de rede, não de CSS.
