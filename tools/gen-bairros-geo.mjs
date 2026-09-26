// Requer: npm i d3-delaunay  (rodar: node tools/gen-bairros-geo.mjs)
import { Delaunay } from "d3-delaunay";
import fs from "node:fs";
import vm from "node:vm";
const src = fs.readFileSync(new URL("../data/dashboard_data.js", import.meta.url), "utf8");
const ctx = { window: {} }; vm.runInNewContext(src, ctx);
const E = ctx.window.ACAI_DATA.estabelecimentos;
// Main urban area (excludes Mosqueiro/Outeiro islands far north)
const BB = { latMin: -1.485, latMax: -1.285, lonMin: -48.515, lonMax: -48.385 };
const inBB = (e) => e.lat >= BB.latMin && e.lat <= BB.latMax && e.lon >= BB.lonMin && e.lon <= BB.lonMax;
const g = {};
for (const e of E) if (inBB(e) && !/rua|\(/i.test(e.bairro)) (g[e.bairro] ??= []).push(e);
const med = (a) => { a = [...a].sort((x, y) => x - y); return a[a.length >> 1]; };
const W = 200, K = W / (BB.lonMax - BB.lonMin), H = Math.round((BB.latMax - BB.latMin) * K);
const proj = (lat, lon) => [(lon - BB.lonMin) * K, (BB.latMax - lat) * K];
const cells = Object.entries(g).map(([nome, a]) => {
  const [x, y] = proj(med(a.map((e) => e.lat)), med(a.map((e) => e.lon)));
  return { nome, x, y, n: a.length };
});
const v = Delaunay.from(cells.map((c) => [c.x, c.y])).voronoi([0, 0, W, H]);
// Sutherland–Hodgman: clip convex voronoi cell by convex circle polygon
function clip(subject, clipPoly) {
  let out = subject;
  for (let i = 0; i < clipPoly.length; i++) {
    const A = clipPoly[i], B = clipPoly[(i + 1) % clipPoly.length], inp = out; out = [];
    const inside = (p) => (B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0]) >= 0;
    const inter = (P, Q) => { const a1 = Q[1] - P[1], b1 = P[0] - Q[0], c1 = a1 * P[0] + b1 * P[1], a2 = B[1] - A[1], b2 = A[0] - B[0], c2 = a2 * A[0] + b2 * A[1], d = a1 * b2 - a2 * b1; return [(b2 * c1 - b1 * c2) / d, (a1 * c2 - a2 * c1) / d]; };
    for (let j = 0; j < inp.length; j++) {
      const P = inp[j], Q = inp[(j + 1) % inp.length];
      if (inside(Q)) { if (!inside(P)) out.push(inter(P, Q)); out.push(Q); } else if (inside(P)) out.push(inter(P, Q));
    }
    if (!out.length) break;
  }
  return out;
}
const R = 30;
const res = cells.map((c, i) => {
  let poly = v.cellPolygon(i).slice(0, -1);
  // ensure ccw orientation consistent with circle
  const circle = Array.from({ length: 20 }, (_, k) => [c.x + R * Math.cos((k / 20) * 2 * Math.PI), c.y + R * Math.sin((k / 20) * 2 * Math.PI)]);
  const area = (p) => p.reduce((s, q, k) => s + q[0] * p[(k + 1) % p.length][1] - p[(k + 1) % p.length][0] * q[1], 0);
  if (area(poly) < 0) poly.reverse();
  poly = clip(poly, circle);
  const d = "M" + poly.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L") + "Z";
  return { nome: c.nome, x: +c.x.toFixed(1), y: +c.y.toFixed(1), d };
});
// "Mancha urbana": círculos nos pontos coletados (deduplicados numa grade) → clipPath do mapa.
const LR = 7.5, seen = new Set(), land = [];
for (const e of E) {
  if (!inBB(e)) continue;
  const [x, y] = proj(e.lat, e.lon);
  const key = `${Math.round(x / 4)}:${Math.round(y / 4)}`;
  if (seen.has(key)) continue;
  seen.add(key);
  land.push(`M${(x - LR).toFixed(1)},${y.toFixed(1)}a${LR},${LR} 0 1,0 ${2 * LR},0a${LR},${LR} 0 1,0 ${-2 * LR},0`);
}
const out = `// Gerado a partir de data/dashboard_data.js (centróides medianos por bairro + Voronoi recortado).\n// Não editar à mão — ver README.\nexport const HEATMAP_VIEWBOX = [0, 0, ${W}, ${H}];\nexport const HEATMAP_CELLS = ${JSON.stringify(res)};\nexport const HEATMAP_LAND = ${JSON.stringify(land.join(""))};\n`;
fs.writeFileSync(new URL("../js/data/bairros-geo.js", import.meta.url), out);
console.log(W, H, res.length, out.length);
