import { esc, fmtRating, fmtKm, directionsUrl } from '../utils.js';
import { icon } from './Icons.js';

/** Foto do batedor ou placeholder da marca (registros reais ainda sem foto). */
export function BatedorPhoto(b, cls = '') {
  if (b.foto) return `<img class="${cls}" src="${esc(b.foto)}" alt="" loading="lazy" decoding="async" />`;
  return `<span class="${cls} photo-ph" aria-hidden="true"><img src="assets/logo-mark.svg" alt="" /><b>${esc(b.nome[0] || 'A')}</b></span>`;
}

/** Badge "Aberto agora" / "Fechado". aberto === null → sem horário cadastrado → não exibe. */
export function StatusBadge(aberto, variant = 'soft') {
  if (aberto == null) return '';
  return aberto
    ? `<span class="status status--open status--${variant}"><i></i>Aberto agora</span>`
    : `<span class="status status--closed status--${variant}"><i></i>Fechado</span>`;
}

/** Card da lista (Tela 1). Clique no card → perfil; botão Rotas → Google Maps. */
export function BatedorCard(b) {
  const hasRating = b.rating > 0;
  return `<article class="bcard" data-id="${esc(b.id)}">
    <a class="bcard__link" href="#/batedor/${encodeURIComponent(b.id)}" aria-label="Ver ${esc(b.nome)}"></a>
    ${BatedorPhoto(b, 'bcard__img')}
    <h3 class="bcard__name">${esc(b.nome)}</h3>
    <div class="bcard__badge">${StatusBadge(b.aberto)}</div>
    <p class="bcard__loc">${icon('pinSolid', { size: 18 })}<span>${esc(b.bairro)}</span>${
      b.distanciaKm != null ? `<em>· ${fmtKm(b.distanciaKm)}</em>` : ''
    }</p>
    <p class="bcard__rate">${
      hasRating
        ? `<span class="star">${icon('star', { size: 18 })}</span><strong>${fmtRating(b.rating)}</strong><span class="muted">(${b.reviews})</span>`
        : '<span class="muted">Sem avaliações</span>'
    }</p>
    <div class="bcard__price">${b.preco ? `<span class="price-badge">${esc(b.preco)}</span>` : ''}</div>
    <a class="btn-lime bcard__cta" href="${directionsUrl(b)}" target="_blank" rel="noopener" data-stop>
      Rotas ${icon('arrowRight', { size: 20, stroke: 2.4 })}
    </a>
  </article>`;
}
