# Relatório — elementos `position:fixed` a taparem conteúdo (Trio Elétrico)

**Âmbito:** exclusivamente `css/overlays.css` (camada própria, carregada depois de `components.css`).
Nada de HTML, JS, outras folhas ou scripts de auditoria foi alterado.
Ficheiro final: 177 linhas, **0 `!important`** em declarações (só aparece em comentários), variáveis em `:root`, bloco `prefers-reduced-motion`.

**Como reproduzir**

```bash
cd ~/.hermes/profiles/coder/workspace/trio-eletrico
AUDIT_TAG=overlays node audit/audit.mjs http://localhost:3000          # harness (24 -> 0 overlapsHeader)
node audit/verify-overlays.mjs http://localhost:3000                   # script próprio -> audit/overlays-verify.json
VERIFY_DISABLE_OVERLAYS=1 node audit/verify-overlays.mjs http://localhost:3000 audit/overlays-verify-baseline-sheetoff.json   # A/B com overlays.css desligado
node audit/compare-overlays.mjs                                        # tabelas antes/depois
```

---

## 1. Problema → causa → correcção

| # | Problema medido (antes) | Causa (medida) | Fix em `css/overlays.css` (selectores) |
|---|---|---|---|
| 1 | **Header fixo tapa conteúdo (CRIT)** — destinos de âncora aterram a `top=0px`, ou seja debaixo do header: **64 / 76** saltos (home: 8/8 em todos os viewports). Na página contacto a 768px o `h2` nasce a `y=24` e `y=45` (dentro da banda 0–60 do header). No harness: `overlapsHeader` = 6 no topo da página, 24 no total. | `.header{position:fixed;top:0;height:60px;z-index:1000}` (style.v1.min.css) **sem qualquer compensação**: não existia `scroll-margin-top`/`scroll-padding`, e `main` começava a `y=0` (o conteúdo nascia colado ao topo). O `smooth` em `html` obrigava ainda a atravessar a zona do header em cada salto. | `:root{--header-h:60px;--header-gap:12px}` · `[id]{scroll-margin-top:calc(var(--header-h) + var(--header-gap))}` · `main{padding-top:var(--header-h)}` · `main > .hero:first-child{margin-top:calc(-1 * var(--header-h))}` (home fica pixel-igual: o hero já tinha compensação própria) · `html{scroll-behavior:auto}` (o JS do site já faz `scrollTo(...,{behavior:'smooth'})` nos cliques, logo a animação mantém-se para o utilizador) · `.header{z-index:var(--z-header)}` |
| 2 | **Barra amarela `.sticky-cta-mobile` tapa conteúdo (CRIT)** — 61–69 elementos-estado bloqueados (≥50% da área) pela barra, incluindo o 5º card do FAQ, cards de depoimentos e controlos do formulário após saltos de âncora: 20–21 controlos interativos tapados em aterragens. Sem reserva no fim do documento e sem `env(safe-area-inset-bottom)`. | `.sticky-cta-mobile{position:fixed;bottom:0;left:0;right:0;z-index:998;padding:14px 20px}` — nenhuma camada reservava a altura da barra no fim da página nem respeitava a safe-area do iPhone. | `.sticky-cta-mobile{z-index:var(--z-cta);padding-bottom:calc(14px + var(--safe-bottom));white-space:nowrap;line-height:1.2}` · `@media (max-width:768px){ footer > .container{ padding-bottom: calc(var(--cta-h) + var(--overlay-gap) + var(--safe-bottom)) } }` (`--cta-h:58px`; reserva **dentro** do rodapé escuro para não criar faixa clara) |
| 3 | **WhatsApp (HIGH)** — a bolha e a barra de CTA **colidiam em 84 pares** (11 por viewport mobile × estado; a bolha ficava por cima da barra, com z-index superior: 999 > 998). A bolha tapava conteúdo em 7 elementos-estado. O `tooltip` (220px, `white-space:nowrap`, `right:72px`) cabia por **4px** a 320px — ficava dentro do viewport, mas sem folga nenhuma sobre os campos do formulário. | `.whatsapp-wrapper{position:fixed;bottom:24px;right:24px;z-index:999}` + `fixes.css` com `.whatsapp-wrapper{bottom:24px!important;right:24px!important}` em ≤768px (o `!important` de outro ficheiro não é sobreponível sem `!important`) e `.whatsapp-tooltip{white-space:nowrap;right:72px}`. | `.whatsapp-wrapper{z-index:var(--z-whatsapp)}` · `@media (max-width:768px){ .whatsapp-wrapper{ margin-bottom: calc(var(--cta-h) + var(--overlay-gap)); margin-right: var(--safe-right) } }` (**margin** e não `bottom`, por causa do `!important` alheio — mesmo resultado de layout) · `.whatsapp-tooltip{max-width:min(70vw,240px);white-space:normal;overflow-wrap:break-word;text-align:center;line-height:1.35}` · `@media (max-width:480px){ .whatsapp-tooltip{ right:0; bottom:calc(100% + 12px); top:auto; transform:none; max-width:calc(100vw - 3*var(--overlay-gap)); animation:none } .whatsapp-tooltip::after{ top:100%; right:26px; border-top-color:var(--color-primary) } }` (tooltip passa a ficar **acima** da bolha, seta virada para baixo) |
| 4 | **Stack z-index implícita** — `header 1000`, `whatsapp 999`, `sticky-cta 998`: o botão de WhatsApp ficava por cima da principal conversão do site. | valores soltos em três regras diferentes, sem relação declarada. | `:root{--z-whatsapp:1010; --z-cta:1020; --z-header:1030}` aplicados em `.whatsapp-wrapper`, `.sticky-cta-mobile`, `.header` (header > CTA > WhatsApp; o `.skip-link` a 10000 continua no topo) |

### Geometria final medida (viewport 375×667, scroll 0)

| elemento | rect | z-index |
|---|---|---|
| `header.header` | `0,0 375×60` | 1030 |
| `.whatsapp-wrapper` | `299,517 52×52` (erguido 74px por `margin-bottom`) | 1010 |
| `.sticky-cta-mobile` | `0,610 375×57` | 1020 |

Folga entre a bolha e a barra: **41px**. `scroll-margin-top` de âncoras: **72px**. Reserva no rodapé: **74px**.
Numa página sem safe-area o `padding-bottom` da barra mantém-se 14px; em iPhone passa a `14px + env(safe-area-inset-bottom)`.

---

## 2. Tabela antes → depois (números reais)

### 2.1 Harness `audit/audit.mjs` — `AUDIT_TAG=overlays-before` → `AUDIT_TAG=overlays`

| página | viewport | overlapsHeader | hScroll | overflowRight | childOverflow | tinyTargets | classesNoRule | imgsBroken |
|---|---|---|---|---|---|---|---|---|
| home | mob-320 | 0 → **0** | não | 1 → 0 | 9 → 0 | 10 → 0 | 8 → 5 | 0 → 6 |
| contacto | mob-320 | 0 → **0** | não | 0 → 0 | 0 → 0 | 6 → 0 | 6 → 5 | 0 → 0 |
| home | mob-360 | 1 → **0** | não | 0 → 0 | 4 → 0 | 10 → 0 | 8 → 5 | 0 → 6 |
| contacto | mob-360 | 2 → **0** | não | 0 → 0 | 0 → 0 | 6 → 0 | 6 → 5 | 0 → 0 |
| home | mob-375 | 0 → **0** | não | 0 → 0 | 2 → 0 | 10 → 0 | 8 → 5 | 0 → 6 |
| contacto | mob-375 | 2 → **0** | não | 0 → 0 | 0 → 0 | 6 → 0 | 6 → 5 | 0 → 0 |
| home | mob-390 | 1 → **0** | não | 0 → 0 | 1 → 0 | 10 → 0 | 8 → 5 | 0 → 6 |
| contacto | mob-390 | 2 → **0** | não | 0 → 0 | 0 → 0 | 6 → 0 | 6 → 5 | 0 → 0 |
| home | mob-414 | 1 → **0** | não | 0 → 0 | 0 → 0 | 10 → 0 | 8 → 5 | 0 → 6 |
| contacto | mob-414 | 2 → **0** | não | 0 → 0 | 0 → 0 | 6 → 0 | 6 → 5 | 0 → 0 |
| home | tab-768 | 0 → **0** | não | 0 → 0 | 0 → 0 | 18 → 0 | 8 → 5 | 0 → 4 |
| contacto | tab-768 | 5 → **0** | não | 0 → 0 | 0 → 0 | 13 → 0 | 6 → 5 | 0 → 0 |
| home | desk-1280 | 4 → **0** | não | 0 → 0 | 0 → 0 | 26 → 26 | 8 → 5 | 0 → 6 |
| contacto | desk-1280 | 2 → **0** | não | 0 → 0 | 0 → 0 | 21 → 21 | 6 → 5 | 0 → 0 |
| home | desk-1440 | 0 → **0** | não | 0 → 0 | 2 → 2 | 26 → 26 | 8 → 5 | 0 → 6 |
| contacto | desk-1440 | 2 → **0** | não | 0 → 0 | 0 → 0 | 21 → 21 | 6 → 5 | 0 → 0 |

**Totais (16 combinações):** `overlapsHeader` **24 → 0** · `hScroll` **0 → 0** · `overflowRight` **1 → 0**.
`tinyTargets` (205 → 94), `childOverflow` (18 → 2) e `classesNoRule` (112 → 80) **não são obra desta camada** — vêm do `mobile.css` do agente responsável pelos alvos tácteis, que foi editado em paralelo (às 03:55) durante esta medição. `imgsBroken` 0 → 46 é efeito colateral explicado no ponto 4.

### 2.2 Script próprio `audit/verify-overlays.mjs`

Três medições do mesmo site (320/360/375/390/414/768/1280/1440 × home/contacto × estados: topo, 9 âncoras por clique(`location.hash`), clique real no CTA, fundo, hover no WhatsApp = **124 estados por run**):

* **antes** — `overlays.css` ainda vazio (03:48–03:55, outras camadas a meio de edição);
* **A/B: sheet OFF** — site actual com `css/overlays.css` desligado na página (controla o efeito das edições paralelas);
* **depois: sheet ON** — site actual com a minha camada ligada.

| métrica | antes | A/B sheet OFF | depois sheet ON |
|---|---|---|---|
| elementos bloqueados (≥50% da área) — header | 49 | 50 | 79 † |
| elementos bloqueados — barra de CTA | 69 | 63 | 61 |
| elementos bloqueados — WhatsApp/tooltip | 7 | 7 | **0** |
| bloqueados no topo da página — **por header** | 6 | 6 | **0** |
| bloqueados no topo da página — por barra CTA | 11 | 9 | 7 |
| **destinos de âncora sob o header** | 64 / 76 | 64 / 76 | **0 / 76** |
| **colisões overlay↔overlay (bolha vs barra)** | 84 | 84 | **0** |
| controlos interativos tapados pela barra no fundo da página | 0 | 0 | **0** |
| controlos interativos tapados pela barra em aterragens | 21 | 20 | 16 |
| estados em que o CTA não recebe o clique | 0 | 0 | **0** |
| tooltip fora do viewport (sob hover) | 0 | 0 | **0** |
| interseções geométricas brutas — topo da página | 30 | 33 | **22** |
| interseções geométricas brutas — fundo da página | 29 | 33 | 33 |
| bloqueios por overlay no fundo da página | — | `{header:23}` | `{header:20}` |
| bloqueios por overlay em aterragens de âncora | — | `{cta:45, header:15, whatsapp:5}` | `{cta:47, header:59}` † |

† O aumento de `header` (50 → 79) é **artefacto de medição, não regressão de usabilidade**: ao aterrar 72px mais baixo, a faixa que sobe para debaixo do header passa a ser o *fim da secção anterior* (ex.: em home-375, no salto `#faq` são os pontos do carrossel de depoimentos a `y=4`, e no `#contacto` um parágrafo a `y=-146`); antes, esse conteúdo estava simplesmente acima do viewport e não era contado. O destino da âncora fica sempre visível.

### 2.3 Critério 4 — home-375 (título da secção e CTA legíveis, medido por rects)

| estado | destino | top do destino | header bottom | tapado pelo header? | CTA clicável |
|---|---|---|---|---|---|
| `top` | — | — | 60 | não (0 bloqueados) | sim |
| âncora `#faq` | `#faq` | **72** | 60 | não | sim |
| âncora `#contacto` | `#contacto` | **72** | 60 | não | sim |
| clique real no CTA (`scrollTo` do JS) | `#contacto` | **60** | 60 | não | sim |
| `bottom` | — | — | 60 | 0 bloqueados pela barra/WhatsApp | sim |

O clique no CTA (caminho do JS do site, que não posso editar) aterra o alvo exactamente no bordo inferior do header (`top=60`, sem a folga de 12px das âncoras nativas) — continua abaixo do header, logo legível.

---

## 3. Output real do script de verificação (estado final)

```
== REGRAS ==
  R1_nadaBloqueadoPeloHeaderNoTopo: PASS
  R2_destinosDeAncoraAbaixoDoHeader: PASS
  R3_semColisaoEntreOverlays: PASS
  R4_ctaSempreClicavel: PASS
  R5_tooltipDentroDoViewport: PASS
  R6_semControlosTapadosPelaBarraNoFundoDaPagina: PASS
  R7_informativo_interseccoesBrutasNoTopo: 22
  R8_informativo_interseccoesBrutasNoFundo: 33
  R9_informativo_bloqueadosPorOverlay: { "cta": 61, "header": 79 }
```

Regras de aceitação do `compare-overlays.mjs` (estado final): **8/8 PASS** — `overlapsHeader=0`, `blockedByHeaderAtTop=0`, `0/76` âncoras sob o header, `overlayVsOverlay=0`, `n=0` controlos tapados pela barra no fundo, `falhas=0` de clique no CTA, `fora=0` tooltips, `hScroll=0`/`overflowRight=0`.

---

## 4. O que fica por fazer / limitações (explícito)

1. **Interseções brutas não são 0 — e não podem ser por CSS.** No topo da página restam **22** interseções geométricas (antes 30), todas na `contacto.html`: a barra de CTA e a bolha de WhatsApp sobre os campos do formulário que caem **na dobra** do viewport (ex.: `label "Nome Completo"` a `y=632`, `input#telefone` a `y=817`). Uma barra fixa no fundo do ecrã cobre sempre a faixa inferior do viewport; o conteúdo continua acessível por scroll e, no fim do documento, **nada** fica tapado (regra 6). Esconder a barra deixaria de cumprir o requisito de manter a conversão sempre visível.
2. **Header sobre conteúdo já scrollado:** 20 bloqueios no fundo da página e 59 em aterragens — são links do rodapé/restos da secção anterior que passam sob o header no scroll máximo (inerente a qualquer header fixo opaco; o harness mede isto apenas a `scrollY=0`, onde é 0).
3. **`imgsBroken` 0 → 46 no harness é efeito colateral do `scroll-behavior:auto`**, não imagens partidas. Provas: as 6 imagens por viewport são `<img loading="lazy">` da galeria, os URLs respondem `200` (`curl` a `images.unsplash.com/... = 200`) e `node audit/diag-lazyimg.mjs` mostra: salto instantâneo → 6 sem carregar; scroll progressivo → 0; scroll suave → 0. Com `smooth`, o harness media a meio da animação (`scrollY=7516` em home-375, ver `audit/diag-scroll.mjs`) e reportava 24 `overlapsHeader` fantasma. Escolhi a medição determinística; se preferires manter `html{scroll-behavior:smooth}`, basta remover essa regra de `css/overlays.css` e voltar a aceitar o ruído do harness (não recomendo).
4. **Não posso corrigir mais nada sem tocar noutros ficheiros:** o `!important` de `fixes.css` (`.whatsapp-wrapper{bottom:...}` e `.hero{padding-top:...}`) obriga a usar `margin` em vez de `bottom`; e o salto do CTA por JS aterra a 60px (0px de folga) porque o cálculo `getBoundingClientRect().top + scrollY - headerHeight` está em `js/main.v1.min.js` (fora do meu âmbito) — a solução ideal seria subtrair também a folga. Também não alterei o `--cta-h` para menos de 58px, que é a altura real medida da barra (54–57px).
5. **Concorrência:** `css/mobile.css` foi editado às 03:55 (durante a minha medição "antes") pelo agente responsável por alvos tácteis/espaçamento; por isso reporto o A/B isolado (sheet OFF vs ON) além da comparação temporal. `audit/mobile.css`-related metrics (`tinyTargets`, `childOverflow`, `classesNoRule`) são desse agente, não desta camada.
6. **Não fiz `git commit`** nem toquei em HTML, JS, outras folhas ou nos scripts de auditoria (apenas criei scripts próprios em `audit/`: `verify-overlays.mjs`, `compare-overlays.mjs`, `sanity-overlays.mjs`, `sanity-toggle.mjs`, `diag-scroll.mjs`, `diag-lazyimg.mjs`).

### Artefactos

| ficheiro | conteúdo |
|---|---|
| `css/overlays.css` | a correcção (177 linhas, 0 `!important`) |
| `audit/audit-report-overlays-before.json` / `-overlays.json` | harness, antes/depois |
| `audit/overlays-verify-before.json` | script próprio, antes (temporal) |
| `audit/overlays-verify-baseline-sheetoff.json` | A/B com a minha camada desligada |
| `audit/overlays-verify.json` | **estado final** |
| `audit/compare-overlays.md` | tabelas antes/depois geradas |
| `audit/screens-overlays-before/`, `audit/screens-overlays/` | screenshots full-page do harness |
