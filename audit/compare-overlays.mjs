// audit/compare-overlays.mjs — before/after (harness audit.mjs + script próprio)
// Uso: node audit/compare-overlays.mjs
//
// Três fontes:
//   A) verify "antes" ....... audit/overlays-verify-before.json   (03:48-03:55, overlays.css ainda vazio)
//   B) baseline A/B ......... audit/overlays-verify-baseline-sheetoff.json (agora, overlays.css DESLIGADO na página)
//   C) depois ............... audit/overlays-verify.json           (agora, overlays.css LIGADO)
// A é temporal (outras camadas mudaram no meio); B vs C é o A/B isolado da minha camada.
import fs from 'node:fs';

const md = [];
const read = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null);
const row = (l, ...cells) => md.push(`| ${l} | ${cells.join(' | ')} |`);

// ---------- 1. harness ----------
const hb = read('audit/audit-report-overlays-before.json');
const ha = read('audit/audit-report-overlays.json');
if (hb && ha) {
  const keys = ['overlapsHeader', 'overflowRight', 'overflowLeft', 'overflowLeft', 'childOverflow', 'truncated', 'tinyTargets', 'classesNoRule', 'imgsBroken'];
  md.push('### 1. Harness `audit/audit.mjs` (overlays-before vs overlays)');
  md.push('');
  md.push('| página | viewport | overlapsHeader | hScroll | overflowRight | childOverflow | truncated | tinyTargets | classesNoRule | imgsBroken |');
  md.push('|---|---|---|---|---|---|---|---|---|---|');
  const hKey = (r) => `${r.page}|${r.viewport}`;
  const bm = new Map(hb.results.map((r) => [hKey(r), r]));
  const am = new Map(ha.results.map((r) => [hKey(r), r]));
  const tot = { b: {}, a: {} };
  for (const k of bm.keys()) {
    const b = bm.get(k), a = am.get(k);
    const c = (r, p) => (r ? (r[p] || []).length : 'n/a');
    md.push(`| ${k.split('|')[0]} | ${k.split('|')[1]} | ${c(b, 'overlapsHeader')} → **${c(a, 'overlapsHeader')}** | ${b?.hScroll ? 'sim' : 'não'} → ${a?.hScroll ? 'sim' : 'não'} | ${c(b, 'overflowRight')} → ${c(a, 'overflowRight')} | ${c(b, 'childOverflow')} → ${c(a, 'childOverflow')} | ${c(b, 'truncated')} → ${c(a, 'truncated')} | ${c(b, 'tinyTargets')} → ${c(a, 'tinyTargets')} | ${c(b, 'classesNoRule')} → ${c(a, 'classesNoRule')} | ${c(b, 'imgsBroken')} → ${c(a, 'imgsBroken')} |`);
    for (const p of keys) { tot.b[p] = (tot.b[p] || 0) + (b ? (b[p] || []).length : 0); tot.a[p] = (tot.a[p] || 0) + (a ? (a[p] || []).length : 0); }
  }
  md.push('');
  md.push(`**Totais (16 página×viewport):** overlapsHeader **${tot.b.overlapsHeader} → ${tot.a.overlapsHeader}** | hScroll ${hb.results.filter((r) => r.hScroll).length} → ${ha.results.filter((r) => r.hScroll).length} | overflowRight ${tot.b.overflowRight} → ${tot.a.overflowRight} | childOverflow ${tot.b.childOverflow} → ${tot.a.childOverflow} | truncated ${tot.b.truncated} → ${tot.a.truncated} | tinyTargets ${tot.b.tinyTargets} → ${tot.a.tinyTargets} | classesNoRule ${tot.b.classesNoRule} → ${tot.a.classesNoRule} | imgsBroken ${tot.b.imgsBroken} → ${tot.a.imgsBroken}`);
  md.push('');
}

// ---------- 2. verify-overlays ----------
const V = {
  antes: read('audit/overlays-verify-before.json'),
  ab: read('audit/overlays-verify-baseline-sheetoff.json'),
  depois: read('audit/overlays-verify.json'),
};
const acc = (rep) => {
  const a = {
    runs: 0, states: 0, blockedKind: { header: 0, cta: 0, whatsapp: 0, tooltip: 0 },
    blockedAtTop: 0, blockedByHeaderAtTop: 0, blockedByCtaAtTop: 0, blockedAtTopList: [],
    blockedByKindAtBottom: {}, ctaBlockedInteractiveBottom: 0, ctaBlockedInteractiveLanding: 0,
    anchorTargetsUnderHeader: 0, anchorsTested: 0, overlayVsOverlay: 0,
    ctaFail: 0, tipOutside: 0, rawTop: 0, rawBottom: 0,
    blockedByKindAtLanding: {}, blockedByKindAtHover: {},
  };
  if (!rep) return a;
  for (const r of rep.runs) {
    if (r.error) continue;
    a.runs++;
    for (const [name, v] of Object.entries(r.states)) {
      if (v.error) continue;
      a.states++;
      for (const b of v.blocked || []) {
        for (const k of Object.keys(b.by || {})) {
          a.blockedKind[k] = (a.blockedKind[k] || 0) + 1;
          if (name === 'top') {
            a.blockedAtTop++;
            if (k === 'header') a.blockedByHeaderAtTop++;
            if (k === 'cta') { a.blockedByCtaAtTop++; a.blockedAtTopList.push(`${r.page}-${r.viewport}:${b.el.slice(0, 30)}`); }
          }
          if (name === 'bottom') {
            a.blockedByKindAtBottom[k] = (a.blockedByKindAtBottom[k] || 0) + 1;
            if (k === 'cta' && b.interactive) a.ctaBlockedInteractiveBottom++;
          }
          if (name === 'hover-tooltip') a.blockedByKindAtHover[k] = (a.blockedByKindAtHover[k] || 0) + 1;
          if (name.startsWith('anchor') || name === 'click-cta') {
            a.blockedByKindAtLanding[k] = (a.blockedByKindAtLanding[k] || 0) + 1;
            if (k === 'cta' && b.interactive) a.ctaBlockedInteractiveLanding++;
          }
        }
      }
      a.overlayVsOverlay += (v.overlayVsOverlay || []).length;
      if (name.startsWith('anchor') || name === 'click-cta') {
        a.anchorsTested++;
        if (v.anchorTarget && v.anchorTarget.targetUnderHeader) a.anchorTargetsUnderHeader++;
      }
      if (name === 'top') a.rawTop += v.interactionCount || 0;
      if (name === 'bottom') a.rawBottom += v.interactionCount || 0;
      if (v.ctaClickable && v.ctaClickable.visible && !v.ctaClickable.receivesEvent) a.ctaFail++;
    }
    const tip = r.states['hover-tooltip'];
    if (tip && tip.tooltip && !tip.tooltip.insideViewport) a.tipOutside++;
    if (tip && tip.tooltipVisible === false) a.tipOutside += 0;
  }
  return a;
};
const A = { antes: acc(V.antes), ab: acc(V.ab), depois: acc(V.depois) };

md.push('### 2. Script próprio `audit/verify-overlays.mjs`');
md.push('');
md.push(`- **antes** = ${V.antes ? 'audit/overlays-verify-before.json' : '(sem ficheiro)'} — overlays.css ainda vazio, outras camadas a meio de edição (03:48-03:55)`);
md.push(`- **A/B** = ${V.ab ? 'audit/overlays-verify-baseline-sheetoff.json' : '(sem ficheiro)'} — mesmo site agora, só com css/overlays.css DESLIGADO`);
md.push(`- **depois** = ${V.depois ? 'audit/overlays-verify.json' : '(sem ficheiro)'} — css/overlays.css LIGADO`);
md.push('');
md.push('| métrica | antes (temporal) | A/B: sheet OFF | depois: sheet ON |');
md.push('|---|---|---|---|');
const cmp = (l, f) => row(l, V.antes ? f(A.antes) : 'n/a', V.ab ? f(A.ab) : 'n/a', V.depois ? f(A.depois) : 'n/a');
cmp('estados medidos (página×viewport×estado)', (x) => x.states);
cmp('elementos bloqueados (≥50% área) — header', (x) => x.blockedKind.header);
cmp('elementos bloqueados — barra de CTA', (x) => x.blockedKind.cta);
cmp('elementos bloqueados — WhatsApp/tooltip', (x) => (x.blockedKind.whatsapp || 0) + (x.blockedKind.tooltip || 0));
cmp('bloqueados no topo da página — por header', (x) => x.blockedByHeaderAtTop);
cmp('bloqueados no topo da página — por barra CTA', (x) => x.blockedByCtaAtTop);
cmp('**destinos de âncora sob o header**', (x) => `${x.anchorTargetsUnderHeader} / ${x.anchorsTested}`);
cmp('**colisões overlay↔overlay (bolha vs barra)**', (x) => x.overlayVsOverlay);
cmp('controlos interativos tapados pela barra no fundo da página', (x) => x.ctaBlockedInteractiveBottom);
cmp('controlos interativos tapados pela barra em aterragens de âncora', (x) => x.ctaBlockedInteractiveLanding);
cmp('estados em que o CTA não recebe o clique', (x) => x.ctaFail);
cmp('tooltip fora do viewport (sob hover)', (x) => x.tipOutside);
cmp('interseções geométricas brutas — topo da página', (x) => x.rawTop);
cmp('interseções geométricas brutas — fundo da página', (x) => x.rawBottom);
md.push('');
md.push('Bloqueios por overlay no **fundo** da página: ' + JSON.stringify(A.ab.blockedByKindAtBottom) + ' (OFF) → ' + JSON.stringify(A.depois.blockedByKindAtBottom) + ' (ON)');
md.push('');
md.push('Bloqueios por overlay em **aterragens de âncora** (exclui click-cta): ' + JSON.stringify(A.ab.blockedByKindAtLanding) + ' (OFF) → ' + JSON.stringify(A.depois.blockedByKindAtLanding) + ' (ON)');

// per run
md.push('');
md.push('| página | viewport | bloqueados OFF | bloqueados ON | âncoras sob header OFF | ON | colisões OFF | ON |');
md.push('|---|---|---|---|---|---|---|---|');
const perRun = (r) => {
  let blocked = 0, oxo = 0, anch = 0, tested = 0;
  for (const [name, v] of Object.entries(r.states || {})) {
    if (v.error) continue;
    blocked += (v.blocked || []).length;
    oxo += (v.overlayVsOverlay || []).length;
    if (name.startsWith('anchor') || name === 'click-cta') { tested++; if (v.anchorTarget && v.anchorTarget.targetUnderHeader) anch++; }
  }
  return { blocked, oxo, anch, tested };
};
const mapOf = (rep) => new Map((rep?.runs || []).map((r) => [`${r.page}|${r.viewport}`, r]));
const mb = mapOf(V.ab), mc = mapOf(V.depois);
for (const k of [...new Set([...mb.keys(), ...mc.keys()])]) {
  const rb = mb.get(k) ? perRun(mb.get(k)) : null, rc = mc.get(k) ? perRun(mc.get(k)) : null;
  md.push(`| ${k.split('|')[0]} | ${k.split('|')[1]} | ${rb?.blocked ?? 'n/a'} | ${rc?.blocked ?? 'n/a'} | ${rb ? `${rb.anch}/${rb.tested}` : 'n/a'} | ${rc ? `${rc.anch}/${rc.tested}` : 'n/a'} | ${rb?.oxo ?? 'n/a'} | ${rc?.oxo ?? 'n/a'} |`);
}

// ---------- 3. regras ----------
md.push('');
md.push('### 3. Regras de aceitação (medidas no estado final)');
md.push('');
const p = A.depois;
const rules = [
  ['1. `overlapsHeader = 0` no harness, em todas as páginas/viewports', `overlapsHeader=${ha ? ha.results.reduce((s, r) => s + (r.overlapsHeader || []).length, 0) : '?'}`, ha && ha.results.every((r) => (r.overlapsHeader || []).length === 0)],
  ['2. nenhum elemento bloqueado pelo header no topo da página', `blockedByHeaderAtTop=${p.blockedByHeaderAtTop}`, p.blockedByHeaderAtTop === 0],
  ['3. nenhum destino de âncora aterra sob o header', `${p.anchorTargetsUnderHeader}/${p.anchorsTested}`, p.anchorTargetsUnderHeader === 0],
  ['4. zero colisões overlay↔overlay', `overlayVsOverlay=${p.overlayVsOverlay}`, p.overlayVsOverlay === 0],
  ['5. nenhum controlo interativo tapado pela barra no fundo da página', `n=${p.ctaBlockedInteractiveBottom}`, p.ctaBlockedInteractiveBottom === 0],
  ['6. CTA nunca deixa de receber o clique', `falhas=${p.ctaFail}`, p.ctaFail === 0],
  ['7. tooltip nunca sai do viewport', `fora=${p.tipOutside}`, p.tipOutside === 0],
  ['8. hScroll / overflowRight a 0 no harness', `hScroll=${ha ? ha.results.filter((r) => r.hScroll).length : '?'} overflowRight=${ha ? ha.results.reduce((s, r) => s + (r.overflowRight || []).length, 0) : '?'}`, ha && ha.results.every((r) => !r.hScroll) && ha.results.every((r) => (r.overflowRight || []).length === 0)],
];
md.push('| regra | valor final | resultado |');
md.push('|---|---|---|');
for (const [l, v, ok] of rules) md.push(`| ${l} | ${v} | ${ok ? '**PASS**' : 'FAIL'} |`);

// ---------- 4. residual ----------
md.push('');
md.push('### 4. O que fica por resolver (inerente, com números)');
md.push('');
md.push(`- Barra de CTA sobre a dobra no topo (${p.blockedByCtaAtTop} elementos, ex.: ${p.blockedAtTopList.slice(0, 3).join(' ; ') || '-'}): a barra fixa cobre sempre a faixa inferior do viewport; o conteúdo continua acessível por scroll (ao fundo da página nada fica tapado — ver regra 5).`);
md.push(`- Header sobre conteúdo já scrollado: no fundo da página ${JSON.stringify(p.blockedByKindAtBottom)} — links do rodapé que passam sob o header no scroll máximo (inerente a qualquer header fixo opaco).`);
md.push(`- Em aterragens de âncora: ${JSON.stringify(p.blockedByKindAtLanding)} — a faixa que sobe sob o header é o fim da secção anterior (é para isso que serve o header); o destino da âncora fica sempre visível (regra 3).`);

console.log(md.join('\n'));
fs.writeFileSync('audit/compare-overlays.md', md.join('\n'));
console.error('\n(gravado em audit/compare-overlays.md)');
