/* =========================================================
   NỘI DUNG CUỐN SỔ — sửa file này là đủ.
   Thứ tự quán trong PLACES = thứ tự trong danh sách = thứ tự trang.
   Tất cả quán dưới đây là QUÁN MẪU, thay bằng quán thật.
   ========================================================= */

const BOOK = {
  title: "Sổ tay\nĂn uống",
  edition: "CT 2026",
  coverImage: "",            // ảnh bìa của ban Truyền thông, vd "images/cover.jpg"
  logo: "",                  // logo CT năm nay, vd "images/logo.png"
  foreword: [
    "Chào bạn! Đây là một cuốn sổ tay nhỏ do Ban Ẩm thực - Lễ Kết Nghĩa 2026 tổng hợp từ đóng góp của các bạn Cộng tác viên.",
    "Chúng mình mong rằng, cuốn sổ này không chỉ là người bạn đồng hành giúp các tân binh K26 vơi đi sự bỡ ngỡ trong những ngày đầu nhập học, mà còn là một \"bí kíp\" hay ho để các anh chị khóa trên tìm được góc quán mới mẻ, đổi gió sau những giờ học tập căng thẳng. Muốn học tốt trước hết no cái bụng và chơi thật vui cái đã!!!",
    "Cuối sổ còn có “Hộp góp ý” để chúng mình đón nhận những chia sẻ của các bạn, giúp cuốn sổ ngày càng phong phú hơn. Chúng mình sẽ cập nhật các địa điểm mới mỗi 2 tuần.",
    "Chúc bạn có trải nghiệm sử dụng thật vui và ý nghĩa!"
  ],
  signature: "Ban Ẩm thực\nLễ Kết Nghĩa 2026 - Thanh Sắc",
  // các cụm từ trong Lời nói đầu không được tách xuống hàng
  forewordKeep: ["Chào bạn!", "sổ tay", "Ban Ẩm thực", "Lễ Kết Nghĩa 2026", "tổng hợp", "đóng góp", "các bạn", "Cộng tác viên.", "Chúng mình", "chúng mình", "mong rằng,", "cuốn sổ", "người bạn", "đồng hành", "tân binh", "bỡ ngỡ", "ngày đầu", "nhập học,", "\"bí kíp\"", "hay ho", "anh chị", "khóa trên", "góc quán", "mới mẻ,", "đổi gió", "giờ học", "học tập", "căng thẳng.", "học tốt", "trước hết", "cái bụng", "thật vui", "cái đã!!!", "Cuối sổ", "“Hộp góp ý”", "đón nhận", "chia sẻ", "ngày càng", "phong phú", "cập nhật", "địa điểm", "2 tuần.", "Chúc bạn", "trải nghiệm", "sử dụng", "ý nghĩa!"],   // \n = xuống dòng
  backNote: "Cảm ơn bạn đã ghé qua. Hẹn gặp ở quán!"
};

/* Nhạc: bỏ file mp3 vào thư mục audio/ với đúng tên dưới đây.
   main = bìa, lời nói đầu, mục lục, hộp góp ý. Mỗi loại quán 1 bài riêng. */
const MUSIC = { main: "audio/Luigi Boccherini - Minuet - String Quintet (mp3cut.net) (1).mp3" };

/* Các loại quán (mục lục). color = màu của mục theo styleguide. */
const SECTIONS = [
  { id: "quan-an-no", name: "Quán ăn no", color: "#82649d", music: "audio/Luigi Boccherini - Minuet - String Quintet (mp3cut.net) (1).mp3",
    blurb: "Cơm, bún, phở: no bụng, chắc bụng, rẻ mà ngon." },
  { id: "an-uong-vat", name: "Quán ăn, uống vặt", color: "#8393cc", music: "audio/Luigi Boccherini - Minuet - String Quintet (mp3cut.net) (1).mp3",
    blurb: "Mấy món nhâm nhi và ly nước mát sau giờ học." },
  { id: "cafe", name: "Quán cafe", color: "#3fae84", music: "audio/Luigi Boccherini - Minuet - String Quintet (mp3cut.net) (1).mp3",
    blurb: "Chỗ ngồi chill, học bài, tán gẫu." },
  { id: "vui-choi", name: "Vui chơi, giải trí", color: "#feae44", color2: "#fe8916", music: "audio/Luigi Boccherini - Minuet - String Quintet (mp3cut.net) (1).mp3",
    blurb: "Ăn xong rồi đi đâu chơi? Ở đây nè." }
];

/* Mỗi quán = 1 trang. Dữ liệu lấy từ file "MỞ THỰC 26 GUIDEBOOK": mỗi sheet là 1 mục.
   name / id: Tên địa điểm. section: sheet (mục). address: Địa chỉ (quán nhiều chi nhánh: mỗi chi nhánh 1 trang riêng).
   km: Khoảng cách — dùng để xếp vào nhóm "< 1 km", "1 – 2 km", "2 – 3 km" (quán xa hơn 3km nằm trong nhóm "2 – 3 km").
   rating: điểm sao (không có = không hiện sao). review: nhận xét (không có = không hiện). note: "Lưu ý" (không bắt buộc).
   photos: 2 đến 4 ảnh (2 trang cạnh nhau nên khác số ảnh để không giống nhau), vd ["images/a.jpg", "images/b.jpg", "images/c.jpg"]; "" = ô màu tạm.
       2 ảnh = chia đôi, 3 ảnh = 1 lớn + 2 nhỏ, 4 ảnh = lưới 2×2. */
const PLACES = [
  { id: "banh-mi-thit-nuong-chu-hung", section: "quan-an-no", name: "Bánh mì thịt nướng chú Hùng", address: "639 Nguyễn Trãi, Phường Chợ Lớn", rating: 4.5, review: "Chú có thể đổi vị trí tuỳ ngày nhưng vẫn sẽ cố định trên trục đường Nguyễn Trãi. Quán ăn sáng tủ của nhiều sinh viên Răng Hàm Mặt.", mapq: "639 Nguyễn Trãi, Chợ Lớn, Hồ Chí Minh", km: 0.01, layout: "rows", photos: ["images/banh-mi-thit-nuong-chu-hung-1.jpg", "images/banh-mi-thit-nuong-chu-hung-2.jpg"] },
  { id: "sup-lien", section: "quan-an-no", name: "Súp Liên", address: "Nguyễn Kim, Phường Chợ Lớn (ngay ngoài cổng trường Hùng Vương)", rating: 4, mapq: "Đường Nguyễn Kim, Chợ Lớn, Hồ Chí Minh", km: 0.1, photos: ["images/sup-lien-1.jpg", "images/sup-lien-2.jpg"] },
  { id: "xoi-cu-huynh", section: "quan-an-no", name: "Xôi Cụ Huỳnh", address: "Ngã 4 Nguyễn Trãi - Tản Đà, Phường Chợ Lớn", rating: 4.7, mapq: "Xôi Cụ Huỳnh, Ngã 4 Nguyễn Trãi - Tản Đà", km: 0.3, photos: ["images/xoi-cu-huynh-1.jpg", "images/xoi-cu-huynh-2.jpg"] },
  { id: "banh-cuon-quang-dong-hanh-phuc-ky", section: "quan-an-no", name: "Bánh cuốn Quảng Đông Hạnh phúc ký", address: "669 Nguyễn Trãi, Phường Chợ Lớn", rating: 4.2, review: "Bánh cuốn người hoa ngon, khẩu phần nhỏ giá rẻ.", mapq: "Bánh cuốn Quảng Đông Hạnh phúc ký, 669 Nguyễn Trãi, Chợ Lớn, Hồ Chí Minh", km: 0.4, photos: ["images/banh-cuon-quang-dong-hanh-phuc-ky-1.jpg", "images/banh-cuon-quang-dong-hanh-phuc-ky-2.jpg"] },
  { id: "com-chay-hoa-thien", section: "quan-an-no", name: "Cơm Chay Hoa Thiện", address: "1M Bà Triệu, Phường Chợ Lớn", rating: 4.5, review: "Em ăn quán này 5 lần/tuần vì quá ngon.", mapq: "Cơm Chay Hoa Thiện, 1M Bà Triệu, Chợ Lớn", km: 0.4, photos: ["images/com-chay-hoa-thien-1.jpg", "images/com-chay-hoa-thien-2.jpg"] },
  { id: "com-tam-ngo-quyen", section: "quan-an-no", name: "Cơm tấm Ngô Quyền", address: "218B Ngô Quyền, Phường Chợ Lớn", rating: 4.6, mapq: "Cơm tấm Ngô Quyền | Cơm Tấm Ngon Quận 5", km: 0.6, photos: ["images/com-tam-ngo-quyen-1.jpg", "images/com-tam-ngo-quyen-2.jpg"] },
  { id: "ha-cao-phanh", section: "quan-an-no", name: "Há cảo Phánh", address: "Lô B Chung cư Nguyễn Trãi, Phường An Đông", rating: 4.5, mapq: "Há cảo Phánh, Lô B Chung cư, Nguyễn Trãi, Phường An Đông", km: 0.7, photos: ["images/ha-cao-phanh-1.jpg", "images/ha-cao-phanh-2.jpg"] },
  { id: "quan-187-bot-chien-nguyen-kim", section: "quan-an-no", name: "Quán 187 - Bột chiên Nguyễn Kim", address: "187 Nguyễn Kim, Phường Diên Hồng", rating: 4.5, km: 0.9, photos: ["images/quan-187-bot-chien-nguyen-kim-1.jpg", "images/quan-187-bot-chien-nguyen-kim-2.jpg"] },
  { id: "bun-bo-vien-gia-hoa-quan", section: "quan-an-no", name: "Bún bò viên Gia Hòa quán", address: "410 Hòa Hảo, Phường Diên Hồng", rating: 4.7, review: "Đồ ăn nhiều, nhiều món, ăn no luôn.", mapq: "Bún bò viên Gia Hòa quán, 410 Hòa Hảo, Diên Hồng, TP. HCM", km: 1.1, photos: ["images/bun-bo-vien-gia-hoa-quan-1.jpg", "images/bun-bo-vien-gia-hoa-quan-2.jpg"] },
  { id: "bun-bo-phuong-ngoc", section: "quan-an-no", name: "Bún bò Phương Ngọc", address: "384 Hòa Hảo, Phường Diên Hồng", rating: 4.5, mapq: "Bún bò Phương Ngọc, 384 Hoà Hảo, Diên Hồng, Hồ Chí Minh 700000", km: 1.2, photos: ["images/bun-bo-phuong-ngoc-1.jpg", "images/bun-bo-phuong-ngoc-2.jpg"] },
  { id: "ha-cao-hoa", section: "quan-an-no", name: "Há cảo Hòa", address: "Đầu hẻm 418 Trần Phú, Phường An Đông (đối diện nhà văn hóa quận 5 cũ)", review: "Ngon, rẻ, phù hợp để ăn vặt sau giờ học.", mapq: "Há Cảo Hòa Quận 5", km: 1.2, photos: ["images/ha-cao-hoa-1.jpg", "images/ha-cao-hoa-2.jpg"] },
  { id: "com-phu-trung-thuan-ky", section: "quan-an-no", name: "Cơm phủ trứng Thuận Ký", address: "199 Nguyễn Lâm, Phường Diên Hồng", rating: 4.6, review: "Quá ngon, đồ ăn nhiều nhưng mà giá sẽ hơi cao.", mapq: "Cơm phủ trứng Thuận Ký, 199 Nguyễn Lâm, Diên Hồng, TP. HCM", km: 1.3, photos: ["images/com-phu-trung-thuan-ky-1.jpg", "images/com-phu-trung-thuan-ky-2.jpg"] },
  { id: "hu-tieu-thai-lan-pi-thai", section: "quan-an-no", name: "Hủ tiếu thái lan pi thái", address: "163 Dương Tử Giang, Phường Chợ Lớn", rating: 4.2, review: "Quá ngon, tuyệt vòi, hủ tiếu nước đục, nước trong, tomyum,…", mapq: "Hủ tiếu thái lan pi thái, 163 Dương Tử Giang, Chợ Lớn", km: 1.3, photos: ["images/hu-tieu-thai-lan-pi-thai-1.jpg", "images/hu-tieu-thai-lan-pi-thai-2.jpg"] },
  { id: "com-tam-229", section: "quan-an-no", name: "Cơm tấm 229", address: "229 Vĩnh Viễn, Phường Vườn Lài", rating: 5, km: 1.4, photos: ["images/com-tam-229-1.jpg", "images/com-tam-229-2.jpg"] },
  { id: "papa-lee-s-noodle-kitchen", section: "quan-an-no", name: "Papa Lee’s Noodle Kitchen", address: "271 Trần Phú, Phường An Đông", rating: 4.5, review: "Mì đậm vị, khẩu phần ăn vừa đủ, hoành thánh ngon.", mapq: "Papa Lee’s Noodle Kitchen, 271 Trần Phú, An Đông, Hồ Chí Minh 72700", km: 1.4, photos: ["images/papa-lee-s-noodle-kitchen-1.jpg", "images/papa-lee-s-noodle-kitchen-2.jpg"] },
  { id: "bun-dau-mam-tom-tien-hai", section: "quan-an-no", name: "Bún đậu mắm tôm Tiến Hải", address: "409 Nguyễn Tri Phương, Phường Diên Hồng", rating: 4.75, km: 1.5, photos: ["images/bun-dau-mam-tom-tien-hai-1.jpg", "images/bun-dau-mam-tom-tien-hai-2.jpg"] },
  { id: "3a-korean-food", section: "quan-an-no", name: "3A Korean Food", address: "345 Nguyễn Tri Phương, Phường Diên Hồng", rating: 4.7, review: "Một trong những quán Hàn rẻ mà khá chất lượng.", mapq: "3A Korean Food, 345 Nguyễn Tri Phương, Diên Hồng", km: 1.6, photos: ["images/3a-korean-food-1.jpg", "images/3a-korean-food-2.jpg"] },
  { id: "all-in-bao", section: "quan-an-no", name: "All in Bao", address: "490/1 Nguyễn Tri Phương, Phường Vườn Lài", rating: 4.5, review: "Quán ruột và hay rủ bạn bè đi.", mapq: "All in Bao, 490/1 Nguyễn Tri Phương, Vườn Lài", km: 1.8, photos: ["images/all-in-bao-1.jpg", "images/all-in-bao-2.jpg"] },
  { id: "banh-canh-cua-35k", section: "quan-an-no", name: "Bánh canh cua 35k", address: "1398 Võ Văn Kiệt, Phường Bình Tiên", rating: 4.4, mapq: "Bánh canh cua 35k, 1398 Võ Văn Kiệt, Bình Tiên", km: 1.9, photos: ["images/banh-canh-cua-35k-1.jpg", "images/banh-canh-cua-35k-2.jpg"] },
  { id: "gia-thanh-kebab", section: "quan-an-no", name: "Gia Thành Kebab", address: "240a Lê Hồng Phong, Phường Chợ Quán", rating: 4.5, review: "Nhiều loại bánh, bánh ngon, làm nhanh, giá tương đối.", km: 1.9, photos: ["images/gia-thanh-kebab-1.jpg", "images/gia-thanh-kebab-2.jpg"] },
  { id: "banh-canh-tom-bot-gao", section: "quan-an-no", name: "Bánh canh TÔM & BỘT GẠO", address: "131 Lê Hồng Phong, Phường Chợ Quán", rating: 4.7, review: "Bánh canh ngon, phần lớn, giá thành tốt, có thể tự thêm nhiều gia vị.", km: 1.9, photos: ["images/banh-canh-tom-bot-gao-1.jpg", "images/banh-canh-tom-bot-gao-2.jpg"] },
  { id: "mi-quan", section: "quan-an-no", name: "Mì Quăn", address: "221 Tôn Thất Hiệp, Phường Phú Thọ", rating: 4.3, mapq: "Mì Quăn, 221 Đ. Tôn Thất Hiệp, Phú Thọ", km: 2.2, photos: ["images/mi-quan-1.jpg", "images/mi-quan-2.jpg"] },
  { id: "kokoria", section: "quan-an-no", name: "Kokoria", address: "207/33 3 Tháng 2, Phường Vườn Lài", rating: 4.6, mapq: "Kokoria, 207/33 đường 3/2, Vườn Lài", km: 2.5, photos: ["images/kokoria-1.jpg", "images/kokoria-2.jpg"] },
  { id: "mi-sui-cao-kon-lou", section: "quan-an-no", name: "Mì sủi cảo KON LOU", address: "796/19 Sư Vạn Hạnh, Phường Hòa Hưng", rating: 4.5, mapq: "Mì sủi cảo KON LOU, 796/19 Sư Vạn Hạnh, Hòa Hưng", km: 2.8, photos: ["images/mi-sui-cao-kon-lou-1.jpg", "images/mi-sui-cao-kon-lou-2.jpg"] },
  { id: "lau-mini-bon-bon", section: "quan-an-no", name: "Lẩu mini Bon Bon", address: "900 Tạ Quang Bửu, Phường Chánh Hưng", rating: 4.4, review: "Quán lẩu 1 người hoặc hay 2 người, phù hợp để ăn lúc trời mưa hoặc thèm lẩu giá 49k - 69k/ người, ăn okie.", mapq: "Lẩu mini Bon Bon, 900 Tạ Quang Bửu, phường Chánh Hưng", km: 3, photos: ["images/lau-mini-bon-bon-1.jpg", "images/lau-mini-bon-bon-2.jpg"] },
  { id: "bun-thit-nuong-kieu-bao", section: "quan-an-no", name: "Bún thịt nướng Kiều Bảo", address: "339/12 Tô Hiến Thành, Phường Hòa Hưng", rating: 4.5, mapq: "Bún thịt nướng Kiều Bảo, 339/12 Tô Hiến Thành, Hòa Hưng, Hồ Chí Minh", km: 3, photos: ["images/bun-thit-nuong-kieu-bao-1.jpg", "images/bun-thit-nuong-kieu-bao-2.jpg"] },
  { id: "sinh-to-phu-dong", section: "an-uong-vat", name: "Sinh tố Phù Đổng", address: "43 Phù Đổng Thiên Vương, Phường Chợ Lớn", review: "Sinh tố ngon, quán ruột của nhiều người.", mapq: "43 Phù Đổng Thiên Vương, Chợ Lớn, Hồ Chí Minh", km: 0.01, photos: ["images/sinh-to-phu-dong-1.jpg", "images/sinh-to-phu-dong-2.jpg"] },
  { id: "sua-dau-co-binh", section: "an-uong-vat", name: "Sữa đậu Cô Bình", address: "39 Phù Đổng Thiên Vương, Phường Chợ Lớn", rating: 4.9, review: "Sữa đậu khá okie.", mapq: "Sữa đậu Cô Bình, 39 Phù Đổng Thiên Vương", km: 0.01, photos: ["images/sua-dau-co-binh-1.jpg", "images/sua-dau-co-binh-2.jpg", "images/sua-dau-co-binh-3.jpg"] },
  { id: "banh-dua-tan-da", section: "an-uong-vat", name: "Bánh dừa Tản Đà", address: "261 Hồng Bàng, Phường Chợ Lớn", rating: 4.6, review: "Bánh dừa, sầu riêng khá ngon.", km: 0.5, photos: ["images/banh-dua-tan-da-1.jpg", "images/banh-dua-tan-da-2.jpg", "images/banh-dua-tan-da-3.jpg"] },
  { id: "kem-con-ca", section: "an-uong-vat", name: "Kem con cá", address: "9A Nguyễn Án, Phường Chợ Lớn", rating: 4.5, mapq: "Kem con cá, 9A Đ. Nguyễn Án, Chợ Lớn, Hồ Chí Minh", km: 0.55, photos: ["images/kem-con-ca-1.jpg", "images/kem-con-ca-2.jpg"] },
  { id: "mi-tron-259", section: "an-uong-vat", name: "Mì trộn 259", address: "259 Trần Hưng Đạo B, Phường Chợ Lớn", review: "Ngon, món ăn vặt đa dạng.", mapq: "Mì trộn 259, 259 Trần Hưng Đạo B, Chợ Lớn", km: 0.55, photos: ["images/mi-tron-259-1.jpg", "images/mi-tron-259-2.jpg"] },
  { id: "kem-trang-tien-sai-thanh-since-1958", section: "an-uong-vat", name: "Kem Tràng Tiền Sài Thành since 1958", address: "205 Nguyễn Tri Phương, Phường An Đông", rating: 4.8, mapq: "Kem Tràng Tiền Sài Thành since 1958, 205 Nguyễn Tri Phương, An Đông, Hồ Chí Minh", km: 0.75, photos: ["images/kem-trang-tien-sai-thanh-since-1958-1.jpg", "images/kem-trang-tien-sai-thanh-since-1958-2.jpg", "images/kem-trang-tien-sai-thanh-since-1958-3.jpg"] },
  { id: "banh-flan-co-mai", section: "an-uong-vat", name: "Bánh flan cô Mai", address: "88 Ngô Quyền, Phường Diên Hồng", rating: 4.8, review: "Flan không quá ngọt, vừa ăn.", mapq: "Bánh flan cô Mai, 88 Ngô Quyền, Diên Hồng, TP. HCM", km: 0.9, photos: ["images/banh-flan-co-mai-1.jpg", "images/banh-flan-co-mai-2.jpg"] },
  { id: "tiem-banh-trang-tron-9-gio-hon", section: "an-uong-vat", name: "Tiệm bánh tráng trộn 9 giờ hơn", address: "300 Nguyễn Chí Thanh, Phường Diên Hồng", rating: 5, km: 1, photos: ["images/tiem-banh-trang-tron-9-gio-hon-1.jpg", "images/tiem-banh-trang-tron-9-gio-hon-2.jpg", "images/tiem-banh-trang-tron-9-gio-hon-3.jpg"] },
  { id: "sinh-to-ty-muoi", section: "an-uong-vat", name: "Sinh tố Tỷ Muội", address: "606/7 hẻm 666/46 3 Tháng 2, Phường Diên Hồng", rating: 4.5, review: "Cũng được, nhiều, ăn đêm chắc cũng vừa đủ.", mapq: "Sinh tố Tỷ Muội, 606/7 hẻm 666/46 đường 3 tháng 2, Diên Hồng, TP.HCM", km: 1.3, photos: ["images/sinh-to-ty-muoi-1.jpg", "images/sinh-to-ty-muoi-2.jpg", "images/sinh-to-ty-muoi-3.jpg"] },
  { id: "che-hong-kong-dai-loan-yi-jia", section: "an-uong-vat", name: "Chè Hong Kong & Đài Loan Yi Jia", address: "363 Vĩnh Viễn, Phường Diên Hồng", rating: 4.8, review: "Chè ngon, thực đơn đa dạng, phù hợp ngồi nói chuyện với bạn.", km: 1.3, photos: ["images/che-hong-kong-dai-loan-yi-jia-1.jpg", "images/che-hong-kong-dai-loan-yi-jia-2.jpg", "images/che-hong-kong-dai-loan-yi-jia-3.jpg"] },
  { id: "kem-ky-hai-thuong-lan-ong", section: "an-uong-vat", name: "Kem ký Hải Thượng Lãn Ông", address: "177 Hải Thượng Lãn Ông, Phường Chợ Lớn", rating: 4, review: "Kem tuổi thơ, mình hay ăn kem chiên ở đây nè.", mapq: "Kem ký Hải Thượng Lãn Ông, 177 Hải Thượng Lãn Ông, Chợ Lớn", km: 1.4, photos: ["images/kem-ky-hai-thuong-lan-ong-1.jpg", "images/kem-ky-hai-thuong-lan-ong-2.jpg", "images/kem-ky-hai-thuong-lan-ong-3.jpg"] },
  { id: "che-sinh-vien", section: "an-uong-vat", name: "Chè sinh viên", address: "Lô R, Phường Vườn Lài", rating: 4.5, mapq: "Chè sinh viên, Lo R P2 Q 10, Vườn Lài, Hồ Chí Minh", km: 1.6, photos: ["images/che-sinh-vien-1.jpg", "images/che-sinh-vien-2.jpg", "images/che-sinh-vien-3.jpg"] },
  { id: "che-tang-chao", section: "an-uong-vat", name: "Chè Tang Chao", address: "249a Lê Hồng Phong, Phường Chợ Quán", rating: 4.6, km: 1.8, photos: ["images/che-tang-chao-1.jpg", "images/che-tang-chao-2.jpg", "images/che-tang-chao-3.jpg"] },
  { id: "banh-trang-nuong-27-lo-sieu", section: "an-uong-vat", name: "Bánh tráng nướng 27 Lò Siêu", address: "27 Lò Siêu, Phường Minh Phụng", rating: 4.7, km: 1.8, photos: ["images/banh-trang-nuong-27-lo-sieu-1.jpg", "images/banh-trang-nuong-27-lo-sieu-2.jpg"] },
  { id: "kem-va-bingsu-coconino", section: "an-uong-vat", name: "Kem và bingsu Coconino", address: "127 Phan Văn Trị, Phường Chợ Quán", rating: 4.7, review: "Kem ngon, quán đẹp, có thể mang đi, giá tốt, thực đơn đa dạng.", km: 2.5, photos: ["images/kem-va-bingsu-coconino-1.jpg", "images/kem-va-bingsu-coconino-2.jpg", "images/kem-va-bingsu-coconino-3.jpg"] },
  { id: "tau-hu-cha-neo", section: "an-uong-vat", name: "Tàu hủ Chà Neo", address: "458/109 3 Tháng 2, Phường Hòa Hưng", rating: 4.6, mapq: "Tàu hủ Chà Neo, 458/109 Đường 3/2, Hoà Hưng", km: 2.9, photos: ["images/tau-hu-cha-neo-1.jpg", "images/tau-hu-cha-neo-2.jpg", "images/tau-hu-cha-neo-3.jpg"] },
  { id: "the-flan-quan-nha-dzi", section: "an-uong-vat", name: "The Flan - Quán Nhà Dzi", address: "347/22 Minh Phụng, Phường Minh Phụng", rating: 4.1, km: 2.9, photos: ["images/the-flan-quan-nha-dzi-1.jpg", "images/the-flan-quan-nha-dzi-2.jpg", "images/the-flan-quan-nha-dzi-3.jpg"] },
  { id: "mat-tra", section: "cafe", name: "Mát Trà", address: "687 Nguyễn Trãi, Phường Chợ Lớn", rating: 4.9, review: "Matcha ngon, có thể ngồi học bài một mình.", mapq: "Mát Trà, 687 Nguyễn Trãi, P. Chợ Lớn", km: 0.15, photos: ["images/mat-tra-1.jpg", "images/mat-tra-2.jpg", "images/mat-tra-3.jpg"] },
  { id: "tra-tien-huong-gotcha", section: "cafe", name: "Trà Tiên Hưởng Gotcha", address: "60A Tản Đà, Phường Chợ Lớn", rating: 4.2, review: "Gần trường, đi bộ được. Không gian rộng và có nhiều ổ cắm.", mapq: "Trà Tiên Hưởng Gotcha, 60A Đ. Tản Đà, Chợ Lớn, Hồ Chí Minh", km: 0.2, photos: ["images/tra-tien-huong-gotcha-1.jpg", "images/tra-tien-huong-gotcha-2.jpg", "images/tra-tien-huong-gotcha-3.jpg"] },
  { id: "ni-hojicha-matcha-cho-xa-tay", section: "cafe", name: "Nị hõjicha (matcha chợ xã tây)", address: "23/3b Phù Đổng Thiên Vương, Phường Chợ Lớn", review: "Giá siêu hạt dẻ, uống khá ngon, nhược điểm quán take away nên không có chỗ ngồi lại nhưng siêu gần trường mình lun.", mapq: "Nị hõjicha (matcha chợ xã tây), 23/3b Phù Đổng Thiên Vương", km: 0.4, photos: ["images/ni-hojicha-matcha-cho-xa-tay-1.jpg", "images/ni-hojicha-matcha-cho-xa-tay-2.jpg", "images/ni-hojicha-matcha-cho-xa-tay-3.jpg"] },
  { id: "kai-coffee-hong-bang", section: "cafe", name: "Kai Coffee", address: "CN Hồng Bàng: 136 Hồng Bàng, Phường Chợ Lớn", rating: 4, review: "Quán khá đông, nước tạm ổn, mở 24/7 và có nhiều ổ sạc.", km: 0.35, photos: ["images/kai-coffee-hong-bang-1.jpg", "images/kai-coffee-hong-bang-2.jpg", "images/kai-coffee-hong-bang-3.jpg"] },
  { id: "kai-coffee-ly-thuong-kiet", section: "cafe", name: "Kai Coffee", address: "CN Lý Thường Kiệt: 319B1 Lý Thường Kiệt, Phường Phú Thọ", rating: 3, review: "Quán có đồ uống tạm ổn nhưng giá hơi cao, không ồn, nhiều ổ điện, mở 24/24.", mapq: "Kai Coffee, 319B1 Đ. Lý Thường Kiệt, Phú Thọ", km: 2.7, photos: ["images/kai-coffee-ly-thuong-kiet-1.jpg", "images/kai-coffee-ly-thuong-kiet-2.jpg"] },
  { id: "nonbiri-nguyen-trai", section: "cafe", name: "Nonbiri", address: "CN Nguyễn Trãi: 720/12 Nguyễn Trãi, Phường Chợ Lớn", rating: 4.9, review: "Yên tĩnh học bài, phải gửi xe chỗ khác nhưng quán có hỗ trợ giảm giá.", mapq: "Nonbiri, 720/12 Nguyễn Trãi, P. Chợ Lớn", km: 0.35, photos: ["images/nonbiri-nguyen-trai-1.jpg", "images/nonbiri-nguyen-trai-2.jpg", "images/nonbiri-nguyen-trai-3.jpg", "images/nonbiri-nguyen-trai-4.jpg"] },
  { id: "nonbiri-xom-chi", section: "cafe", name: "Nonbiri", address: "CN Xóm Chỉ: 4/7 Xóm Chỉ, Phường Chợ Lớn", rating: 4.8, mapq: "Nonbiri, 4/7 Đ. Xóm Chỉ, Chợ Lớn", km: 0.6, photos: ["images/nonbiri-xom-chi-1.jpg", "images/nonbiri-xom-chi-2.jpg", "images/nonbiri-xom-chi-3.jpg"] },
  { id: "s-mores-saigon", section: "cafe", name: "S'mores Saigon", address: "123 Trần Hưng Đạo, Phường Chợ Lớn", rating: 4.5, review: "Quán rộng và đẹp, nước ngon.", mapq: "S'mores Saigon, 123 Trần Hưng Đạo, Chợ Lớn", km: 0.7, photos: ["images/s-mores-saigon-1.jpg", "images/s-mores-saigon-2.jpg", "images/s-mores-saigon-3.jpg"] },
  { id: "cheese-coffee", section: "cafe", name: "Cheese Coffee", address: "307 Hồng Bàng, Phường Chợ Lớn", rating: 4.1, mapq: "Cheese Coffee, 307 Đ. Hồng Bàng, Chợ Lớn, Quận 5", km: 0.8, photos: ["images/cheese-coffee-1.jpg", "images/cheese-coffee-2.jpg", "images/cheese-coffee-3.jpg"] },
  { id: "chon-rieng-quan-5", section: "cafe", name: "Chốn riêng Quận 5", address: "Tầng 3, Chung cư 62 Châu Văn Liêm, Phường Chợ Lớn", rating: 4, review: "25k/4h, không gian hơi tối nhưng có đèn riêng, yên tĩnh học bài.", mapq: "Chốn riêng Quận 5, Tầng 3, Chung Cư 62, Châu Văn Liêm, P.11, Quận 5", km: 0.85, photos: ["images/chon-rieng-quan-5-1.jpg", "images/chon-rieng-quan-5-2.jpg", "images/chon-rieng-quan-5-3.jpg"] },
  { id: "tron-de-dung-chan", section: "cafe", name: "Trốn để dừng chân", address: "41/22 Ngô Quyền, Phường Diên Hồng", rating: 4.5, review: "Nhiều bàn, giá nước vừa, có bánh, không gian cũng chill, hợp để học bài lắm.", mapq: "Trốn để dừng chân, 41/22 Ngô Quyền, Diên Hồng, TP. HCM", km: 0.95, photos: ["images/tron-de-dung-chan-1.jpg", "images/tron-de-dung-chan-2.jpg", "images/tron-de-dung-chan-3.jpg"] },
  { id: "sole-saigon", section: "cafe", name: "Sole SAIGON", address: "8 Nguyễn Tiểu La, Phường Diên Hồng", rating: 4.3, review: "Zuyệt.", km: 1, photos: ["images/sole-saigon-1.jpg", "images/sole-saigon-2.jpg", "images/sole-saigon-3.jpg"] },
  { id: "hustle-up-cafe", section: "cafe", name: "Hustle up cafe", address: "269/31 Vĩnh Viễn, Phường Diên Hồng", rating: 4.1, mapq: "Hustle up cafe, 269/31 Vĩnh Viễn, Diên Hồng", km: 1.2, photos: ["images/hustle-up-cafe-1.jpg", "images/hustle-up-cafe-2.jpg", "images/hustle-up-cafe-3.jpg"] },
  { id: "bong-tra", section: "cafe", name: "Bông Trà", address: "907 Trần Hưng Đạo, Phường Chợ Quán", rating: 4.5, review: "Không gian rộng, nhiều tầng, có bàn rộng và nhiều ổ cắm.", mapq: "Bông Trà, 907 Trần Hưng Đạo, Chợ Quán, Hồ Chí Minh", km: 2.1, photos: ["images/bong-tra-1.jpg", "images/bong-tra-2.jpg", "images/bong-tra-3.jpg"] },
  { id: "three-o-clock", section: "cafe", name: "Three o'clock", address: "771 Trần Hưng Đạo, Phường Chợ Quán", rating: 4.1, review: "Không gian siêu rộng, hơi ồn, thích hợp học nhóm hoặc thảo luận nhóm hơn.", mapq: "Three o'clock, 771 Trần Hưng Đạo, Quận 5, Hồ Chí Minh", km: 2.4, photos: ["images/three-o-clock-1.jpg", "images/three-o-clock-2.jpg", "images/three-o-clock-3.jpg"] },
  { id: "ca-zone-nguyen-thi-nho", section: "cafe", name: "Cà Zone - Nguyễn Thị Nhỏ", address: "223 Nguyễn Thị Nhỏ, Phường Tân Hòa", rating: 4.5, review: "Quán có nhiều bàn lớn và nhỏ phù hợp để học nhóm, nhạc rất chill với bạn nào thích nghe indie và âm lượng vừa phải :vv, đồ uống giá hơi cao, có thể mượn ổ điện để nối dây, mở 24/24, hầu như tất cả mọi người đều đến để chạy deadline.", mapq: "Cà Zone - Nguyễn Thị Nhỏ, 223 Nguyễn Thị Nhỏ, Tân Hòa", km: 2.7, photos: ["images/ca-zone-nguyen-thi-nho-1.jpg", "images/ca-zone-nguyen-thi-nho-2.jpg"] },
  { id: "hay-la-cafe", section: "cafe", name: "Hay Là Cafe", address: "497/11 Sư Vạn Hạnh, Phường Hòa Hưng", rating: 4.7, review: "Quán yên tĩnh, phù hợp học bài, có phòng học nhóm riêng, không gian hơi nhỏ nên cần đặt bàn trước. Nước ngon, có mèo.", mapq: "Hay Là Cafe, 497/11 Sư Vạn Hạnh, Hoà Hưng", km: 2.8, photos: ["images/hay-la-cafe-1.jpg", "images/hay-la-cafe-2.jpg", "images/hay-la-cafe-3.jpg", "images/hay-la-cafe-4.jpg"] },
  { id: "foxi-film-photobooth", section: "vui-choi", name: "Foxi Film - Photobooth", address: "15 Nguyễn Án, Phường Chợ Lớn", rating: 4.8, mapq: "Foxi Film - Photobooth, 15 Đ. Nguyễn Án, Chợ Lớn, Hồ Chí Minh", km: 0.4, photos: ["images/foxi-film-photobooth-1.jpg", "images/foxi-film-photobooth-2.jpg"] },
  { id: "meo-moc-photobooth", section: "vui-choi", name: "Mèo Mốc Photobooth", address: "10 Nguyễn Án, Phường Chợ Lớn", rating: 4.8, mapq: "Mèo Mốc Photobooth, 10 Đ. Nguyễn Án, Chợ Lớn, Hồ Chí Minh", km: 0.4, photos: ["images/meo-moc-photobooth-1.jpg", "images/meo-moc-photobooth-2.jpg"] },
  { id: "uc-spaces-cafe", section: "vui-choi", name: "UC spaces cafe", address: "100/15 Hùng Vương, Phường An Đông", rating: 4.8, review: "Có thể học bài hoặc chơi board game, khá nhiều trò phổ biến tuy nhiên không có mấy trò lạ.", mapq: "UC Cafe Space - Cafe Học Bài & Boardgame Quận 5", km: 1, photos: ["images/uc-spaces-cafe-1.jpg", "images/uc-spaces-cafe-2.jpg"] },
  { id: "master-escape", section: "vui-choi", name: "Master Escape", address: "226 Trần Phú, Phường An Đông", rating: 5, mapq: "Master Escape, 226 Trần Phú, An Đông, Hồ Chí Minh", km: 1.3, photos: ["images/master-escape-1.jpg", "images/master-escape-2.jpg"] },
  { id: "boom-music-box", section: "vui-choi", name: "Boom Music Box", address: "335 Hùng Vương, Phường An Đông", rating: 4.7, review: "Không gian rộng, âm thanh tốt, chỗ gửi xe trong nhà.", mapq: "Boom Music Box, 335 Hùng Vương, An Đông, Hồ Chí Minh", km: 1.4, photos: ["images/boom-music-box-1.jpg", "images/boom-music-box-2.jpg"] },
  { id: "novo-cafe", section: "vui-choi", name: "Novo Cafe", address: "606/72 3 Tháng 2, Phường Diên Hồng", rating: 4.3, review: "Cafe lắp ráp lego, không gian khá xinh.", mapq: "Novo Cafe, 606/72 Đường 3/2, Phường 14, Quận 10", km: 1.5, photos: ["images/novo-cafe-1.jpg", "images/novo-cafe-2.jpg"] },
  { id: "real-escape", section: "vui-choi", name: "Real Escape", address: "662/3 Sư Vạn Hạnh, Phường Hòa Hưng", rating: 5, mapq: "Real Escape, 662/3 Sư Vạn Hạnh, Hòa Hưng", km: 2.3, photos: ["images/real-escape-1.jpg", "images/real-escape-2.jpg"] },
  { id: "cong-vien-ly-thai-to", section: "vui-choi", name: "Công viên Lý Thái Tổ", address: "1 Lý Thái Tổ, Phường Vườn Lài", rating: 4.7, review: "Công viên siêu đẹp, nghe tên vậy thôi nhưng là công viên mới nên rất sạch, xanh và siêu rộng luôn. Thích hợp để đi dạo hóng gió buổi tối, hẹn hò tụ tập bạn bè, nói chung là nên ghé ít nhất một lần.", mapq: "Công Viên Lý Thái Tổ Quận 10", km: 2.3, photos: ["images/cong-vien-ly-thai-to-1.jpg", "images/cong-vien-ly-thai-to-2.jpg"] },
  { id: "sixteen-musicbox", section: "vui-choi", name: "Sixteen Musicbox", address: "517 Tô Hiến Thành, Phường Diên Hồng", rating: 4.7, mapq: "Sixteen Musicbox, 517 Tô Hiến Thành, Diên Hồng, Quận 10", km: 2.4, photos: ["images/sixteen-musicbox-1.jpg", "images/sixteen-musicbox-2.jpg"] },
  { id: "cashflow-boardgame-cafe", section: "vui-choi", name: "Cashflow Boardgame Cafe", address: "7A/19 Thành Thái, Phường Diên Hồng", rating: 4.3, review: "Quán tủ, lúc nào đi chơi với bạn bè cũng sẽ ra đây chơi, nhiều boardgame, giá cả hssv.", mapq: "Cashflow Boardgame Cafe, Hẻm 7A/19 Đường Thành Thái, Diên Hồng", km: 2.5, photos: ["images/cashflow-boardgame-cafe-1.jpg", "images/cashflow-boardgame-cafe-2.jpg"] },
];

/* Lý do gợi ý trong hộp góp ý */
const REASONS = ["Ngon", "Rẻ", "Không gian đẹp", "Vui", "Gần trường"];

/* Vị trí cắt ảnh, lấy từ trang "Cắt ảnh". Ảnh không có ở đây thì giữ ở giữa. */
const CROPS = {
  "3a-korean-food-2": { x: 0.6099, y: 0.5, z: 1 },
  "banh-canh-cua-35k-1": { x: 0.3951, y: 0.5, z: 1 },
  "banh-canh-cua-35k-2": { x: 0.541, y: 0.5, z: 1 },
  "banh-dua-tan-da-2": { x: 0.5, y: 0.6279, z: 1 },
  "banh-dua-tan-da-3": { x: 0.5, y: 0.8761, z: 1 },
  "banh-flan-co-mai-1": { x: 0.5, y: 0.5772, z: 1 },
  "banh-flan-co-mai-2": { x: 0.5, y: 1, z: 1 },
  "banh-mi-thit-nuong-chu-hung-1": { x: 0.4244, y: 0.8268, z: 1 },
  "banh-mi-thit-nuong-chu-hung-2": { x: 0.7683, y: 0.8174, z: 1 },
  "banh-trang-nuong-27-lo-sieu-2": { x: 0.8106, y: 0.5, z: 1 },
  "bong-tra-1": { x: 0.5, y: 1, z: 1 },
  "bong-tra-2": { x: 0.5, y: 0.5839, z: 1 },
  "bong-tra-3": { x: 0.5, y: 0.686, z: 1 },
  "bun-bo-phuong-ngoc-1": { x: 0.4746, y: 0.5, z: 1 },
  "bun-bo-phuong-ngoc-2": { x: 0, y: 0.5, z: 1 },
  "bun-bo-vien-gia-hoa-quan-1": { x: 1, y: 0.5, z: 1 },
  "bun-bo-vien-gia-hoa-quan-2": { x: 0.3392, y: 0.5, z: 1 },
  "bun-dau-mam-tom-tien-hai-2": { x: 0.3634, y: 0.5, z: 1 },
  "bun-thit-nuong-kieu-bao-1": { x: 0.6148, y: 0.5, z: 1 },
  "che-hong-kong-dai-loan-yi-jia-2": { x: 0.5, y: 0.5918, z: 1 },
  "che-hong-kong-dai-loan-yi-jia-3": { x: 0.5, y: 0.8879, z: 1 },
  "che-sinh-vien-1": { x: 0.5, y: 0.6847, z: 1 },
  "che-tang-chao-2": { x: 0.5, y: 0.3551, z: 1 },
  "cheese-coffee-1": { x: 0.5, y: 0.706, z: 1 },
  "cheese-coffee-3": { x: 0.5, y: 0.6365, z: 1 },
  "chon-rieng-quan-5-1": { x: 0.5, y: 0.5265, z: 1 },
  "chon-rieng-quan-5-2": { x: 0.5358, y: 0.5, z: 1 },
  "com-chay-hoa-thien-1": { x: 0.5, y: 0.5, z: 1.09 },
  "com-chay-hoa-thien-2": { x: 0.5, y: 0.8038, z: 1 },
  "com-phu-trung-thuan-ky-1": { x: 0, y: 0.5, z: 1 },
  "com-tam-229-2": { x: 0.561, y: 0.5, z: 1 },
  "ha-cao-hoa-1": { x: 0.9216, y: 0.5, z: 1 },
  "ha-cao-phanh-1": { x: 0.8209, y: 0.5, z: 1 },
  "ha-cao-phanh-2": { x: 0, y: 0.5, z: 1 },
  "hay-la-cafe-1": { x: 0.5, y: 0.6303, z: 1 },
  "hay-la-cafe-2": { x: 0.5, y: 0.5008, z: 1 },
  "hay-la-cafe-3": { x: 0.5, y: 0.7248, z: 1 },
  "hay-la-cafe-4": { x: 0.5, y: 0.2771, z: 1 },
  "hustle-up-cafe-2": { x: 0.5, y: 0.317, z: 1 },
  "hustle-up-cafe-3": { x: 0.5, y: 0.6148, z: 1 },
  "kem-con-ca-1": { x: 1, y: 0.5, z: 1 },
  "kem-con-ca-2": { x: 0.6713, y: 0.5, z: 1 },
  "kem-ky-hai-thuong-lan-ong-1": { x: 1, y: 0.5, z: 1 },
  "kem-ky-hai-thuong-lan-ong-2": { x: 0.5, y: 0.6731, z: 1 },
  "kem-ky-hai-thuong-lan-ong-3": { x: 0.506, y: 0.5, z: 1 },
  "kem-trang-tien-sai-thanh-since-1958-1": { x: 0.5, y: 0.5672, z: 1 },
  "kem-trang-tien-sai-thanh-since-1958-2": { x: 0.5, y: 0.4085, z: 1 },
  "kem-trang-tien-sai-thanh-since-1958-3": { x: 0.5, y: 0.6306, z: 1 },
  "kem-va-bingsu-coconino-1": { x: 0.5, y: 1, z: 1 },
  "kem-va-bingsu-coconino-2": { x: 0.5, y: 0.4831, z: 1 },
  "kem-va-bingsu-coconino-3": { x: 0.5, y: 0.4993, z: 1 },
  "kokoria-1": { x: 0.2649, y: 0.5, z: 1 },
  "kokoria-2": { x: 0.5579, y: 0.5, z: 1 },
  "lau-mini-bon-bon-1": { x: 0.5753, y: 0.5, z: 1 },
  "lau-mini-bon-bon-2": { x: 0.489, y: 0.5, z: 1 },
  "mat-tra-1": { x: 0.5, y: 0, z: 1 },
  "mat-tra-2": { x: 0.5, y: 0.5799, z: 1 },
  "mat-tra-3": { x: 0.5, y: 0.5768, z: 1 },
  "meo-moc-photobooth-2": { x: 0, y: 0.5, z: 1 },
  "mi-quan-1": { x: 0.3055, y: 0.5, z: 1 },
  "mi-tron-259-1": { x: 0.5036, y: 0.5, z: 1 },
  "mi-tron-259-2": { x: 0.5, y: 0.4917, z: 1 },
  "ni-hojicha-matcha-cho-xa-tay-1": { x: 0.5, y: 0.6087, z: 1 },
  "ni-hojicha-matcha-cho-xa-tay-2": { x: 0.5, y: 0.4816, z: 1 },
  "ni-hojicha-matcha-cho-xa-tay-3": { x: 0.5, y: 0.4034, z: 1 },
  "nonbiri-nguyen-trai-4": { x: 0.5, y: 0.8527, z: 1 },
  "novo-cafe-1": { x: 0.202, y: 0.5, z: 1 },
  "novo-cafe-2": { x: 0.8681, y: 0.5, z: 1 },
  "papa-lee-s-noodle-kitchen-2": { x: 0.5, y: 0, z: 1 },
  "quan-187-bot-chien-nguyen-kim-1": { x: 0.5, y: 0.5408, z: 1 },
  "quan-187-bot-chien-nguyen-kim-2": { x: 1, y: 0.5, z: 1 },
  "s-mores-saigon-2": { x: 0.5, y: 0.4949, z: 1 },
  "s-mores-saigon-3": { x: 0.3757, y: 0.5, z: 1 },
  "sinh-to-phu-dong-1": { x: 1, y: 0.5, z: 1 },
  "sinh-to-phu-dong-2": { x: 0.4624, y: 0.5, z: 1 },
  "sinh-to-ty-muoi-1": { x: 0.5, y: 0.9463, z: 1 },
  "sinh-to-ty-muoi-2": { x: 0.5, y: 0.3509, z: 1 },
  "sole-saigon-2": { x: 0.5, y: 0.1054, z: 1 },
  "sua-dau-co-binh-2": { x: 1, y: 0.5, z: 1 },
  "sua-dau-co-binh-3": { x: 0.5, y: 0.6738, z: 1 },
  "sup-lien-1": { x: 0.6577, y: 0.5, z: 1 },
  "sup-lien-2": { x: 0.4406, y: 0.5, z: 1 },
  "tau-hu-cha-neo-1": { x: 0.5, y: 0.1104, z: 1 },
  "the-flan-quan-nha-dzi-2": { x: 0.5, y: 0, z: 1 },
  "three-o-clock-2": { x: 0.5304, y: 0.5, z: 1 },
  "three-o-clock-3": { x: 0.5, y: 0.6318, z: 1 },
  "tiem-banh-trang-tron-9-gio-hon-1": { x: 0.5088, y: 0.5, z: 1 },
  "tiem-banh-trang-tron-9-gio-hon-2": { x: 0.5, y: 0.4536, z: 1 },
  "tiem-banh-trang-tron-9-gio-hon-3": { x: 0.5, y: 0.4488, z: 1 },
  "tra-tien-huong-gotcha-3": { x: 0.4923, y: 0.5, z: 1 },
  "tron-de-dung-chan-1": { x: 0.5, y: 0.5368, z: 1 },
  "tron-de-dung-chan-3": { x: 0.5, y: 0.4336, z: 1 },
  "uc-spaces-cafe-2": { x: 0.4664, y: 0.5, z: 1 },
  "xoi-cu-huynh-2": { x: 0.5, y: 0.5, z: 1.002 }
};

/* Series foodtour: trang sau hộp góp ý. Mỗi tập = 1 link + ảnh thumbnail (images/) */
const SERIES = {
  title: "SERIES FOODTOUR\n“ĂN CHƠI”",        // tiêu đề trang (font Bon Foyage), \n = xuống dòng
  tocTitle: "SERIES FOODTOUR “ĂN CHƠI”",     // dòng trong mục lục
  episodes: [
    { title: "TẬP 1: “Ờ LON”",     url: "https://www.facebook.com/share/v/18nFHEYkUS/", thumb: "images/series-tap-1.jpg" },
    { title: "TẬP 2: “TU GE ĐỜ”", url: "https://www.facebook.com/share/v/1MT4LbfxJU/", thumb: "images/series-tap-2.jpg" }
  ]
};
