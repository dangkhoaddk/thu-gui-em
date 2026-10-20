// 3. Những miền ký ức — vòng tròn desktop + dải vuốt mobile + modal phim cưới.
import { $, $$, esc, toneFor, imgOrPh, lazyVideo, ICON } from './utils.js';
import { openPlayer } from './player.js';

const VIDEO = 'video/wedding.mp4';
const POSTER = 'video/wedding-poster.jpg';
const CX = 720, CY = 540, R = 290, R2 = 446;
const rad = (d) => d * Math.PI / 180;

export function initUniverse(cats, { openGallery, filmTitle = 'Lời hứa của anh !' }) {
  const section = $('#universe');
  const N = cats.length;

  // ---------- Hình học (chép từ Universe.dc.html → renderVals) ----------
  const geo = cats.map((c, i) => {
    const a = -126 + (360 / N) * i;
    const t = rad(a), dx = Math.cos(t), dy = Math.sin(t);
    const sx = CX + 142 * dx, sy = CY + 142 * dy, ex = CX + (R - 30) * dx, ey = CY + (R - 30) * dy;
    const mx = (sx + ex) / 2 - dy * 34, my = (sy + ey) / 2 + dx * 34;
    const n = Math.min(5, Math.max(c.images.length, c.images.length ? 1 : 5));
    const fan = Array.from({ length: n }, (_, k) => {
      const s = (k - (n - 1) / 2) * 12, u = rad(a + s);
      return { x: Math.round(CX + R2 * Math.cos(u) - 54), y: Math.round(CY + R2 * Math.sin(u) - 64), rot: s * 0.9 + (k % 2 ? 4 : -3), delay: (0.2 + k * 0.07).toFixed(2) };
    });
    return {
      x: Math.round(CX + R * dx - 104), y: Math.round(CY + R * dy - 40), delay: (-i * 1.3).toFixed(1),
      thread: `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
      fan, tone: toneFor(c.slug, i)
    };
  });

  const filmFace = () => `<span class="film-face"><span class="film-play">${ICON.play}</span><span class="film-title">${esc(filmTitle)}</span><span class="film-sub">Xem phim cưới</span></span>`;

  // ---------- Desktop ----------
  const desk = $('.uni-desk', section);
  desk.innerHTML = `
    <div class="uni-stage">
      <div class="uni-head"><span class="rule" aria-hidden="true"></span><h2 id="uni-title">Những miền ký ức</h2><span class="rule" aria-hidden="true"></span></div>
      <div class="uni-ring" aria-hidden="true"></div>
      <svg class="uni-threads" aria-hidden="true" width="1440" height="1080" viewBox="0 0 1440 1080"></svg>
      <button type="button" class="film-btn" aria-label="Xem phim: ${esc(filmTitle)}">
        <video muted loop playsinline preload="none" poster="${POSTER}" aria-hidden="true" tabindex="-1"></video>
        ${filmFace()}
      </button>
      <div class="uni-cap" aria-live="polite"></div>
      ${cats.map((c, i) => `
        <div class="float" style="left:${geo[i].x}px;top:${geo[i].y}px;animation-delay:${geo[i].delay}s">
          <button type="button" class="card" data-i="${i}" aria-label="${esc(c.title)}, ${c.images.length} ảnh — mở gallery">
            <span class="card-img">${imgOrPh(c, 0, geo[i].tone, 'Ảnh bìa ' + c.title)}</span>
            <span class="card-text"><span class="card-title">${esc(c.title)}</span><span class="card-count">${c.images.length} ảnh</span></span>
          </button>
        </div>`).join('')}
      <div class="uni-fan" aria-hidden="true"></div>
    </div>`;

  const stage = $('.uni-stage', desk);
  const threads = $('.uni-threads', desk);
  const cap = $('.uni-cap', desk);
  const fanBox = $('.uni-fan', desk);
  const cards = $$('.card', desk);
  let active = -1;

  const hint = '<p class="uni-hint">Rê chuột vào một miền ký ức · bấm để mở</p>';
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    cards.forEach((c, k) => c.classList.toggle('is-dim', i >= 0 && k !== i));
    if (i < 0) { threads.innerHTML = ''; fanBox.innerHTML = ''; cap.innerHTML = hint; return; }
    const c = cats[i], g = geo[i];
    threads.innerHTML = `<path class="thread" pathLength="1" d="${g.thread}" fill="none" stroke="#A3243B" stroke-width="1.3" stroke-linecap="round"/>`;
    fanBox.innerHTML = g.fan.map((p, k) => `
      <div class="fan" style="left:${p.x}px;top:${p.y}px;transform:rotate(${p.rot}deg);animation-delay:${p.delay}s">
        <div class="fan-img">${imgOrPh(c, k, g.tone, '', { eager: true })}</div>
      </div>`).join('');
    cap.innerHTML = `<div class="cap"><p class="cap-title">${esc(c.title)}</p><p class="cap-text">${esc(c.caption)}</p></div>`;
  };
  cap.innerHTML = hint;

  // Cảm ứng: chạm lần 1 = hover, chạm lần 2 = mở gallery
  let touchTap = false, wasActive = false;
  cards.forEach((card) => {
    const i = +card.dataset.i;
    card.addEventListener('pointerdown', (e) => { touchTap = e.pointerType === 'touch'; wasActive = active === i; });
    card.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') setActive(i); });
    card.addEventListener('focus', () => setActive(i));
    card.addEventListener('click', () => {
      const touch = touchTap;
      touchTap = false;
      if (touch && !wasActive) { setActive(i); return; }
      openGallery(i, card);
    });
  });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') setActive(-1); });
  stage.addEventListener('focusout', (e) => { if (!stage.contains(e.relatedTarget)) setActive(-1); });

  // Thu phóng sân khấu 1440×1080 theo bề rộng
  const fit = () => section.style.setProperty('--uni-s', Math.min(1, document.documentElement.clientWidth / 1440));
  fit();
  addEventListener('resize', fit);

  // ---------- Mobile / tablet ----------
  const mob = $('.uni-mob', section);
  mob.innerHTML = `
    <div class="uni-mhead"><span class="rule" aria-hidden="true"></span><h2>Những miền ký ức</h2><span class="rule" aria-hidden="true"></span></div>
    <div class="uni-mfilm">
      <button type="button" class="film-btn" aria-label="Xem phim: ${esc(filmTitle)}">
        <video muted loop playsinline preload="none" poster="${POSTER}" aria-hidden="true" tabindex="-1"></video>
        ${filmFace()}
      </button>
      <p>Chạm để xem lời hứa của anh</p>
    </div>
    <div class="uni-mrow"><p class="uni-mcount">${N} miền ký ức</p><p class="uni-mswipe">Vuốt ngang ${ICON.arrowRight}</p></div>
    <div class="strip" data-scrollable>
      ${cats.map((c, i) => {
        const tone = geo[i].tone;
        const back = (k) => (c.images[k] ? k : 0);
        return `
        <button type="button" class="scard" data-i="${i}" aria-label="${esc(c.title)}, ${c.images.length} ảnh — mở gallery">
          <span class="stack">
            <span class="pola pola-1" aria-hidden="true"><span class="pola-img">${imgOrPh(c, back(2), tone, '')}</span></span>
            <span class="pola pola-2" aria-hidden="true"><span class="pola-img">${imgOrPh(c, back(1), tone, '')}</span></span>
            <span class="pola pola-3"><span class="pola-img">${imgOrPh(c, 0, tone, 'Ảnh bìa ' + c.title)}</span></span>
          </span>
          <span class="scard-title">${esc(c.title)}</span>
          <span class="scard-count">${c.images.length} ảnh</span>
          <span class="scard-cap">${esc(c.caption)}</span>
        </button>`;
      }).join('')}
    </div>
    <div class="dots" aria-hidden="true">${cats.map((_, i) => `<span class="${i ? '' : 'on'}"></span>`).join('')}</div>`;

  const strip = $('.strip', mob);
  const dots = $$('.dots span', mob);
  let raf = 0;
  strip.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const first = strip.firstElementChild;
      const step = first ? first.getBoundingClientRect().width + 18 : 258;
      const idx = Math.max(0, Math.min(N - 1, Math.round(strip.scrollLeft / step)));
      dots.forEach((d, k) => d.classList.toggle('on', k === idx));
    });
  }, { passive: true });
  $$('.scard', mob).forEach((b) => b.addEventListener('click', () => openGallery(+b.dataset.i, b)));

  // ---------- Video tròn + modal phim cưới ----------
  $$('.film-btn', section).forEach((btn) => {
    const v = $('video', btn);
    lazyVideo(v, VIDEO, () => btn.classList.remove('has-video'));
    v.addEventListener('playing', () => btn.classList.add('has-video'));
    btn.addEventListener('click', () => openPlayer({ src: VIDEO, poster: POSTER, title: filmTitle, trigger: btn }));
  });
}
