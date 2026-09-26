import { esc } from '../utils.js';
import { icon } from './Icons.js';

/** Linha de informação: [ícone] Título ........ Valor (+ linha secundária opcional). */
export function IconStatRow({ ico, label, value, sub = '' }) {
  return `<li class="stat-row">
    <span class="stat-row__icon">${icon(ico, { size: 20, stroke: 1.8 })}</span>
    <span class="stat-row__label">${esc(label)}</span>
    <span class="stat-row__value">${esc(value)}${sub ? `<small>${esc(sub)}</small>` : ''}</span>
  </li>`;
}
