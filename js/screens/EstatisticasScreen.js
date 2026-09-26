// Aba Estatísticas — KPIs gerais, buscas mais comuns, favoritos e créditos.
import { el, esc, fmtInt, fmtRatingDot, isOpenNow } from '../utils.js';
import { icon } from '../components/Icons.js';
import { DarkHeader } from '../components/Common.js';
import { BatedorCard } from '../components/BatedorCard.js';
import { repo } from '../data/repository.js';
import { store } from '../store.js';

const CREDITOS = [
  ['acai-01 a 04', 'Marcuskuhl', 'CC BY-SA 4.0'],
  ['acai-05', 'Gervásio Baptista/ABr', 'CC BY 3.0 BR'],
  ['acai-06', 'Túllio F', 'CC BY-SA 4.0'],
  ['acai-07', 'Olga Kreglicka', 'CC BY-SA 3.0'],
  ['acai-08', 'Joe Crawford', 'CC BY 2.0'],
];

export function EstatisticasScreen() {
  const s = repo.stats();
  const k = s.kpis;
  const maxTermo = Math.max(...s.termos.map((t) => t.total));
  const kpis = [
    { ico: 'store', value: fmtInt(k.locais), label: 'Locais mapeados', tone: 'acai' },
    { ico: 'pin', value: fmtInt(k.areas), label: 'Áreas cobertas', tone: 'lime' },
    { ico: 'star', value: Number(k.notaMedia).toFixed(2), label: 'Nota média', tone: 'lime' },
    { ico: 'message', value: fmtInt(k.avaliacoes), label: 'Avaliações', tone: 'acai' },
  ];

  const root = el(`<section class="screen screen--dark" aria-label="Estatísticas">
    <div class="scroll-y">
      ${DarkHeader({
        title: 'Estatísticas',
        subtitle: k.coleta ? `Coleta de ${k.coleta}` : 'Visão geral',
        right: `<span class="source-chip">${repo.source === 'dashboard' ? 'Dados reais' : 'Dados de exemplo'}</span>`,
      })}
      <div class="panel panel--first">
        <section class="kpis">${kpis.map((x) => `<article class="kpi">
          <span class="kpi__ico kpi__ico--${x.tone}">${icon(x.ico, { size: 20 })}</span>
          <strong>${x.value}</strong><span>${x.label}</span>
        </article>`).join('')}</section>

        <section class="card">
          <div class="card__head"><h2>Buscas mais comuns</h2><span class="muted small">resultados</span></div>
          <ul class="bars bars--terms">${s.termos.map((t) => `<li>
            <span class="bars__name">${esc(t.termo)}</span>
            <span class="bars__track"><i style="width:${(t.total / maxTermo) * 100}%"></i><b>${t.total}</b></span>
          </li>`).join('')}</ul>
          <p class="muted small">${fmtInt(k.consultas)} consultas · ${fmtInt(k.ocorrencias)} ocorrências coletadas</p>
        </section>

        <section class="card">
          <h2>Seus favoritos</h2>
          <ul class="bcard-list fav-list"></ul>
        </section>

        <section class="card card--plain">
          <h2>Créditos</h2>
          <p class="muted small">Mapa © OpenStreetMap contributors © CARTO. Fotos via Wikimedia Commons:</p>
          <ul class="credits">${CREDITOS.map(([f, a, l]) => `<li><span>${esc(f)}</span>${esc(a)} · ${esc(l)}</li>`).join('')}</ul>
        </section>
      </div>
    </div>
  </section>`);

  const favList = root.querySelector('.fav-list');
  const renderFavs = () => {
    const favs = [...store.get().favorites].map((id) => repo.byId(id)).filter(Boolean)
      .map((b) => ({ ...b, aberto: isOpenNow(b.horario) }));
    favList.innerHTML = favs.length
      ? favs.map((b) => `<li>${BatedorCard(b)}</li>`).join('')
      : `<li class="empty">Toque no ${icon('heart', { size: 16 })} no perfil de um batedor para salvá-lo aqui.</li>`;
  };
  store.subscribe(renderFavs);
  renderFavs();

  return { root };
}
