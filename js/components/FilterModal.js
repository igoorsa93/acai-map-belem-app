// Modal de filtros avançados (ordenar + nota mínima).
import { el, toast } from '../utils.js';
import { icon } from './Icons.js';
import { PillRow } from './PillFilter.js';
import { store } from '../store.js';

const SORTS = [
  { key: 'relevancia', label: 'Relevância' },
  { key: 'nota', label: 'Maior nota' },
  { key: 'avaliacoes', label: 'Mais avaliados' },
  { key: 'distancia', label: 'Mais perto' },
];
const RATINGS = [
  { key: '0', label: 'Qualquer' },
  { key: '4', label: '4.0+', lead: '⭐' },
  { key: '4.5', label: '4.5+', lead: '⭐' },
];

export function FilterModal(host, { value, onApply }) {
  const m = el(`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="flt-title">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel">
      <header class="modal__head">
        <h2 id="flt-title">Filtros</h2>
        <button type="button" class="btn-round btn-round--ghost" data-close aria-label="Fechar">${icon('close')}</button>
      </header>
      <h3 class="modal__label">Ordenar por</h3>
      <div class="chips-wrap" data-sort></div>
      <h3 class="modal__label">Nota mínima</h3>
      <div class="chips-wrap" data-rating></div>
      <footer class="modal__foot">
        <button type="button" class="btn-outline" data-reset>Limpar</button>
        <button type="button" class="btn-lime btn-lime--block" data-apply>Aplicar filtros</button>
      </footer>
    </div>
  </div>`);

  const sort = PillRow(m.querySelector('[data-sort]'), { items: SORTS, variant: 'light', single: true, initial: [value.sort] });
  const rating = PillRow(m.querySelector('[data-rating]'), { items: RATINGS, variant: 'light', single: true, initial: [String(value.minRating)] });

  const close = () => { m.classList.add('is-leaving'); setTimeout(() => m.remove(), 200); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => e.key === 'Escape' && close();
  document.addEventListener('keydown', onKey);

  m.addEventListener('click', async (e) => {
    if (e.target.closest('[data-close]')) return close();
    if (e.target.closest('[data-reset]')) { sort.set(['relevancia']); rating.set(['0']); return; }
    if (e.target.closest('[data-apply]')) {
      const s = [...sort.get()][0];
      if (s === 'distancia' && !(await store.locate())) { toast('Ative a localização para ordenar por distância.'); return; }
      onApply({ sort: s, minRating: Number([...rating.get()][0]) });
      close();
    }
  });

  host.appendChild(m);
  m.querySelector('[data-apply]').focus({ preventScroll: true });
}
