// 2. Hero — ảnh nền trình chiếu, lời chúc, bộ đếm thời gian thực.
import { $, reducedMotion } from './utils.js';

// Hướng trôi Ken Burns cho từng ảnh (luân phiên để không đơn điệu)
const DRIFT = [['-2%', '-1.5%'], ['2%', '-1%'], ['-1.5%', '1.5%'], ['1.5%', '1%']];

let slideshow = null;
export const startHeroSlides = () => slideshow && slideshow.start();
export const prepareHeroSlides = () => slideshow && slideshow.prepare();

export function initHero(config) {
  const hero = $('#hero');
  // Chữ mặc định đã có sẵn trong HTML (tránh layout shift); chỉ thay khi config khác
  const setText = (key, value) => { const n = $(`[data-hero="${key}"]`, hero); if (n.textContent !== value) n.textContent = value; };
  setText('script', config.hero.script);
  setText('title', config.hero.title);
  setText('message', config.hero.message);

  slideshow = initSlides(hero, config.heroSlides || [], (config.slideSeconds || 5) * 1000);

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
    $('#universe').scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
  });
}

function initSlides(hero, srcs, duration) {
  const box = $('.hero-slides', hero);
  const progress = $('.hero-progress', hero);
  const media = $('.hero-media', hero);
  if (!srcs.length) { box.innerHTML = ''; return null; }

  // Ảnh đầu đã có trong HTML; đồng bộ nếu config đổi ảnh đầu
  // Ảnh đầu đã có trong HTML (bản thumbnail để hiện nhanh) → nạp bản nét rồi thay vào
  const first = $('.slide img', box);
  const upgrade = () => {
    if (first.getAttribute('src') === srcs[0]) return;
    const hi = new Image();
    hi.src = srcs[0];
    (hi.decode ? hi.decode() : Promise.resolve()).then(() => { first.src = srcs[0]; }, () => {});
  };
  if (!first.getAttribute('src').includes('/thumbs/') && first.getAttribute('src') !== srcs[0]) first.src = srcs[0];
  first.addEventListener('error', () => media.classList.add('no-slides'), { once: true });

  const slides = [first.parentNode];
  for (let i = 1; i < srcs.length; i++) {
    const s = document.createElement('div');
    s.className = 'slide';
    s.innerHTML = '<img alt="" decoding="async">';
    box.appendChild(s);
    slides.push(s);
  }
  slides.forEach((s, i) => {
    s.style.setProperty('--kx', DRIFT[i % 4][0]);
    s.style.setProperty('--ky', DRIFT[i % 4][1]);
    s.style.setProperty('--kdur', duration / 1000 + 1.6 + 's');
  });
  if (srcs.length > 1) {
    progress.innerHTML = srcs.map(() => '<span><i></i></span>').join('');
    progress.style.setProperty('--dur', duration / 1000 + 's');
  }
  const bars = [...progress.children];

  // Nạp ảnh kế tiếp trước khi chuyển (chỉ nạp khi cần, không tải cả 9 ảnh ngay)
  const load = (i) => {
    const img = $('img', slides[i]);
    if (!img.getAttribute('src')) img.src = srcs[i];
    return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
  };

  let idx = 0, timer = 0, running = false, visible = true, started = false;
  const mark = () => bars.forEach((b, k) => { b.classList.toggle('done', k < idx); b.classList.toggle('on', k === idx); });

  const go = async (next) => {
    await load(next);
    if (!running) return;
    const prev = slides[idx];
    prev.classList.remove('on');
    prev.classList.add('prev');
    idx = next;
    const cur = slides[idx];
    cur.classList.remove('prev');
    void cur.offsetWidth; // khởi động lại Ken Burns
    cur.classList.add('on');
    setTimeout(() => prev.classList.remove('prev'), 1700);
    // reset thanh tiến trình
    bars.forEach((b) => { b.classList.remove('on'); });
    void progress.offsetWidth;
    mark();
    schedule();
    load((idx + 1) % srcs.length);
  };
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => go((idx + 1) % srcs.length), duration);
  };
  const play = () => {
    if (running || !started || !visible || document.hidden || srcs.length < 2 || reducedMotion()) return;
    running = true;
    hero.classList.add('slides-running');
    if (bars[idx]) { bars[idx].classList.remove('on'); void progress.offsetWidth; }
    mark();
    schedule();
  };
  const pause = () => {
    running = false;
    clearTimeout(timer);
    hero.classList.remove('slides-running');
  };

  new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? play() : pause(); }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));

  return {
    // gọi khi bấm con dấu: phong thư còn che Hero vài giây, đủ để nạp ảnh nét
    prepare() { upgrade(); if (srcs.length > 1) load(1); },
    start() {
      upgrade();
      if (started) return;
      started = true;
      mark();
      // khởi động lại Ken Burns của ảnh đầu từ lúc Hero lộ ra
      slides[0].classList.remove('on'); void slides[0].offsetWidth; slides[0].classList.add('on');
      if (srcs.length > 1) load(1);
      play();
    }
  };
}
