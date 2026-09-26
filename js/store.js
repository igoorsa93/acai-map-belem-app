// Estado global mínimo (pub/sub) + filtragem pura de batedores.
import { haversineKm, isOpenNow, normalize, toast } from './utils.js';

const FAV_KEY = 'acaimap:favoritos';
const readFavs = () => {
  try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); } catch { return new Set(); }
};

const state = {
  userPos: null,       // { lat, lon }
  favorites: readFavs(),
};
const subs = new Set();

export const store = {
  get: () => state,
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  set(patch) { Object.assign(state, patch); subs.forEach((fn) => fn(state)); },

  toggleFavorite(id) {
    const f = new Set(state.favorites);
    f.has(id) ? f.delete(id) : f.add(id);
    try { localStorage.setItem(FAV_KEY, JSON.stringify([...f])); } catch { /* modo privado */ }
    this.set({ favorites: f });
    return f.has(id);
  },

  /** Pede a localização uma vez; resolve com {lat, lon} ou null. */
  locate() {
    if (state.userPos) return Promise.resolve(state.userPos);
    if (!('geolocation' in navigator)) { toast('Localização indisponível neste dispositivo.'); return Promise.resolve(null); }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => { const pos = { lat: p.coords.latitude, lon: p.coords.longitude }; this.set({ userPos: pos }); resolve(pos); },
        () => { toast('Não foi possível obter sua localização.'); resolve(null); },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
      );
    });
  },
};

/**
 * Aplica busca, chips e ordenação.
 * opts: { q, chips:Set, sort:'relevancia'|'nota'|'avaliacoes'|'distancia', minRating, userPos }
 */
export function filterBatedores(list, { q = '', chips = new Set(), sort = 'relevancia', minRating = 0, userPos = null } = {}) {
  const nq = normalize(q.trim());
  let out = list.map((b) => ({
    ...b,
    aberto: isOpenNow(b.horario),
    distanciaKm: userPos ? haversineKm(userPos, b) : null,
  }));

  if (nq) out = out.filter((b) => normalize(`${b.nome} ${b.bairro} ${b.tags.join(' ')} ${(b.termos || []).join(' ')}`).includes(nq));
  if (chips.has('aberto')) out = out.filter((b) => b.aberto === true);
  if (chips.has('farinha')) out = out.filter((b) => b.tags.some((t) => /farinha/i.test(t)));
  if (chips.has('batedores')) out = out.filter((b) => b.tipo === 'Especializado');
  if (chips.has('nota45')) out = out.filter((b) => b.rating >= 4.5);
  if (minRating) out = out.filter((b) => b.rating >= minRating);

  let key = sort;
  if (chips.has('populares')) key = 'avaliacoes';
  if (chips.has('perto') && userPos) key = 'distancia';

  const sorters = {
    nota: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    avaliacoes: (a, b) => b.reviews - a.reviews,
    distancia: (a, b) => (a.distanciaKm ?? 1e9) - (b.distanciaKm ?? 1e9),
  };
  if (sorters[key]) out.sort(sorters[key]);
  return out;
}
