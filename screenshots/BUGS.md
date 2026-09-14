# Audit Visual — Trio Elétrico

**Data:** 29 de Junho 2026
**Screenshots:** 5 ficheiros em screenshots/
**Breakpoints testados:** desktop-1440, tablet-768, mobile-375, iphone-390, desktop-1440-dark

---

## HIGH (crítico)

1. Overlap de media queries (769px–1024px) — A media query `@media (min-width: 481px) and (max-width: 1024px)` (linha 1399) e `@media (min-width: 769px) and (max-width: 1024px)` (linha 1619) sobrepõem-se no intervalo 769–1024px. Como a segunda aparece depois no CSS, ela ganha por cascade e força society cards em 2 colunas em vez de 3 entre 769–1024px. O mesmo pode afectar services grid e outros grids — ficheiro: css/style.css — breakpoints: tablet landscape (769-1024)

2. Nav horizontal esmagado em tablet-768 — No breakpoint 481–1024px, o menu de navegação é exibido inline (sem hamburger) com `font-size: 0.82rem` e `gap: 16px`. A 768px de largura com 7 links + botão "Orçamento", o texto fica ilegível e os links podem overflow ou ficar cortados. Não há media query específica para 481–768px que ajuste o layout — ficheiro: css/style.css (linha 1408-1445) — breakpoints: tablet (481–768)

3. Hero stats em mobile com 3 colunas demasiado apertado — `grid-template-columns: repeat(3, 1fr)` com `gap: 12px` em ecrãs de 375px. O texto das labels ("Projetos realizados", "Anos de atividade", etc.) possivelmente overflow ou fica ilegível — ficheiro: css/style.css (linha 1857) — breakpoints: mobile

---

## MEDIUM (melhorar)

4. Dark mode aplicado correctamente às secções escuras mas não às secções claras — As secções "Sobre Nós", "Áreas de Atuação", "Porquê Nós", "FAQ" e "Contacto" têm fundo explicitamente branco no design. O `data-theme='dark'` muda as CSS variáveis `--bg-primary`, `--bg-secondary`, `--bg-tertiary` para cores escuras, mas as secções com `.section` em fundo branco podem não estar a usar as variáveis correctas. A análise do screenshot dark mode mostra que o fundo das secções claras permanece branco — isto é intencional (design com alternância) ou bug? — ficheiro: css/style.css — breakpoints: todos

5. Contact form em mobile usa layout 1-coluna correcto mas em tablet mantém 1-coluna — Aos 768px, o formulário de contacto permanece em coluna única enquanto o espaço permitiria confortavelmente 2 colunas (formulário + info lado a lado) — ficheiro: css/style.css — breakpoints: tablet

6. Society cards (equipa) em tablet-768 — A media query 481–1024px define `grid-template-columns: repeat(3, 1fr)` mas a media query 769–1024px (que ganha por cascade) define 2 colunas. Resultado: a 768px apenas 2 cards por linha com o 3º card esticado a 50% width. Layout inconsistente e visualmente desequilibrado — ficheiro: css/style.css (linhas 1692-1706) — breakpoints: tablet (768)

7. Society card placeholder images — As fotos da equipa usam elementos SVG placeholder genéricos com iniciais/gráficos. Sem imagens reais, esta secção parece inacabada — ficheiro: index.html (linhas ~480-540) — breakpoints: todos

8. Hero illustration SVG pode ter aspect ratio incorrecto em tablet-768 — O `hero-image` tem `max-width: 100%` mas sem `height: auto` explícito no SVG, podendo causar distorção ou espaço em branco excessivo na coluna direita — ficheiro: css/style.css — breakpoints: tablet

---

## LOW (polimento)

9. Nav toggle button (hamburger) falta aria-label — O botão `.nav-toggle` não tem aria-label visível. Deve ter `aria-label="Menu"` ou similar para acessibilidade WCAG 2.1 — ficheiro: index.html — breakpoints: mobile

10. Footer em mobile com múltiplas colunas condensadas — No breakpoint <=480px, o footer mantém 3-4 colunas de links que ficam com texto muito pequeno (~12-13px). Recomendado layout em 2 colunas com font-size >=14px — ficheiro: css/style.css — breakpoints: mobile

11. FAQ accordion "+/-" button sem aria-expanded toggle via JS — O accordion FAQ precisa de ter `aria-expanded="true/false"` actualizado dinamicamente quando aberto/fechado. Verificar se o JS actualiza este atributo — ficheiro: js/main.js — breakpoints: todos

12. WhatsApp float button pode obstruir conteúdo em mobile — O botão flutuante verde no canto inferior direito posicionado com `position: fixed` pode sobrepor o botão de submit do formulário em ecrãs pequenos — ficheiro: css/style.css — breakpoints: mobile (375, 390)

---

## NOTAS POSITIVAS

- Design limpo e profissional com hierarquia tipográfica forte
- Alternância de fundos (escuro/claro) cria ritmo visual agradável
- CSS bem estruturado com variáveis CSS custom properties
- Dark mode implementado com toggle button funcional (localStorage + prefers-color-scheme)
- 5 secções de conteúdo bem definidas com informação completa
- Formulário com validação ARIA (aria-required, aria-describedby, role=alert)
- Skip-to-content link presente e funcional
- Nenhum horizontal overflow detectado em nenhum breakpoint
- Font Inter carregada correctamente via Google Fonts com preload
- JSON-LD structured data (Electrician, Person, FAQPage) correctamente implementado
