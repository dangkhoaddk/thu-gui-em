# Gửi Em

Website tĩnh anh tặng em: phong thư mở đầu, hero video, những miền ký ức, gallery, hành trình và lời kết.
HTML + CSS + JS thuần (ES modules), không framework, không backend.

## Cấu trúc

```
public/
  index.html
  css/styles.css          design tokens trong :root
  js/config.js            ← NỘI DUNG: sửa ở đây
  js/main.js              khởi tạo
  js/envelope.js hero.js universe.js gallery.js lightbox.js journey.js utils.js
  video/wedding.mp4       video cưới (nền hero, video tròn, modal phim)
  video/wedding-poster.jpg
  images/<slug>/01.jpg …  mỗi thư mục = 1 miền ký ức
  images/<slug>/thumbs/   ảnh nhỏ 600px (tự tạo bằng `npm run optimize`)
  manifest.json           SINH TỰ ĐỘNG — không sửa tay
scripts/build-manifest.mjs   quét ảnh → manifest.json (+ preload ảnh bìa vào index.html)
scripts/optimize-images.mjs  HEIC/ảnh lớn → JPG ≤ 2000px + thumbnail (macOS)
originals/                   ảnh gốc đã được chuyển ra (không deploy, không commit)
```

## Sửa nội dung

Mở `public/js/config.js`:

- `husband`, `wife`: tên hai vợ chồng (hiện ở lời kết).
- `metDate`: mốc bắt đầu bộ đếm ngày · giờ · phút, dạng `"2022-04-14T19:30"`.
- `weddingDate`, `journey[].date`: dạng `"yyyy-mm-dd"`, trang hiện `dd.mm.yyyy`. Nếu còn để placeholder `[yyyy-mm-dd]` thì trang hiện nguyên chuỗi.
- `letterLine`: câu trong lá thư. `hero`: chữ viết tay, tiêu đề, lời chúc. `ending`: lời kết.
- `categories`: thứ tự = thứ tự trên vòng tròn, dải mobile và gallery. `slug` phải trùng tên thư mục trong `public/images/`.
- `journey`: tự sắp theo ngày; ảnh của mỗi mốc = ảnh đầu tiên (`01.jpg`) của `category`.

> Lời chúc hero có sẵn trong `index.html` để tránh giật layout. Nếu đổi `hero.message` trong config thì trang vẫn đúng,
> nhưng sửa luôn đoạn `data-hero="message"` trong `index.html` cho khớp sẽ mượt nhất.

## Thay ảnh

1. Bỏ ảnh vào `public/images/<slug>/` (jpg, png, webp; trên macOS có thể bỏ cả HEIC).
2. Ảnh được sắp theo tên file: `01.jpg` là ảnh bìa, rồi `02.jpg`, `03.jpg`…
3. Trên macOS chạy:
   ```bash
   npm run optimize
   ```
   Lệnh này chuyển HEIC / ảnh lớn sang JPG ≤ 2000px (bản gốc được dời sang `originals/`) và tạo thumbnail.
   Không chạy cũng được, khi đó trang sẽ dùng ảnh gốc, chỉ chậm hơn.
4. Chạy `npm run build` để cập nhật `manifest.json`.

Thêm thư mục mới chưa có trong config thì nó được nối vào cuối, tên lấy từ tên thư mục.
Thư mục chưa có ảnh sẽ hiện ô giữ chỗ sọc chéo như thiết kế.

## Thay video

Ghi đè `public/video/wedding.mp4` (H.264, nên ≤ 1080p, bật faststart) và tạo poster từ khung hình đầu:

```bash
ffmpeg -i public/video/wedding.mp4 -frames:v 1 -q:v 4 public/video/wedding-poster.jpg
```

## Chạy local

```bash
npm start
```

Mở http://localhost:3000 (lệnh này build manifest rồi serve thư mục `public`). Cần Node ≥ 18.

## Deploy Vercel (free)

1. Đẩy repo lên GitHub.
2. Trên vercel.com chọn **Add New → Project**, import repo. Mọi thiết lập đã có trong `vercel.json`
   (build `npm run build`, output `public`). Bấm **Deploy**.

Hoặc dùng CLI:

```bash
npx vercel --prod
```

`.vercelignore` loại `originals/` và file HEIC khỏi bản upload.
