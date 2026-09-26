import { esc } from '../utils.js';

/**
 * Chip de filtro (toggle).
 * variant: 'dark' (sobre o mapa, Tela 1) | 'glass' (header do Mapa) | 'tab' (sub-navegação)
 * lead: emoji ou HTML (ex.: bolinha verde) exibido antes do texto.
 */
export function PillFilter({ key, label, lead = '', active = false, variant = 'dark', trail = '' }) {
  return `<button type="button" class="pill pill--${variant}${active ? ' is-active' : ''}" data-chip="${esc(key)}" aria-pressed="${active}">
    ${lead ? `<span class="pill__lead" aria-hidden="true">${lead}</span>` : ''}<span>${esc(label)}</span>${trail}
  </button>`;
}

/** Linha horizontal rolável de chips com seleção múltipla ou única. */
export function PillRow(container, { items, variant = 'dark', single = false, initial = [], onChange }) {
  const active = new Set(initial);
  const render = () => {
    container.innerHTML = items.map((it) => PillFilter({ ...it, variant, active: active.has(it.key) })).join('');
  };
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-chip]');
    if (!btn) return;
    const k = btn.dataset.chip;
    if (single) { active.clear(); active.add(k); }
    else active.has(k) ? active.delete(k) : active.add(k);
    render();
    onChange?.(new Set(active), k);
  });
  render();
  return {
    get: () => new Set(active),
    set(keys) { active.clear(); keys.forEach((k) => active.add(k)); render(); },
  };
}
