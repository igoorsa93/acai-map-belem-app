// TELA 2 — Perfil do batedor.
import { el, esc, fmtRatingDot, isOpenNow, directionsUrl, toast } from '../utils.js';
import { icon } from '../components/Icons.js';
import { ReviewCard } from '../components/Common.js';
import { IconStatRow } from '../components/IconStatRow.js';
import { BatedorPhoto, StatusBadge } from '../components/BatedorCard.js';
import { repo } from '../data/repository.js';
import { store } from '../store.js';

const mapsLink = (b) => b.link || `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lon}`;

export function BatedorScreen(id) {
  const b = repo.byId(id);
  if (!b) {
    const r = el(`<section class="screen screen--push screen--detail"><div class="empty-page">
      <p>Batedor não encontrado.</p><a class="btn-lime" href="#/explorar">Voltar ao início</a></div></section>`);
    return { root: r };
  }

  const aberto = isOpenNow(b.horario);
  const fav = () => store.get().favorites.has(b.id);
  const cityLine = b.cidade === b.bairro ? `${b.cidade} - PA` : `${b.bairro} · ${b.cidade} - PA`;

  const info = [
    b.horario && { ico: 'clock', label: 'Horário de funcionamento', value: `${b.horario.abre} - ${b.horario.fecha}` },
    b.precoFaixa && { ico: 'dollar', label: 'Preço médio do litro', value: b.precoFaixa },
    b.tipoAcai && { ico: 'leaf', label: 'Tipo de açaí', value: b.tipoAcai },
    { ico: 'pin', label: 'Endereço', value: b.endereco, sub: b.enderecoLinha2 || '' },
  ].filter(Boolean);

  const reviews = b.avaliacoes || [];

  const root = el(`<section class="screen screen--push screen--detail" aria-label="${esc(b.nome)}">
    <div class="detail__top">
      <button type="button" class="btn-glass" data-action="back" aria-label="Voltar">${icon('chevronLeft', { size: 24, stroke: 2.4 })}</button>
      <div class="detail__top-right">
        <button type="button" class="btn-glass" data-action="fav" aria-pressed="${fav()}" aria-label="Favoritar">${icon('heart', { size: 22, stroke: 2.2 })}</button>
        <button type="button" class="btn-glass" data-action="menu" aria-haspopup="menu" aria-label="Mais opções">${icon('more', { size: 22 })}</button>
      </div>
      <ul class="menu" role="menu" hidden>
        <li><a role="menuitem" href="${esc(mapsLink(b))}" target="_blank" rel="noopener">${icon('external', { size: 18 })}Abrir no Google Maps</a></li>
        <li><button role="menuitem" type="button" data-action="copy">${icon('copy', { size: 18 })}Copiar endereço</button></li>
      </ul>
    </div>

    <div class="scroll-y detail__scroll">
      <div class="detail__hero">${BatedorPhoto(b, 'detail__img')}</div>

      <article class="detail__card">
        <header class="detail__head">
          <h1>${esc(b.nome)}</h1>
          ${StatusBadge(aberto, 'lime')}
        </header>
        <p class="detail__city">${esc(cityLine)}</p>
        <p class="detail__rating">${
          b.rating > 0
            ? `<span class="star">${icon('star', { size: 22 })}</span><strong>${fmtRatingDot(b.rating)}</strong><span>(${b.reviews} avaliações)</span>`
            : '<span>Ainda sem avaliações</span>'
        }</p>

        <ul class="tags">${b.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>

        <div class="actions">
          <a class="btn-lime" href="${directionsUrl(b)}" target="_blank" rel="noopener">${icon('navigation', { size: 20, stroke: 2.2 })}Como Chegar</a>
          <a class="btn-outline${b.telefone ? '' : ' is-disabled'}" ${b.telefone ? `href="tel:${esc(b.telefone)}"` : 'aria-disabled="true" data-action="nophone"'}>${icon('phone', { size: 19 })}Ligar</a>
          <button type="button" class="btn-outline" data-action="share">${icon('share', { size: 19 })}Compartilhar</button>
        </div>

        <section class="detail__section">
          <h2>Informações</h2>
          <ul class="stat-list">${info.map(IconStatRow).join('')}</ul>
        </section>

        <section class="detail__section">
          <div class="section-head">
            <h2>Avaliações dos clientes</h2>
            ${reviews.length > 1 ? `<button type="button" class="link" data-action="all">Ver todas ${icon('chevronRight', { size: 16, stroke: 2.4 })}</button>` : ''}
          </div>
          <div class="reviews">${
            reviews.length
              ? reviews.map((r, i) => (i < 2 ? ReviewCard(r) : ReviewCard(r).replace('<article class="review"', '<article class="review" hidden'))).join('')
              : `<p class="empty-note">Ainda não há avaliações escritas por aqui. <a href="${esc(mapsLink(b))}" target="_blank" rel="noopener">Ver no Google Maps</a></p>`
          }</div>
        </section>
      </article>
    </div>
  </section>`);

  const menu = root.querySelector('.menu');

  root.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-action]');
    if (!menu.hidden && !e.target.closest('.menu, [data-action="menu"]')) menu.hidden = true;
    if (!t) return;
    switch (t.dataset.action) {
      case 'back':
        history.length > 1 ? history.back() : (location.hash = '#/explorar');
        break;
      case 'fav': {
        const on = store.toggleFavorite(b.id);
        t.setAttribute('aria-pressed', on);
        toast(on ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
        break;
      }
      case 'menu':
        menu.hidden = !menu.hidden;
        break;
      case 'copy':
        menu.hidden = true;
        try { await navigator.clipboard.writeText(`${b.endereco}${b.enderecoLinha2 ? `, ${b.enderecoLinha2}` : ''}`); toast('Endereço copiado'); }
        catch { toast('Não foi possível copiar'); }
        break;
      case 'nophone':
        e.preventDefault();
        toast('Telefone não informado');
        break;
      case 'share': {
        const data = { title: b.nome, text: `${b.nome} — ${cityLine} no Açaí Map Belém`, url: location.href };
        if (navigator.share) { try { await navigator.share(data); } catch { /* cancelado */ } }
        else { try { await navigator.clipboard.writeText(`${data.text}\n${data.url}`); toast('Link copiado'); } catch { toast('Não foi possível compartilhar'); } }
        break;
      }
      case 'all':
        root.querySelectorAll('.review[hidden]').forEach((r) => (r.hidden = false));
        t.remove();
        break;
    }
  });

  return { root };
}
