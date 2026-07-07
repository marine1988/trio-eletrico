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
├── index.html          # Página principal (9 secções)
├── css/
│   └── style.v1.min.css # Estilos minificados (mobile-first, responsivo)
├── js/
│   └── main.v1.min.js  # Menu mobile, FAQ accordion, smooth scroll (minificado)
├── favicon.svg         # Favicon SVG
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

## Notas

- Telefone e email são placeholders pendentes de confirmação pelo proprietário
- Os nomes dos sócios nos cards são fictícios — aguardam dados reais
- Review/testemunhos no JSON-LD são ilustrativos

## Licença

Site gratuito para uso pelo cliente. Não reutilizar sem autorização.
