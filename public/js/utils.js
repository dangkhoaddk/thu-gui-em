// Tiện ích dùng chung.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isMobile = () => matchMedia('(max-width: 767px)').matches;
export const isDesktop = () => matchMedia('(min-width: 1024px)').matches;

// Hàm giả ngẫu nhiên y như canvas (để vị trí bụi / tim giống hệt thiết kế).
export const rnd = (i, n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;

// Tông màu placeholder theo canvas.
const TONES = { 'hen-ho': '#DCC9B6', 'hue-hoi-an': '#C9A0A0', 'ninh-binh': '#CDBF9E', 'thai-lan': '#D7B49C', 'anh-cuoi': '#E2BDB9' };
const TONE_LIST = ['#DCC9B6', '#C9A0A0', '#CDBF9E', '#D7B49C', '#E2BDB9'];
export const toneFor = (slug, i) => TONES[slug] || TONE_LIST[i % TONE_LIST.length];

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const pad2 = (n) => String(n).padStart(2, '0');

// "2024-05-20" → "20.05.2024"; placeholder giữ nguyên.
export function formatDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s ?? ''));
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(s ?? '');
}
export const validDate = (s) => /^\d{4}-\d{2}-\d{2}/.test(String(s ?? '')) && !isNaN(new Date(s).getTime());

// Ảnh nhỏ (thumb) nếu có, ngược lại ảnh gốc.
export const thumbOf = (cat, i) => (cat.thumbs && cat.thumbs[i]) || cat.images[i];
export const dimsOf = (cat, i) => (cat.dims && cat.dims[i]) || null;

// Ô ảnh hoặc placeholder sọc chéo.
export function imgOrPh(cat, i, tone, alt, { cls = 'cover', eager = false } = {}) {
  const src = cat && cat.images[i] ? thumbOf(cat, i) : null;
  if (!src) return `<span class="ph ${cls}" role="img" aria-label="${esc(alt)}" style="display:block;background-color:${tone}"></span>`;
  const d = dimsOf(cat, i);
  const wh = d ? ` width="${d[0]}" height="${d[1]}"` : '';
  return `<img class="${cls}" src="${src}" alt="${esc(alt)}"${wh} loading="${eager ? 'eager' : 'lazy'}" decoding="async" style="background-color:${tone}">`;
}

// ---- khoá cuộn (đếm số lớp modal đang mở) ----
let locks = 0, blockers = null;
const stop = (e) => { if (!e.target.closest || !e.target.closest('[data-scrollable]')) e.preventDefault(); };
export function lockScroll({ hard = false } = {}) {
  locks++;
  document.documentElement.classList.add('is-locked');
  if (hard && !blockers) {
    blockers = true;
    addEventListener('wheel', stop, { passive: false });
    addEventListener('touchmove', stop, { passive: false });
  }
}
export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (blockers) { removeEventListener('wheel', stop); removeEventListener('touchmove', stop); blockers = null; }
  if (!locks) document.documentElement.classList.remove('is-locked');
}

// ---- focus trap ----
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, video[controls], [tabindex]:not([tabindex="-1"])';
export function trapFocus(container) {
  const onKey = (e) => {
    if (e.key !== 'Tab') return;
    const items = $$(FOCUSABLE, container).filter((n) => n.offsetParent !== null || n === document.activeElement);
    if (!items.length) { e.preventDefault(); return; }
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
  };
  container.addEventListener('keydown', onKey);
  return () => container.removeEventListener('keydown', onKey);
}

// Đóng modal bằng hiệu ứng mờ rồi ẩn.
export function fadeOut(node, done) {
  if (reducedMotion()) { done(); return; }
  node.classList.remove('fade-in');
  node.classList.add('is-closing');
  setTimeout(() => { node.classList.remove('is-closing'); done(); }, 300);
}

// Video tự phát khi nằm trong màn hình và đang hiển thị; nạp src lười.
export function lazyVideo(video, src, onFail) {
  const fail = () => onFail && onFail();
  video.addEventListener('error', fail, true);
  const io = new IntersectionObserver(([en]) => {
    const visible = en.isIntersecting && video.offsetParent !== null;
    if (visible) {
      if (!video.getAttribute('src')) { video.src = src; }
      video.play().catch(() => {});
    } else if (!video.paused) video.pause();
  }, { rootMargin: '200px' });
  io.observe(video);
  return io;
}

export const ICON = {
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M10 8.5v7l5.5-3.5z" fill="currentColor"/></svg>',
  heartLine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  heartFill: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5-8-11.2A4.6 4.6 0 0 1 12 6.8a4.6 4.6 0 0 1 8 3c0 6.2-8 11.2-8 11.2z" fill="currentColor"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};
