// Helpers genéricos (DOM, formatação, geo, horário).

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Cria um elemento a partir de uma string HTML (primeiro nó). */
export function el(markup) {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild;
}

const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nfInt = new Intl.NumberFormat('pt-BR');
/** 4.4 → "4,4" (padrão brasileiro, como no card da Tela 1). */
export const fmtRating = (n) => nf1.format(n);
/** 4.4 → "4.4" (como no perfil / ranking dos prints). */
export const fmtRatingDot = (n) => Number(n).toFixed(1);
export const fmtInt = (n) => nfInt.format(n);
export const fmtKm = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${nf1.format(km)} km`);
export const fmtPct = (n) => `${Number(n).toFixed(1)}%`;

export function haversineKm(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
/** true/false conforme o horário atual; null quando não há horário cadastrado. */
export function isOpenNow(horario, now = new Date()) {
  if (!horario) return null;
  const t = now.getHours() * 60 + now.getMinutes();
  const a = toMin(horario.abre), f = toMin(horario.fecha);
  return a <= f ? t >= a && t < f : t >= a || t < f; // suporta virada de meia-noite
}

export const directionsUrl = (b) =>
  `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lon}`;

export function debounce(fn, ms = 200) {
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); };
}

export const normalize = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

let toastTimer;
export function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-visible'), 2600);
}

/** Iniciais para avatares sem foto. */
export const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
