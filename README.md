# Sổ Tay Ăn Uống CT — bản thử

Website dạng cuốn sổ lật trang. HTML + CSS + JavaScript, không cần database.

## Các file
```
index.html     khung trang + form ẩn cho Netlify
css/book.css   giao diện: màu, font, nền, kích thước
js/data.js     NỘI DUNG: lời nói đầu, loại quán, quán, lý do góp ý  <- sửa file này
js/book.js     lật trang, mục lục, nhạc, hộp góp ý
images/        ảnh bìa, logo, ảnh quán
audio/         nhạc: nhac-1.mp3 (bìa, mục lục, góp ý), nhac-2..5.mp3 (4 loại quán)
fonts/         BonFoyage.woff2 hoặc BonFoyage.otf
```

## Thay nội dung
- Quán: sửa `PLACES` trong `js/data.js`. Thứ tự trong file = thứ tự trong danh sách = thứ tự trang.
- Ảnh: bỏ ảnh vào `images/`, ghi `photo: "images/ten-anh.jpg"`.
- Ảnh bìa / logo: `BOOK.coverImage`, `BOOK.logo`.
- Màu mỗi mục: `color` trong `SECTIONS`. Màu bìa và nền ngoài: đầu file `css/book.css`.
- Font: bỏ file Bon Foyage vào `fonts/`. Kiểm tra font có đủ dấu tiếng Việt.

## Đưa lên mạng
1. Kéo cả thư mục vào https://app.netlify.com/drop
2. Netlify > Forms > bật thông báo email (Form notifications) để góp ý gửi về email admin.
3. Lượt truy cập: thêm Cloudflare Web Analytics hoặc GoatCounter (miễn phí), hoặc Netlify Analytics (trả phí).

Lật trang: chạm vào trang, kéo góc trang, vuốt, hoặc dùng nút ← →. Hiệu ứng gấp giấy nằm trong phần "3. BỘ MÁY LẬT TRANG" của js/book.js.

Trình duyệt chỉ cho phát nhạc sau khi người xem chạm vào trang, nên nhạc bắt đầu khi mở bìa.

## Nút 👍 (cần Netlify Functions)
Số lượt thích được lưu bằng `netlify/functions/votes.mjs` + Netlify Blobs (miễn phí ở mức nhỏ).
Kéo-thả thư mục vào Netlify Drop KHÔNG chạy được phần này. Hãy deploy bằng 1 trong 2 cách:
- Đưa thư mục lên GitHub, rồi trên Netlify chọn "Add new site > Import from Git" (Netlify tự cài `@netlify/blobs` từ package.json).
- Hoặc dùng Netlify CLI: `npm install`, `npx netlify deploy --prod`.
Mọi quán bắt đầu từ 0. Mỗi máy chỉ bấm được 1 lần cho mỗi quán (bấm lại để bỏ). Số lượt luôn hiện và tự cập nhật mỗi 6 giây (LIVE_MS trong js/book.js).

### Reset lượt 👍 (admin)
1. Netlify > Site configuration > Environment variables > Add a variable: Key `ADMIN_KEY`, Value = một mã bí mật do bạn tự đặt. Deploy lại 1 lần.
2. Mở `https://<tên-trang>.netlify.app/admin.html`, nhập mã, bấm "Về 0" cho từng quán hoặc "Reset tất cả về 0".
Trang admin không có link trong sổ tay. Chưa đặt ADMIN_KEY thì không ai reset được.
