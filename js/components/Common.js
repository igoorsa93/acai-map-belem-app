// Peças menores reutilizadas entre telas.
import { esc, initials, fmtRatingDot } from '../utils.js';
import { icon } from './Icons.js';

/** Wordmark "AÇAÍ MAP / BELÉM". tone: 'dark' (texto roxo) | 'light' (texto branco). */
export function Logo({ tone = 'dark', inline = false } = {}) {
  return `<span class="logo logo--${tone}${inline ? ' logo--inline' : ''}">
    <img class="logo__mark" src="assets/logo-mark.svg" alt="" width="44" height="44" />
    <span class="logo__text"><b>AÇAÍ</b><b>MAP</b><small>BELÉM</small></span>
  </span>`;
}

/** Estrelas (0–5) com meia estrela. */
export function Stars(n, size = 16) {
  return `<span class="stars" aria-label="${fmtRatingDot(n)} de 5">${[1, 2, 3, 4, 5]
    .map((i) => {
      const fill = Math.max(0, Math.min(1, n - (i - 1)));
      return `<span class="stars__i" style="--f:${fill * 100}%">${icon('star', { size })}</span>`;
    })
    .join('')}</span>`;
}

export function ReviewCard(r) {
  return `<article class="review">
    <span class="avatar" aria-hidden="true">${esc(initials(r.autor))}</span>
    <div class="review__body">
      <header><strong>${esc(r.autor)}</strong><time>${esc(r.quando)}</time></header>
      <div class="review__rate">${Stars(r.nota, 15)}<span>${fmtRatingDot(r.nota)}</span></div>
      <p>${esc(r.texto)}</p>
    </div>
  </article>`;
}

/** Item do ranking (medalha 1/2/3 + nome + total + nota + seta). */
export function RankingItem(b, pos) {
  const medal = pos <= 3 ? `medal--${pos}` : 'medal--n';
  return `<li><button type="button" class="rank" data-bairro="${esc(b.nome)}">
    <span class="medal ${medal}">${pos}</span>
    <span class="rank__txt"><strong>${esc(b.nome)}</strong><small>${b.total} batedores</small></span>
    <span class="rank__rate">${b.nota ? `${icon('star', { size: 18 })}${fmtRatingDot(b.nota)}` : ''}</span>
    ${icon('chevronRight', { size: 18, cls: 'rank__chev' })}
  </button></li>`;
}

/** Header escuro das telas analíticas (Bairros / Estatísticas). */
export function DarkHeader({ title, subtitle, right = '' }) {
  return `<header class="dark-header">
    <div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>
    ${right}
  </header>`;
}
