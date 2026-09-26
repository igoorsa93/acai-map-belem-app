// Gráficos em SVG puro: Donut (Tipos de Ponto) e Mapa de calor por bairro.
import { esc, fmtInt, fmtPct, fmtRatingDot } from '../utils.js';
import { HEATMAP_CELLS, HEATMAP_LAND, HEATMAP_VIEWBOX } from '../data/bairros-geo.js';

let heatSeq = 0;

/** Donut com texto central e legenda à direita. */
export function DonutChart({ total, segments, size = 148, thickness = 20, caption = 'pontos' }) {
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const gap = 2.5; // px de respiro entre segmentos
  let offset = 0;
  const arcs = segments.map((s) => {
    const len = Math.max(0, (s.pct / 100) * C - gap);
    const arc = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${thickness}"
      stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-offset}" />`;
    offset += (s.pct / 100) * C;
    return arc;
  });
  return `<div class="donut">
    <figure class="donut__chart" style="width:${size}px;height:${size}px" role="img"
      aria-label="${segments.map((s) => `${s.label} ${fmtPct(s.pct)}`).join(', ')}">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="transform:rotate(-90deg)">${arcs.join('')}</svg>
      <figcaption class="donut__center"><strong>${fmtInt(total)}</strong><span>${esc(caption)}</span></figcaption>
    </figure>
    <ul class="donut__legend">
      ${segments.map((s) => `<li><i style="background:${s.color}"></i><div><strong>${fmtPct(s.pct)}</strong><span>${esc(s.label)}</span></div></li>`).join('')}
    </ul>
  </div>`;
}

export const HEAT_SCALES = {
  batedores: {
    label: 'Batedores',
    buckets: [
      { label: 'Mais de 100', color: '#3A0F6E', test: (v) => v > 100 },
      { label: '51 - 100', color: '#B2F026', test: (v) => v > 50 },
      { label: '11 - 50', color: '#9D5CE6', test: (v) => v > 10 },
      { label: '1 - 10', color: '#D9C4F2', test: (v) => v > 0 },
      { label: '0', color: '#E7E5EC', test: () => true },
    ],
    value: (s) => s?.total ?? 0,
    fmt: (v) => `${fmtInt(v)} batedores`,
  },
  nota: {
    label: 'Nota média',
    buckets: [
      { label: '4.8 ou mais', color: '#3A0F6E', test: (v) => v >= 4.8 },
      { label: '4.6 - 4.7', color: '#B2F026', test: (v) => v >= 4.6 },
      { label: '4.4 - 4.5', color: '#9D5CE6', test: (v) => v >= 4.4 },
      { label: 'Até 4.3', color: '#D9C4F2', test: (v) => v > 0 },
      { label: 'Sem dados', color: '#E7E5EC', test: () => true },
    ],
    value: (s) => s?.nota ?? 0,
    fmt: (v) => (v ? `nota ${fmtRatingDot(v)}` : 'sem avaliações'),
  },
};

/** Mapa de calor: células Voronoi dos bairros, recortadas pela mancha urbana, coloridas por métrica. */
export function HeatMap({ bairros, metric = 'batedores', highlight = null, withLegend = true }) {
  const scale = HEAT_SCALES[metric];
  const byName = new Map(bairros.map((b) => [b.nome, b]));
  const colorOf = (v) => scale.buckets.find((b) => b.test(v)).color;
  const cells = HEATMAP_CELLS.map((c) => {
    const s = byName.get(c.nome);
    const v = scale.value(s);
    const dim = highlight && !highlight.has(c.nome);
    return `<path d="${c.d}" fill="${colorOf(v)}" data-bairro="${esc(c.nome)}" class="heat__cell${dim ? ' is-dim' : ''}" tabindex="0">
      <title>${esc(c.nome)} · ${esc(scale.fmt(v))}</title></path>`;
  }).join('');
  const clipId = `heat-land-${++heatSeq}`;
  const top = [...bairros].sort((a, b) => scale.value(b) - scale.value(a))[0];
  const topCell = top && HEATMAP_CELLS.find((c) => c.nome === top.nome);
  return `<div class="heat">
    <svg class="heat__svg" viewBox="${HEATMAP_VIEWBOX.join(' ')}" role="img" aria-label="Mapa de calor por bairro — ${esc(scale.label)}">
      <defs><clipPath id="${clipId}"><path d="${HEATMAP_LAND}"/></clipPath></defs>
      <g clip-path="url(#${clipId})" stroke="#fff" stroke-width="1.1" stroke-linejoin="round">${cells}</g>
      ${topCell ? `<g class="heat__marker" transform="translate(${topCell.x} ${topCell.y})"><circle r="5.5" fill="#fff"/><path d="M-2.4-2.4 2.4 2.4M2.4-2.4-2.4 2.4" stroke="#3A0F6E" stroke-width="1.6" stroke-linecap="round"/></g>` : ''}
    </svg>
    ${withLegend ? `<ul class="heat__legend">${scale.buckets.map((b) => `<li><i style="background:${b.color}"></i>${esc(b.label)}</li>`).join('')}</ul>` : ''}
  </div>`;
}
