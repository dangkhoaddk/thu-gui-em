// 3b. Gallery toàn màn hình (masonry) + nút Back của trình duyệt.
import { $, $$, esc, pad2, toneFor, thumbOf, lockScroll, unlockScroll, trapFocus, fadeOut, ICON } from './utils.js';
import { openLightbox, closeLightbox, lightboxOpen } from './lightbox.js';

// Chiều cao placeholder theo canvas (desktop / mobile)
const HS = [330, 230, 290, 370, 250, 310, 270, 350, 230, 300, 330, 260];
const HM = [220, 150, 180, 240, 160, 200, 170, 230, 150, 190, 220, 160];
const TONES_NB = ['#CDBF9E', '#C2B08C', '#D6C8AA', '#BFAE92', '#D9CDB4', '#C8B597'];

let cats = [];
let state = null; // { i, trigger, release, io }

export function initGallery(categories) {
  cats = categories;
  addEventListener('popstate', (e) => {
    const s = e.state || {};
    if (lightboxOpen() && s.lb == null) closeLightbox();
    if (state && s.g == null) closeNow();
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state && !lightboxOpen()) requestClose();
  });
}

export function openGallery(i, trigger) {
  if (state) return;
  const c = cats[i];
  const g = $('#gallery');
  const n = c.images.length;
  const tone = toneFor(c.slug, i);
  const tiles = n
    ? c.images.map((src, k) => {
        const d = c.dims && c.dims[k];
        const wh = d ? ` width="${d[0]}" height="${d[1]}"` : '';
        return `<button type="button" class="tile" data-k="${k}" style="--tone:${tone}" aria-label="Xem ảnh ${k + 1} trên ${n}">
          <img src="${thumbOf(c, k)}" alt="${esc(c.title)} — ảnh ${k + 1}"${wh} loading="lazy" decoding="async"></button>`;
      }).join('')
    : HS.map((h, k) => `<button type="button" class="tile ph" data-k="${k}" style="--tone:${TONES_NB[k % 6]};--h:${h}px;--hm:${HM[k]}px" aria-label="Xem ảnh ${k + 1} trên 12"></button>`).join('');

  g.innerHTML = `
    <button type="button" class="g-close" aria-label="Đóng gallery">${ICON.close}</button>
    <header class="g-head">
      <div class="g-head-main">
        <p class="g-eyebrow">Miền ký ức · ${pad2(i + 1)} / ${pad2(cats.length)}<span class="m-only"> · ${n} ảnh</span></p>
        <h2 id="g-title" class="g-title" tabindex="-1">${esc(c.title)}</h2>
        ${c.caption ? `<p class="g-cap">${esc(c.caption)}</p>` : ''}
      </div>
      <p class="g-count d-only">${n} tấm ảnh</p>
    </header>
    <div class="g-rule d-only" aria-hidden="true"></div>
    <div class="g-grid">${tiles}</div>
    <div class="g-fade" aria-hidden="true"></div>`;
  g.hidden = false;
  g.scrollTop = 0;
  g.classList.add('fade-in');
  lockScroll();
  history.pushState({ g: i }, '', '#' + encodeURIComponent(c.slug));

  // Hiện dần từng ô khi cuộn tới
  const io = new IntersectionObserver((entries) => {
    let k = 0;
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.style.animationDelay = (k++ * 0.06).toFixed(2) + 's';
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, { root: g, rootMargin: '0px 0px 80px 0px' });
  $$('.tile', g).forEach((t) => io.observe(t));

  $$('.tile', g).forEach((t) => t.addEventListener('click', () => {
    history.pushState({ g: i, lb: +t.dataset.k }, '', location.hash);
    openLightbox(c, i, +t.dataset.k, t, { onRequestClose: () => history.back() });
  }));
  $('.g-close', g).addEventListener('click', requestClose);

  state = { i, trigger, release: trapFocus(g), io };
  $('#g-title', g).focus({ preventScroll: true });
}

function requestClose() {
  if (history.state && history.state.g != null) history.back();
  else closeNow();
}

function closeNow() {
  if (!state) return;
  const { trigger, release, io } = state;
  state = null;
  io.disconnect();
  release();
  const g = $('#gallery');
  fadeOut(g, () => {
    g.hidden = true;
    g.innerHTML = '';
    unlockScroll();
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
  });
}
