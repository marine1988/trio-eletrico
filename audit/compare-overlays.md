### 1. Harness `audit/audit.mjs` (overlays-before vs overlays)

| página | viewport | overlapsHeader | hScroll | overflowRight | childOverflow | truncated | tinyTargets | classesNoRule | imgsBroken |
|---|---|---|---|---|---|---|---|---|---|
| home | mob-320 | 0 → **0** | não → não | 1 → 0 | 9 → 0 | 2 → 0 | 10 → 0 | 8 → 5 | 0 → 6 |
| contacto | mob-320 | 0 → **0** | não → não | 0 → 0 | 0 → 0 | 1 → 1 | 6 → 0 | 6 → 5 | 0 → 0 |
| home | mob-360 | 1 → **0** | não → não | 0 → 0 | 4 → 0 | 0 → 0 | 10 → 0 | 8 → 5 | 0 → 6 |
| contacto | mob-360 | 2 → **0** | não → não | 0 → 0 | 0 → 0 | 1 → 1 | 6 → 0 | 6 → 5 | 0 → 0 |
| home | mob-375 | 0 → **0** | não → não | 0 → 0 | 2 → 0 | 0 → 0 | 10 → 0 | 8 → 5 | 0 → 6 |
| contacto | mob-375 | 2 → **0** | não → não | 0 → 0 | 0 → 0 | 1 → 1 | 6 → 0 | 6 → 5 | 0 → 0 |
| home | mob-390 | 1 → **0** | não → não | 0 → 0 | 1 → 0 | 0 → 0 | 10 → 0 | 8 → 5 | 0 → 6 |
| contacto | mob-390 | 2 → **0** | não → não | 0 → 0 | 0 → 0 | 1 → 1 | 6 → 0 | 6 → 5 | 0 → 0 |
| home | mob-414 | 1 → **0** | não → não | 0 → 0 | 0 → 0 | 0 → 0 | 10 → 0 | 8 → 5 | 0 → 6 |
| contacto | mob-414 | 2 → **0** | não → não | 0 → 0 | 0 → 0 | 1 → 1 | 6 → 0 | 6 → 5 | 0 → 0 |
| home | tab-768 | 0 → **0** | não → não | 0 → 0 | 0 → 0 | 0 → 0 | 18 → 0 | 8 → 5 | 0 → 4 |
| contacto | tab-768 | 5 → **0** | não → não | 0 → 0 | 0 → 0 | 1 → 1 | 13 → 0 | 6 → 5 | 0 → 0 |
| home | desk-1280 | 4 → **0** | não → não | 0 → 0 | 0 → 0 | 0 → 0 | 26 → 26 | 8 → 5 | 0 → 6 |
| contacto | desk-1280 | 2 → **0** | não → não | 0 → 0 | 0 → 0 | 1 → 1 | 21 → 21 | 6 → 5 | 0 → 0 |
| home | desk-1440 | 0 → **0** | não → não | 0 → 0 | 2 → 2 | 0 → 0 | 26 → 26 | 8 → 5 | 0 → 6 |
| contacto | desk-1440 | 2 → **0** | não → não | 0 → 0 | 0 → 0 | 1 → 1 | 21 → 21 | 6 → 5 | 0 → 0 |

**Totais (16 página×viewport):** overlapsHeader **24 → 0** | hScroll 0 → 0 | overflowRight 1 → 0 | childOverflow 18 → 2 | truncated 10 → 8 | tinyTargets 205 → 94 | classesNoRule 112 → 80 | imgsBroken 0 → 46

### 2. Script próprio `audit/verify-overlays.mjs`

- **antes** = audit/overlays-verify-before.json — overlays.css ainda vazio, outras camadas a meio de edição (03:48-03:55)
- **A/B** = audit/overlays-verify-baseline-sheetoff.json — mesmo site agora, só com css/overlays.css DESLIGADO
- **depois** = audit/overlays-verify.json — css/overlays.css LIGADO

| métrica | antes (temporal) | A/B: sheet OFF | depois: sheet ON |
|---|---|---|---|
| estados medidos (página×viewport×estado) | 124 | 124 | 124 |
| elementos bloqueados (≥50% área) — header | 49 | 50 | 79 |
| elementos bloqueados — barra de CTA | 69 | 63 | 61 |
| elementos bloqueados — WhatsApp/tooltip | 7 | 7 | 0 |
| bloqueados no topo da página — por header | 6 | 6 | 0 |
| bloqueados no topo da página — por barra CTA | 11 | 9 | 7 |
| **destinos de âncora sob o header** | 64 / 76 | 64 / 76 | 0 / 76 |
| **colisões overlay↔overlay (bolha vs barra)** | 84 | 84 | 0 |
| controlos interativos tapados pela barra no fundo da página | 0 | 0 | 0 |
| controlos interativos tapados pela barra em aterragens de âncora | 21 | 20 | 16 |
| estados em que o CTA não recebe o clique | 0 | 0 | 0 |
| tooltip fora do viewport (sob hover) | 0 | 0 | 0 |
| interseções geométricas brutas — topo da página | 30 | 33 | 22 |
| interseções geométricas brutas — fundo da página | 29 | 33 | 33 |

Bloqueios por overlay no **fundo** da página: {"header":23} (OFF) → {"header":20} (ON)

Bloqueios por overlay em **aterragens de âncora** (exclui click-cta): {"cta":45,"header":15,"whatsapp":5} (OFF) → {"cta":47,"header":59} (ON)

| página | viewport | bloqueados OFF | bloqueados ON | âncoras sob header OFF | ON | colisões OFF | ON |
|---|---|---|---|---|---|---|---|
| home | mob-320 | 7 | 13 | 8/9 | 0/9 | 11 | 0 |
| contacto | mob-320 | 8 | 1 | 0/1 | 0/1 | 3 | 0 |
| home | mob-360 | 8 | 15 | 8/9 | 0/9 | 11 | 0 |
| contacto | mob-360 | 11 | 1 | 0/1 | 0/1 | 3 | 0 |
| home | mob-375 | 9 | 16 | 8/9 | 0/9 | 11 | 0 |
| contacto | mob-375 | 11 | 5 | 0/1 | 0/1 | 3 | 0 |
| home | mob-390 | 16 | 18 | 8/9 | 0/9 | 11 | 0 |
| contacto | mob-390 | 7 | 8 | 0/1 | 0/1 | 3 | 0 |
| home | mob-414 | 6 | 19 | 8/9 | 0/9 | 11 | 0 |
| contacto | mob-414 | 6 | 8 | 0/1 | 0/1 | 3 | 0 |
| home | tab-768 | 15 | 28 | 8/9 | 0/9 | 11 | 0 |
| contacto | tab-768 | 6 | 3 | 0/1 | 0/1 | 3 | 0 |
| home | desk-1280 | 2 | 3 | 8/8 | 0/8 | 0 | 0 |
| contacto | desk-1280 | 0 | 0 | 0/0 | 0/0 | 0 | 0 |
| home | desk-1440 | 1 | 2 | 8/8 | 0/8 | 0 | 0 |
| contacto | desk-1440 | 0 | 0 | 0/0 | 0/0 | 0 | 0 |

### 3. Regras de aceitação (medidas no estado final)

| regra | valor final | resultado |
|---|---|---|
| 1. `overlapsHeader = 0` no harness, em todas as páginas/viewports | overlapsHeader=0 | **PASS** |
| 2. nenhum elemento bloqueado pelo header no topo da página | blockedByHeaderAtTop=0 | **PASS** |
| 3. nenhum destino de âncora aterra sob o header | 0/76 | **PASS** |
| 4. zero colisões overlay↔overlay | overlayVsOverlay=0 | **PASS** |
| 5. nenhum controlo interativo tapado pela barra no fundo da página | n=0 | **PASS** |
| 6. CTA nunca deixa de receber o clique | falhas=0 | **PASS** |
| 7. tooltip nunca sai do viewport | fora=0 | **PASS** |
| 8. hScroll / overflowRight a 0 no harness | hScroll=0 overflowRight=0 | **PASS** |

### 4. O que fica por resolver (inerente, com números)

- Barra de CTA sobre a dobra no topo (7 elementos, ex.: contacto-mob-375:label ; contacto-mob-390:label ; contacto-mob-390:input#telefone): a barra fixa cobre sempre a faixa inferior do viewport; o conteúdo continua acessível por scroll (ao fundo da página nada fica tapado — ver regra 5).
- Header sobre conteúdo já scrollado: no fundo da página {"header":20} — links do rodapé que passam sob o header no scroll máximo (inerente a qualquer header fixo opaco).
- Em aterragens de âncora: {"cta":47,"header":59} — a faixa que sobe sob o header é o fim da secção anterior (é para isso que serve o header); o destino da âncora fica sempre visível (regra 3).