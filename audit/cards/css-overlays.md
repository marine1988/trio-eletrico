## Objectivo
Eliminar todas as sobreposições de elementos `position: fixed` sobre conteúdo, editando apenas `css/overlays.css`. Evidência: campos `overlapsHeader`, `fixedEls` em `audit/audit-report.json` + screenshots `audit/sections/*`.

## Bugs concretos (medidos/observados)
1. **Header fixo tapa conteúdo (CRIT):** `header.header` é `position: fixed; height: 60-70px`. A 375px o conteúdo de `#areas` começa em `y=6` (o `h2#areas-title` fica entre y=56 e y=97, por baixo do header que ocupa y=0..60). Há 1-6 elementos tapados por viewport em vários breakpoints. Falta compensação (`scroll-margin-top` em `section[id]`, `[id]` de âncoras, e `padding-top` onde o conteúdo nasce colado ao topo).
2. **Barra amarela `.sticky-cta-mobile` tapa conteúdo (CRIT):** cobre o título do formulário na secção contacto, o 5º card do FAQ e cards de depoimentos (visível em `home-375-08-faq.png`, `home-375-09-contacto.png`, `home-375-07-depoimentos.png`). Fix: reservar espaço (padding-bottom no `body`/última secção), respeitar `env(safe-area-inset-bottom)`, e garantir que não colide com o botão de WhatsApp.
3. **WhatsApp (HIGH):** `.whatsapp-wrapper` / `.whatsapp-float` sobrepõem cards e CTAs; `.whatsapp-tooltip` sai do viewport pela esquerda e tapa o campo Email do formulário. Fix: offsets com margem, `max-width` do tooltip, esconder tooltip em ≤480px ou posicioná-lo acima do botão.
4. **Stack z-index:** definir ordem explícita (header > sticky-cta > whatsapp) e garantir que nenhum overlay fica inutilizável.

## Regras obrigatórias
- Só editar `css/overlays.css`. Nada de HTML/JS/outras folhas.
- Variáveis de `:root`; **sem `!important`**; respeitar `prefers-reduced-motion`.
- Não esconder conteúdo do utilizador como "solução" (excepto tooltip em ecrãs pequenos).
- O CTA mobile deve continuar visível e clicável — é conversão.

## Critérios de aceitação (medir, não afirmar)
1. `node audit/audit.mjs http://localhost:3000` → `overlapsHeader` = **0** em todos os viewports e páginas.
2. Verificação dedicada: para cada combinação página/viewport, nenhum elemento com `position: fixed` intersecta o `rect` de um elemento com texto essencial (h1/h2/h3/p/a/button/input) — escreve um pequeno script de verificação e guarda o output em `audit/overlays-verify.json`.
3. Screenshots: `node audit/shots.mjs` — em `home-375-08-faq.png` e `home-375-09-contacto.png` o título da secção e o CTA têm de estar legíveis (não tapados).
