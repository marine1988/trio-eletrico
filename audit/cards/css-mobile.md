## Objectivo
Afinar mobile + acessibilidade táctil, editando apenas `css/mobile.css`. Evidência: `tinyTargets`, `truncated`, `sections` e `console` em `audit/audit-report.json`.

## Bugs concretos (medidos/observados)
1. **Tap targets <44px (HIGH, a11y):** home 375 → `button.testimonials-dot` 12x12 (3), `button.testimonials-dot.active` 36x12, `a` de créditos 58x15 e 81x15, `a.logo` 36px de altura. Contacto 375 → 3 links de 24px de altura, 2 de 21px. Desktop: 21-26 alvos pequenos (não regridas, mas não podem encolher).
2. **Alturas excessivas em mobile (HIGH, UX):** a home mede ~17.500px de altura a 375px (secções `#sobre` 3090px, `#servicos` 2201px, `#porquenos` 2000px, `#depoimentos` 2036px). Precisa de respiração apertada em ≤768px (não colapsar, mas reduzir padding/gap sem partir desktop).
3. **Formulário de contacto (MED):** campo telefone com **valor hardcoded** `+351 912 345 678` (deve ser placeholder), placeholders com notação `[seu.email@exemplo.com]`, labels encostadas aos inputs, input `font-size 13.33px` (default UA — deve ser ≥16px para evitar zoom automático no iOS).
4. **Ícones desproporcionados (MED):** no contacto o SVG do relógio ocupa ~80% da largura útil; os trust badges e o emblema "Garantia 2 anos" são desproporcionados face às labels.
5. **Overflow residual (LOW):** home a 320px → `#faq-question-5 > span.faq-icon` sai +2px do viewport; `#faq .faq-icon` gigante é do card de componentes, mas garante que nada transborda o viewport a 320px.

## Regras obrigatórias
- Só editar `css/mobile.css`. Nada de HTML/JS/outras folhas (o form HTML é tratado noutro card).
- Usar `@media (max-width: ...)` coerentes com os breakpoints já usados pelo site (480/600/768/1024).
- Variáveis de `:root`; **sem `!important`**; nada pode regredir em desktop 1280/1440.
- Não reduzir tamanho de texto abaixo de 16px em elementos de formulário.

## Critérios de aceitação (medir, não afirmar)
1. `node audit/audit.mjs http://localhost:3000` → `tinyTargets` = **[]** em 320/360/375/390/414/768 (aceitam-se excepções apenas para links dentro de blocos de texto legal, documentadas).
2. `truncated` = **0** em todas as viewports/páginas (excepto `.sr-only`, que é falso-positivo).
3. `overflowRight` e `hScroll` = **0** em 8 viewports × 2 páginas.
4. Altura da home a 375px: de ~17.500px → **≤13.000px** sem partir desktop (medir `docHeight`).
5. Desktop 1440 continua sem overflow e com as `sections` alinhadas (comparar `audit/screens/home-desk-1440.png` antes/depois).
