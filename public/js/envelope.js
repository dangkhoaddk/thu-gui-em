// 1. Phong thư — overlay mở đầu (chép logic renderVals() của Main / M-Envelope).
import { $, rnd, isMobile, reducedMotion, lockScroll, unlockScroll, trapFocus, ICON } from './utils.js';

const COLS = ['#F2D4D2', '#E8B9B7', '#EBD3A0', '#FBF6EE', '#D98C97'];

export function initEnvelope(config, { onOpened, onRevealStart, onSealOpen = () => {} }) {
  const root = $('#envelope');
  if (!root) { onOpened(); return; }
  const stage = $('.env-stage', root);
  const letter = $('.env-letter', root);
  const seal = $('.seal', root);
  const reveal = $('.env-reveal', root);
  $('[data-letter]', root).textContent = config.letterLine;

  lockScroll({ hard: true });
  scrollTo(0, 0);
  const releaseTrap = trapFocus(root);

  // Bụi vàng: 26 hạt desktop / 16 mobile
  const mobile = isMobile();
  const n = mobile ? 16 : 26;
  let dust = '';
  for (let i = 0; i < n; i++) {
    const r = (k) => rnd(i, k);
    const s = (1.5 + r(3) * (mobile ? 2.5 : 3)).toFixed(1);
    dust += `<span class="dust" style="left:${(r(1) * 100).toFixed(1)}%;top:${(r(2) * 100).toFixed(1)}%;width:${s}px;height:${s}px;animation-delay:${(-r(4) * 14).toFixed(1)}s;animation-duration:${(10 + r(5) * 10).toFixed(1)}s"></span>`;
  }
  $('.env-dust', root).innerHTML = dust;

  // Bề rộng thật của dòng chữ đánh máy (để steps() khớp từng ký tự)
  const type = $('.type', root);
  const fitType = () => {
    const clone = type.cloneNode(true);
    clone.style.cssText = 'position:absolute;visibility:hidden;width:auto;animation:none;border:0';
    type.parentNode.appendChild(clone);
    type.style.setProperty('--type-w', clone.getBoundingClientRect().width / scale + 1.5 + 'px');
    clone.remove();
  };

  // Thu nhỏ sân khấu cho vừa màn hình thấp / hẹp
  let scale = 1;
  const fit = () => {
    const W = isMobile() ? 390 : 1440, H = isMobile() ? 844 : 900;
    scale = Math.min(1, innerHeight / H, isMobile() ? innerWidth / W : 1);
    stage.style.setProperty('--env-s', scale);
  };
  fit();
  addEventListener('resize', fit);
  if (document.fonts) document.fonts.ready.then(fitType); else fitType();

  let state = 0;
  const open = () => {
    if (state) return;
    state = 1;
    root.classList.add('is-open');
    onSealOpen();
    letter.inert = false;
    setTimeout(() => reveal.focus({ preventScroll: true }), reducedMotion() ? 0 : 1100);
  };

  const finish = () => {
    removeEventListener('resize', fit);
    releaseTrap();
    unlockScroll();
    root.remove();
    onOpened();
  };

  const doReveal = () => {
    if (state !== 1) return;
    state = 2;
    if (reducedMotion()) { onRevealStart(); finish(); return; }
    root.classList.add('is-revealed');

    // Tim bay: 30 desktop / 20 mobile
    const m = isMobile();
    const count = m ? 20 : 30;
    const cx = m ? 195 : 720, cy = m ? 390 : 470, spreadX = m ? 160 : 260, spreadY = m ? 60 : 80;
    let html = '';
    for (let i = 0; i < count; i++) {
      const sz = Math.round((m ? 10 : 12) + rnd(i, 7) * (m ? 20 : 26));
      const dx = Math.round((rnd(i, 8) - 0.5) * (m ? 380 : 1300));
      const dy = Math.round((m ? -220 : -260) - rnd(i, 9) * (m ? 360 : 420));
      const x = Math.round(cx + (rnd(i, 10) - 0.5) * spreadX - sz / 2);
      const y = Math.round(cy + (rnd(i, 11) - 0.5) * spreadY);
      const dur = (2 + rnd(i, 12) * 1.4).toFixed(2), delay = (rnd(i, 13) * 0.7).toFixed(2);
      html += `<span class="heart" style="left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;color:${COLS[i % 5]};--dx:${dx}px;--dy:${dy}px;--dur:${dur}s;--delay:${delay}s">${ICON.heartFill}</span>`;
    }
    const hearts = $('.hearts', root);
    hearts.innerHTML = html;
    setTimeout(() => hearts.querySelectorAll('.heart').forEach((h) => h.classList.add('go')), 50);

    // Overlay mờ dần (delay 2.1s, 1s) để lộ Hero ngay bên dưới
    requestAnimationFrame(() => root.classList.add('is-leaving'));
    setTimeout(onRevealStart, 2400);
    setTimeout(finish, 3200);
  };

  seal.addEventListener('click', open);
  reveal.addEventListener('click', doReveal);
}
