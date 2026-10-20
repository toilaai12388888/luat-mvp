# BÁO CÁO KIỂM THỬ TOÀN BỘ ỨNG DỤNG LUẬT LẸ (CẬP NHẬT 20/10)

- **Môi trường kiểm thử**: 
  - Trực tiếp trên production: https://luatle.vercel.app
  - Môi trường phát triển cục bộ: http://localhost:3000 (kiểm tra các bản vá sửa lỗi mới nhất)
- **Thời gian thực hiện**: 20h00 – 20h45 (Thứ Ba, 20/10)
- **Cấu hình thiết bị & Khung hình**:
  - Android phổ thông: 360 × 780 px (Chế độ Sáng & Chế độ Tối)
  - iPhone hiện đại: 390 × 844 px (Chế độ Sáng & Chế độ Tối)
- **Phương pháp kiểm thử**: Tự động hóa bằng Puppeteer + Chrome thật (DevTools Protocol), kết hợp tab ẩn danh (Incognito Context) kiểm tra chia sẻ link.

---

## 1. Bảng kết quả kiểm thử chi tiết từng màn hình

| STT | Màn hình | Đường dẫn | 360×780 Sáng | 360×780 Tối | 390×844 Sáng | 390×844 Tối | Hiện tượng tràn ngang | Lỗi Console / Runtime | Ghi chú tương tác |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Trang chủ** | `/` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | Chuỗi 5 ngày, 200 XP, thẻ "Thử thách hôm nay" nằm trọn trong màn hình, thanh TabBar dưới cố định đáy không dính vào giữa trang. |
| 2 | **Trắc nghiệm** | `/mon/dan-su/trac-nghiem/c01` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | Chọn đáp án đúng hiện "Chính xác" (+10 XP), căn cứ Điều 116 BLDS 2015. Nút "Tiếp tục" rộng tối thiểu 120px, chữ trên 1 dòng duy nhất. |
| 3 | **Nhận định** | `/mon/dan-su/nhan-dinh/c01` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | Phím Đúng/Sai lớn (h-14), phản hồi tức thì, giải thích chi tiết theo Điều 129 BLDS 2015. |
| 4 | **Tình huống** | `/mon/dan-su/tinh-huong/c01` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | Quy trình 3 bước (Vấn đề pháp lý → Chọn căn cứ → Kết luận), thanh chọn bước hiển thị rõ ràng trên cả 360px. |
| 5 | **Tra cứu** | `/tra-cuu` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | Ô tìm kiếm nhanh, lọc theo từng bộ luật, mở xem nguyên văn điều luật bằng modal/sheet. |
| 6 | **Hằng ngày** | `/hang-ngay` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | Bộ 5 câu thử thách toàn quốc, theo dõi lịch chuỗi ngày trong tuần. |
| 7 | **Thi thử** | `/thi-thu` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | Chọn môn thi, số câu hỏi (10/20 câu), đồng hồ đếm ngược, thanh điều hướng câu hỏi, chấm điểm tổng kết bài thi. |
| 8 | **Ôn tập** | `/on-tap` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | 3 chế độ: Ôn câu sai (thuật toán lặp 2 lần đúng để xoá), Ôn câu đánh dấu, và Ôn theo chủ đề. |
| 9 | **Thách đấu** | `/thach-dau/[id]` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | **Mở ở tab ẩn danh (Incognito)**: Nhận diện người tạo phòng và điểm số đối thủ; bắt đầu làm bài 10 câu; phòng không tồn tại hiển thị màn hình thông báo và nút quay về trang chủ. |
| 10 | **Xếp hạng** | `/xep-hang` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | Top 3 vinh danh, chuyển đổi 2 tab Toàn quốc / Trường tôi, hiển thị đúng biệt danh đã lưu của người chơi. |
| 11 | **Tiến độ** | `/tien-do` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | Thống kê tổng XP, chuỗi ngày, tỷ lệ đúng theo từng môn, danh sách câu sai cần ôn lại và các huy hiệu đạt được. |
| 12 | **Flashcard** | `/mon/dan-su/flashcard/c01` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | Lật thẻ 3D mượt mà, mặt trước điều luật, mặt sau tóm tắt nội dung; 2 nút "Chưa nhớ" và "Nhớ rồi" cập nhật tiến độ. |
| 13 | **Trang môn** | `/mon/dan-su` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | Banner ảnh đại diện môn học, danh sách các chương kèm các nút tắt vào Trắc nghiệm, Nhận định, Flashcard, Tình huống. |
| 14 | **Đề cương** | `/mon/dan-su/de-cuong/c01` | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | ✅ ĐẠT | Không tràn (0px) | 0 lỗi | Tóm tắt Markdown cấu trúc rõ ràng, danh mục điều hay ra đề và bảng so sánh/sơ đồ tư duy. |

---

## 2. Các lỗi thực tế đã phát hiện và xử lý

1. **Lỗi nút "Tiếp tục" trong FeedbackSheet bị bóp hẹp xuống 2 dòng (Mức độ Vừa - Đã sửa)**:
   - *Nguyên nhân*: Khi có các nút phụ ("Hỏi AI", "Thảo luận") trên màn hình hẹp (360×780), thuộc tính flex khiến nút "Tiếp tục" bị co lại nhỏ hơn chiều rộng chữ.
   - *Khắc phục*: Thêm `whitespace-nowrap` mặc định cho component `Button`, đặt `fullWidth={false}` kèm `shrink-0` cho các nút phụ và `min-w-[120px]` cho nút "Tiếp tục". Chữ "Tiếp tục" luôn nằm trọn vẹn trên 1 dòng.

2. **Lỗi Thách đấu kẹt ở "Đang tải phòng thách đấu..." khi mở tab ẩn danh (Mức độ Nặng - Đã sửa)**:
   - *Nguyên nhân*: Người dùng chưa đăng nhập Supabase tạo phòng thách đấu thì phòng chỉ lưu ở `localStorage` của máy người tạo. Khi gửi link cho bạn bè hoặc mở tab ẩn danh, `localStorage` trống và Supabase không có dữ liệu dẫn đến treo màn hình vô tận.
   - *Khắc phục*:
     - Tự động mã hóa gói dữ liệu thách đấu dạng compact URL (`c-v1-<base64>`) chứa danh sách câu hỏi, điểm số và tên người thách đấu, đảm bảo link mở ở bất kỳ máy hay tab ẩn danh nào cũng đọc được ngay lập tức mà không phụ thuộc cơ sở dữ liệu.
     - Bổ sung màn hình báo lỗi thân thiện "Không tìm thấy phòng thách đấu" kèm nút "Về trang chủ" nếu link sai hoặc hết hạn.

3. **Lỗi Trang Xếp hạng không nhận diện người chơi đã đặt tên (Mức độ Vừa - Đã sửa)**:
   - *Nguyên nhân*: Component `LeaderboardView` khởi tạo `player = null` nhưng thiếu `useEffect` nạp `getLocalPlayer()`, khiến người đã đặt biệt danh vẫn bị nhắc "Chưa có tên trên bảng" và không bấm chuyển tab "Trường tôi" được.
   - *Khắc phục*: Tự động nạp profile người chơi từ `localStorage` khi component mount.

4. **Lỗi ảnh marketing chụp desktop dính thanh tab và dải gradient (Mức độ Vừa - Đã sửa)**:
   - *Nguyên nhân*: Chụp bằng kích thước desktop (1440px) hoặc chụp cuộn trang (fullPage) khiến thanh điều hướng cố định bị nằm lơ lửng giữa trang và che mất thẻ "Thử thách hôm nay".
   - *Khắc phục*: Chụp lại toàn bộ 6 ảnh với viewport chuẩn di động 390×844, `deviceScaleFactor: 3`, chỉ chụp khung nhìn hiển thị (fullPage: false) với dữ liệu mẫu đẹp (chuỗi 5 ngày, 200 XP). Tái tạo 3 ảnh marketing post đạt chuẩn 1080×1350 không còn lỗi đè chữ hay dải phân cách.

---

## 3. Trạng thái kiểm tra Tên miền & Biến môi trường (Mục 5)

- **og:url và og:image trên https://luatle.vercel.app**: Hiện tại mã HTML của production vẫn trả về `https://luat-mvp.vercel.app` (do biến môi trường `NEXT_PUBLIC_SITE_URL` trên Vercel chưa được cập nhật và redeploy).
- **robots.txt và sitemap.xml**: Vẫn đang dẫn nguồn về `https://luat-mvp.vercel.app/sitemap.xml`.
- **Hành động cần thực hiện**: Người dùng cần vào Vercel Settings → Environment Variables → sửa `NEXT_PUBLIC_SITE_URL` thành `https://luatle.vercel.app` và bấm Redeploy bản Production mới nhất.
