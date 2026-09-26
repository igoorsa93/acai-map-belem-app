// TELA 3 — Bairros de Belém (Ranking · Mapa · Insights · Comparativo).
import { el, esc, fmtInt, fmtPct, fmtRatingDot } from '../utils.js';
import { icon } from '../components/Icons.js';
import { DarkHeader, RankingItem } from '../components/Common.js';
import { PillRow } from '../components/PillFilter.js';
import { DonutChart, HeatMap, HEAT_SCALES } from '../components/Charts.js';
import { repo } from '../data/repository.js';

const REGIOES = {
  todas: { label: 'Belém', bairros: null },
  centro: {
    label: 'Centro',
    bairros: ['Umarizal', 'Reduto', 'Nazaré', 'Batista Campos', 'Cidade Velha', 'Campina', 'Marco', 'São Brás', 'Cremação', 'Jurunas',
      'Guamá', 'Pedreira', 'Telégrafo', 'Sacramenta', 'Fátima', 'Canudos', 'Condor', 'Souza', 'Barreiro', 'Utinga', 'Castanheira', 'Marambaia'],
  },
  expansao: {
    label: 'Expansão',
    bairros: ['Tapanã', 'Pratinha', 'Coqueiro', 'Cabanagem', 'Mangueirão', 'Parque Verde', 'Benguí', 'Tenoné', 'Parque Guajará', 'Una',
      'São Clemente', 'Cajueiro', 'Tocantins', 'Guajará', 'da Benfica'],
  },
  distritos: {
    label: 'Distritos',
    bairros: ['Icoaraci', 'Outeiro', 'Agulha de Icoaraci', 'Orla de Icoaraci', 'Distrito Industrial de Icoaraci', 'São João do Outeiro',
      'Porto Arthur', 'Carananduba', 'Aeroporto', 'Chapéu Virado', 'Murubira', 'Mangueiras', 'Vila'],
  },
  ananindeua: { label: 'Ananindeua', bairros: ['Ananindeua'] },
};

const TABS = [
  { key: 'ranking', label: 'Ranking' },
  { key: 'mapa', label: 'Mapa' },
  { key: 'insights', label: 'Insights' },
  { key: 'comparativo', label: 'Comparativo' },
];

export function BairrosScreen() {
  const stats = repo.stats();
  const ui = { regiao: 'todas', tab: 'ranking', metric: 'batedores', fullRanking: false, focus: null };

  const root = el(`<section class="screen screen--dark" aria-label="Bairros de Belém">
    <div class="scroll-y">
      ${DarkHeader({
        title: 'Bairros de Belém',
        subtitle: `${stats.kpis.areas} áreas mapeadas`,
        right: `<label class="select-glass">
          <span class="sr-only">Região</span>
          <select name="regiao">${Object.entries(REGIOES).map(([k, r]) => `<option value="${k}">${esc(r.label)}</option>`).join('')}</select>
          ${icon('chevronDown', { size: 18, stroke: 2.4 })}
        </label>`,
      })}
      <div class="subtabs hscroll" role="tablist" aria-label="Seções"></div>
      <div class="panel" role="tabpanel"></div>
    </div>
  </section>`);

  const $ = (s) => root.querySelector(s);
  const panel = $('.panel');
  const subtitle = $('.dark-header p');

  const regionList = () => {
    const r = REGIOES[ui.regiao].bairros;
    return r ? stats.bairros.filter((b) => r.includes(b.nome)) : stats.bairros;
  };

  const heatCard = (title, big = false) => {
    const list = regionList();
    const highlight = REGIOES[ui.regiao].bairros ? new Set(list.map((b) => b.nome)) : ui.focus ? new Set([ui.focus]) : null;
    return `<section class="card${big ? ' card--heat-big' : ''}">
      <div class="card__head">
        <h2>${title}</h2>
        <label class="select-soft">
          <span class="sr-only">Métrica</span>
          <select name="metric">${Object.entries(HEAT_SCALES).map(([k, s]) => `<option value="${k}"${k === ui.metric ? ' selected' : ''}>${s.label}</option>`).join('')}</select>
          ${icon('chevronDown', { size: 16, stroke: 2.4 })}
        </label>
      </div>
      ${HeatMap({ bairros: stats.bairros, metric: ui.metric, highlight })}
      <p class="heat__info" aria-live="polite">${ui.focus ? focusText(ui.focus) : 'Toque em um bairro para ver os detalhes.'}</p>
    </section>`;
  };

  const focusText = (nome) => {
    const b = stats.bairros.find((x) => x.nome === nome);
    return b ? `<strong>${esc(b.nome)}</strong> · ${b.total} batedores${b.nota ? ` · ★ ${fmtRatingDot(b.nota)}` : ''}` : esc(nome);
  };

  const views = {
    ranking() {
      const list = regionList();
      const shown = ui.fullRanking ? list : list.slice(0, 3);
      return `
        <section class="card">
          <h2>Top 3 bairros com mais batedores</h2>
          <ol class="rank-list">${shown.map((b, i) => RankingItem(b, i + 1)).join('') || '<li class="empty">Sem dados para esta região.</li>'}</ol>
          ${list.length > 3 ? `<button type="button" class="link link--center" data-action="toggle-rank">${ui.fullRanking ? 'Mostrar só o Top 3' : `Ver ranking completo (${list.length})`}</button>` : ''}
        </section>
        <section class="card">
          <h2>Tipos de Ponto</h2>
          ${DonutChart({ total: stats.kpis.locais, segments: stats.tipos })}
        </section>
        ${heatCard('Mapa de calor por bairro')}`;
    },
    mapa() {
      return heatCard('Mapa de calor por bairro', true);
    },
    insights() {
      const all = stats.bairros;
      const sum = stats.kpis.locais || all.reduce((s, b) => s + b.total, 0);
      const [a, b] = all;
      const bestRated = all.filter((x) => x.total >= 10).sort((x, y) => y.nota - x.nota)[0];
      const poucos = all.filter((x) => x.total <= 5).length;
      const tipo = [...stats.tipos].sort((x, y) => y.pct - x.pct)[0];
      const items = [
        { ico: 'trending', tone: 'acai', title: `${fmtPct(((a.total + b.total) / sum) * 100)} dos pontos`, text: `${a.nome} e ${b.nome} concentram a maior oferta de açaí da região mapeada.` },
        bestRated && { ico: 'star', tone: 'lime', title: `${bestRated.nome} · ★ ${fmtRatingDot(bestRated.nota)}`, text: `Melhor nota média entre os bairros com 10 ou mais batedores.` },
        { ico: 'store', tone: 'acai', title: `${fmtPct(tipo.pct)} ${tipo.label.toLowerCase()}`, text: `A maioria dos pontos mapeados é ${tipo.label === 'Especializado' ? 'especializada em açaí' : 'mista'}.` },
        { ico: 'pin', tone: 'lime', title: `${poucos} bairros com até 5 pontos`, text: 'Áreas com pouca oferta — oportunidade para novos batedores.' },
        { ico: 'message', tone: 'acai', title: `${fmtInt(stats.kpis.avaliacoes)} avaliações`, text: `Nota média geral de ${Number(stats.kpis.notaMedia).toFixed(2)} nas plataformas consultadas.` },
      ].filter(Boolean);
      return items.map((it) => `<section class="card insight">
        <span class="insight__ico insight__ico--${it.tone}">${icon(it.ico, { size: 22 })}</span>
        <div><h2>${esc(it.title)}</h2><p>${esc(it.text)}</p></div>
      </section>`).join('');
    },
    comparativo() {
      const list = regionList().slice(0, 15);
      const max = Math.max(1, ...list.map((b) => b.total));
      return `<section class="card">
        <div class="card__head"><h2>Batedores por bairro</h2><span class="muted small">Nota média</span></div>
        <ul class="bars">${list.map((b) => `<li>
          <span class="bars__name">${esc(b.nome)}</span>
          <span class="bars__track"><i style="width:${(b.total / max) * 100}%"></i><b>${b.total}</b></span>
          <span class="bars__rate">${b.nota ? `★ ${fmtRatingDot(b.nota)}` : '—'}</span>
        </li>`).join('')}</ul>
      </section>`;
    },
  };

  function render() {
    panel.innerHTML = views[ui.tab]();
    const n = regionList().length;
    subtitle.textContent = ui.regiao === 'todas' ? `${stats.kpis.areas} áreas mapeadas` : `${n} ${n === 1 ? 'área' : 'áreas'} em ${REGIOES[ui.regiao].label}`;
  }

  const tabs = PillRow($('.subtabs'), {
    items: TABS,
    variant: 'tab',
    single: true,
    initial: [ui.tab],
    onChange: (s) => { ui.tab = [...s][0]; render(); },
  });

  root.addEventListener('change', (e) => {
    if (e.target.name === 'regiao') { ui.regiao = e.target.value; ui.focus = null; render(); }
    if (e.target.name === 'metric') { ui.metric = e.target.value; render(); }
  });

  const focusBairro = (nome) => {
    ui.focus = ui.focus === nome ? null : nome;
    render();
  };

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="toggle-rank"]')) { ui.fullRanking = !ui.fullRanking; render(); return; }
    const rank = e.target.closest('.rank');
    if (rank) { ui.focus = rank.dataset.bairro; ui.tab = 'mapa'; tabs.set(['mapa']); render(); return; }
    const cell = e.target.closest('.heat__cell');
    if (cell) focusBairro(cell.dataset.bairro);
  });
  root.addEventListener('keydown', (e) => {
    const cell = e.target.closest?.('.heat__cell');
    if (cell && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); focusBairro(cell.dataset.bairro); }
  });

  render();
  return { root };
}
