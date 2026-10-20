# Đợt 3 — An toàn, kiểm thử, hoàn thiện, nội dung chương 3, chuẩn bị ra mắt (chốt 20/10/2026 ~11h)

File này THẮNG các file team/* khác ở chỗ khác nhau. Vẫn: AI tự chạy liên tục; mỗi việc xong `npm run check` → commit → push main; cập nhật TIEN_DO_DUC.md (ghi file UTF-8 KHÔNG BOM, sửa luôn phần chữ đang bị lỗi mã hóa trong file).

**Ra mắt: SÁNG THỨ TƯ 21/10/2026.** Hôm nay: sửa an toàn → kiểm thử → hoàn thiện giao diện → bạn bè thử lúc chiều → thêm chương 3 → sửa theo góp ý → 22h khóa code.

## 1. Sửa an toàn (làm NGAY, trước mọi thứ)
1. **Trang quản trị**: bỏ mã PIN mặc định "882026" khỏi code và khỏi ô nhập (placeholder). `ADMIN_PIN` chưa cài → API trả 503, không ai vào được. So sánh bằng `crypto.timingSafeEqual`. Chặn đoán mã: tối đa 5 lần sai mỗi 15 phút theo IP (bảng `admin_attempts` hoặc bộ nhớ + header `x-forwarded-for`), quá thì khóa 15 phút. Đổi yêu cầu PIN thành chuỗi ít nhất 12 ký tự. Thêm `robots: noindex` cho /quan-tri.
2. **Cron nhắc học**: `CRON_SECRET` chưa cài → trả 401, không chạy. Chỉ nhận `Authorization: Bearer <CRON_SECRET>` (bỏ cách truyền qua `?secret=`).
3. **Hỏi AI**: xác định người dùng ở server từ access token Supabase (header `Authorization`, `supabase.auth.getUser(token)`), không tin `playerId` client gửi. Không có token → không cho hỏi. Giữ 5 lần/người/ngày; thêm giới hạn 30 lần/ngày/IP.
4. Quét lại toàn repo: không còn khóa bí mật nào trong code (chỉ anon key là được phép). Kiểm tra mọi API route dùng service role đều có xác thực.
5. Đưa Đức sẵn các giá trị cần dán vào Vercel (mục 7) TRONG MỘT LẦN.

## 2. Kiểm thử kỹ bằng trình duyệt của Antigravity
- Mở bản chạy local (`npm run build && npm run start`) và bản Vercel, khung 390×844 (iPhone) và 360×780 (Android), cả sáng và tối.
- Đi hết từng màn: trang chủ, tìm kiếm, môn, đề cương (so sánh, sơ đồ), trắc nghiệm, nhận định, tình huống, flashcard, kết quả, thi thử (nộp bài, xem lại), hằng ngày (thẻ chia sẻ, tải ảnh), ôn tập, tra cứu + khung nguyên văn điều luật, xếp hạng (đặt biệt danh), thách đấu (tạo link, mở bằng cửa sổ ẩn danh làm như người khác), bình luận + báo cáo, báo sai, đóng góp câu hỏi, lộ trình ôn, tiến độ + huy hiệu, /quan-tri, 404.
- Mỗi màn: không lỗi console, không chữ tràn/cuộn ngang, vùng bấm ≥ 44px, chữ tối trên nền tối không có, đang tải có Skeleton, trống có câu hướng dẫn, mất mạng không trắng trang.
- Ghi kết quả vào `noi-dung/KIEM_THU.md` (màn, lỗi, đã sửa chưa) và chụp ảnh từng màn vào `marketing/screens/` (dùng luôn cho mục 5).
- Sửa hết lỗi tìm được. Lỗi lớn không sửa kịp thì ẩn tính năng đó và ghi lại.

## 3. Hoàn thiện giao diện
- Sau khi thêm nhiều tính năng nhanh, rà cho đồng nhất với design/DESIGN.md: cùng kiểu tiêu đề, khoảng cách, nút, thẻ, icon, màu chỉ từ biến; không gradient, không emoji trong giao diện.
- Trang chủ đang nhiều thứ: sắp lại thứ tự ưu tiên: (1) Tiếp tục học / mục tiêu hôm nay, (2) Thử thách hằng ngày, (3) Môn học, (4) Tìm kiếm + tra cứu, (5) chuỗi ngày. Không quá dài; phần phụ thu gọn.
- Lần đầu vào web: 3 màn giới thiệu ngắn có thể bỏ qua ("Ôn luật theo chương, có căn cứ điều luật" → "Thi thử, thử thách mỗi ngày" → "Bắt đầu với môn bạn đang học"), cho chọn môn đang học.
- Thêm ảnh xem trước khi chia sẻ link (Open Graph): ảnh chung của app 1200×630, ảnh riêng cho trang thử thách hằng ngày và thách đấu (dùng `next/og`). Tiêu đề, mô tả tiếng Việt cho từng trang.
- Chân trang chủ: ghi nguồn ảnh Unsplash, liên hệ/fanpage, dòng "Nội dung do AI soạn và đối chiếu điều luật; nếu thấy sai hãy bấm Báo sai".

## 4. Tên miền
Đức đổi tên miền miễn phí trên Vercel (mục 7). AI: không viết cứng "luat-mvp.vercel.app" ở đâu cả; dùng biến `NEXT_PUBLIC_SITE_URL` (mặc định lấy từ request) cho link chia sẻ, thách đấu, OG, manifest.

## 5. Chuẩn bị ra mắt (marketing) — lưu trong `marketing/` (commit được, không có bí mật)
- `marketing/fanpage.md`: tên trang "Luật Lẹ — Ôn thi Luật", tên người dùng gợi ý, mô tả ngắn (≤ 255 ký tự) và dài, nút hành động (Dùng ngay → link web), danh mục, thông tin liên hệ để trống.
- Ảnh: `marketing/avatar.png` (1080×1080, ô navy dấu § như icon), `marketing/cover-facebook.png` (1640×624), `marketing/cover-ig-highlight/*.png` nếu cần. Phong cách đúng DESIGN.md, có ảnh màn hình app trên khung điện thoại, chữ tiếng Việt rõ.
- `marketing/bai-dang.md`:
  - 3 bài ra mắt cho nhóm Facebook SV Luật (giọng khác nhau: kể chuyện ôn thi "bơi"; liệt kê tính năng; thử thách câu hỏi khó mời làm thử). Mỗi bài ≤ 200 chữ, mở đầu bằng 1 câu hỏi luật gây tò mò, có link, 2–4 ảnh màn hình gợi ý kèm theo.
  - 5 bài đầu cho fanpage (giới thiệu, 1 câu nhận định đúng/sai mỗi ngày, mẹo nhớ điều luật, so sánh TNHH vs Cổ phần, kêu gọi đóng góp câu hỏi).
  - Bộ cho Threads + Instagram: 5 bài ngắn (≤ 80 chữ) + 3 ý story (thẻ thử thách hằng ngày, thăm dò "Đúng hay Sai?").
  - Tin nhắn mời bạn bè dùng thử (hôm nay) và tin nhắn mời người được phỏng vấn.
  - Quy tắc đăng nhóm: đọc nội quy nhóm trước, không đăng dồn một lúc, trả lời bình luận trong 1 giờ đầu.
- Ảnh bài đăng: `marketing/posts/*.png` (1080×1350): ảnh màn hình đẹp + tiêu đề lớn. Không dùng logo/tên trường đại học thật.

## 6. Nội dung chương 3 cho 3 môn (làm SAU khi đã gửi link cho bạn bè thử)
- Mỗi môn thêm `c03`: đề cương (có so sánh/sơ đồ khi hợp), 15 trắc nghiệm, 10 nhận định, 2 tình huống; thêm điều luật nguyên văn vào `content/van-ban/`. Chọn chủ đề hay thi tiếp theo, luật còn hiệu lực (kiểm cả sửa đổi 2025).
- Đúng quy trình cũ: lấy nguyên văn → soạn → tự đối chiếu từng câu → cập nhật noi-dung/DOI_CHIEU.md → chọn 10 câu kém chắc nhất đưa Đức kiểm.
- Không kịp trước 22h thì để chương 3 ra sau ngày ra mắt; không được làm chậm việc khác.

## 7. VIỆC CỦA ĐỨC hôm nay (AI gom lại, đưa sẵn giá trị)
a) **Vercel → Settings → Environment Variables** (Production + Preview) rồi Redeploy: `SUPABASE_SERVICE_ROLE_KEY` (Đức tự lấy trong Supabase → Project Settings → API, KHÔNG gửi cho AI), `ADMIN_PIN` (Đức tự đặt, ≥ 12 ký tự), `CRON_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (AI tạo và đưa), `NEXT_PUBLIC_SITE_URL` (tên miền mới).
b) **Supabase**: chạy file SQL mới nếu AI tạo thêm.
c) **Tên miền**: Vercel → dự án → Settings → Domains → sửa `luat-mvp.vercel.app` thành tên mới (ví dụ `luatle.vercel.app`; nếu bị trùng thì thử `luatle-app`, `onluatle`) → báo AI.
d) **Trước 16h**: gửi tin AI soạn cho 5–10 bạn đã phỏng vấn; chuyển góp ý cho AI tối nay.
e) **Lập fanpage Facebook + Instagram + Threads** theo marketing/fanpage.md, đăng ảnh đại diện/ảnh bìa.
f) Kiểm 10 câu chương 3.
g) **Sáng mai 21/10**: đăng bài ra mắt (mỗi nhóm cách nhau ≥ 30 phút), đăng fanpage/Threads/Instagram.

## 8. Lịch hôm nay
- 11h–12h: mục 1 + đưa giá trị mục 7a.
- 12h–14h30: mục 2 (kiểm thử + sửa) và mục 3.
- 14h30–15h30: mục 4, ảnh OG, ảnh màn hình; soạn tin mời thử → Đức gửi trước 16h.
- 15h30–19h: mục 5 (marketing) rồi mục 6 (chương 3).
- 19h–22h: sửa theo góp ý bạn bè, kiểm thử lại toàn bộ, 22h khóa code, báo cáo tổng.
Trễ thì cắt: chương 3 (dời sau ra mắt) → màn giới thiệu lần đầu → ảnh OG riêng từng trang. Không cắt: mục 1, mục 2, bài đăng ra mắt.
