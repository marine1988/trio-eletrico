## Objectivo
Implementar em `css/components.css` (ÚNICO ficheiro que podes editar) as regras para as classes que **não têm nenhuma regra CSS** em nenhuma folha carregada. Evidência: `audit/audit-report.json` → `classesNoRule`.

Home (8): `theme-toggle__sun`, `theme-toggle__moon`, `carousel-track`, `carousel-nav`, `gallery-credit`, `accent`, `noSwipe`, `faq-question-text`
Contacto (6): `theme-toggle__sun`, `theme-toggle__moon`, `footer-content`, `footer-logo`, `footer-social`, `social-icons`

## Bugs concretos que isto causa (medidos)
- **Carrossel de depoimentos partido (CRIT):** `.carousel-wrapper` e `.carousel-track` sem CSS → os 4 cards ficam comprimidos a 122px de largura a 320px, texto cortado (`p.testimonial-text`: clientWidth 122 / scrollWidth 128), `.testimonial-author > div` sai do card (9 ocorrências a 320px). Dots `.testimonials-dot` com 12x12px (tap target inaceitável).
- **FAQ (CRIT):** `.faq-icon` mede 77x69px dentro de um botão de 174px e transborda o pai em 67px (9 ocorrências a 320px; +2px fora do viewport no `#faq-question-5`). `.faq-question-text` sem regra → sem controlo de quebra/ellipsis.
- **Dark mode (HIGH):** `.theme-toggle__sun`/`__moon` sem regras → o toggle não mostra o estado certo (sol/lua). Já existe `data-theme` no `<html>` via JS e o anti-FOUC no head; falta a CSS dos ícones e as variáveis em `[data-theme="dark"]` que ainda não existam.
- **Footer (MED):** `footer-content`, `footer-logo`, `footer-social`, `social-icons` sem regras → footer do contacto desalinhado.
- `gallery-credit`, `accent`, `noSwipe`: estilizar de forma mínima e coerente.

## Regras obrigatórias
- Só editar `css/components.css` (nada de HTML, JS ou outras folhas).
- Usar as variáveis de `:root` já definidas (`--color-accent`, `--bg-secondary`, `--color-gray-*`, `--radius-*`, `--shadow-*`, `--transition`).
- **Sem `!important`.** Sem CSS inline.
- Preservar `.reveal { opacity/transform/transition }`.
- `prefers-reduced-motion` respeitado.
- Tap targets ≥44x44 (aplicar a `.testimonials-dot`). Se necessário usar pseudo-elemento para aumentar a área clicável sem mudar o visual.

## Critérios de aceitação (medir, não afirmar)
1. `node audit/audit.mjs http://localhost:3000` → `classesNoRule` = **[]** em home e contacto (0 classes).
2. `node audit/audit.mjs` → `childOverflow` da home a 320px: de 9 → **≤2** (só os que sejam decorativos justificados, documentados no relatório).
3. `truncated` a 320px: de 2 → **0** no texto dos depoimentos.
4. Carrossel navegável: 1 card por view em ≤768px, 3+ em desktop; dots com ≥44px de área.
5. Screenshots: `node audit/shots.mjs` e confirmar que `home-375-07-depoimentos.png` mostra cards legíveis (um por linha, texto não cortado).
