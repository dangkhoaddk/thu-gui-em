// 2. Hero — video nền, lời chúc, bộ đếm thời gian thực.
import { $ } from './utils.js';

// Video nền chỉ được nạp khi cần (phong thư đang che Hero lúc đầu)
export function startHeroVideo() {
  const video = $('#hero video');
  if (!video || video.getAttribute('src')) return;
  video.src = video.dataset.src;
  video.preload = 'auto';
  video.play().catch(() => {});
}

export function initHero(config) {
  const hero = $('#hero');
  // Chữ mặc định đã có sẵn trong HTML (tránh layout shift); chỉ thay khi config khác
  const setText = (key, value) => { const n = $(`[data-hero="${key}"]`, hero); if (n.textContent !== value) n.textContent = value; };
  setText('script', config.hero.script);
  setText('title', config.hero.title);
  setText('message', config.hero.message);

  // Video lỗi / chưa có file → giữ nền placeholder như canvas
  const media = $('.hero-media', hero);
  const video = $('video', hero);
  const fail = () => media.classList.add('no-video');
  video.addEventListener('error', fail);

  // Bộ đếm (logic Hero.dc.html → renderVals)
  const nums = {
    days: $('[data-count="days"]', hero),
    hours: $('[data-count="hours"]', hero),
    minutes: $('[data-count="minutes"]', hero)
  };
  const start = new Date(config.metDate).getTime();
  const tick = () => {
    const now = Date.now();
    let diff = Math.max(0, now - (isNaN(start) ? now : start));
    const days = Math.floor(diff / 864e5); diff -= days * 864e5;
    const hours = Math.floor(diff / 36e5); diff -= hours * 36e5;
    const minutes = Math.floor(diff / 6e4);
    nums.days.textContent = days.toLocaleString('vi-VN');
    nums.hours.textContent = hours;
    nums.minutes.textContent = minutes;
  };
  tick();
  setInterval(tick, 15000);

  $('.scroll-btn', hero).addEventListener('click', () => {
    const target = $('#universe');
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
}
