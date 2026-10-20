// Tối ưu ảnh trong public/images/<slug>/ (chạy tay trên macOS: `npm run optimize`).
//  - HEIC / ảnh quá lớn / tên có dấu cách → JPG cạnh dài tối đa 2000px, chất lượng 82.
//    Bản gốc được CHUYỂN sang originals/<slug>/ (không xoá).
//  - Tạo thumbs/<tên>.jpg cạnh dài 640px để dùng cho thẻ, quạt ảnh, lưới gallery.
// Dùng `sips` có sẵn trên macOS, không cần cài thêm gì.
import { readdir, mkdir, rename, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = join(ROOT, 'public', 'images');
const ORIGINALS = join(ROOT, 'originals');
const MAX = 2000, THUMB = 600;
const INPUT = new Set(['.heic', '.heif', '.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

if (process.platform !== 'darwin') {
  console.error('Script này dùng `sips` của macOS. Trên máy khác hãy tự chuyển ảnh sang JPG ≤ 2000px.');
  process.exit(1);
}

const sips = (...args) => execFileSync('sips', args, { encoding: 'utf8' });
const longSide = (file) => {
  const out = sips('-g', 'pixelWidth', '-g', 'pixelHeight', file);
  return Math.max(...[...out.matchAll(/pixel(?:Width|Height): (\d+)/g)].map((m) => +m[1]));
};
const safeName = (f) => basename(f, extname(f)).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D').trim().replace(/\s+/g, '-').replace(/[^A-Za-z0-9._-]/g, '');

let converted = 0, thumbs = 0;
for (const slug of await readdir(IMAGES)) {
  const dir = join(IMAGES, slug);
  if (slug.startsWith('.') || !(await stat(dir)).isDirectory()) continue;
  for (const f of await readdir(dir)) {
    const src = join(dir, f);
    const ext = extname(f).toLowerCase();
    if (f.startsWith('.') || !INPUT.has(ext) || (await stat(src)).isDirectory()) continue;
    let out = join(dir, safeName(f) + '.jpg');
    const keep = (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp') && f === basename(f).replace(/\s/g, '') && longSide(src) <= MAX;
    if (keep) {
      out = src;
    } else {
      if (existsSync(out) && out.toLowerCase() !== src.toLowerCase()) out = join(dir, safeName(f) + '-' + ext.slice(1) + '.jpg');
      const tmp = out + '.tmp.jpg';
      sips('-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '--resampleHeightWidthMax', String(MAX), src, '--out', tmp);
      await mkdir(join(ORIGINALS, slug), { recursive: true });
      await rename(src, join(ORIGINALS, slug, f));
      await rename(tmp, out);
      converted++;
      console.log(`  ${slug}/${f} → ${basename(out)}`);
    }
    const t = join(dir, 'thumbs', basename(out).replace(/\.[^.]+$/, '.jpg'));
    if (!existsSync(t) || (await stat(t)).mtimeMs < (await stat(out)).mtimeMs) {
      await mkdir(join(dir, 'thumbs'), { recursive: true });
      sips('-s', 'format', 'jpeg', '-s', 'formatOptions', '70', '--resampleHeightWidthMax', String(THUMB), out, '--out', t);
      thumbs++;
    }
  }
}
console.log(`Đã chuyển ${converted} ảnh, tạo ${thumbs} thumbnail. Bản gốc nằm trong originals/.`);
