// Camada de acesso a dados: abstrai mock × dashboard_data.js.
import { CONFIG } from '../config.js';
import { MOCK_BATEDORES, MOCK_STATS } from './mock.js';

const RAW = window.ACAI_DATA || null;
const hasDashboard = !!RAW?.estabelecimentos?.length;
const source = CONFIG.dataSource === 'dashboard' && hasDashboard ? 'dashboard' : 'mock';

const TIPO_MAP = (t = '') => {
  const s = t.toLowerCase();
  if (s.startsWith('especializado')) return 'Especializado';
  if (s.includes('outro segmento')) return 'Misto';
  return 'Outros';
};

/** Converte um registro de dashboard_data.js para o modelo Batedor do app. */
function fromDashboard(e) {
  const tipo = TIPO_MAP(e.tipo);
  const tags = [tipo === 'Especializado' ? 'Especializado em açaí' : tipo === 'Misto' ? 'Açaí + outro segmento' : 'Outro estabelecimento'];
  if (e.categoria && e.categoria !== 'Não informado') tags.push(e.categoria);
  const rawTel = (e.telefone || '').replace(/\D/g, '');
  const telefone = rawTel ? (rawTel.startsWith('55') ? `+${rawTel}` : `+55${rawTel}`) : '';
  const termos = e.termos ? e.termos.split('|').map((t) => t.trim()).filter(Boolean) : [];
  let endereco = e.endereco || '';
  if (endereco.startsWith(e.nome + ' - ')) endereco = endereco.slice(e.nome.length + 3);
  return {
    id: e.place_id,
    nome: e.nome,
    bairro: e.bairro,
    cidade: e.cidade || 'Belém',
    endereco,
    lat: e.lat, lon: e.lon,
    rating: e.rating || 0, reviews: e.reviews || 0,
    preco: null, precoFaixa: null,
    horario: null,
    tipoAcai: null,
    tipo, tags,
    termos,
    foto: null,
    telefone,
    website: e.website || '',
    link: e.link || '',
    avaliacoes: [],
    ocorrencias: e.ocorrencias || 0,
    origem: 'dashboard',
  };
}

const dashboardList = hasDashboard ? RAW.estabelecimentos.map(fromDashboard) : [];
const mockList = MOCK_BATEDORES.map((b) => ({ ...b, origem: 'mock' }));
const byIdIndex = new Map([...dashboardList, ...mockList].map((b) => [b.id, b]));

/** Destaques do modo dashboard: especializados primeiro, depois mistos; nota × volume de avaliações. */
function dashboardFeatured() {
  const score = (b) => b.rating * Math.log10(b.reviews + 1);
  const rank = (tipo) => dashboardList.filter((b) => b.tipo === tipo && b.rating > 0).sort((a, b) => score(b) - score(a));
  return [...rank('Especializado'), ...rank('Misto')];
}

function dashboardStats() {
  const list = dashboardList;
  const tipoCount = { Especializado: 0, Misto: 0, Outros: 0 };
  const byBairro = new Map();
  for (const b of list) {
    tipoCount[b.tipo]++;
    const g = byBairro.get(b.bairro) || { nome: b.bairro, total: 0, soma: 0, n: 0 };
    g.total++;
    if (b.rating > 0) { g.soma += b.rating; g.n++; }
    byBairro.set(b.bairro, g);
  }
  const total = list.length;
  const k = RAW.kpis || {};
  return {
    kpis: {
      locais: k.total_estabelecimentos ?? total,
      areas: k.total_areas ?? byBairro.size,
      notaMedia: k.avg_rating ?? 0,
      avaliacoes: k.total_reviews ?? 0,
      consultas: k.total_consultas ?? 0,
      ocorrencias: k.total_ocorrencias ?? 0,
      coleta: k.data_coleta ?? '',
    },
    tipos: MOCK_STATS.tipos.map((t) => ({ ...t, pct: +((tipoCount[t.key] / total) * 100).toFixed(1) })),
    bairros: [...byBairro.values()]
      .map((g) => ({ nome: g.nome, total: g.total, nota: g.n ? +(g.soma / g.n).toFixed(1) : 0 }))
      .sort((a, b) => b.total - a.total),
    termos: (RAW.termos || []).map((t) => ({ termo: t.termo, total: t.resultados })),
  };
}

export const repo = {
  source,
  hasDashboard,

  /** Lista exibida na bottom sheet / resultados (especializados primeiro, depois mistos, depois sem nota). */
  batedores() {
    if (source !== 'dashboard') return mockList;
    const score = (b) => b.rating * Math.log10(b.reviews + 1);
    const rank = (tipo) => dashboardList.filter((b) => b.tipo === tipo && b.rating > 0).sort((a, b) => score(b) - score(a));
    const unrated = dashboardList.filter((b) => b.rating === 0);
    return [...rank('Especializado'), ...rank('Misto'), ...unrated];
  },

  byId(id) {
    return byIdIndex.get(id) || null;
  },

  /** Todos os pontos plotados no mapa (destaques + base coletada). */
  mapPoints() {
    const base = CONFIG.plotDashboardPointsOnMap || source === 'dashboard' ? dashboardList : [];
    const featured = source === 'dashboard' ? [] : mockList;
    return [...featured.map((b) => ({ ...b, destaque: true })), ...base];
  },

  stats() {
    return source === 'dashboard' ? dashboardStats() : MOCK_STATS;
  },
};
