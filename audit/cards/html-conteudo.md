## Objectivo
Corrigir conteúdo/semântica/estrutura HTML que a auditoria expôs (fora do CSS).

## Itens
1. **Dados fictícios visíveis (HIGH):** o site mostra `+351 912 345 678` como **valor real** em campos de formulário (contacto) e em cards/botões de telefone e WhatsApp. Confirmar com o Rogério o número real antes de publicar, e converter valores de formulário em `placeholder`.
2. **Ícone errado (MED):** o card "Email" usa um ícone de documento/página em vez de envelope (`index.html` secção contacto).
3. **`h1.sr-only` do contacto:** `contacto.html` tem um `h1.sr-only` com 757px de conteúdo inline (`div.container > h1.sr-only`) — verificar se é o único h1 da página e se a estrutura de headings (h1→h2→h3) está correcta; se houver h1 visível, remover o duplicado.
4. **Duplicação de `<meta name="theme-color">` (4x) no `contacto.html`** — limpar.
5. **Links de crédito da galeria (`gallery-credit`)**: links de 15px de altura, sem `target/rel` coerentes — garantir `rel="noopener"` em links externos.
6. **Domínio canónico (BLOQUEADOR DE PUBLICAÇÃO):** canonical, og:url e JSON-LD apontam para `https://trioeletrico.pt`, que está **ocupado por outra empresa** (serve "Uz-Me Trio Elétrico", Apache/OVH 94.23.75.235). Decidir o domínio final antes do deploy.
