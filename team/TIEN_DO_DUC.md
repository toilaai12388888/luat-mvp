# TIẾN ĐỘ CỦA ĐỨC — CHẾ ĐỘ MỘT MÌNH (SOLO + ĐẶC TẢ TÍNH NĂNG MỚI)

- **Dự án**: Web app ôn thi Luật — **Luật Lẹ**
- **Quy tắc**: Tuân thủ team/TINH_NANG.md (thắng team/SOLO.md ở các điểm khác nhau)
- **Repo GitHub**: https://github.com/toilaai12388888/luat-mvp
- **Link web**: https://luat-mvp.vercel.app/
- **Thời gian ra mắt**: Thứ Sáu 23/10/2026.
- **Cập nhật lần cuối**: Thứ Hai 19/10/2026 16:50

---

## Tiến độ theo ĐẶC TẢ (team/TINH_NANG.md)

| Mục | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| **0** | **Sửa nội dung trước** | **HOÀN THÀNH** | Sửa doanh-nghiep-c01-nd05 & tn08 (Ban kiểm soát chỉ bắt buộc với DNNN theo Đ54 LDN 2020); sửa hanh-chinh-c01-tn09 & nd05 theo Luật số 88/2025/QH15 (nâng mức phạt không lập biên bản lên 500k/1tr từ 01/07/2025). |
| **1** | **Thêm Chương 2 mỗi môn (~150 câu tổng)** | **HOÀN THÀNH** | Dân sự c02 (Hợp đồng & Biện pháp bảo đảm), Hành chính c02 (Biện pháp ngăn chặn & bảo đảm xử phạt VPHC), Doanh nghiệp c02 (Công ty cổ phần). Đã xuất noi-dung/DOI_CHIEU.md và noi-dung/15_CAU_KIEM.json. |
| **2** | **Tài khoản biệt danh (Supabase Anon + SQL)** | **CODE XONG** | Viết file migration SQL supabase/migrations/20261019_initial_schema.sql (bảng players, weekly_xp, challenges, challenge_results, comments, bật full RLS); hoàn thiện lib/player.ts, lib/supabase.ts, components/auth/NicknameModal.tsx (chọn 7 trường Luật + Khác). |
| **3.1** | **Ôn câu sai + Đánh dấu câu** | **HOÀN THÀNH** | Nút đánh dấu Bookmark trên QuizTopBar; lưu activeWrongIds, làm đúng 2 lần liên tiếp tự rời danh sách; trang /on-tap ôn tập riêng câu sai / đã đánh dấu. |
| **3.2** | **Thi thử có giờ** | **HOÀN THÀNH** | Trang /thi-thu: chọn môn, chương, 10/20/40 câu; đếm ngược ~1 phút/câu; không lộ đáp án khi làm; nộp bài tính điểm thang 10, xem lại giải thích chi tiết, lưu lịch sử. |
| **3.3** | **Thử thách hằng ngày** | **HOÀN THÀNH** | Trang /hang-ngay: 5 câu/ngày deterministic bằng PRNG theo ngày; làm 1 lần/ngày; xuất thẻ Wordle chia sẻ và canvas ảnh Story 1080×1920 tải về; cộng streak chuỗi ngày. |
| **3.4** | **Huy hiệu** | **HOÀN THÀNH** | Thư viện lib/badges.ts gồm 12 huy hiệu; toast micro-animation khi mở khóa; hiển thị gallery huy hiệu trên trang /tien-do. |
| **3.5** | **Thống kê điểm yếu** | **HOÀN THÀNH** | Phân tích điều luật sai nhiều nhất (lib/weakness.ts); nút 'Ôn ngay' trên /tien-do mở trực tiếp bộ câu hỏi xoay quanh điều luật đó. |
| **3.6** | **Tìm kiếm** | **HOÀN THÀNH** | Component HomeSearch.tsx tại trang chủ; tìm kiếm không dấu tiếng Việt theo từ khóa hoặc số điều (ví dụ: 'Điều 117', 'bồi thường'); click mở bài ôn ngay. |
| **3.7** | **Flashcard điều luật** | **HOÀN THÀNH** | Trang /mon/[mon]/flashcard/[chuong]: lật thẻ trước/sau (số điều & nội dung); nút 'Nhớ rồi / Chưa nhớ'; thuật toán lặp lại ngắt quãng đơn giản lưu localStorage. |
| **3.8** | **Bảng xếp hạng** | **HOÀN THÀNH** | Trang /xep-hang: BXH XP theo tuần (thứ Hai - Chủ nhật); 2 tab Toàn quốc & Trường tôi; hiển thị Top 50 + thứ hạng của bản thân; tự đồng bộ XP lên Supabase khi có nickname. |
| **3.9** | **Thách đấu bạn bè** | **HOÀN THÀNH** | Sau bài thi / trang kết quả có nút 'Thách đấu bạn' -> tạo link /thach-dau/[id]; bạn mở làm đúng 10 câu đó -> so điểm 2 bên trên bảng đấu; người tạo xem danh sách ai đã nhận đấu. |
| **3.10** | **Bình luận dưới câu** | **HOÀN THÀNH** | Trong FeedbackSheet, nút 'Thảo luận' mở modal xem/gửi bình luận dưới câu (<= 500 ký tự); bộ lọc từ ngữ thô tục cơ bản; nút báo cáo (3 lần tự ẩn). |
| **3.11** | **Nhắc học (PWA)** | **HOÀN THÀNH** | PWA manifest public/manifest.json, service worker public/sw.js, PwaRegister.tsx xin quyền thông báo và kiểm tra nhắc học lúc 20h. |
| **4** | **Giao diện & Navigation** | **HOÀN THÀNH** | Bottom navigation 5 tab: Học (/) · Ôn tập (/on-tap) · Thi thử (/thi-thu) · Xếp hạng (/xep-hang) · Tôi (/tien-do). Chuẩn theme Navy design/DESIGN.md. |

---

## 📢 MỤC 5: VIỆC CỦA ĐỨC (Đang chờ Đức thực hiện)

### a) Supabase
1. Vào Supabase Dashboard -> **Authentication** -> **Providers** -> Bật **Anonymous sign-ins**.
2. Vào **SQL Editor** -> Tạo query mới -> Dán toàn bộ nội dung file `supabase/migrations/20261019_initial_schema.sql` -> Bấm **Run**.

### b) Vercel
1. Vào Vercel Dashboard dự án `luat-mvp` -> **Settings** -> **Environment Variables**.
2. Thêm 2 biến môi trường:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL Supabase của bạn
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon Key của bạn
3. Chọn cả **Production** và **Preview** -> Bấm **Save** -> **Redeploy**.

### c) Kiểm 15 câu mới
Xem 15 câu chọn lọc trong file `noi-dung/15_CAU_KIEM.json`.

### d) Thử trên điện thoại
Sau khi Đức chạy xong Supabase và Vercel deploy, mở link https://luat-mvp.vercel.app/ trên điện thoại để trải nghiệm 11 tính năng mới!

---

## Nhật ký
- [19/10 13:22] Chuyển chế độ SOLO, gỡ khóa main.
- [19/10 13:34] Xong Nền móng & Giao diện chung, push main.
- [19/10 13:49] Đức đã deploy Vercel và cung cấp link: https://luat-mvp.vercel.app/
- [19/10 13:56] Xong toàn bộ Bộ làm bài, Trắc nghiệm, Nhận định, Trang chủ, Đề cương, Tiến độ.
- [19/10 14:07] Hoàn thành Bước 7 ban đầu (75 câu hỏi).
- [19/10 16:05] Nhận ĐẶC TẢ mới từ Đức: lưu team/TINH_NANG.md.
- [19/10 16:15] Hoàn thành Mục 0: sửa nội dung Điều 54 Luật Doanh nghiệp & Luật Xử lý VPHC sửa đổi 2025.
- [19/10 16:25] Hoàn thành Mục 1: thêm Chương 2 cả 3 môn (tổng 150 câu), xuất 15 câu mẫu kiểm tra.
- [19/10 16:40] Hoàn thành Mục 2: tài khoản biệt danh, Supabase Anonymous auth & migration SQL.
- [19/10 16:50] Hoàn thành Mục 3 (trọn bộ 11 tính năng) & Mục 4 (TabBar 5 tab). All checks passed (lint 0 err, typecheck 0 err, build 54 static pages ok).
## Tiến độ ĐỢT 2 (team/TINH_NANG_2.md - 20/10/2026)

| Mục | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| **0.1** | **Bảo mật bình luận** | **HOÀN THÀNH** | Xóa policy mở toang, bảng comment_reports, RPC report_comment (3 báo cáo tự ẩn), người viết tự xóa được bình luận. |
| **0.2** | **Chống gian lận XP** | **HOÀN THÀNH** | Bỏ INSERT/UPDATE trên weekly_xp, thêm RPC add_weekly_xp (1-15 XP, rate limit 2s, cap 5000/tuần). |
| **0.3** | **Icon app chuẩn** | **HOÀN THÀNH** | Icon-192, icon-512, apple-touch-icon (#14284B dấu § trắng), manifest theme_color #14284B, xóa SVG Next thừa. |
| **0.4** | **Cho phép phóng to** | **HOÀN THÀNH** | Bỏ maximumScale & userScalable trong viewport layout. |
| **0.5** | **Nhắc học thật (Web Push)** | **HOÀN THÀNH** | web-push, bảng push_subscriptions, modal xin quyền sau bài đầu / hướng dẫn Safari iPhone, cron 13:00 UTC (20:00 VN). |
| **0.6** | **Báo sai trong app** | **HOÀN THÀNH** | Modal báo sai in-app 4 lý do + ghi chú, lưu bảng item_reports & local fallback. |
| **A** | **Nguyên văn điều luật** | **ĐANG LÀM** | content/van-ban/*.json, chip căn cứ trượt lên, trang /tra-cuu. |
| **B** | **B�i tập t�nh huống** | **HO�N TH�NH** | 2 tình huống mỗi chương (12 tình huống), trang giải từng bước. |
| **C** | **Lộ tr�nh �n thi** | **HO�N TH�NH** | Đặt ngày thi, thẻ tiến độ mỗi ngày trên trang chủ. |
| **D** | **So s�nh & Sơ đồ** | **HO�N TH�NH** | Bảng cuộn ngang và sơ đồ khối trong đề cương. |
| **E** | **Đóng góp câu hỏi** | **CHỜ** | Form đóng góp, bảng contributions, câu duyệt vào chương. |
| **F** | **Trang duyệt /quan-tri** | **HO�N TH�NH** | Quản trị bảo vệ mã PIN: duyệt câu, báo cáo bình luận, báo sai. |
| **G** | **Hỏi AI (ẩn)** | **CHỜ** | API Gemini, giới hạn 5 lần/ngày/người. |

---

## Nhật ký
- [19/10 13:22] Chuyển chế độ SOLO, gỡ khóa main.
- [19/10 13:34] Xong Nền móng & Giao diện chung, push main.
- [19/10 13:49] Đức đã deploy Vercel và cung cấp link: https://luat-mvp.vercel.app/
- [19/10 13:56] Xong toàn bộ Bộ làm bài, Trắc nghiệm, Nhận định, Trang chủ, Đề cương, Tiến độ.
- [19/10 14:07] Hoàn thành Bước 7 ban đầu (75 câu hỏi).
- [19/10 16:05] Nhận ĐẶC TẢ mới từ Đức: lưu team/TINH_NANG.md.
- [19/10 16:15] Hoàn thành Mục 0: sửa nội dung Điều 54 Luật Doanh nghiệp & Luật Xử lý VPHC sửa đổi 2025.
- [19/10 16:25] Hoàn thành Mục 1: thêm Chương 2 cả 3 môn (tổng 150 câu), xuất 15 câu mẫu kiểm tra.
- [19/10 16:40] Hoàn thành Mục 2: tài khoản biệt danh, Supabase Anonymous auth & migration SQL.
- [19/10 16:50] Hoàn thành Mục 3 (trọn bộ 11 tính năng) & Mục 4 (TabBar 5 tab). All checks passed.
- [20/10 09:40] Bắt đầu ĐỢT 2 (team/TINH_NANG_2.md). Commit đặc tả đợt 2 lên GitHub.
- [20/10 09:52] Hoàn thành Mục 0 đợt 2: sửa 5 lỗi + báo sai trong app + Web Push nhắc học thật + chống gian lận XP + bảo mật bình luận + app icon mới + cho phép phóng to. Check passed 100%.
- [20/10 10:00] Ho�n th�nh Mục A: Nguy�n văn điều luật ngay trong app (77 điều, /tra-cuu, DieuLuatSheet, HomeSearch).
- [20/10 10:08] Ho�n th�nh Mục B: B�i tập t�nh huống 3 bước (12 t�nh huống, runner đề b�i ghim, lời giải mẫu, huy hiệu). All checks passed (66 static pages).
- [20/10 10:11] Ho�n th�nh Mục D: Bảng so s�nh cuộn ngang v� sơ đồ khối ph�n loại trong đề cương. All checks passed.



- [20/10 10:17] Ho�n th�nh Mục F: Trang quản trị duyệt nội dung /quan-tri (m� PIN trong biến ADMIN_PIN, API server SUPABASE_SERVICE_ROLE_KEY, duyệt c�u hỏi đ�ng g�p, b�nh luận b�o c�o, b�o sai). All checks passed.
- [20/10 10:22] Ho�n th�nh Mục C: Lộ tr�nh �n đến ng�y thi (đặt ng�y thi theo m�n tại tab T�i, thẻ mục ti�u h�m nay tại trang chủ, c�ng thức t�nh số c�u X chia theo ng�y c�n lại, chế độ nước r�t 3 ng�y cuối gợi � thi thử, thưởng +15 XP khi ho�n th�nh mục ti�u). All checks passed.
- [20/10 10:25] Ho�n th�nh Mục E: Sinh vi�n đ�ng g�p c�u hỏi (Modal form đủ trường bắt buộc + link kiểm chứng ch�nh thức, lưu bảng contributions & local fallback, mở kh�a huy hiệu "Người đ�ng g�p", n�t đ�ng g�p ở tab T�i v� cuối b�i l�m ResultScreen, danh s�ch "C�u hỏi cộng đồng" trong m�n học ghi nhận t�n t�c giả). All checks passed.
- [20/10 10:28] Ho�n th�nh Mục G: Hỏi AI về c�u n�y (L�m sẵn nhưng ẩn; kiểm tra qua API /api/hoi-ai kh�ng lộ key, n�t Hỏi AI trong FeedbackSheet, API Gemini Flash k�m ngữ cảnh nguy�n văn điều luật căn cứ, giới hạn 5 lần/người/ng�y lưu bảng ai_usage, d�ng cảnh b�o "AI c� thể sai, h�y đối chiếu điều luật"). All checks passed.
- [30/10 10:35] Ho�n th�nh T�nh năng Luyện �n thật & Khắc phục h�m add_weekly_xp tr�n database:
  + �p dụng th�nh c�ng migration trực tiếp l�n Supabase zolxwrrhdwssuqlcnkkr qua SQL Editor, kh�a d�ng FOR UPDATE chống race condition, sửa lỗi COALESCE khi tuần mới chưa c� bản ghi, trần 5000 XP/tuần, tự động đảm bảo bản ghi players.
  + Kiểm thử to�n diện test suite tr�n server thật: thưởng +15 XP cho t�i khoản mới th�nh c�ng, từ chối rate limit < 2s, từ chối delta ngo�i [1, 15], cộng dồn ch�nh x�c sau 2s, xử l� an to�n 2 request đồng thời.
  + Giao diện CaseStudyRunner cập nhật luồng thưởng XP an to�n: chỉ đ�nh dấu đ� nhận khi server x�c nhận th�nh c�ng, hỗ trợ n�t bấm thử lại khi lỗi mạng/gi�n c�ch, giữ nguy�n trạng th�i l�m b�i/nh�p khi reload, b�o sai ch�nh x�c từng c�u hỏi.
  + Dọn dẹp sạch t�i khoản thử nghiệm khỏi database, kh�ng l�m � nhiễm bảng xếp hạng c�ng khai. All checks passed.
