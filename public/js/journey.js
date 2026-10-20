// 4. Hành trình & lời kết.
import { $, $$, esc, formatDate, validDate, toneFor, imgOrPh, isDesktop, ICON } from './utils.js';

const ROT_D = [-3, 2.5, -1.5, 3, -2];
const ROT_M = [-3, 2.5, -2, 3, -2.5];

export function initJourney(config, cats) {
  const section = $('#journey');

  // Sắp xếp theo ngày tăng dần (ngày còn placeholder giữ nguyên vị trí)
  const stops = config.journey
    .map((s, i) => ({ ...s, i }))
    .sort((a, b) => (validDate(a.date) && validDate(b.date) ? new Date(a.date) - new Date(b.date) || a.i - b.i : a.i - b.i));

  const items = stops.map((s, i) => {
    const ci = cats.findIndex((c) => c.slug === s.category);
    const cat = cats[ci];
    const tone = toneFor(s.category, ci < 0 ? i : ci);
    return `
      <li class="j-stop" style="--d:${(0.15 + i * 0.18).toFixed(2)}s;--gap:${i % 2 ? 76 : 22}px;--rot:${ROT_D[i % 5]}deg;--rot-m:${ROT_M[i % 5]}deg">
        <span class="j-node" aria-hidden="true"></span>
        <p class="j-date">${esc(formatDate(s.date))}</p>
        <div class="j-pola"><div class="j-img">${imgOrPh(cat, 0, tone, 'Ảnh mốc ' + s.place)}</div></div>
        <div class="j-text">
          <h3 class="j-place">${esc(s.place)}</h3>
          <p class="j-line-text">“${esc(s.line)}”</p>
        </div>
      </li>`;
  }).join('');

  section.innerHTML = `
    <div class="j-head">
      <p class="j-eyebrow">Từ ngày ấy đến hôm nay</p>
      <h2 id="journey-title" class="j-title">Hành trình của chúng mình</h2>
    </div>
    <div class="j-track">
      <div class="j-line" aria-hidden="true"></div>
      <ol class="j-list" style="--n:${stops.length}">${items}</ol>
    </div>
    <div class="ending">
      <div class="ornament" aria-hidden="true"><span></span>${ICON.heartLine}<span></span></div>
      <p class="end-line">${esc(config.ending)}</p>
      <div class="end-names">
        <p class="end-couple">${esc(config.husband)} &amp; ${esc(config.wife)}</p>
        <p class="end-date">${esc(formatDate(config.weddingDate))}</p>
      </div>
    </div>`;

  // Hiện dần khi cuộn tới: desktop cả hàng (stagger), mobile từng mốc
  const list = $('.j-list', section);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  if (isDesktop()) io.observe(list);
  else $$('.j-stop', section).forEach((li) => io.observe(li));
}
