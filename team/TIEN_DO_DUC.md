# TIẾN ĐỘ THỰC HIỆN CỦA ĐỨC (PHASE 2 - 20/10)

## Trạng thái tổng quan: HOÀN THÀNH 100% CÁC TÍNH NĂNG ĐỢT 2
- Ngày thực hiện: Thứ Ba, 20/10
- Codebase check: `npm run check` -> 0 lint error, 0 type error, 162 content verified, build pass 100%.
- Supabase: Đã chạy migration đầy đủ các bảng và RPC (comment_reports, push_subscriptions, item_reports, contributions, ai_usage, add_weekly_xp, report_comment).
- Vercel Deployment: Đã triển khai Production tại https://luat-mvp.vercel.app với đầy đủ 8 biến môi trường.
- Trang Quản trị: https://luat-mvp.vercel.app/quan-tri (mã PIN đặt trong biến ADMIN_PIN trên Vercel, không ghi vào repo).

---

## Chi tiết các mục tính năng theo team/TINH_NANG_2.md

| Mục | Tên tính năng | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **0** | Sửa 5 lỗi tồn & Báo sai in-app | ✅ Xong 100% | Đã sửa: Bảo mật token, Icon 48px, Viewport mobile, Web Push SW, Báo sai in-app lưu vào DB |
| **A** | Nguyên văn điều luật & Tra cứu | ✅ Xong 100% | Đã thêm text đầy đủ 22 điều luật Dân sự, nút tra cứu nhanh tại /tra-cuu, Sheet xem điều luật |
| **B** | 12 bài tập tình huống 3 bước | ✅ Xong 100% | 12 case studies Dân sự (c01, c02), giao diện 3 bước tư duy pháp lý, huy hiệu Phá án Dân sự |
| **C** | Lộ trình ôn tập & Đặt ngày thi | ✅ Xong 100% | Trang chủ có widget đếm ngược ngày thi, tính số câu ôn mỗi ngày theo ngày thi từng môn |
| **D** | So sánh cuộn ngang & Sơ đồ khối | ✅ Xong 100% | Đề cương có bảng so sánh dạng thẻ trượt ngang + Visual flowcharts |
| **E** | Đóng góp câu hỏi & Bộ câu cộng đồng | ✅ Xong 100% | Form gửi câu hỏi đóng góp, tích hợp duyệt qua trang quản trị, tag Cộng đồng |
| **F** | Trang duyệt quản trị /quan-tri | ✅ Xong 100% | Bảo vệ bằng PIN (biến ADMIN_PIN, ≥ 12 ký tự), kết nối Supabase service role, duyệt/từ chối đóng góp, ẩn bình luận |
| **0.5** | Nhắc học thật (Web Push & Cron) | ✅ Xong 100% | Web Push Service Worker, Vercel Cron /api/cron/nhac-hoc lúc 20h VN (13:00 UTC) |
| **G** | Hỏi AI trợ lý luật (Gemini API) | ✅ Xong 100% | API route /api/hoi-ai với rate limit, giao diện hỏi đáp, an toàn bảo mật |

---

## Danh sách biến môi trường trên Vercel
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `ADMIN_PIN` (≥ 12 ký tự, không ghi giá trị vào repo)
5. `CRON_SECRET`
6. `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
7. `VAPID_PUBLIC_KEY`
8. `VAPID_PRIVATE_KEY`

---

# PHASE 3 - 28/10/2026: ĐO LƯỜNG NGƯỜI DÙNG & SỬA BẢNG XẾP HẠNG THẬT

## 1. Trạng thái tổng quan
- **Mã nguồn:** Đã kiểm thử hoàn tất (`npm run check` -> 0 lỗi lint, 0 lỗi typecheck, 162 items nội dung, build production thành công).
- **Commit:** `5bfbc79` (kế thừa commit `3c77784`).
- **Bảng xếp hạng:** Đã xóa bỏ hoàn toàn 15 người chơi mẫu (`MOCK_LEADERS`). Phân tách rõ ràng 4 trạng thái: Đang tải, Chưa có người chơi trong tuần (màn hình rỗng có nút kêu gọi học), Lỗi truy vấn/thiếu cấu hình (có nút Thử lại), và Có dữ liệu thật.
- **Bộ đếm ẩn danh & Hoạt động 5 phút:** Đã hoàn thiện mã client với heartbeat nhẹ (1 lần/phút, chỉ khi tab hiển thị và có tương tác), chống ghi trùng bằng mã phiên bài học (session key).
- **Trang Quản trị (/quan-tri):** Bổ sung tab "Thống kê sử dụng" tích hợp bộ lọc thời gian (Hôm nay, 7 ngày, 30 ngày, tùy chọn), bộ lọc loại trừ lượt nội bộ/QA, 6 thẻ chỉ số (khách ghé web, người học thật, tổng lượt học, thử thách 5 câu, người quay lại, tỷ lệ hoàn thành), chỉ số đang hoạt động 5 phút qua, bảng chi tiết theo ngày và nguồn dẫn đến.

## 2. File Migration cơ sở dữ liệu
- File sẵn sàng tại: `supabase/migrations/20261028_complete_usage_and_leaderboard.sql` (và copy tại `D:\Projects\Luat Le - Bai dang\Theo doi so lieu\1 - Chay 1 lan - Tao bo dem.sql`).
- Chứa toàn bộ cấu trúc:
  1. `usage_daily` (RLS bật, lưu lượt vào, lượt học, thử thách, câu hỏi, cờ nội bộ).
  2. `internal_devices` (quản trị thiết bị kiểm thử/nội bộ để loại khỏi báo cáo).
  3. `active_devices` (ước tính hoạt động trong 5 phút qua).
  4. RPC `track_usage` (hỗ trợ ghi nhận visit, lesson, daily và ping).
  5. RPC `set_internal_device` và `get_usage_analytics`.

## 3. Trở ngại mạng nội bộ cần Đức thao tác
- Mạng nội bộ cơ quan (`10.1.206.36`) có tường lửa chặn `Application: github-uploading` (trả về lỗi HTTP 503 khi thực hiện lệnh POST `git push`).
- Đức chỉ cần kết nối mạng cá nhân (hoặc phát 4G/hotspot) và gõ `git push origin main` trên máy tính để đẩy commit lên GitHub. Vercel sẽ tự động deploy bản mới.
- Trên Supabase SQL Editor: Dán file `supabase/migrations/20261028_complete_usage_and_leaderboard.sql` và bấm Run.


---

# PHASE 4: TÍNH NĂNG "LUYỆN ÁN THẬT" (28/10)

## Trạng thái tổng quan: HOÀN THÀNH 100% VÀ SẴN SÀNG TRIỂN KHAI PRODUCTION
- **Kiểm tra chất lượng:** `npm run check` -> 0 lỗi lint, 0 lỗi typecheck, 177 items nội dung được kiểm tra (12 tình huống, 3 vụ án thật với 12 câu hỏi), build production static HTML hoàn tất.
- **Phạm vi hoàn thành:**
  1. **Nguồn án chính thức và xác thực:**
     - **Dân sự:** Án lệ số 25/2018/AL của Hội đồng Thẩm phán TANDTC (Tranh chấp phạt cọc mua bán nhà khi chậm cấp sổ đỏ vì lý do khách quan). Gắn với Chương c02: Hợp đồng và Biện pháp bảo đảm (Điều 328 BLDS 2015).
     - **Doanh nghiệp:** Quyết định giải quyết việc dân sự số 126/2022/KDTM-PT ngày 22/03/2022 của TAND TP. Hồ Chí Minh (Yêu cầu hủy bỏ Nghị quyết Đại hội đồng cổ đông do vi phạm thủ tục mời họp và gửi tài liệu). Gắn với Chương c02: Công ty cổ phần (Điều 143, 151 Luật Doanh nghiệp 2020).
     - **Hành chính:** Bản án hành chính phúc thẩm số 01/2021/HC-PT ngày 27/05/2021 của TAND tỉnh Tuyên Quang (Khiếu kiện Quyết định xử phạt VPHC của Trưởng Công an thị trấn). Gắn với Chương c01: Xử phạt vi phạm hành chính (Điều 39, 58 Luật Xử lý vi phạm hành chính).
  2. **Quy trình luyện tập 4 bước:**
     - **Bước 1 — Hồ sơ vụ việc:** Tóm tắt tình tiết trung tính, thông tin nguồn gốc tòa án, cấp xét xử, ngày ban hành, các bên đương sự, diễn biến và yêu cầu khởi kiện. Có liên kết đến bản án gốc kèm cảnh báo mở sớm có thể thấy trước kết quả.
     - **Bước 2 — Câu hỏi trọng tâm:** 4 câu hỏi trắc nghiệm theo chuỗi tư duy (vấn đề pháp lý → tình tiết then chốt → căn cứ → áp dụng → kết quả). Có nút mở xem lại tình tiết bất kỳ lúc nào mà không mất lựa chọn. Không làm lộ đáp án và phán quyết trước bước 4.
     - **Bước 3 — Lập luận tùy chọn:** 3 ô chuẩn (Vấn đề – Căn cứ – Kết luận) kèm gợi ý tư duy. Lưu nháp an toàn trên thiết bị (localStorage), không gửi lên server. Nút "Bỏ qua và xem đối chiếu" và "Hoàn thành & Xem đối chiếu".
     - **Bước 4 — Đối chiếu:** Hiển thị chi tiết đáp án câu hỏi kèm căn cứ điều luật, nhận định nguyên văn của Tòa án, phán quyết cuối cùng, bảng tự đối chiếu 3 cột và ghi chú sư phạm (kết luận khác Tòa không đồng nghĩa với vô giá trị).
  3. **Tích hợp hệ thống:**
     - Tích hợp ghi nhận đo lường `trackUsage("lesson", count, sessionKey)` chống ghi trùng.
     - Tích hợp cộng điểm hoàn thành (+20 XP), cập nhật chuỗi streak ngày.
     - Nút báo sai in-app (`ReportButton`) kết nối bảng `item_reports` trên Supabase.
     - Điểm truy cập từ Trang chủ (`app/page.tsx`), trang chi tiết môn (`app/mon/[mon]/page.tsx`) và sitemap (`app/sitemap.ts`).
  4. **Tài liệu bàn giao:** Đã tạo file hướng dẫn chi tiết `team/HUONG_DAN_THEM_AN_THAT.md` hướng dẫn cấu trúc file JSON và quy trình thêm vụ mới.
