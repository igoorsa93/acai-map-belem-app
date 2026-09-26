// TELA 1 — Explorar: mapa + busca + chips + bottom sheet com a lista.
import { el, debounce, toast } from '../utils.js';
import { icon } from '../components/Icons.js';
import { Logo } from '../components/Common.js';
import { PillRow } from '../components/PillFilter.js';
import { BatedorCard } from '../components/BatedorCard.js';
import { BottomSheet } from '../components/BottomSheet.js';
import { AcaiMap } from '../components/AcaiMap.js';
import { FilterModal } from '../components/FilterModal.js';
import { repo } from '../data/repository.js';
import { store, filterBatedores } from '../store.js';

const CHIPS = [
  { key: 'populares', lead: '🔥', label: 'Mais Populares' },
  { key: 'perto', lead: '📍', label: 'Perto de mim' },
  { key: 'aberto', lead: '<i class="dot-open"></i>', label: 'Aberto agora' },
  { key: 'farinha', lead: '🥣', label: 'Tradicional com Farinha' },
];

export function ExplorarScreen() {
  const root = el(`<section class="screen screen--explorar" aria-label="Explorar">
    <div class="explorar__map"></div>

    <div class="explorar__top">
      <form class="searchbar" role="search">
        ${Logo()}
        <label class="searchbar__field">
          ${icon('search', { size: 22, stroke: 2.2 })}
          <span class="sr-only">Buscar</span>
          <input type="search" name="q" placeholder="Onde tomar açaí hoje?..." autocomplete="off" enterkeyhint="search" />
        </label>
        <button type="button" class="btn-round btn-round--acai" data-action="filters" aria-label="Filtros">${icon('sliders', { size: 22 })}</button>
      </form>
      <div class="chips hscroll" role="toolbar" aria-label="Filtros rápidos"></div>
    </div>

    <button type="button" class="fab-locate" data-action="locate" aria-label="Minha localização">${icon('locate', { size: 26, stroke: 2.2 })}</button>

    <section class="sheet" aria-label="Batedores em destaque">
      <header class="sheet__header">
        <button type="button" class="sheet__handle" aria-label="Expandir ou recolher lista"></button>
        <div class="sheet__title">
          <h2>Batedores em destaque</h2>
          <span class="count-badge"></span>
        </div>
      </header>
      <div class="sheet__list scroll-y"><ul class="bcard-list"></ul></div>
    </section>
  </section>`);

  const $ = (s) => root.querySelector(s);
  const list = $('.bcard-list');
  const opts = { q: '', chips: new Set(), sort: 'relevancia', minRating: 0 };

  $('.count-badge').textContent = `${repo.stats().kpis.locais} locais`;

  // Mapa
  const mapApi = AcaiMap($('.explorar__map'), {
    variant: 'explorar',
    center: [-1.405, -48.468],
    bottomInset: () => root.clientHeight * 0.46,
    onSelect: (b) => { location.hash = `#/batedor/${encodeURIComponent(b.id)}`; },
  });
  mapApi.setPoints(repo.mapPoints());

  // Lista
  function renderList() {
    const items = filterBatedores(repo.batedores(), { ...opts, userPos: store.get().userPos }).slice(0, 60);
    list.innerHTML = items.length
      ? items.map((b) => `<li>${BatedorCard(b)}</li>`).join('')
      : `<li class="empty">Nenhum batedor encontrado com esses filtros.</li>`;
  }

  // Chips
  PillRow($('.chips'), {
    items: CHIPS,
    variant: 'dark',
    onChange: async (active, changed) => {
      opts.chips = active;
      if (changed === 'perto' && active.has('perto')) {
        const pos = await store.locate();
        if (pos) mapApi.showUser(pos);
      }
      renderList();
    },
  });

  // Busca
  const input = $('input[name="q"]');
  input.addEventListener('input', debounce(() => { opts.q = input.value; renderList(); }, 150));
  $('.searchbar').addEventListener('submit', (e) => {
    e.preventDefault(); input.blur(); sheet.snapTo('expanded');
  });
  input.addEventListener('focus', () => sheet.state === 'collapsed' && sheet.snapTo('mid'));

  // Ações
  root.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-action]')?.dataset.action;
    if (a === 'locate') {
      const pos = await store.locate();
      if (pos) { mapApi.showUser(pos); renderList(); }
    } else if (a === 'filters') {
      FilterModal(root, { value: opts, onApply: (v) => { Object.assign(opts, v); renderList(); toast('Filtros aplicados'); } });
    }
  });

  // Bottom sheet
  const sheetEl = $('.sheet');
  const top = $('.explorar__top');
  const fab = $('.fab-locate');
  const sheet = BottomSheet(sheetEl, {
    header: $('.sheet__header'),
    scroller: $('.sheet__list'),
    initial: 'mid',
    // Alturas visíveis (acima da bottom bar). Expandida: cobre o mapa até logo abaixo da busca.
    snaps: () => {
      const navH = document.getElementById('bottom-nav').offsetHeight;
      const H = root.clientHeight - navH;
      const search = $('.searchbar');
      return {
        collapsed: 132,
        mid: Math.round(H * 0.46),
        expanded: Math.round(H - (top.offsetTop + search.offsetHeight + 10)),
      };
    },
    onChange: (state, visible) => {
      root.style.setProperty('--sheet-visible', `${visible}px`);
      fab.classList.toggle('is-hidden', state === 'expanded' || visible > root.clientHeight * 0.62);
    },
  });

  store.subscribe(() => renderList());
  renderList();

  return {
    root,
    onShow() { requestAnimationFrame(() => { mapApi.invalidate(); sheet.relayout(); }); },
  };
}
