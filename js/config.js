// Configuração central do app.
export const CONFIG = {
  /**
   * 'mock'      → textos, cards e estatísticas exatamente como nos prints do design.
   * 'dashboard' → lista e estatísticas calculadas a partir de window.ACAI_DATA
   *               (data/dashboard_data.js). Também pode ser forçado via ?dados=dashboard
   */
  dataSource: new URLSearchParams(location.search).get('dados') || 'mock',

  /** Os pontos reais do dashboard alimentam o mapa mesmo no modo mock (se carregados). */
  plotDashboardPointsOnMap: true,

  map: {
    center: [-1.4155, -48.4705],
    zoom: 12,
    minZoom: 10,
    maxZoom: 18,
    /**
     * Tiles OSM padrão, escurecidos e tingidos de roxo via CSS (classe .tiles--night).
     * Para produção com tráfego alto, troque por um provedor com chave
     * (ex.: MapTiler, Stadia, CARTO) e ajuste tileClass para '' se o estilo já for escuro.
     */
    tiles: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    tileClass: 'tiles--night',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
};
