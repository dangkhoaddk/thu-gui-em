// Trình phát phim "Lời hứa của anh !" — controls tuỳ biến, tua, âm lượng, toàn màn hình, phím tắt.
import { $, lockScroll, unlockScroll, trapFocus, fadeOut, esc, ICON } from './utils.js';

const I = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>',
  replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/></svg>',
  vol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  fs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>',
  fsExit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 7 6 12l5 5"/><path d="M18 7l-5 5 5 5"/></svg>',
  fwd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m13 7 5 5-5 5"/><path d="m6 7 5 5-5 5"/></svg>'
};

const fmt = (t) => {
  if (!isFinite(t)) t = 0;
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

export function openPlayer({ src, poster, title, trigger }) {
  const root = $('#film');
  root.innerHTML = `
    <div class="pl">
      <div class="pl-head">
        <div class="pl-heading">
          <p class="pl-eyebrow">Phim cưới</p>
          <h2 class="pl-title" id="pl-title">${esc(title)}</h2>
        </div>
        <button type="button" class="round pl-close" aria-label="Đóng video">${ICON.close}</button>
      </div>
      <div class="pl-box is-paused">
        <video playsinline preload="auto" poster="${poster}" src="${src}"></video>
        <div class="pl-spin" aria-hidden="true"></div>
        <button type="button" class="pl-big" aria-label="Phát">${I.play}</button>
        <div class="pl-bar">
          <div class="pl-track" role="slider" tabindex="0" aria-label="Tua video" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00">
            <div class="pl-rail"><div class="pl-buf"></div><div class="pl-fill"></div></div>
            <div class="pl-knob"></div>
            <div class="pl-tip" aria-hidden="true">0:00</div>
          </div>
          <div class="pl-row">
            <button type="button" class="pl-btn pl-toggle" aria-label="Phát">${I.play}</button>
            <button type="button" class="pl-btn pl-back d-only" aria-label="Lùi 10 giây">${I.back}</button>
            <button type="button" class="pl-btn pl-fwd d-only" aria-label="Tới 10 giây">${I.fwd}</button>
            <div class="pl-vol">
              <button type="button" class="pl-btn pl-mute" aria-label="Tắt tiếng">${I.vol}</button>
              <input class="pl-volume d-only" type="range" min="0" max="1" step="0.05" value="1" aria-label="Âm lượng">
            </div>
            <p class="pl-time"><span class="pl-cur">0:00</span><span class="pl-sep">/</span><span class="pl-dur">0:00</span></p>
            <button type="button" class="pl-btn pl-fs" aria-label="Toàn màn hình">${I.fs}</button>
          </div>
        </div>
      </div>
    </div>`;
  root.setAttribute('aria-labelledby', 'pl-title');
  root.removeAttribute('aria-label');
  root.hidden = false;
  root.classList.add('fade-in');
  lockScroll();
  const release = trapFocus(root);

  const box = $('.pl-box', root);
  const v = $('video', box);
  const track = $('.pl-track', box);
  const fill = $('.pl-fill', box), buf = $('.pl-buf', box), knob = $('.pl-knob', box), tip = $('.pl-tip', box);
  const toggle = $('.pl-toggle', box), big = $('.pl-big', box), muteBtn = $('.pl-mute', box), vol = $('.pl-volume', box), fsBtn = $('.pl-fs', box);
  const cur = $('.pl-cur', box), dur = $('.pl-dur', box);

  // ---- phát / dừng ----
  const playPause = () => (v.paused || v.ended ? v.play().catch(() => {}) : v.pause());
  const syncPlay = () => {
    const paused = v.paused;
    box.classList.toggle('is-paused', paused);
    box.classList.toggle('is-ended', v.ended);
    toggle.innerHTML = paused ? (v.ended ? I.replay : I.play) : I.pause;
    toggle.setAttribute('aria-label', paused ? (v.ended ? 'Xem lại' : 'Phát') : 'Tạm dừng');
    big.innerHTML = v.ended ? I.replay : I.play;
    big.setAttribute('aria-label', v.ended ? 'Xem lại' : 'Phát');
    if (paused) showUi(); else idleSoon();
  };
  ['play', 'pause', 'ended'].forEach((e) => v.addEventListener(e, syncPlay));
  big.addEventListener('click', playPause);
  toggle.addEventListener('click', playPause);
  v.addEventListener('click', () => { if (matchMedia('(hover: hover)').matches) playPause(); else toggleUi(); });
  v.addEventListener('dblclick', () => toggleFs());

  // ---- chờ tải ----
  v.addEventListener('waiting', () => box.classList.add('is-loading'));
  ['playing', 'canplay', 'pause'].forEach((e) => v.addEventListener(e, () => box.classList.remove('is-loading')));
  v.addEventListener('error', () => { box.classList.add('is-error'); box.classList.remove('is-loading'); });

  // ---- thời gian / tiến trình ----
  let scrubbing = false;
  const setProgress = (t) => {
    const p = v.duration ? Math.min(1, t / v.duration) : 0;
    fill.style.transform = `scaleX(${p})`;
    knob.style.left = p * 100 + '%';
    cur.textContent = fmt(t);
    track.setAttribute('aria-valuenow', Math.round(t));
    track.setAttribute('aria-valuetext', `${fmt(t)} / ${fmt(v.duration)}`);
  };
  v.addEventListener('loadedmetadata', () => { if (v.videoWidth) $('.pl', root).style.setProperty('--ar', v.videoWidth / v.videoHeight); dur.textContent = fmt(v.duration); track.setAttribute('aria-valuemax', Math.round(v.duration)); setProgress(v.currentTime); });
  v.addEventListener('timeupdate', () => { if (!scrubbing) setProgress(v.currentTime); });
  v.addEventListener('progress', () => {
    if (!v.duration || !v.buffered.length) return;
    buf.style.transform = `scaleX(${v.buffered.end(v.buffered.length - 1) / v.duration})`;
  });

  const ratioAt = (x) => { const r = track.getBoundingClientRect(); return Math.min(1, Math.max(0, (x - r.left) / r.width)); };
  track.addEventListener('pointermove', (e) => {
    const p = ratioAt(e.clientX);
    tip.textContent = fmt(p * (v.duration || 0));
    tip.style.left = p * 100 + '%';
    if (scrubbing) setProgress(p * v.duration);
  });
  track.addEventListener('pointerdown', (e) => {
    if (!v.duration) return;
    scrubbing = true;
    box.classList.add('is-scrubbing');
    track.setPointerCapture(e.pointerId);
    setProgress(ratioAt(e.clientX) * v.duration);
  });
  const endScrub = (e) => {
    if (!scrubbing) return;
    scrubbing = false;
    box.classList.remove('is-scrubbing');
    v.currentTime = ratioAt(e.clientX) * v.duration;
  };
  track.addEventListener('pointerup', endScrub);
  track.addEventListener('pointercancel', endScrub);
  const seek = (d) => { if (v.duration) { v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + d)); setProgress(v.currentTime); showUi(); } };
  track.addEventListener('keydown', (e) => {
    if (e.key === 'Home') { e.preventDefault(); v.currentTime = 0; }
    if (e.key === 'End') { e.preventDefault(); v.currentTime = v.duration || 0; }
  });
  $('.pl-back', box).addEventListener('click', () => seek(-10));
  $('.pl-fwd', box).addEventListener('click', () => seek(10));

  // ---- âm lượng ----
  const syncVol = () => {
    const muted = v.muted || v.volume === 0;
    muteBtn.innerHTML = muted ? I.mute : I.vol;
    muteBtn.setAttribute('aria-label', muted ? 'Bật tiếng' : 'Tắt tiếng');
    vol.value = muted ? 0 : v.volume;
    vol.style.setProperty('--v', (muted ? 0 : v.volume) * 100 + '%');
  };
  v.addEventListener('volumechange', syncVol);
  muteBtn.addEventListener('click', () => { if (v.volume === 0) v.volume = 1; v.muted = !v.muted; });
  vol.addEventListener('input', () => { v.volume = +vol.value; v.muted = +vol.value === 0; });
  syncVol();

  // ---- toàn màn hình ----
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const toggleFs = () => {
    if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else if (box.requestFullscreen) box.requestFullscreen().catch(() => {});
    else if (box.webkitRequestFullscreen) box.webkitRequestFullscreen();
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); // iOS
  };
  const syncFs = () => {
    const on = fsEl() === box;
    box.classList.toggle('is-fs', on);
    fsBtn.innerHTML = on ? I.fsExit : I.fs;
    fsBtn.setAttribute('aria-label', on ? 'Thoát toàn màn hình' : 'Toàn màn hình');
  };
  document.addEventListener('fullscreenchange', syncFs);
  document.addEventListener('webkitfullscreenchange', syncFs);
  fsBtn.addEventListener('click', toggleFs);

  // ---- tự ẩn thanh điều khiển ----
  let idleT = 0;
  const showUi = () => { box.classList.remove('is-idle'); idleSoon(); };
  const idleSoon = () => { clearTimeout(idleT); if (!v.paused) idleT = setTimeout(() => { const a = document.activeElement; if (!(box.contains(a) && a.matches(':focus-visible'))) box.classList.add('is-idle'); }, 2600); };
  const toggleUi = () => (box.classList.contains('is-idle') ? showUi() : box.classList.add('is-idle'));
  box.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') showUi(); });
  box.addEventListener('focusin', showUi);

  // ---- phím tắt ----
  const onKey = (e) => {
    if (e.target === vol) return;
    const k = e.key;
    if (k === 'Escape') { if (!fsEl()) { e.preventDefault(); close(); } return; }
    const onButton = e.target.closest && e.target.closest('button');
    if ((k === ' ' && !onButton) || k === 'k' || k === 'K') { e.preventDefault(); playPause(); showUi(); }
    else if (k === 'ArrowRight') { e.preventDefault(); seek(5); }
    else if (k === 'ArrowLeft') { e.preventDefault(); seek(-5); }
    else if (k === 'ArrowUp') { e.preventDefault(); v.muted = false; v.volume = Math.min(1, v.volume + 0.1); showUi(); }
    else if (k === 'ArrowDown') { e.preventDefault(); v.volume = Math.max(0, v.volume - 0.1); showUi(); }
    else if (k === 'm' || k === 'M') { v.muted = !v.muted; showUi(); }
    else if (k === 'f' || k === 'F') toggleFs();
  };
  addEventListener('keydown', onKey);

  // ---- đóng ----
  const close = () => {
    v.pause();
    clearTimeout(idleT);
    if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    removeEventListener('keydown', onKey);
    document.removeEventListener('fullscreenchange', syncFs);
    document.removeEventListener('webkitfullscreenchange', syncFs);
    release();
    fadeOut(root, () => {
      root.hidden = true;
      v.removeAttribute('src'); v.load();
      root.innerHTML = '';
      unlockScroll();
      if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
    });
  };
  $('.pl-close', root).addEventListener('click', close);
  root.onclick = (e) => { if (e.target === root || e.target.classList.contains('pl')) close(); };

  syncPlay();
  toggle.focus({ preventScroll: true });
  v.play().catch(() => {});
}
