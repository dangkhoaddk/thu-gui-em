// Khởi tạo trang.
import { CONFIG } from './config.js';
import { $ } from './utils.js';
import { initEnvelope } from './envelope.js';
import { initHero, startHeroSlides, prepareHeroSlides } from './hero.js';
import { initUniverse } from './universe.js';
import { initGallery, openGallery } from './gallery.js';
import { initJourney } from './journey.js';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);

// manifest.json do `npm run build` sinh ra; thiếu thì dùng config (placeholder)
async function loadCategories() {
  let manifest = [];
  try {
    const res = await fetch('manifest.json', { cache: 'no-cache' });
    if (res.ok) manifest = await res.json();
  } catch { /* chạy không có manifest */ }
  const bySlug = new Map(manifest.map((m) => [m.slug, m]));
  const list = CONFIG.categories.map((c) => {
    const m = bySlug.get(c.slug) || {};
    return { ...c, images: m.images || [], dims: m.dims || [], thumbs: m.thumbs || [] };
  });
  manifest.filter((m) => !CONFIG.categories.some((c) => c.slug === m.slug))
    .forEach((m) => list.push({ slug: m.slug, title: m.title, caption: m.caption || '', images: m.images || [], dims: m.dims || [], thumbs: m.thumbs || [] }));
  return list;
}

const main = $('#main');
initHero(CONFIG);
initEnvelope(CONFIG, {
  onSealOpen: prepareHeroSlides,
  onRevealStart: () => { document.documentElement.classList.add('hero-go'); startHeroSlides(); },
  onOpened: () => {
    startHeroSlides();
    document.documentElement.classList.add('hero-go');
    main.inert = false;
    $('#hero-title').focus({ preventScroll: true });
  }
});

const cats = await loadCategories();
initGallery(cats);
initUniverse(cats, { openGallery, filmTitle: CONFIG.filmTitle });
initJourney(CONFIG, cats);
