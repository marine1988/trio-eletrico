# Relatório — camada `css/mobile.css` (Trio Elétrico)

Tarefa: afinar mobile + acessibilidade táctil editando **apenas** `css/mobile.css`
(camada carregada por último). Nada de HTML/JS/outras folhas, sem `!important`,
sem commit.

Ficheiro alterado: `css/mobile.css` (0 → 17.976 bytes, 6 blocos `@media`).
Artefactos de auditoria: `audit/audit-report-mobile-before.json` (baseline),
`audit/audit-report-mobile.json` (estado final), ecrãs em `audit/screens-mobile-before/`
e `audit/screens-mobile/`.

---

## 1. Como foi medido (reprodução)

```bash
cd /home/roger/.hermes/profiles/coder/workspace/trio-eletrico
python3 -m http.server 3000 &                 # se ainda não estiver a correr

# baseline (antes de tocar em mobile.css)
AUDIT_TAG=mobile-before node audit/audit.mjs http://localhost:3000 > /tmp/before.txt

# estado final
AUDIT_TAG=mobile node audit/audit.mjs http://localhost:3000 > /tmp/after.txt
```

Além do harness, usei uma medição **A/B na mesma página** (liga/desliga só o
`mobile.css` via `link.disabled = true` e mede com o mesmo scroll, fontes e
imagens) para atribuir com rigor cada diferença à minha camada. Script completo
no fim deste relatório (§8).

---

## 2. Nota sobre a linha de base (17.498 px)

O briefing indicava ~17.498 px de altura da home a 375 px. Esse valor **já não é
reproduzível**: vem de `audit/audit-report-BEFORE.json` (03:39), medido antes de
`index.html`/`contacto.html` passarem a carregar `css/style.v1.min.css` (a base
real, 50 KB) — o diff mostra as 7/11 linhas adicionadas de `<link>` nas duas
páginas (ver `git diff HEAD -- index.html contacto.html`). Com o mesmo harness e
os mesmos ficheiros que estão agora no disco, a linha de base é:

| | home 375 | home 320 | home 768 |
|---|---|---|---|
| `audit-report-BEFORE.json` (obsoleto) | 17.498 | 18.390 | 12.012 |
| `audit-report-mobile-before.json` (usado aqui) | **19.862** | **20.919** | **13.253** |

Ou seja, o critério "≤13.000 px a 375 px" foi avaliado contra os 19.862 px
efectivamente medidos (−36,4 %), e não contra os 17.498 px do briefing (−25 %).

---

## 3. Problemas → causa → correcção

| # | Problema (medido) | Causa | Correção (selectores em `mobile.css`, ≤768 px salvo indicação) |
|---|---|---|---|
| 1 | **Tap targets < 44 px** na home 375: `a.logo` 165×36 (header), `a.logo` 327×36 (footer), `button.testimonials-dot` 12×12 ×3 e `.active` 36×12, `p.gallery-credit > a` 58×15 / 81×15, `footer .footer-contact a` 120×42 e 134×21. Contacto 375: `a.logo` 165×36, 2 links de rodapé 21 px, `div.social-icons > a` 327×24 ×3. A 768 faltavam ainda 9 `.footer-links a` a 17 px | a base só garante 44 px em `≤480`; links inline e ícones não têm caixa táctil | `.header .logo, .footer-brand .logo{min-height:44px}` · `.footer-links a, .footer-contact a{display:flex;align-items:center;min-height:44px}` · `.social-icons{display:flex;flex-wrap:wrap;gap:8px} .social-icons a{inline-flex;44×44}` · `.gallery-credit a{display:inline;padding:15px 0}` (padding vertical em inline não altera o layout, só a área de toque) · `.testimonials-dot{width:44px;height:44px;…}` com o ponto desenhado em `::before` (12 px / 36×12 activo) para não mudar o visual · `.nav-toggle,.theme-toggle{min-width:44px;min-height:44px}` |
| 2 | **Alturas excessivas**: home 375 = 19.862 px (#sobre 3.170, #servicos 2.396, #contacto 2.344, #porquenos 2.286, #depoimentos 2.563, FAQ 1.822, galeria 1.863) | `fixes.css` impõe `section{padding:5rem 0!important}` (160 px por secção), grelhas de 1 coluna com cartões grandes, imagens a 240–285 px, tipografia com entrelinha 1.6–1.75 | compensação do padding bloqueado por margens negativas no `.container` (`main > section:not(.hero) > .container{margin:-60px 0}`, o padding continua lá, só colapsa); `.section-header + *{margin-top:-28px}` (o `margin-bottom:3rem!important` do `fixes.css` não é reescrevível); cartões de serviço/vantagem com ícone+número na mesma linha do título (`display:grid; grid-template-columns:auto minmax(0,1fr)`); galeria em 2 colunas com `aspect-ratio:3/2`; hero-image 240→140 (110 em ≤480); team-banner 200→100; fotos dos sócios 285→150 (132 em ≤480); áreas SVG 297→180/140; `line-height:1.5` nos blocos de texto; gaps/margens de cartões e listas reduzidos |
| 3 | **Formulário**: labels a 6 px do campo; controlos sem garantia de ≥16 px (a base só os estiliza dentro de `.form-group`; botões sem estilo herdam 13,33 px do UA) | `label{margin-bottom:6px}`, `font-size` ausente em controlos fora de `.form-group` | `label{font-size:14px;line-height:1.35;margin-bottom:10px}` · `input,select,textarea,button,.btn{font-size:16px}` (evita o zoom automático do iOS) · `.form-group{margin-bottom:8px}` · `input/select{min-height:44px;padding:10px 14px}` · `textarea{min-height:84px;padding:10px 14px}` |
| 4 | **Ícones/emblemas desproporcionados** | — | **Não reproduzido** (ver §7) — adicionei apenas uma guarda `max-width/max-height:100%` a `.contacto-icon svg, .trust-badge-icon svg, .urgency-badge svg, .service-icon-wrapper svg` para que um SVG sem `width/height` não volte a esticar |
| 5 | **Overflow a 320 px**: `#faq-question-5 > span.faq-icon` saía +2 px do viewport (também 9 `childOverflow` a 320) | o `#faq [class*="faq-"]{padding:1.25rem 1.5rem!important}` do `fixes.css` também apanha `.faq-question-text` e `.faq-icon`, a somar 48 px horizontais de padding dentro de um flex | `.faq-question-text{margin:-20px -24px;line-height:1.3}` e `.faq-icon{margin:-20px -24px}` (anula o padding !important sem o reescrever; o ícone alinha à borda útil do botão) · `.faq-answer{margin:-20px 0}` · `p,li,h1..h4,span,strong,a{overflow-wrap:break-word}` · `.testimonial-author > div{min-width:0}` |
| 6 | Extra, na mesma linha: FAQ inflamada (1.822 px) pelo mesmo `[class*="faq-"]`, depoimentos com cartões de 543 px de texto estreito, `.company-data` com 8 linhas a 23 px, `.hero-stats` a quebrar em 2 linhas | padding `!important` em três níveis (lista+item+pergunta); `gap:1.5rem!important` nos stats | `line-height`/`font-size` reduzidos (`.testimonial-text`, `.company-data > div`, `.faq-answer p`), `.faq-list{margin:-20px 0}`, `.hero-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}` (3 colunas fixas em vez de 2 linhas), `.carousel-track{margin-top:-24px}` |

Nunca usei `!important` (0 declarações; a palavra só aparece em comentários) nem
toquei noutro ficheiro. Todas as regras estão dentro de `@media` (768 / 480 /
481-768 / 1024 / `prefers-reduced-motion` / `hover:none`) e alinhadas com os
breakpoints do site.

---

## 4. Antes → depois (números reais do harness)

### 4.1 Altura do documento (`docHeight` px)

| página | viewport | antes | depois | delta | % |
|---|---|---|---|---|---|
| home | 320 | 20.919 | **13.652** | −7.267 | −34,7 % |
| home | 360 | 19.973 | **12.905** | −7.068 | −35,4 % |
| **home** | **375** | **19.862** | **12.626** | **−7.236** | **−36,4 %** |
| home | 390 | 19.439 | **12.291** | −7.148 | −36,8 % |
| home | 414 | 19.247 | **12.136** | −7.111 | −36,9 % |
| home | 768 | 13.253 | **9.458** | −3.795 | −28,6 % |
| home | 1280 | 11.203 | 10.613 | −590¹ | — |
| home | 1440 | 11.186 | 10.596 | −590¹ | — |
| contacto | 320 | 3.059 | 2.688 | −371 | −12,1 % |
| contacto | 360 | 2.926 | 2.625 | −301 | −10,3 % |
| contacto | 375 | 2.904 | 2.549 | −355 | −12,2 % |
| contacto | 390 | 2.883 | 2.549 | −334 | −11,6 % |
| contacto | 414 | 2.883 | 2.479 | −404 | −14,0 % |
| contacto | 768 | 1.784 | 1.813 | +29² | — |
| contacto | 1280 | 1.796 | 1.583 | −213¹ | — |
| contacto | 1440 | 1.796 | 1.583 | −213¹ | — |

¹ valores de desktop medidos no build combinado (incluem as camadas `components.css`/`overlays.css`,
publicadas durante o trabalho); a contribuição **da minha camada** em desktop é 0 (§6).
² +29 px na página contacto a 768 px: os 7 links do rodapé passam de 17 px para 44 px de altura útil
(exigência do critério 1). É o único sítio onde a altura subiu — é o custo directo dos tap targets.

### 4.2 Contribuição isolada da camada (A/B, mesmo estado de página)

| página | viewport | sem `mobile.css` | com `mobile.css` | delta da camada |
|---|---|---|---|---|
| home | 375 | 19.858 | **12.626** | −7.232 |
| home | 320 | 24.046 | **13.652** | −10.394 |
| home | 768 | 13.194 | **9.458** | −3.736 |
| home | 1280 | 10.613 | 10.613 | **0** |
| home | 1440 | 10.596 | 10.596 | **0** |
| contacto | 375 | 3.133 | 2.549 | −584 |
| contacto | 320 | 3.288 | 2.688 | −600 |
| contacto | 768 | 2.013 | 1.813 | −200 |
| contacto | 1440 | 1.583 | 1.583 | **0** |

Alturas por secção (só a minha camada, home 375):

| secção | antes | depois |
|---|---|---|
| hero | 1.456 | 1.065 |
| sobre | 3.170 | 2.079 |
| serviços | 2.396 | 1.549 |
| áreas | 949 | 607 |
| galeria | 1.863 | 650 |
| porquê-nós | 2.286 | 1.505 |
| depoimentos | 2.028 | 1.323 |
| FAQ | 2.279 | 998 |
| contacto | 2.344 | 1.841 |
| footer | 1.006 | 928 |

### 4.3 Alvos tácteis (contagem de `<a>`/`<button>` < 44 px)

| página | 320 | 360 | 375 | 390 | 414 | 768 |
|---|---|---|---|---|---|---|
| home antes | 10 | 10 | 10 | 10 | 10 | 18 |
| home depois | **0** | **0** | **0** | **0** | **0** | **0** |
| contacto antes | 6 | 6 | 6 | 6 | 6 | 13 |
| contacto depois | **0** | **0** | **0** | **0** | **0** | **0** |

Dimensões medidas depois (375 px): `a.logo` header 165×44, `a.logo` footer 343×44,
`footer .footer-contact a` 120×44 e 134×44, `.footer-links a` 152×44,
`social-icons a` 44×44 ×3, `.nav-toggle`/`.theme-toggle` 44×44,
`p.gallery-credit > a` 62×45 e 85×45. (Os `button.testimonials-dot` passaram de
12×12/36×12 para caixa 44×44; a camada `components.css` esconde-os em ≤768, pelo
que a regra só produz efeito se voltarem a ser visíveis.)

### 4.4 Overflow / truncagem / formulários

| indicador | antes | depois |
|---|---|---|
| `overflowRight` (6 viewports mobile × 2 páginas) | 1 (home 320) | **0 / 0** |
| `hScroll` (8 viewports × 2 páginas) | false | **false** |
| `childOverflow` mobile (home 320/360/375/390/414/768) | 9/4/2/1/0/0 | **0/0/0/0/0/0** |
| `truncated` home (todas as viewports) | 2 (a 320) | **0** |
| `truncated` contacto | 1 | 1 → **`h1.sr-only`** (falso positivo previsto no critério 2) |
| `font-size` de campos de formulário (ambas as páginas) | 16 px (inputs) / 13,33 px em botões sem estilo | **16 px em `input`, `select`, `textarea`, `button`** |
| distância label→campo | 6 px | 10 px |
| altura útil de input / textarea | 48 / 120 px | 44 / 84 px |

---

## 5. Critérios de aceitação

1. **`tinyTargets = []` em 320/360/375/390/414/768 nas duas páginas** — ✅ cumprido
   (0 em 12 medições; ver 4.3). Não foi preciso invocar a excepção de "links de
   texto legal": os créditos da galeria (`p.gallery-credit a`) também ficaram com
   45 px de altura.
2. **`truncated = 0` em todas as viewports/páginas excepto `.sr-only`** — ✅ cumprido
   (home: 0 em todas; contacto: apenas `h1.sr-only`, o falso positivo explicitamente
   permitido).
3. **`overflowRight` e `hScroll` = 0 em 8 viewports × 2 páginas** — ⚠️ **parcial**:
   ✅ 0 em 320/360/375/390/414/768 nas duas páginas e `hScroll = false` nas 8;
   ❌ desktop home 1280 = 8 e 1440 = 7 elementos à direita do viewport.
   **Atribuição:** esses 8/7 são `div#s4.testimonial-card` e descendentes (os
   cartões fora do slide do carrossel), vêm da camada `components.css` (carrossel
   horizontal), **não da minha**. Prova: no A/B com o `mobile.css` desligado o
   número é exactamente o mesmo (8/7), e a minha camada não altera uma única
   rect em desktop. Na baseline (antes do `components.css` existir) eram 0.
4. **`docHeight` da home a 375 px ≤ 13.000** — ✅ cumprido: **12.626 px**
   (antes 19.862; −36,4 %), com 374 px de margem.
5. **Desktop 1440 sem overflow e sem alterações visíveis** — ✅ cumprido **para a
   minha camada**: A/B com/sem `mobile.css` dá o mesmo `docHeight` (10.596 home,
   1.583 contacto), as mesmas alturas/larguras de secção (0 secção alterada) e a
   mesma contagem de `tinyTargets` (26→26 home / 21→21 contacto na comparação
   isolada). No build combinado o desktop mudou −590 px e ganhou os 7/8
   `overflowRight`, mas a A/B mostra que isso vem das outras duas camadas, que
   foram publicadas depois da minha baseline.

---

## 6. Integridade de desktop (detalhe da medição A/B)

```
### home @1440  [mobile.css OFF / ON]
  docH      10596 -> 10596   delta 0
  sections changed by my layer: none
  tinyA off=22 on=22 | overflowRight off=7 on=7 | hScroll false/false
### contacto @1440
  docH      1583 -> 1583     delta 0
  sections changed by my layer: none
### home @1280
  docH      10613 -> 10613   delta 0     | sections changed: none
```

Os `overflowRight` de desktop aparecem iguais nas duas medições → não vêm de
`mobile.css`.

---

## 7. O que ficou por fazer / não reproduzido / fora de âmbito

* **Ícones "desproporcionados" (ponto 4 do briefing) — não reproduzido.**
  Medido na página de contacto: o SVG do relógio (`.urgency-badge svg`) tem
  **16×16 px** dentro de um badge de 264 px (6 % da largura útil);
  `.contacto-icon` = 48×48 px com SVG 24×24; `.trust-badge-icon` = 40×40 px com
  SVG 22×22 e label a 14,4 px — tudo proporcionado. Deixei apenas a guarda
  `max-width:100%;max-height:100%` nesses SVGs para o caso de um SVG sem
  `width/height` no markup (foi esse o modelo que poderia esticar). Não toquei no
  markup (não é minha camada).
* **`input` a 13,33 px (ponto 3 do briefing) — parcialmente refutado.** Todos os
  `input/select/textarea` das duas páginas já mediam 16 px na baseline (a regra
  `.form-group input{font-size:1rem}` aplica-se). Os 13,33 px eram `button` sem
  estilo (`nav-toggle`, `theme-toggle`, `testimonials-dot`), que não têm texto.
  Ainda assim fixei `font-size:16px` em `input,select,textarea,button,.btn` para
  garantir o requisito em qualquer markup futuro.
* **Valor hardcoded no campo telefone** — não é desta camada (é de outro cartão);
  não foi tocado.
* **`.sr-only`** — o `h1.sr-only` da página de contacto é marcado como
  `truncated` (757 px de conteúdo numa caixa de 1 px): falso positivo estrutural
  do harness, explicitamente permitido pelo critério 2. Não alterei a técnica.
* **`imgBroken: 6` na home mobile** (6 imagens da galeria, 4 a 768) — ruído de
  *lazy-load*: no A/B o número é igual com e sem a minha camada, e depois de
  `scrollIntoView` + 4 s de espera todas as imagens medem `naturalWidth 600×400
  complete=true`. Não é regressão.
* **`overflowLeft: 1`** em todas as viewports = `a.skip-link` (link de salto
  escondido fora do ecrã, 9999 px) — existe antes e depois; é intencional.
* **Desktop com `tinyTargets`**: 1280 = 22, 1440 = 18/22 (nav `li > a` a 33 px e
  17 px, créditos de galeria a 15 px, `a.logo` a 36 px). O briefing diz que não
  podem encolher mais nesta ronda e o critério 5 proíbe alterar o desktop — ficou
  como dívida de a11y documentada (seria resolúvel com `min-height:44px` também
  nos breakpoints de desktop, se se aceitar mexer no ritmo do desktop).
* **Camada `components.css` / `overlays.css`**: nada tocado. A minha camada é
  compatível com as regras que publicaram (o `components.css` até regista, no
  cabeçalho, que não contraria as minhas margens negativas). Observação de
  convivência: o carrossel de depoimentos em ≤768 continua em coluna (4 cartões
  de ~230 px), e o `mobile.css` apara-lhe o padding com o `transform:none!important`
  que a camada de componentes já aplica ao track — não há conflito.

---

## 8. Script A/B (atribuição por camada, fora do repo)

Guardado fora do repositório para não interferir com a auditoria partilhada
(usa o Playwright do projecto):

```js
// node ab.cjs   (mede com e sem css/mobile.css, no mesmo estado de página)
const { chromium } = require('<repo>/node_modules/playwright');
const measure = () => ({
  docH: document.documentElement.scrollHeight,
  hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  tiny: [...document.querySelectorAll('a,button')].filter((el) => {
    const cs = getComputedStyle(el); if (cs.display === 'none' || parseFloat(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && (r.width < 44 || r.height < 44);
  }).length,
  overflowRight: [...document.querySelectorAll('body *')].filter((el) => {
    const cs = getComputedStyle(el); if (cs.display === 'none' || parseFloat(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 8 && r.right > document.documentElement.clientWidth + 1;
  }).length,
  sections: Object.fromEntries([...document.querySelectorAll('main > section, footer')].map((s) => [
    s.id || s.className.split(' ')[0], [Math.round(s.getBoundingClientRect().height), Math.round(s.getBoundingClientRect().width)]])),
});
// para cada (url, largura): goto, revelar .reveal, scroll até ao fundo, voltar a 0,
// medir (ON), depois desligar só o link do mobile.css e medir de novo (OFF)
```
