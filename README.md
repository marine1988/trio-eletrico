# Trio Eléctrico, Instalações Eléctricas e Manutenção, Lda — Site Estático

Site profissional de uma página para a **Trio Eléctrico, Instalações Eléctricas e Manutenção, Lda**, uma empresa de eletricidade com 3 sócios eletricistas.

## Identificação

| Campo | Valor |
|-------|-------|
| Nome legal | Trio Eléctrico, Instalações Eléctricas e Manutenção, Lda |
| NIF | 513823930 |
| Forma jurídica | Sociedade por Quotas |
| Capital social | € 10.000,00 |
| Sede | Rua Stuart Carvalhais, Nº.7, Cruz de Pau, 2845-135 Amora, Seixal |
| Distrito | Setúbal |
| Constituição | 13/01/2016 |
| CAE principal | 43210 — Instalação elétrica |
| CAE secundários | 33140, 33190, 43290 |

## Estrutura

```
trio-eletrico/
├── index.html            # Página principal (9 secções)
├── contacto.html         # Página de contacto (formulário completo)
├── css/
│   ├── style.v1.min.css  # Folha PRINCIPAL (380 regras) — não editar à mão
│   ├── style.min.css     # Pequeno override (1 regra)
│   ├── fixes.css         # Correções de spacing/overlays herdadas
│   ├── components.css    # Componentes: carrossel, dark-mode, FAQ, footer
│   ├── overlays.css      # Elementos position:fixed + stack z-index
│   └── mobile.css        # Mobile + acessibilidade táctil (carregado por último)
├── js/main.v1.min.js     # Menu mobile, FAQ accordion, smooth scroll, carrossel, dark mode
├── audit/
│   ├── audit.mjs         # Harness multi-viewport (8 viewports × 2 páginas)
│   ├── shots.mjs         # Screenshots por secção
│   ├── img-check.mjs     # Verificação isolada de imagens
│   └── reports/          # Relatórios dos agentes (antes/depois com números)
├── tests/                # Playwright: e2e, responsividade, a11y, mobile, stylesheets
├── assets/images/        # Assets locais
└── README.md
```

## Tecnologias

- **HTML5** — Semântico, acessível (ARIA labels, alt em imagens)
- **CSS3** — Mobile-first, variáveis CSS, grid e flexbox, dark mode
- **JavaScript vanilla** — Menu mobile, accordion FAQ, smooth scroll, highlight de secção, dark mode toggle

## Paleta de Cores

| Cor | HEX | Uso |
|-----|-----|-----|
| Azul escuro | `#0A2540` | Fundo, header, footer |
| Amarelo elétrico | `#FFC107` | Destaques, CTAs, acentos |
| Branco | `#FFFFFF` | Fundo de conteúdo |
| Cinza | `#6c757d` | Textos secundários |

## Secções do Site

1. **Hero** — Apresentação principal com estatísticas (10 anos de atividade)
2. **Sobre Nós** — Dados da empresa + Cards dos 3 sócios
3. **Serviços** — 6 serviços (residencial, comercial, industrial, reparações, boletins, energia solar)
4. **Áreas de Atuação** — Península de Setúbal e Grande Lisboa
5. **Porquê Escolher-nos** — 6 diferenciais
6. **Depoimentos** — 4 testemunhos de clientes
7. **FAQ** — 5 perguntas com accordion
8. **Contacto** — Formulário (com campo NIF opcional) + informações de contacto
9. **Footer** — Links, copyright, NIF

## Como Servir

### Servidor de desenvolvimento (com compressão)

`python -m http.server` **não suporta compressão** (gzip/brotli). Para desenvolvimento local com compressão, usar uma das alternativas:

**Opção 1 — Netlify Dev (recomendado, usa a CDN Netlify com brotli automático):**
```bash
npm install -g netlify-cli
netlify dev
```

**Opção 2 — Servidor Node com compressão:**
```bash
npx serve -s . -l 8000
```

**Opção 3 — Python simples (sem compressão, apenas para teste rápido):**
```bash
python3 -m http.server 8000
```

Abre em `http://localhost:8000`

### Validação de compressão

```bash
curl -H "Accept-Encoding: br" -I http://localhost:8000/index.html
# Esperar: content-encoding: br
```

## Responsividade

- **Mobile:** 320px–768px (menu hamburger, colunas simples)
- **Tablet:** 769px–1199px (grids de 2 colunas)
- **Desktop:** 1200px+ (grids de 3 colunas)

## Imagens

Todas as imagens usam SVG inline para ilustrações. Para produção, substituir por fotos reais.

## Acessibilidade

- HTML semântico com ARIA labels
- Contraste WCAG AA (azul escuro + amarelo)
- `alt` em todas as imagens
- Navegação por teclado (tabindex, focus)
- `aria-expanded` no menu mobile e FAQ

## Arquitetura CSS (camadas — ordem obrigatória)

Ambas as páginas (`index.html` e `contacto.html`) carregam, por esta ordem:

1. CSS crítico inline no `<head>` (variáveis `:root`, acima da dobra)
2. `css/style.v1.min.css` — **folha principal** (380 regras) — não editar à mão
3. `css/style.min.css` — override pequeno
4. `css/fixes.css` → 5. `components.css` → 6. `overlays.css` → 7. `mobile.css`

⚠️ **Regressão já ocorrida:** o `contacto.html` carregava apenas `style.min.css` (156 bytes, **1 regra**) e o `fixes.css` não estava ligado a **nenhuma** página — resultado: 33 classes sem regras, inputs com estilo default do browser e scroll horizontal de +32px em todos os viewports. Uma camada só conta como aplicada quando está ligada **nas duas** páginas; o teste `tests/stylesheets.spec.js` garante isso.

## Auditoria e QA automática

```bash
npm run audit           # harness: 8 viewports × 2 páginas → audit/audit-report.json + screenshots
npm run audit:shots     # screenshots por secção → audit/sections/ (inspeção visual)
npm run test            # suite Playwright completa
npm run test:mobile     # gate mobile/a11y + regressão de folhas de estilos
node audit/img-check.mjs # verificação isolada de imagens (0 respostas não-200)
```

O harness mede, por combinação página×viewport: `hScroll`, `overflowRight`, `childOverflow`, `truncated`, `tinyTargets`, `classesNoRule`, `overlapsHeader`, `imgsBroken`, `forms`, `sections` e erros de consola. Para trabalho em paralelo, definir `AUDIT_TAG=<nome>` para não colidir com outros relatórios.

**Metas do gate:** `hScroll = 0`, `overflowRight = []`, `tinyTargets = []`, `classesNoRule = []`, `imgsBroken = []`, `overlapsHeader = 0` em 320/360/375/390/414/600/768/820/1024/1440.

## Notas

- Telefone e email são placeholders pendentes de confirmação pelo proprietário
- Os nomes dos sócios nos cards são fictícios — aguardam dados reais
- Review/testemunhos no JSON-LD são ilustrativos
- ⚠️ **BLOQUEADOR DE PUBLICAÇÃO — domínio:** o `canonical`, `og:url` e o JSON-LD apontam para `https://trioeletrico.pt`, que **não pertence a este projeto**: está registado e a servir outra empresa ("Uz-Me Trio Elétrico", Apache/OVH, 94.23.75.235). Definir o domínio final e actualizar `canonical`, `og:url`, `og:image` e o JSON-LD antes de publicar.
- ⚠️ **Imagens externas:** as 11 fotografias são hotlinks do Unsplash (`images.unsplash.com`). Frágil em produção (rate limit, rede restrita, sem cache própria). Recomendado baixar para `assets/images/` e servir localmente.
- ⚠️ **Deploy a partir do Git:** `css/style.v1.min.css` e `js/main.v1.min.js` estão no `.gitignore` (`*.v1.min.*`) e **não estão no repositório**. Um deploy que build a partir do Git (Vercel/Netlify por import do repo) serve a página **sem o CSS principal**. Fazer deploy por CLI a partir desta pasta, ou remover essas entradas do `.gitignore`, ou adicionar um passo de build.

## Licença

Site gratuito para uso pelo cliente. Não reutilizar sem autorização.
