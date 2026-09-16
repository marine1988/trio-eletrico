# Trio Elétrico — Relatório final da ronda de correção (2026-09-15)

**Âmbito:** revisão completa do site (mobile + tablet + desktop), correção dos bugs visuais e criação de um gate de QA que os apanhe no futuro.
**Estado:** ✅ **Publicado em produção com auto-deploy ligado ao Git** — https://trio-eletrico.vercel.app · cada `git push` para `master` publica automaticamente · suite verde (`npm run test` → 70 passed, 1 skipped, 0 failed, duas corridas) · gate contra produção **39/39**.
**Commits:** `ad9748e` (correções) · `4e352da` (vercel.json) · `9c2490b`, `85a10ec` (docs) · `078aca6` (versionar os `.v1.min`) · `d3fb8e9` (fechar a auditoria no deploy) · `6458fcd` (teste do auto-deploy) · `baa1fca` (scripts duplicados do contacto).

---

## Ronda 2 — integração com o Git (o que apareceu depois de publicar)

| # | Achado | Gravidade | Correção |
|---|---|---|---|
| 1 | **A auditoria estava pública:** `/audit/reports/FINAL.md` e `/playwright.config.js` respondiam HTTP 200 na internet (o CLI sobe o sistema de ficheiros local e a pasta `audit/` não estava excluída) | Alta (exposição de notas internas) | `.vercelignore` a excluir auditoria, testes, scripts, fontes não servidas e configs de dev; redeploy + verificado a 404 |
| 2 | **O build a partir do Git sairia sem o CSS principal:** `css/style.v1.min.css` (50 KB) e `js/main.v1.min.js` estavam no `.gitignore` e **não existiam no repositório** — exatamente a regressão que deixou o contacto sem estilos | Crítica (bloqueava a ligação ao Git) | Pre-flight a comparar os recursos pedidos pelas páginas com `git ls-files` (faltavam só 2 de 15); re-incluídos explicitamente no `.gitignore` e versionados |
| 3 | **`contacto.html` tinha 5 tags de script:** `main.min.js` (versão de Jun 2026, excluída do deploy → **404 em produção**) + `js/main.v1.min.js` repetido **4×** — o JS corria 5 vezes (listeners/observers/autoplay duplicados) e, em produção, a página ficava **sem JS** | Alta | Uma única referência; verificado: 1 pedido HTTP, 0 erros, dark mode a funcionar no contacto |
| 4 | **Nenhum destes 3 bugs era detetável localmente** (o ficheiro existia no disco, o servidor local servia-o) | — | O gate a correr **contra produção** (`PW_BASE=URL npm run test:mobile`) apanhou os dois últimos: 37/39 → 39/39 |

**Verificação do artefacto construído pelo Git** (não pelo CLI): md5 local == servido em `index.html`, `contacto.html`, `style.v1.min.css`, `style.min.css`, `fixes/components/overlays/mobile.css`, `main.v1.min.js` e `site.webmanifest`; internos a 404; headers de segurança aplicados; gate 39/39; auditoria de 14 viewports com 320-768 = OK nas duas páginas.

---

## 1. Causas-raiz encontradas (medidas, não supostas)

| # | Bug | Causa medida | Impacto |
|---|---|---|---|
| **P0** | `contacto.html` sem estilos | Carregava só `css/style.min.css` (**156 bytes, 1 regra**); nunca carregava `style.v1.min.css` (50 KB, 380 regras) | 33 classes sem regra, inputs com estilo default do browser, **scroll horizontal +32px em 8/8 viewports**, formulário com "quadrados brancos" e select cortado |
| **P0** | `css/fixes.css` inerte | Nunca esteve ligado a nenhuma página | Toda a ronda anterior de correções (hero, WhatsApp, galeria, spacing) estava morta |
| **HIGH** | 14 classes sem qualquer regra CSS | Carrossel de depoimentos (`carousel-wrapper/track/nav`), ícones sun/moon do dark-mode, `faq-question-text`, footer do contacto | Depoimentos comprimidos a **122px** com texto cortado; toggle com sol+lua sobrepostos; dots de 12×12px |
| **HIGH** | Elementos fixos tapavam conteúdo | Header 60px sem compensação; barra sticky de CTA sem reserva; WhatsApp a colidir com a barra em **84 pares**; tooltip fora do viewport | **64 de 76** âncoras aterravam debaixo do header; 38 elementos essenciais bloqueados |
| **HIGH** | Imagem 404 na galeria | URL Unsplash morta | Alt text visível + card vazio gigante |
| **HIGH** | Nav a transbordar em tablet retrato | A 769-820px o `.nav` mede **680px** e terminava 74px fora do container; `.theme-toggle` colapsava para **18×44px** (ícones `position:absolute` + `flex-shrink:1`); logótipo esmagado para 93px | Links cortados em iPad retrato |
| **MED** | Alvos abaixo do mínimo a11y | Links de footer/contactos com **17px** de altura em ≥769px | Falha WCAG 2.5.8 (AA) |

## 2. Correções aplicadas

**Wave 0 (raiz):** ligar `style.v1.min.css` + camadas em **ambas** as páginas; criar a arquitetura `fixes.css → components.css → overlays.css → mobile.css`; substituir a imagem 404 por uma foto verificada (eletricista a reparar quadro — alt text bate certo).

**Delegado a 3 sub-agents em paralelo (um ficheiro cada, zero colisões):**

| Camada | Correção | Números |
|---|---|---|
| `components.css` | Carrossel (flex no track, step alinhado com o JS, baselines 100/50/33.3%), estado do toggle por `[data-theme]` (a animação `forwards` do v1 sobrepunha sol+lua), `.faq-question-text`, respostas fechadas escondidas com `visibility`, footer do contacto | `classesNoRule` 14 → **0**; `childOverflow`@320 **9 → 0**; `truncated`@320 **2 → 0**; dots 12×12 → **44×44** |
| `overlays.css` | `--header-h` + `scroll-margin-top:72px` + `main{padding-top:60px}`; reserva de 74px no rodapé + `env(safe-area-inset-bottom)`; WhatsApp erguido 74px e tooltip acima da bolha em ≤480px; stack `header 1030 > CTA 1020 > WhatsApp 1010` | `overlapsHeader` **24 → 0**; âncoras sob o header **64/76 → 0/76**; colisões bolha↔barra **84 → 0** |
| `mobile.css` | Ritmo compacto, gutter 16px, tap targets 44px, inputs 16px, labels com respiro | altura da home @375 **17.498 → 12.626px (−28%)**; `tinyTargets` **10/6 → 0/0**; `overflowRight` **→ 0** |

**Correções minhas (verificação + buracos que o harness não apanhava):**
- **Tablet 769-1024:** nav passa a escalar com a largura (`clamp()`), logótipo não encolhe, toggle blindado a 44px. Medido: nav.right 843 → **753** (container 769), logótipo 93 → **165px**, `headerScrollWidth == clientWidth` em 769/800/820/850/900/1024 nas duas páginas.
- **Alvos ≥769px:** links de footer/contactos de 17px → **≥24px** (WCAG 2.5.8 AA), sem inflacionar o rodapé.
- **Matriz de auditoria:** adicionados 600/769/820/900/1024 (era a lacuna que escondia o bug do tablet).

## 3. Verificação (3 frentes independentes)

1. **Suite Playwright** — `npm run test`: **70 passed / 1 skipped / 0 failed**, duas corridas seguidas (determinística). Specs novos: `tests/mobile.spec.js` (12 viewports × 2 páginas: overflow, imagens 404, overlays, tap targets por tipo de ponteiro, inputs ≥16px, carrossel por teclado, dark mode com persistência) e `tests/stylesheets.spec.js` (regressão do P0: ambas as páginas carregam as 6 folhas e nenhuma classe fica sem regra).
2. **Harness estrutural** — `npm run audit` (14 viewports × 2 páginas): **320/360/375/390/414/600/768 = "OK" nas duas páginas** (única flag: `h1.sr-only` no contacto, falso positivo documentado).
3. **Estados reais de scroll** — `audit/verify-ux.mjs` (60 estados: topo, cada âncora, fim de página): **0 controlos interativos bloqueados**, **0 títulos debaixo do header**.
4. **Visual** — inspeção por secção a 320/375/768 + medição no fim de página (última linha do footer a **137px** acima da barra sticky, zero texto truncado).

## 4. Dívida técnica conhecida (não bloqueia)

| Item | Detalhe | Recomendação |
|---|---|---|
| `fixes.css` com **30 `!important`** | Obrigou a **36 margens negativas** em `mobile.css` para apertar secções; deixa o `.faq-icon` em 77×69px em ≥769px | Limpar `fixes.css` (substituir por melhor especificidade) e trocar os workarounds por padding real |
| `visibleSlides=2` fixo no `js/main.js` | No desktop o último slide mostra 2 de 3 cards | Ajustar o JS do carrossel |
| Carrossel horizontal em ≤768px | Fica empilhado a 1 por linha (um carrossel horizontal a 320px transbordava 24px) | Se quiser carrossel em mobile, mexer no JS |
| Alvos <44px em desktop | nav 33px, créditos 15px (cumprem o AA de 24px) | Opcional |
| Imagens hotlinkadas do Unsplash | 11 URLs externas (rate limit / rede) | Baixar para `assets/images/` |

## 5. Bloqueadores de publicação

1. **Domínio:** `canonical`, `og:url` e JSON-LD apontam para `https://trioeletrico.pt` — domínio **ocupado por outra empresa** ("Uz-Me Trio Elétrico", Apache/OVH).
2. **Deploy a partir do Git:** `css/style.v1.min.css` e `js/main.v1.min.js` estão no `.gitignore` → um deploy por import do repo serve o site **sem o CSS principal**. Deploy por CLI da pasta, ou remover as entradas do `.gitignore`.
3. **Dados reais:** telefone, email, nomes dos sócios e testemunhos são fictícios (o README já o assinalava).
4. **Token Vercel** (ou claim na conta) para publicar.
