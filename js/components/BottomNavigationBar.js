import { icon } from './Icons.js';

export const TABS = [
  { key: 'explorar', label: 'Explorar', icon: 'compass', href: '#/explorar' },
  { key: 'mapa', label: 'Mapa', icon: 'map', href: '#/mapa' },
  { key: 'bairros', label: 'Bairros', icon: 'building', href: '#/bairros' },
  { key: 'estatisticas', label: 'Estatísticas', icon: 'chart', href: '#/estatisticas' },
];

/**
 * Barra inferior fixa. Retorna { el, setActive(key), setHidden(bool) }.
 */
export function BottomNavigationBar(root) {
  root.className = 'bottom-nav';
  root.setAttribute('aria-label', 'Navegação principal');
  root.innerHTML = TABS.map(
    (t) => `
    <a class="bottom-nav__item" href="${t.href}" data-tab="${t.key}">
      <span class="bottom-nav__icon">${icon(t.icon, { size: 26, stroke: 1.9 })}<i class="bottom-nav__dot" aria-hidden="true"></i></span>
      <span class="bottom-nav__label">${t.label}</span>
    </a>`,
  ).join('');

  return {
    el: root,
    setActive(key) {
      root.querySelectorAll('.bottom-nav__item').forEach((a) => {
        const on = a.dataset.tab === key;
        a.classList.toggle('is-active', on);
        on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
      });
    },
    setHidden(hidden) {
      root.classList.toggle('is-hidden', hidden);
      document.documentElement.classList.toggle('nav-hidden', hidden);
    },
  };
}
