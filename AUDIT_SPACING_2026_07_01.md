# Relatório de Audit de Spacing — Trio Elétrico

**Data:** 2026-07-01  
**Script:** `scripts/spacing-audit-v2.mjs`  
**Ferramenta:** Playwright ( Chromium headless )  
**Breakpoints:** Desktop (1440x900), Tablet (768x1024), Mobile (375x667)  
**Páginas:** `index` (http://localhost:3000/), `contacto` (http://localhost:3000/contacto.html)

---

## Resumo

| Métrica | Valor |
|---------|-------|
| Secções analisadas | 9 por página (hero, sobre, serviços, áreas, galeria, porquenos, depoimentos, FAQ, contacto) |
| Total de secções | 18 (2 páginas x 9 secções) |
| Total de elementos medidos | 180+ |
| Total de issues encontradas | **12** |
| Issues por breakpoint | 4 (desktop), 4 (tablet), 4 (mobile) |
| Secções com issues | **0** |
| Header issues | 6 (info) |
| Footer issues | 6 (warning) |

---

## Classificação por Severidade

| Severidade | Count | Tipo |
|------------|-------|------|
| **Info** | 6 | Header padding (10-16px) |
| **Warning** | 6 | Footer padding assimétrico (top 48px vs bottom 24px) |

---

## Análise Detalhada

### ✅ SECÇÕES DE CONTEÚDO — Sem Issues

Todas as 9 secções de cada página foram medidas em profundidade (padding, margin, gap, overflow, flex/grid children, grid grand-children). **Nenhuma issue foi encontrada em nenhuma secção de conteúdo**, em nenhum breakpoint. Isto confirma que as correções de spacing aplicadas anteriormente estão a funcionar corretamente.

Secções verificadas:
- Hero — padding consistente, sem overflow
- Sobre — children com padding adequado
- Serviços — cards com padding >= 16px
- Áreas de Atuação — grid com gap >= 16px
- Galeria — children com margens consistentes
- Porquê Nós — flex containers com spacing correto
- Depoimentos — cards com padding >= 16px
- FAQ — accordion items com padding consistente
- Contacto — form com padding adequado

### ⚠️ HEADER — Padding (INFO)

| Página | Breakpoint | Padding Top | Padding Bottom | Altura |
|--------|------------|-------------|----------------|--------|
| index | desktop | 10px | 10px | 60px |
| index | tablet | 10px | 10px | 60px |
| index | mobile | 10px | 10px | 60px |
| contacto | desktop | 16px | 16px | 70px |
| contacto | tablet | 16px | 16px | 70px |
| contacto | mobile | 16px | 16px | 70px |

**Nota:** O header da página index tem padding de 10px enquanto a contacto tem 16px. Isto é consistente (sem assimetria top/bottom) mas os valores diferem entre páginas. Considerar uniformizar.

### ⚠️ FOOTER — Assimetria de Padding (WARNING)

| Página | Breakpoint | Padding Top | Padding Bottom | Diferença |
|--------|------------|-------------|----------------|-----------|
| index | desktop | 48px | 24px | 24px |
| index | tablet | 48px | 24px | 24px |
| index | mobile | 48px | 24px | 24px |
| contacto | desktop | 48px | 24px | 24px |
| contacto | tablet | 48px | 24px | 24px |
| contacto | mobile | 48px | 24px | 24px |

**Problema:** O footer tem padding-top=48px mas padding-bottom=24px em TODAS as páginas e TODOS os breakpoints. A diferença de 24px é consistente mas assimétrica.

**Recomendação:** Igualar para 40px / 40px ou 48px / 48px.

---

## Medidas do Container

| Página | Breakpoint | Container Width | Container Padding L/R |
|--------|------------|-----------------|----------------------|
| index | desktop (1440px) | 1200px | 20px |
| index | tablet (768px) | 768px | 28px |
| index | mobile (375px) | 375px | 20px |
| contacto | desktop (1440px) | 1200px | 20px |
| contacto | tablet (768px) | 768px | 16px |
| contacto | mobile (375px) | 375px | 16px |

**Observação:** Nos breakpoints desktop (1440px), o container tem margin-left=120px e margin-right=120px (centralizado com 120px de gap em cada lado). Nos breakpoints tablet e mobile, as margins são 0px (full-width).

---

## Screenshots

| Imagem | Descrição |
|--------|-----------|
| `screenshots/audit/audit_index_desktop_full.png` | Página index em desktop |
| `screenshots/audit/audit_index_tablet_full.png` | Página index em tablet |
| `screenshots/audit/audit_index_mobile_full.png` | Página index em mobile |
| `screenshots/audit/audit_contacto_desktop_full.png` | Página contacto em desktop |
| `screenshots/audit/audit_contacto_tablet_full.png` | Página contacto em tablet |
| `screenshots/audit/audit_contacto_mobile_full.png` | Página contacto em mobile |

---

## Conclusão

O site do Trio Elétrico está **bem ajustado** em termos de spacing nas secções de conteúdo. As 12 issues encontradas são todas no header e footer, que são elementos globais e não afetam a experiência de navegação nas secções principais.

### Prioridade de Ação

1. **Alta:** Corrigir assimetria do footer (padding-bottom 24px → 40px ou 48px)
2. **Baixa:** Uniformizar padding do header entre páginas index e contacto

---

## Dados Completos

O ficheiro JSON com todas as medições brutos está em:  
`spacing-audit-results.json`

Contém:
- Medições de todas as 9 secções x 2 páginas x 3 breakpoints
- Espaçamento de cada child element (padding, margin, gap, flex properties)
- Container children (flex/grid containers com grand-children)
- Header e footer measurements
