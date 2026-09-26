// Mapa noturno (Leaflet + tiles OSM escurecidos/tingidos de roxo) com clusters.
import { CONFIG } from '../config.js';

const PIN_SVG = `<svg viewBox="0 0 40 52" width="40" height="52" aria-hidden="true">
  <path d="M20 1C9.5 1 1 9.3 1 19.6 1 33 17.3 48.6 18.7 50a1.9 1.9 0 0 0 2.6 0C22.7 48.6 39 33 39 19.6 39 9.3 30.5 1 20 1Z" fill="#B2F026"/>
  <path d="m20 10.6 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" fill="#1A1033"/>
</svg>`;

function clusterIcon(variant) {
  return (cluster) => {
    const n = cluster.getChildCount();
    const size = n < 10 ? 40 : n < 50 ? 50 : n < 100 ? 60 : 68;
    return L.divIcon({
      html: `<span>${n}</span>`,
      className: `mk-cluster mk-cluster--${variant}`,
      iconSize: [size, size],
    });
  };
}

function pointIcon(b, variant) {
  if (b.destaque || variant === 'explorar') {
    return L.divIcon({ html: PIN_SVG, className: 'mk-pin', iconSize: [40, 52], iconAnchor: [20, 50] });
  }
  return L.divIcon({ html: '<i></i>', className: 'mk-dot', iconSize: [14, 14] });
}

/**
 * @param {HTMLElement} container
 * @param {{ variant: 'explorar'|'mapa', onSelect?: (b) => void, zoom?: number, center?: [number, number], bottomInset?: () => number }} opts
 *   bottomInset: px cobertos por painéis na base — o centro é deslocado para a área visível.
 */
export function AcaiMap(container, { variant = 'explorar', onSelect, zoom, center, bottomInset = () => 0 } = {}) {
  container.classList.add('acai-map', `acai-map--${variant}`);
  if (CONFIG.map.tileClass) container.classList.add(CONFIG.map.tileClass);

  if (!window.L) {
    container.innerHTML = `<div class="map-fallback"><strong>Mapa indisponível</strong><span>Conecte-se à internet para carregar o mapa de Belém.</span></div>`;
    return { setPoints() {}, showUser() {}, focus() {}, invalidate() {}, fitAll() {} };
  }

  const map = L.map(container, {
    zoomControl: false,
    attributionControl: true,
    minZoom: CONFIG.map.minZoom,
    maxZoom: CONFIG.map.maxZoom,
    zoomSnap: 0.25,
  }).setView(center || CONFIG.map.center, zoom ?? CONFIG.map.zoom);
  // A tela é montada fora do DOM; o Leaflet força position:relative nesse caso.
  container.style.position = 'absolute';

  map.attributionControl.setPrefix(false);
  L.tileLayer(CONFIG.map.tiles, { attribution: CONFIG.map.attribution, subdomains: CONFIG.map.subdomains, maxZoom: 19 }).addTo(map);

  const group = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    maxClusterRadius: variant === 'explorar' ? 70 : 55,
    chunkedLoading: true,
    iconCreateFunction: clusterIcon(variant),
  });
  map.addLayer(group);

  let userMarker = null;
  let sized = false;
  const byId = new Map();

  function setPoints(list) {
    group.clearLayers();
    byId.clear();
    const markers = list.map((b) => {
      const m = L.marker([b.lat, b.lon], {
        icon: pointIcon(b, variant),
        title: b.nome,
        keyboard: true,
        riseOnHover: true,
        zIndexOffset: b.destaque ? 500 : 0,
      });
      m.on('click', () => onSelect?.(b));
      byId.set(b.id, m);
      return m;
    });
    group.addLayers(markers);
  }

  function showUser(pos) {
    if (!pos) return;
    const ll = [pos.lat, pos.lon];
    if (!userMarker) {
      userMarker = L.marker(ll, {
        icon: L.divIcon({ className: 'mk-user', html: '<i></i>', iconSize: [22, 22] }),
        interactive: false, zIndexOffset: 1000,
      }).addTo(map);
    } else userMarker.setLatLng(ll);
    map.flyTo(ll, Math.max(map.getZoom(), 15), { duration: 0.8 });
  }

  function focus(b, z = 16) {
    const m = byId.get(b.id);
    if (m) group.zoomToShowLayer(m, () => map.panTo([b.lat, b.lon]));
    else map.flyTo([b.lat, b.lon], z, { duration: 0.6 });
  }

  return {
    map,
    setPoints,
    showUser,
    focus,
    // Na primeira exibição o container tinha 0px: recalcula e recentraliza.
    invalidate() {
      const wasEmpty = !sized;
      map.invalidateSize({ pan: false });
      sized = container.clientHeight > 0;
      if (wasEmpty && sized) {
        map.setView(center || CONFIG.map.center, zoom ?? CONFIG.map.zoom, { animate: false });
        map.panBy([0, bottomInset() / 2], { animate: false });
      }
    },
    fitAll: () => map.setView(center || CONFIG.map.center, zoom ?? CONFIG.map.zoom),
  };
}
