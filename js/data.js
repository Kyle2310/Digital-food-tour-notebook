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
    "Chào bạn! Đây là cuốn sổ nhỏ gom lại những quán ăn, quán cafe và chỗ vui chơi mà tụi mình đã thử và muốn giới thiệu.",
    "Lật từng trang, chọn một loại quán, rồi chọn một quán. Mỗi quán có địa chỉ, hình và điểm của tụi mình.",
    "Biết quán nào ngon mà chưa có trong sổ? Cuối sổ có hộp góp ý đó."
  ],
  signature: "Ban tổ chức CT 2026",
  backNote: "Cảm ơn bạn đã ghé qua. Hẹn gặp ở quán!"
};

/* Nhạc: bỏ file mp3 vào thư mục audio/ với đúng tên dưới đây.
   main = bìa, lời nói đầu, mục lục, hộp góp ý. Mỗi loại quán 1 bài riêng. */
const MUSIC = { main: "audio/nhac-1.mp3" };

/* Các loại quán (mục lục). color = màu của mục theo styleguide. */
const SECTIONS = [
  { id: "quan-an-no", name: "Quán ăn no", color: "#cf4c64", music: "audio/nhac-2.mp3",
    blurb: "Cơm, bún, phở: no bụng, chắc bụng, rẻ mà ngon." },
  { id: "an-uong-vat", name: "Quán ăn, uống vặt", color: "#ff8643", music: "audio/nhac-3.mp3",
    blurb: "Mấy món nhâm nhi và ly nước mát sau giờ học." },
  { id: "cafe", name: "Quán cafe", color: "#82649d", music: "audio/nhac-4.mp3",
    blurb: "Chỗ ngồi chill, học bài, tán gẫu." },
  { id: "vui-choi", name: "Vui chơi, giải trí", color: "#8393cc", music: "audio/nhac-5.mp3",
    blurb: "Ăn xong rồi đi đâu chơi? Ở đây nè." }
];

/* Mỗi quán = 1 trang.
   rating: điểm của ban (0–5).
   note: "Lưu ý" (không bắt buộc) — chỉ hiện trên trang quán nào có ghi, vd note: "Chỉ nhận tiền mặt".
   km: khoảng cách từ trường (km). Trong trang mỗi mục, quán được xếp vào 3 nhóm: "< 1 km", "1 – 2 km", "2 – 3 km"
       (quán xa hơn 3km vẫn nằm trong nhóm "2 – 3 km"). Thứ tự trang quán cũng theo nhóm đó.
   photos: 2 đến 4 ảnh, vd ["images/a.jpg", "images/b.jpg", "images/c.jpg"].
       Ô ảnh để "" thì hiện ô màu tạm. 2 ảnh = chia đôi, 3 ảnh = 1 lớn + 2 nhỏ, 4 ảnh = lưới 2×2. */
const PLACES = [
  { id: "bun-bo-co-ba", section: "quan-an-no", name: "Bún bò Cô Ba", address: "12 Đường Mẫu, Phường 1",
    hours: "6:00 – 13:00", price: "35k – 50k", rating: 4.5, mustTry: "Bún bò giò heo",
    review: "Nước lèo đậm, thịt mềm. Đi sớm vì trưa là hết.", note: "Đi sớm, trưa là hết.", km: 0.6, photos: ["", "", ""] },
  { id: "com-tam-nha-lam", section: "quan-an-no", name: "Cơm tấm Nhà Lam", address: "45 Đường Mẫu, Phường 2",
    hours: "10:00 – 21:00", price: "40k – 60k", rating: 4, mustTry: "Sườn bì chả",
    review: "Sườn nướng than thơm, phần ăn to.", km: 1.4, photos: ["", ""] },
  { id: "pho-goc-cho", section: "quan-an-no", name: "Phở Góc Chợ", address: "3 Đường Ví Dụ, Phường 3",
    hours: "5:30 – 11:00", price: "45k – 65k", rating: 4, mustTry: "Phở tái nạm",
    review: "Quán nhỏ đầu chợ, nước trong và ngọt.", km: 2.5, photos: ["", "", "", ""] },

  { id: "banh-trang-tron-be-na", section: "an-uong-vat", name: "Bánh tráng trộn Bé Na", address: "Trước cổng trường",
    hours: "14:00 – 19:00", price: "15k – 25k", rating: 4.5, mustTry: "Bánh tráng trộn đặc biệt",
    review: "Chua cay vừa miệng, cô bán vui tính.", note: "Chỉ nhận tiền mặt.", km: 0.1, photos: ["", "", "", ""] },
  { id: "che-ba-tu", section: "an-uong-vat", name: "Chè Bà Tư", address: "88 Đường Ví Dụ",
    hours: "13:00 – 22:00", price: "15k – 30k", rating: 4, mustTry: "Chè khúc bạch",
    review: "Chè mát, không quá ngọt.", km: 1.2, photos: ["", "", ""] },
  { id: "tra-sua-may", section: "an-uong-vat", name: "Trà sữa Mây", address: "9 Đường Ví Dụ",
    hours: "9:00 – 22:00", price: "25k – 45k", rating: 4, mustTry: "Trà sữa ô long nướng",
    review: "Trân châu dai, chỉnh được độ ngọt.", km: 0.8, photos: ["", ""] },

  { id: "cafe-goc-sach", section: "cafe", name: "Cà phê Góc Sách", address: "21 Đường Mẫu, Phường 4",
    hours: "7:00 – 22:30", price: "30k – 55k", rating: 4.5, mustTry: "Cà phê muối",
    review: "Yên tĩnh, nhiều ổ cắm, hợp ngồi học.", km: 0.5, photos: ["", "", ""] },
  { id: "cafe-san-thuong", section: "cafe", name: "Cà phê Sân Thượng", address: "Tầng 5, 60 Đường Mẫu",
    hours: "8:00 – 23:00", price: "35k – 60k", rating: 4, mustTry: "Cacao đá xay",
    review: "View đẹp buổi tối, cuối tuần nên đặt chỗ.", note: "Cuối tuần nên đặt chỗ trước.", km: 2.2, photos: ["", "", "", ""] },
  { id: "cafe-hem-nho", section: "cafe", name: "Cafe Hẻm Nhỏ", address: "Hẻm 14, Đường Ví Dụ",
    hours: "6:30 – 22:00", price: "20k – 40k", rating: 4, mustTry: "Bạc xỉu",
    review: "Giá sinh viên, có mèo, nhạc nhỏ dễ chịu.", km: 1.6, photos: ["", ""] },

  { id: "bowling-sao-mai", section: "vui-choi", name: "Bowling Sao Mai", address: "Tầng 3, TTTM Mẫu",
    hours: "9:00 – 23:00", price: "60k / lượt", rating: 4, mustTry: "Đấu nhóm 4 người",
    review: "Sân mới, giày sạch, tối cuối tuần đông.", km: 2.8, photos: ["", ""] },
  { id: "karaoke-hat-hay", section: "vui-choi", name: "Karaoke Hát Hay", address: "102 Đường Mẫu",
    hours: "10:00 – 24:00", price: "150k / giờ / phòng", rating: 4.5, mustTry: "Phòng lớn 10 người",
    review: "Âm thanh tốt, ban ngày có giá rẻ hơn.", note: "Ban ngày rẻ hơn buổi tối.", km: 1.9, photos: ["", "", ""] },
  { id: "board-game-xuc-xac", section: "vui-choi", name: "Board game Xúc Xắc", address: "15 Đường Ví Dụ",
    hours: "9:00 – 22:30", price: "30k / người", rating: 4, mustTry: "Ma sói, Mèo nổ",
    review: "Nhiều game, nhân viên hướng dẫn luật.", km: 0.9, photos: ["", "", "", ""] }
];

/* Lý do gợi ý trong hộp góp ý */
const REASONS = ["Ngon", "Rẻ", "Không gian đẹp", "Vui", "Gần trường"];
