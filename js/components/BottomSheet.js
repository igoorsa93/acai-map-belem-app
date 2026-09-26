/**
 * Bottom sheet arrastável com 3 pontos de parada e scroll interno independente.
 *
 *  - Arrasto pelo cabeçalho (puxador + título) com mouse ou toque.
 *  - Na lista: enquanto a sheet não está expandida, arrastar move a sheet;
 *    expandida, a lista rola normalmente e, ao puxar para baixo com scrollTop = 0,
 *    a sheet volta a descer.
 *
 * snaps(): { collapsed, mid, expanded } → altura VISÍVEL em px de cada estado.
 */
export function BottomSheet(sheet, { header, scroller, snaps, initial = 'mid', onChange }) {
  let state = initial;
  let visible = 0;
  let maxH = 0;
  let drag = null;
  let moved = false; // evita que o clique no puxador dispare após um arrasto

  const order = ['collapsed', 'mid', 'expanded'];
  const clampV = (v) => { const s = snaps(); return Math.max(s.collapsed - 40, Math.min(s.expanded, v)); };

  function apply(v, animate) {
    visible = v;
    sheet.style.transition = animate ? 'transform .38s cubic-bezier(.22,1,.36,1)' : 'none';
    sheet.style.transform = `translate3d(0, ${maxH - v}px, 0)`;
    onChange?.(state, v);
  }

  function snapTo(next, animate = true) {
    state = next;
    sheet.dataset.state = next;
    scroller.classList.toggle('is-locked', next !== 'expanded');
    apply(snaps()[next], animate);
  }

  function layout() {
    maxH = snaps().expanded;
    sheet.style.height = `${maxH}px`;
    snapTo(state, false);
  }

  // ----- arrasto genérico -----
  const start = (y) => { moved = false; drag = { y0: y, v0: visible, t: performance.now(), lastY: y, vel: 0 }; };
  const move = (y) => {
    if (!drag) return;
    const now = performance.now();
    drag.vel = (drag.lastY - y) / Math.max(1, now - drag.t); // px/ms (+ = para cima)
    drag.t = now; drag.lastY = y;
    if (Math.abs(drag.y0 - y) > 5) moved = true;
    apply(clampV(drag.v0 + (drag.y0 - y)), false);
  };
  const end = () => {
    if (!drag) return;
    const s = snaps();
    const { vel } = drag;
    drag = null;
    let target;
    if (Math.abs(vel) > 0.45) {
      const i = order.indexOf(state);
      const cur = order.reduce((best, k) => (Math.abs(s[k] - visible) < Math.abs(s[best] - visible) ? k : best), state);
      const base = Math.abs(s[cur] - visible) < 24 ? order.indexOf(cur) : i;
      target = order[Math.max(0, Math.min(2, base + (vel > 0 ? 1 : -1)))];
      if (vel > 0 && s[target] < visible) target = 'expanded';
      if (vel < 0 && s[target] > visible) target = 'collapsed';
    } else {
      target = order.reduce((best, k) => (Math.abs(s[k] - visible) < Math.abs(s[best] - visible) ? k : best), 'mid');
    }
    snapTo(target);
  };

  // Mouse / caneta no cabeçalho: pointer events com captura
  header.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.target.closest('button, a, input')) return;
    e.preventDefault(); // sem seleção de texto / drag nativo
    header.setPointerCapture(e.pointerId);
    start(e.clientY);
  });
  header.addEventListener('pointermove', (e) => e.pointerType !== 'touch' && drag && move(e.clientY));
  header.addEventListener('pointerup', (e) => e.pointerType !== 'touch' && end());
  header.addEventListener('pointercancel', (e) => e.pointerType !== 'touch' && end());
  sheet.addEventListener('dragstart', (e) => e.preventDefault());
  header.addEventListener('click', (e) => {
    if (!moved && e.target.closest('.sheet__handle')) snapTo(state === 'expanded' ? 'mid' : 'expanded');
  });

  // Toque: touch events (preventDefault condicional funciona igual no iOS e no Android)
  function bindTouch(target, canDrag) {
    let t = null;
    target.addEventListener('touchstart', (e) => {
      t = { y: e.touches[0].clientY, dragging: false };
    }, { passive: true });
    target.addEventListener('touchmove', (e) => {
      if (!t) return;
      const y = e.touches[0].clientY;
      if (!t.dragging && canDrag(y - t.y)) { t.dragging = true; start(t.y); }
      if (t.dragging) { e.preventDefault(); move(y); }
    }, { passive: false });
    const stop = () => { if (t?.dragging) end(); t = null; };
    target.addEventListener('touchend', stop);
    target.addEventListener('touchcancel', stop);
  }
  // Cabeçalho: sempre arrasta
  bindTouch(header, () => true);
  // Lista: arrasta enquanto não expandida, ou ao puxar para baixo com a lista no topo
  bindTouch(scroller, (dy) => state !== 'expanded' || (scroller.scrollTop <= 0 && dy > 4));

  // Mouse wheel / trackpad
  let wheelLock = 0;
  scroller.addEventListener('wheel', (e) => {
    const now = Date.now();
    if (state !== 'expanded' && e.deltaY > 0) {
      e.preventDefault();
      if (now > wheelLock) { snapTo(order[order.indexOf(state) + 1]); wheelLock = now + 450; }
    } else if (state === 'expanded' && scroller.scrollTop <= 0 && e.deltaY < -8 && now > wheelLock) {
      snapTo('mid'); wheelLock = now + 450;
    }
  }, { passive: false });

  const ro = new ResizeObserver(layout);
  ro.observe(sheet.parentElement);
  layout();

  return {
    snapTo,
    get state() { return state; },
    relayout: layout,
  };
}
