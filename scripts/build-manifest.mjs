// Quét public/images/<slug>/ → public/manifest.json (chạy bởi `npm run build`).
// Không dùng dependency: kích thước ảnh đọc trực tiếp từ header JPEG / PNG / WebP.
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const IMAGES = join(PUBLIC, 'images');
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const { CONFIG } = await import(pathToFileURL(join(PUBLIC, 'js', 'config.js')).href);

// ---------- đọc kích thước ảnh ----------
function jpegOrientation(buf, start, len) {
  // APP1 "Exif\0\0" + TIFF header (APP1 khác, ví dụ XMP, trả về null)
  if (buf.toString('ascii', start, start + 4) !== 'Exif') return null;
  const t = start + 6;
  const le = buf.toString('ascii', t, t + 2) === 'II';
  const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const ifd = t + u32(t + 4);
  if (ifd + 2 > start + len) return 1;
  const n = u16(ifd);
  for (let i = 0; i < n; i++) {
    const e = ifd + 2 + i * 12;
    if (e + 12 > buf.length) break;
    if (u16(e) === 0x0112) return u16(e + 8);
  }
  return 1;
}

function jpegSize(buf) {
  let o = 2, orient = 1;
  while (o + 9 < buf.length) {
    if (buf[o] !== 0xff) { o++; continue; }
    const m = buf[o + 1];
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7) || m === 0x01 || m === 0xff) { o += m === 0xff ? 1 : 2; continue; }
    const len = buf.readUInt16BE(o + 2);
    if (m === 0xe1) orient = jpegOrientation(buf, o + 4, len - 2) ?? orient;
    if ((m >= 0xc0 && m <= 0xc3) || (m >= 0xc5 && m <= 0xc7) || (m >= 0xc9 && m <= 0xcb) || (m >= 0xcd && m <= 0xcf)) {
      const h = buf.readUInt16BE(o + 5), w = buf.readUInt16BE(o + 7);
      return orient >= 5 && orient <= 8 ? [h, w] : [w, h];
    }
    o += 2 + len;
  }
  return null;
}

function imageSize(buf) {
  try {
    if (buf[0] === 0xff && buf[1] === 0xd8) return jpegSize(buf);
    if (buf.toString('ascii', 1, 4) === 'PNG') return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
    if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      const kind = buf.toString('ascii', 12, 16);
      if (kind === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
      if (kind === 'VP8L') {
        const b = buf.readUInt32LE(21);
        return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1];
      }
      if (kind === 'VP8X') return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
    }
  } catch { /* bỏ qua */ }
  return null;
}

// ---------- quét thư mục ----------
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const url = (...parts) => '/' + parts.map(encodeURIComponent).join('/');

async function scan(slug) {
  const dir = join(IMAGES, slug);
  const files = (await readdir(dir))
    .filter((f) => !f.startsWith('.') && EXTS.has(extname(f).toLowerCase()))
    .sort(collator.compare);
  const images = [], dims = [], thumbs = [];
  for (const f of files) {
    images.push(url('images', slug, f));
    const size = imageSize(await readFile(join(dir, f)));
    dims.push(size);
    const thumb = join(dir, 'thumbs', f.replace(/\.[^.]+$/, '.jpg'));
    thumbs.push(existsSync(thumb) ? url('images', slug, 'thumbs', f.replace(/\.[^.]+$/, '.jpg')) : null);
  }
  return { images, dims, thumbs };
}

const folders = existsSync(IMAGES)
  ? (await Promise.all((await readdir(IMAGES)).map(async (n) => ((await stat(join(IMAGES, n))).isDirectory() && !n.startsWith('.') ? n : null)))).filter(Boolean)
  : [];

const manifest = [];
for (const c of CONFIG.categories) {
  const found = folders.includes(c.slug) ? await scan(c.slug) : { images: [], dims: [], thumbs: [] };
  manifest.push({ slug: c.slug, title: c.title, caption: c.caption || '', ...found });
}
for (const slug of folders.filter((f) => !CONFIG.categories.some((c) => c.slug === f)).sort(collator.compare)) {
  const title = slug.replace(/[-_]+/g, ' ').replace(/^./, (s) => s.toUpperCase());
  manifest.push({ slug, title, caption: '', ...(await scan(slug)) });
}

await writeFile(join(PUBLIC, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

// ---------- chèn preload (poster + ảnh bìa) vào index.html ----------
const indexPath = join(PUBLIC, 'index.html');
if (existsSync(indexPath)) {
  const html = await readFile(indexPath, 'utf8');
  const links = [];
  const htmlTransforms = [];
  // ảnh nền Hero đầu tiên: preload bản thumbnail (hiện nhanh), ảnh nét được JS nạp sau
  const firstSlide = (CONFIG.heroSlides || [])[0];
  if (firstSlide) {
    const low = firstSlide.replace(/\/([^/]+)\.[^.]+$/, '/thumbs/$1.jpg');
    const href = existsSync(join(PUBLIC, decodeURIComponent(low))) ? low : firstSlide;
    links.push(`<link rel="preload" as="image" href="${href}" fetchpriority="high">`);
    const out = html => html.replace(/(<div class="slide on"><img src=")[^"]*(")/, `$1${href}$2`);
    htmlTransforms.push(out);
  }
  for (const c of manifest) {
    const cover = c.thumbs[0] || c.images[0];
    if (cover) links.push(`<link rel="preload" as="image" href="${cover}" fetchpriority="low">`);
  }
  let out = html.replace(/(<!-- preload:start -->)[\s\S]*?(<!-- preload:end -->)/, `$1\n${links.map((l) => '  ' + l).join('\n')}\n  $2`);
  for (const t of htmlTransforms) out = t(out);
  if (out !== html) await writeFile(indexPath, out);
}

const total = manifest.reduce((n, c) => n + c.images.length, 0);
console.log(`manifest.json: ${manifest.length} miền ký ức, ${total} ảnh`);
for (const c of manifest) console.log(`  ${c.slug.padEnd(14)} ${String(c.images.length).padStart(3)} ảnh`);
