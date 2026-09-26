// Aba Mapa — mapa em tela cheia com card flutuante do batedor selecionado.
import { el, esc, debounce, fmtRating, fmtKm, haversineKm, isOpenNow, directionsUrl, toast } from '../utils.js';
import { icon } from '../components/Icons.js';
import { Logo } from '../components/Common.js';
import { PillRow } from '../components/PillFilter.js';
import { BatedorPhoto, StatusBadge } from '../components/BatedorCard.js';
import { AcaiMap } from '../components/AcaiMap.js';
import { FilterModal } from '../components/FilterModal.js';
import { repo } from '../data/repository.js';
import { store, filterBatedores } from '../store.js';

export function MapaScreen() {
  const total = repo.stats().kpis.locais;
  const CHIPS = [
    { key: 'todos', label: `Todos (${total})` },
    { key: 'batedores', label: 'Batedores' },
    { key: 'aberto', lead: '<i class="dot-open"></i>', label: 'Aberto agora' },
    { key: 'nota45', label: '4.5+', trail: '<span class="pill__star">★</span>' },
  ];

  const root = el(`<section class="screen screen--mapa" aria-label="Mapa">
    <div class="mapa__map"></div>
    <div class="mapa__top">
      <div class="mapa__brand">${Logo({ tone: 'light', inline: true })}<p>Mais açaí.<br/>Mais histórias.</p></div>
      <form class="mapa__search" role="search">
        <label class="field-white">
          ${icon('search', { size: 20, stroke: 2.2 })}
          <span class="sr-only">Buscar</span>
          <input type="search" name="q" placeholder="Buscar batedores, bairros..." autocomplete="off" enterkeyhint="search" />
          ${icon('pinSolid', { size: 20, cls: 'field-white__pin' })}
        </label>
        <button type="button" class="btn-square" data-action="filters" aria-label="Filtros">${icon('sliders', { size: 22 })}</button>
      </form>
      <div class="chips hscroll" role="toolbar" aria-label="Filtros do mapa"></div>
    </div>
    <button type="button" class="fab-nav" data-action="locate" aria-label="Minha localização">${icon('navigation', { size: 22, stroke: 2.2 })}</button>
    <article class="mapcard" aria-live="polite"></article>
  </section>`);

  const $ = (s) => root.querySelector(s);
  const opts = { q: '', chips: new Set(), sort: 'relevancia', minRating: 0 };
  let selected = null;

  const mapApi = AcaiMap($('.mapa__map'), {
    variant: 'mapa',
    zoom: 11.75,
    center: [-1.385, -48.462],
    bottomInset: () => 150,
    onSelect: (b) => select(b, false),
  });

  function select(b, pan = true) {
    selected = b;
    renderCard();
    if (pan && b) mapApi.focus(b);
  }

  function renderCard() {
    const card = $('.mapcard');
    const b = selected;
    if (!b) { card.hidden = true; return; }
    card.hidden = false;
    const pos = store.get().userPos;
    const aberto = isOpenNow(b.horario);
    const sub = b.desde ? `${b.tags[0]} · Desde ${b.desde}` : b.tags[0] || b.tipo;
    card.innerHTML = `
      <a class="mapcard__main" href="#/batedor/${encodeURIComponent(b.id)}">
        ${BatedorPhoto(b, 'mapcard__img')}
        <div class="mapcard__info">
          <h3>${esc(b.nome)}</h3>
          <p class="mapcard__rate">${b.rating > 0 ? `<span class="star">${icon('star', { size: 16 })}</span><strong>${fmtRating(b.rating)}</strong><span class="muted">(${b.reviews}) · ${esc(b.bairro)}</span>` : `<span class="muted">${esc(b.bairro)}</span>`}</p>
          <p class="mapcard__sub">${esc(sub)}</p>
          <p class="mapcard__meta">${aberto == null ? '<span></span>' : StatusBadge(aberto, 'text')}
            ${pos ? `<span class="mapcard__dist">${icon('pinSolid', { size: 15 })}${fmtKm(haversineKm(pos, b))}</span>` : ''}</p>
        </div>
      </a>
      <a class="btn-lime btn-lime--block" href="${directionsUrl(b)}" target="_blank" rel="noopener">Traçar Rota</a>`;
  }

  function refresh() {
    const pts = filterBatedores(repo.mapPoints(), { ...opts, chips: new Set([...opts.chips].filter((k) => k !== 'todos')) });
    mapApi.setPoints(pts);
    if (opts.chips.has('aberto') && !pts.length) toast('Horários ainda não disponíveis para estes locais.');
    if (!selected || !pts.some((p) => p.id === selected.id)) select(pts.find((p) => p.destaque) || pts[0] || null, false);
  }

  const chips = PillRow($('.chips'), {
    items: CHIPS,
    variant: 'glass',
    initial: ['todos'],
    onChange: (active, changed) => {
      if (changed === 'todos' || active.size === 0) active = new Set(['todos']);
      else active.delete('todos');
      chips.set([...active]);
      opts.chips = active;
      refresh();
    },
  });

  const input = $('input[name="q"]');
  input.addEventListener('input', debounce(() => {
    opts.q = input.value;
    refresh();
    if (opts.q && selected) mapApi.focus(selected);
  }, 200));
  $('.mapa__search').addEventListener('submit', (e) => { e.preventDefault(); input.blur(); });

  root.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-action]')?.dataset.action;
    if (a === 'locate') {
      const pos = await store.locate();
      if (pos) { mapApi.showUser(pos); renderCard(); }
    } else if (a === 'filters') {
      FilterModal(root, { value: opts, onApply: (v) => { Object.assign(opts, v); refresh(); } });
    }
  });

  store.subscribe(renderCard);
  refresh();

  return { root, onShow() { requestAnimationFrame(() => mapApi.invalidate()); } };
}
