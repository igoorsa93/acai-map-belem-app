// Shell do app: roteamento por hash, cache de telas e service worker.
import { BottomNavigationBar } from './components/BottomNavigationBar.js';
import { ExplorarScreen } from './screens/ExplorarScreen.js';
import { MapaScreen } from './screens/MapaScreen.js';
import { BairrosScreen } from './screens/BairrosScreen.js';
import { EstatisticasScreen } from './screens/EstatisticasScreen.js';
import { BatedorScreen } from './screens/BatedorScreen.js';

const TAB_SCREENS = {
  explorar: ExplorarScreen,
  mapa: MapaScreen,
  bairros: BairrosScreen,
  estatisticas: EstatisticasScreen,
};

const host = document.getElementById('screens');
const nav = BottomNavigationBar(document.getElementById('bottom-nav'));
const cache = new Map();   // abas ficam montadas (preserva posição do mapa / scroll)
let current = null;
let pushed = null;         // tela empilhada (perfil)

function parse() {
  const [, name = 'explorar', ...rest] = location.hash.replace(/^#/, '').split('/');
  return { name, param: rest.length ? decodeURIComponent(rest.join('/')) : null };
}

function show(screen) {
  if (current && current !== screen) current.root.classList.remove('is-active');
  screen.root.classList.add('is-active');
  current = screen;
  screen.onShow?.();
}

function route() {
  const { name, param } = parse();

  if (pushed) { pushed.root.remove(); pushed = null; }

  if (name === 'batedor' && param) {
    pushed = BatedorScreen(param);
    host.appendChild(pushed.root);
    nav.setHidden(true);
    show(pushed);
    document.title = `${pushed.root.getAttribute('aria-label') || 'Batedor'} · Açaí Map Belém`;
    return;
  }

  const key = TAB_SCREENS[name] ? name : 'explorar';
  if (!cache.has(key)) {
    const s = TAB_SCREENS[key]();
    host.appendChild(s.root);
    cache.set(key, s);
  }
  nav.setHidden(false);
  nav.setActive(key);
  show(cache.get(key));
  document.title = 'Açaí Map Belém';
}

// Containers com overflow:hidden ainda podem ser rolados por focus()/scrollIntoView — trava-os.
const lockScroll = (el) => { el.scrollTop = 0; el.scrollLeft = 0; };
document.getElementById('app').addEventListener('scroll', (e) => lockScroll(e.currentTarget));
host.addEventListener('scroll', (e) => {
  if (e.target === host || e.target.classList?.contains('screen')) lockScroll(e.target);
}, true);

window.addEventListener('hashchange', route);
if (!location.hash) history.replaceState(null, '', '#/explorar');
route();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
