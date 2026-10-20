// Nội dung của trang — chỉ cần sửa file này.
// Ngày dùng dạng "yyyy-mm-dd"; nếu còn để "[yyyy-mm-dd]" thì trang hiện nguyên chuỗi.
export const CONFIG = {
  husband: "Đăng Khoa", wife: "Tú Trinh",
  metDate: "2023-10-20T00:00",      // bộ đếm ngày·giờ·phút tính từ đây
  weddingDate: "[2024-10-30]",
  letterLine: "Cảm ơn em, vì đã chọn anh.",
  // Ảnh nền Hero (trình chiếu, mỗi ảnh ~5s). Nên dùng ảnh NGANG, cạnh dài ≥ 1600px.
  heroSlides: [
    "/images/anh-cuoi/01.jpg",
    "/images/hen-ho/06.jpg",
    "/images/hen-ho/10.jpg",
    "/images/hue-hoi-an/02.jpg",
    "/images/thai-lan/15.jpg",
    "/images/hen-ho/11.jpg",
    "/images/anh-cuoi/04.jpg",
    "/images/anh-cuoi/05.jpg",
    "/images/anh-cuoi/06.jpg"
  ],
  slideSeconds: 5,
  filmTitle: "Lời hứa của anh !",   // tiêu đề video tròn + trình phát phim
  hero: { script: "Cảm ơn em", title: "vì đã là vợ của anh",
          message: "Cảm ơn em đã kiên nhẫn với anh qua những ngày vụng về nhất, và cùng anh biến một căn nhà thành tổ ấm. Anh chúc em luôn bình an, luôn được cười thật nhiều — và anh hứa sẽ là lý do cho những nụ cười ấy." },
  categories: [   // thứ tự = thứ tự thời gian, dùng cho vòng tròn, dải mobile và gallery
    { slug: "hen-ho",     title: "Hẹn hò",       caption: "Những buổi hẹn đầu, anh đã biết mình muốn ở lại." },
    { slug: "hue-hoi-an", title: "Huế – Hội An", caption: "Phố Hội lên đèn, em vẫn là ánh sáng đẹp nhất." },
    { slug: "ninh-binh",  title: "Ninh Bình",    caption: "Giữa non nước Tràng An, anh chỉ mải nhìn em." },
    { slug: "thai-lan",   title: "Thái Lan",     caption: "Đi xa thật xa, để thấy nhà là nơi có em." },
    { slug: "anh-cuoi",   title: "Ảnh cưới",     caption: "Ngày em mặc váy trắng, cả thế giới như dịu lại." }
  ],
  journey: [      // render đã SẮP XẾP theo date tăng dần; ảnh = ảnh đầu của category
    { date: "[yyyy-mm-dd]", place: "Hẹn hò",       category: "hen-ho",     line: "Hôm đó trời bình thường, nhưng anh thì không." },
    { date: "[yyyy-mm-dd]", place: "Huế – Hội An", category: "hue-hoi-an", line: "Phố Hội lung linh đèn lồng, em vẫn là ánh sáng đẹp nhất." },
    { date: "[yyyy-mm-dd]", place: "Ninh Bình",    category: "ninh-binh",  line: "Tràng An có trăm hang động, anh chỉ nhớ nụ cười của em." },
    { date: "[yyyy-mm-dd]", place: "Thái Lan",     category: "thai-lan",   line: "Đi xa thật xa, rồi nhận ra nhà là nơi có em." },
    { date: "[yyyy-mm-dd]", place: "Ngày cưới",    category: "anh-cuoi",   line: "Ngày anh được gọi em là vợ." }
  ],
  ending: "Hết trang này rồi, nhưng chuyện của chúng mình thì chưa. ♡"
};
