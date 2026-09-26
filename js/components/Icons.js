// Ícones outline (24×24, traço 2) — geometria no estilo Lucide (ISC).
const P = {
  search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
  sliders:
    '<path d="M20 5h-7M9 5H4M20 12h-9M7 12H4M20 19h-5M11 19H4"/><circle cx="11" cy="5" r="2" fill="currentColor"/><circle cx="9" cy="12" r="2" fill="currentColor"/><circle cx="13" cy="19" r="2" fill="currentColor"/>',
  locate:
    '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  pin: '<path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  pinSolid:
    '<path fill="currentColor" stroke="none" d="M12 1.5a8.5 8.5 0 0 0-8.5 8.5c0 5.6 6 11.1 7.7 12.5a1.3 1.3 0 0 0 1.6 0c1.7-1.4 7.7-6.9 7.7-12.5A8.5 8.5 0 0 0 12 1.5Zm0 11.8a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Z"/>',
  star: '<path fill="currentColor" stroke="none" d="M12 2.2 15 8.4l6.8 1-4.9 4.8 1.2 6.8L12 17.8 5.9 21l1.2-6.8L2.2 9.4l6.8-1z"/>',
  starOutline: '<path d="M12 2.2 15 8.4l6.8 1-4.9 4.8 1.2 6.8L12 17.8 5.9 21l1.2-6.8L2.2 9.4l6.8-1z"/>',
  compass:
    '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-1.8 5.4a2 2 0 0 1-1.3 1.3l-5.3 1.7 1.8-5.4a2 2 0 0 1 1.3-1.3z"/>',
  map: '<path d="M14.1 5.6a2 2 0 0 0 1.8 0l3.7-1.9A1 1 0 0 1 21 4.6v12.8a1 1 0 0 1-.6.9l-4.5 2.3a2 2 0 0 1-1.8 0l-4.2-2.1a2 2 0 0 0-1.8 0l-3.7 1.8A1 1 0 0 1 3 19.4V6.6a1 1 0 0 1 .6-.9l4.5-2.3a2 2 0 0 1 1.8 0z"/><path d="M15 5.8v15M9 3.2v15"/>',
  building:
    '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"/>',
  chart: '<rect x="4" y="12" width="4" height="9" rx="1"/><rect x="10" y="4" width="4" height="17" rx="1"/><rect x="16" y="8" width="4" height="13" rx="1"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  heart:
    '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
  more: '<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
  navigation: '<path d="M3 11 22 2l-9 19-2-8z"/>',
  phone:
    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2"/>',
  dollar: '<path d="M12 2v20M17 5.5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
  arrowRight: '<path d="M5 12h14M13 5l7 7-7 7"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  trending: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  store: '<path d="M3 9 4.5 3.8A1 1 0 0 1 5.5 3h13a1 1 0 0 1 1 .8L21 9"/><path d="M3 9h18v1.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z"/><path d="M5 13v8h14v-8M10 21v-5h4v5"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
};

/** Retorna o SVG inline de um ícone. */
export function icon(name, { size = 20, stroke = 2, cls = '' } = {}) {
  const body = P[name];
  if (!body) return '';
  return `<svg class="ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}
