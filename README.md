# Açaí Map Belém — App mobile (PWA)

Interface mobile do Açaí Map Belém, feita a partir dos prints do design.
HTML, CSS e JavaScript puros (ES modules), sem etapa de build. É instalável como PWA.

## Rodar

```bash
python tools/serve.py        # http://localhost:5173  (servidor de dev sem cache)
```

Qualquer servidor estático serve. Abrir o `index.html` direto do disco (file://) não funciona, porque os ES modules não carregam assim.

| Rota | Tela |
|---|---|
| `#/explorar` | Tela 1: mapa, busca, chips e bottom sheet arrastável |
| `#/mapa` | Mapa em tela cheia com card flutuante e "Traçar Rota" |
| `#/batedor/:id` | Tela 2: perfil do batedor |
| `#/bairros` | Tela 3: ranking, donut, mapa de calor, insights e comparativo |
| `#/estatisticas` | KPIs, buscas mais comuns, favoritos e créditos |

## Dados

`js/config.js → dataSource`

- `mock` (padrão): textos, cards e estatísticas iguais aos prints (`js/data/mock.js`). Só 3 batedores aparecem nos prints; os outros 3 do mock são fictícios e servem para preencher a lista.
- `dashboard`: a lista e as estatísticas vêm de `data/dashboard_data.js` (`window.ACAI_DATA`, 780 locais). Também dá para ativar pela URL: `?dados=dashboard`.

O mapa sempre plota os 780 pontos reais quando o arquivo está carregado (`plotDashboardPointsOnMap`).
Os registros reais ainda não têm foto, preço nem horário. Por isso aparecem com um placeholder da marca e sem os badges "Aberto agora" e "R$/L". O app não inventa esses valores.

`js/data/repository.js` é o único ponto de acesso aos dados. Para trocar por uma API, basta reimplementar `batedores()`, `byId()`, `mapPoints()` e `stats()`.

Para atualizar os dados, copie o `dashboard_data.js` novo de `Açai Maps/acai-map-belem/web/data/` e regenere a geometria do mapa de calor:

```bash
npm i d3-delaunay && node tools/gen-bairros-geo.mjs
```

## Estrutura

```
css/tokens.css          design tokens (cores, tipografia, raios, sombras, camadas)
css/components.css      estilos dos componentes
css/screens.css         layout das telas
js/components/
  BottomNavigationBar   barra inferior fixa (pill ativa #39106E)
  BatedorCard           card da lista + StatusBadge + foto/placeholder
  PillFilter            chip + PillRow (seleção única ou múltipla)
  IconStatRow           linha ícone / título / valor
  BottomSheet           3 pontos de parada, arrasto por toque e mouse, scroll interno
  AcaiMap               Leaflet + clusters + estilo noturno
  Charts                DonutChart + HeatMap (SVG)
  FilterModal, Common   modal de filtros, logo, estrelas, review, ranking
js/screens/             uma tela por arquivo
sw.js                   offline: app shell network-first, tiles/CDN stale-while-revalidate
```

## Observações

- **Tiles do mapa:** o CARTO Dark passou a exigir chave de API. Por isso o app usa tiles OSM com um filtro CSS roxo (`.tiles--night`). Para produção com tráfego relevante, troque `CONFIG.map.tiles` por um provedor com chave (MapTiler, Stadia etc.).
- **Fotos:** vêm do Wikimedia Commons (CC BY / CC BY-SA). Os créditos ficam na aba Estatísticas e em `assets/fotos/CREDITOS.json`.
- **Status "Aberto agora":** é calculado pelo horário atual do aparelho. À noite os batedores do mock aparecem como "Fechado".
