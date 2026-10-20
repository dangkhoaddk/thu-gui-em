// Xem ảnh lớn — crossfade, ← →, vuốt, Esc, preload ảnh kế bên.
import { $, $$, esc, toneFor, trapFocus, fadeOut, reducedMotion, ICON } from './utils.js';

const DARK = ['#6E6450', '#5F5644', '#776B55', '#665B49', '#71654F', '#625846'];
let current = null;

export const lightboxOpen = () => !!current;

export function openLightbox(cat, catIndex, index, trigger, { onRequestClose }) {
  const lb = $('#lightbox');
  const total = cat.images.length || 12;
  lb.innerHTML = `
    <div class="lb-top">
      <p class="lb-title">${esc(cat.title)}</p>
      <p class="lb-num" aria-live="polite"></p>
      <div class="lb-top-end"><button type="button" class="round lb-close" aria-label="Đóng">${ICON.close}</button></div>
    </div>
    <div class="lb-stage">
      <button type="button" class="round lg lb-prev d-only" aria-label="Ảnh trước">${ICON.prev}</button>
      <div class="lb-frame"></div>
      <button type="button" class="round lg lb-next d-only" aria-label="Ảnh sau">${ICON.next}</button>
    </div>
    <div class="lb-bottom">
      <button type="button" class="round lb-prev m-only" aria-label="Ảnh trước">${ICON.prev}</button>
      <p class="lb-hint"><span class="d-only">← → để chuyển ảnh · Esc để đóng</span><span class="m-only">Vuốt để chuyển ảnh</span></p>
      <button type="button" class="round lb-next m-only" aria-label="Ảnh sau">${ICON.next}</button>
    </div>`;
  const frame = $('.lb-frame', lb);
  const num = $('.lb-num', lb);
  lb.hidden = false;
  lb.classList.add('fade-in');
  const release = trapFocus(lb);

  let idx = index, token = 0;
  const preload = (i) => { const src = cat.images[(i + total) % total]; if (src) { const im = new Image(); im.decoding = 'async'; im.src = src; } };

  const show = (i) => {
    idx = (i + total) % total;
    num.textContent = `${idx + 1} / ${total}`;
    const old = $$('.on', frame);
    let node;
    if (cat.images[idx]) {
      node = new Image();
      node.alt = `${cat.title} — ảnh ${idx + 1} trên ${total}`;
      node.decoding = 'async';
      node.draggable = false;
      const d = cat.dims && cat.dims[idx];
      if (d) { node.width = d[0]; node.height = d[1]; }
      node.src = cat.images[idx];
    } else {
      node = document.createElement('div');
      node.className = 'lb-ph ph-d';
      node.setAttribute('role', 'img');
      node.setAttribute('aria-label', `Ảnh ${idx + 1} của ${cat.title} (giữ chỗ)`);
      node.style.backgroundColor = DARK[idx % 6] || toneFor(cat.slug, catIndex);
    }
    frame.appendChild(node);
    const my = ++token;
    const swap = () => {
      if (my !== token) { node.remove(); return; }
      requestAnimationFrame(() => {
        node.classList.add('on');
        old.forEach((o) => { o.classList.remove('on'); setTimeout(() => o.remove(), reducedMotion() ? 0 : 460); });
      });
    };
    if (node.decode) node.decode().then(swap, swap); else swap();
    preload(idx + 1); preload(idx - 1);
  };

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onRequestClose(); }
  };
  addEventListener('keydown', onKey, true);
  $$('.lb-prev', lb).forEach((b) => b.addEventListener('click', () => show(idx - 1)));
  $$('.lb-next', lb).forEach((b) => b.addEventListener('click', () => show(idx + 1)));
  $('.lb-close', lb).addEventListener('click', onRequestClose);

  // Vuốt (pointer events, ngưỡng 50px)
  let sx = null, sy = 0;
  frame.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
  frame.addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
  });
  frame.addEventListener('pointercancel', () => { sx = null; });

  show(idx);
  $('.lb-close', lb).focus();

  current = () => {
    removeEventListener('keydown', onKey, true);
    release();
    current = null;
    fadeOut(lb, () => {
      lb.hidden = true;
      lb.innerHTML = '';
      if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
    });
  };
}

export function closeLightbox() { if (current) current(); }
