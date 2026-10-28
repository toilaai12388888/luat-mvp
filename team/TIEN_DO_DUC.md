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
