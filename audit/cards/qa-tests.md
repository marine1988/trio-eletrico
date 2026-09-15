## Objectivo
Fechar o QA gate: a suite Playwright actual passa (31 testes) mas **não detectou nenhum dos bugs reais** (contacto sem CSS principal, H-scroll de 32px em todos os viewports, formulário sem estilos, imagem 404, tap targets 12x12). Actualizar para que estes casos falhem no futuro.

## Trabalho
1. Estender `tests/responsive.spec.js` com asserts em 320/360/375/390/414/600/768/820/1024/1440: `document.documentElement.scrollWidth <= innerWidth + 1`, zero imagens com `naturalWidth === 0`, zero `h1/h2` tapados pelo header fixo.
2. Novo `tests/mobile.spec.js`: tap targets ≥44x44, inputs com `font-size >= 16px`, zero elementos a transbordar o viewport, classes em uso têm regra CSS (via `document.styleSheets`), carrossel navegável por teclado.
3. Novo `tests/stylesheets.spec.js`: garantir que **ambas** as páginas carregam `style.v1.min.css` e as 4 camadas (regressão do bug P0) e que nenhuma folha de estilos devolve 404.
4. `tests/a11y.spec.js`: manter axe-core, correr também em 375px.
5. Actualizar snapshots visuais (`--update-snapshots`) **depois** de todos os fixes de CSS estarem aplicados, e commitar os PNG novos.
6. Correr `npm run test` e reportar contagem de testes passados/falhados.

## Critérios de aceitação
- `npm run test` verde (0 falhas), com ≥40 testes.
- Prova de que o gate funciona: reverter temporariamente (numa cópia, não no repo) a linha `<link href="css/style.v1.min.css">` do contacto e mostrar que a suite falha; guardar output em `audit/qa-gate-proof.txt`.
