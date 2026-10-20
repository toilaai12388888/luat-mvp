# Đợt 2 — Hoàn thiện + tính năng mới (chốt 19/10/2026 tối)

File này THẮNG team/TINH_NANG.md và team/SOLO.md ở chỗ khác nhau. Vẫn: AI tự chạy liên tục, mỗi việc xong `npm run check` → commit → push main, ghi TIEN_DO_DUC.md; ra mắt thứ Sáu 23/10; 21h Thứ Năm khóa code. Giao diện mọi màn mới theo đúng design/DESIGN.md.

## 0. Sửa lỗi (làm TRƯỚC mọi thứ, không được cắt)
1. **Bình luận đang mở toang**: policy "Users can update reports on comments" (UPDATE USING true) cho phép ai cũng sửa/ẩn bình luận người khác. Xóa policy đó. Thêm bảng `comment_reports(comment_id, player_id, created_at, PK(comment_id, player_id))` và hàm `report_comment(comment_id)` SECURITY DEFINER: mỗi người báo 1 lần, tăng `reports`, `reports >= 3` thì `hidden = true`. Cho phép người viết tự xóa bình luận của mình. Client gọi RPC, không update bảng trực tiếp.
2. **Chống gian lận XP**: bỏ quyền INSERT/UPDATE trực tiếp trên `weekly_xp` (chỉ SELECT). Thêm hàm `add_weekly_xp(delta int)` SECURITY DEFINER: chỉ nhận 1 ≤ delta ≤ 15, mỗi người tối đa 1 lần mỗi 2 giây (lưu `last_xp_at`), tổng tuần tối đa 5000. Client chỉ gọi RPC.
3. **Icon app**: tạo `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (ô navy #14284B bo góc, dấu § trắng kiểu chữ có chân); khai báo trong manifest và layout. Đổi `theme_color` sang #14284B. Xóa file mặc định của Next trong public (file.svg, globe.svg, next.svg, vercel.svg, window.svg) nếu không dùng.
4. **Cho phóng to**: bỏ `maximumScale` / `userScalable: false` trong viewport.
5. **Nhắc học thật (Web Push)**:
   - Thư viện `web-push`. Bảng `push_subscriptions(player_id, endpoint UNIQUE, p256dh, auth, last_active_date, created_at)`, RLS chỉ dòng của mình.
   - Xin quyền thông báo sau khi người dùng xong bài đầu tiên (không xin ngay khi vào web). Cần tài khoản ẩn danh: gọi signInAnonymously nếu chưa có (không bắt đặt biệt danh).
   - Mỗi lần làm xong một bài: cập nhật `last_active_date` (giờ Việt Nam).
   - Vercel Cron 1 lần/ngày lúc 13:00 UTC (= 20:00 VN) gọi `/api/cron/nhac-hoc` (kiểm `CRON_SECRET`), dùng `SUPABASE_SERVICE_ROLE_KEY` (chỉ ở server) gửi thông báo cho ai chưa học hôm nay: "Giữ chuỗi N ngày nhé — 5 câu thôi!". Xóa subscription hỏng (410).
   - iPhone: hướng dẫn ngắn "Thêm vào Màn hình chính để nhận nhắc học" khi chạy Safari.
   - Bỏ cơ chế nhắc giả (setInterval kiểm 20h) cũ.
6. **Báo sai trong app** (thay Google Form): nút "Báo sai" mở form nhỏ (lý do: đáp án sai / căn cứ sai / giải thích khó hiểu / khác + ghi chú) → bảng `item_reports(item_id, reason, note, player_id null được, created_at)`; ai cũng INSERT được (kể cả chưa đăng nhập, dùng anon key), không ai đọc trừ server.

## 1. Tính năng học mới
A. **Nguyên văn điều luật ngay trong app**
   - `content/van-ban/<slug>.json`: `{ van_ban, so_hieu, ngay_hieu_luc, link, sua_doi: [ {van_ban, link} ], dieu: { "117": { ten, noi_dung } } }`. Gồm MỌI điều đang được trích trong `content/` (và tình huống). AI tự lấy nguyên văn từ thuvienphapluat.vn / vbpl.vn; điều đã bị sửa đổi thì lấy nội dung hiện hành và ghi chú văn bản sửa đổi.
   - Bấm chip căn cứ ("Điều 117 · BLDS 2015") → khung trượt lên hiện nguyên văn điều đó + nút "Xem văn bản gốc". Có cả trong đề cương và flashcard.
   - Trang `/tra-cuu`: danh sách văn bản → các điều có trong app, ô tìm kiếm (bỏ dấu). Thêm vào tìm kiếm trang chủ.
   - Ghi nguồn ở cuối khung: "Nguồn: <văn bản>, <link>". (Văn bản quy phạm pháp luật không thuộc đối tượng bảo hộ quyền tác giả theo Điều 15 Luật Sở hữu trí tuệ.)
B. **Bài tập tình huống** — 2 tình huống mỗi chương (12 tình huống)
   - Thêm vào schema chương: `tinh_huong: [{ id: "<mon>-<chuong>-th01", tieu_de, de_bai, buoc: [{ hoi, lua_chon: [3–4], dap_an, giai_thich, can_cu: [...] }] }]`, mỗi tình huống 3 bước: xác định vấn đề pháp lý → chọn căn cứ → kết luận. Cập nhật zod + check-content.
   - Trang `/mon/[mon]/tinh-huong/[chuong]`: đề bài ghim trên cùng, làm từng bước với bộ làm bài chung (chọn → Kiểm tra → giải thích), cuối có "Lời giải mẫu" ghép 3 bước. Tính XP, vào ôn câu sai, thống kê, huy hiệu mới "Giải 5 tình huống".
   - AI soạn theo đúng quy trình nội dung (nguyên văn, còn hiệu lực, tự đối chiếu), ghi vào noi-dung/DOI_CHIEU.md.
C. **Lộ trình ôn đến ngày thi**
   - Ở tab Tôi: đặt ngày thi cho từng môn (localStorage). Trang chủ hiện thẻ "Còn N ngày thi Dân sự · Hôm nay: X câu" + nút Bắt đầu.
   - X = (số câu chưa làm + câu sai chưa thuộc + tình huống chưa làm) ÷ số ngày còn lại, tối thiểu 5, tối đa 40; ưu tiên câu sai và điểm yếu. 3 ngày cuối tự chuyển sang gợi ý thi thử. Làm xong mục tiêu ngày thì tick + XP thưởng.
D. **Bảng so sánh, sơ đồ trong đề cương**
   - Thêm vào `de_cuong` (không bắt buộc): `so_sanh: [{ tieu_de, cot: [...], hang: [[...]] }]` và `so_do: [{ tieu_de, nut: [{ ten, con: [...] }] }]` (sơ đồ cây/nhóm). Hiển thị bằng bảng cuộn ngang và sơ đồ khối theo phong cách DESIGN.md, không thư viện nặng.
   - AI viết cho những chương có giá trị, ví dụ: công ty TNHH 2 thành viên vs công ty cổ phần; 9 biện pháp bảo đảm; hình thức xử phạt vs biện pháp khắc phục hậu quả; các trường hợp giao dịch vô hiệu và thời hiệu.

## 2. Cộng đồng
E. **Sinh viên đóng góp câu hỏi**
   - Nút "Đóng góp câu hỏi" (tab Tôi và cuối mỗi bài). Cần biệt danh. Form: loại (trắc nghiệm / nhận định), môn, chương, câu hỏi, lựa chọn + đáp án, giải thích, căn cứ (điều + link bắt buộc). Bảng `contributions(id, player_id, payload jsonb, status: pending|approved|rejected, note, created_at)`; người dùng chỉ thấy bài của mình và trạng thái.
   - Câu đã duyệt hiện trong chương ở mục "Câu cộng đồng" (đọc từ Supabase), ghi "Đóng góp bởi <biệt danh>". Huy hiệu "Người đóng góp".
F. **Trang duyệt `/quan-tri`** (không có link trên giao diện, noindex)
   - Nhập mã PIN, kiểm ở server với biến `ADMIN_PIN`; thao tác qua API route dùng `SUPABASE_SERVICE_ROLE_KEY` (chỉ server).
   - 3 tab: Câu đóng góp (xem, sửa nhanh, Duyệt / Từ chối kèm ghi chú) · Bình luận bị báo cáo (Hiện lại / Ẩn / Xóa) · Báo sai (danh sách theo câu, nút "Đã xử lý"). Thêm một dòng số liệu nhanh: số người chơi, lượt báo sai chưa xử lý.
G. **Hỏi AI về câu này** — LÀM SẴN NHƯNG ẨN
   - Nút "Hỏi AI" trong khung giải thích, CHỈ hiện khi server có biến `GEMINI_API_KEY` (kiểm qua API, không lộ khóa).
   - API `/api/hoi-ai`: nhận item_id + câu hỏi (≤ 300 ký tự); server tự lấy câu hỏi, đáp án, giải thích và nguyên văn các điều căn cứ (mục A) làm ngữ cảnh. Luật cho AI: chỉ trả lời về câu này và luật Việt Nam hiện hành, tiếng Việt, ngắn (≤ 150 chữ), dẫn số điều, không chắc thì nói không chắc, câu ngoài phạm vi thì từ chối. Model đặt bằng biến `GEMINI_MODEL` (mặc định một bản Flash).
   - Giới hạn 5 lần/người/ngày (giờ VN), đếm ở server trong bảng `ai_usage(player_id, day, count)`. Dòng nhỏ "AI có thể sai, hãy đối chiếu điều luật".

## 3. Thứ tự làm và thứ tự cắt
Thứ tự: 0 (1→6) → A → B → D → C → F → E → push (0.5 nếu chưa xong) → G.
Cắt khi trễ (từ cuối lên): G → E → C. Không cắt: mục 0, A, B.

## 4. VIỆC CỦA ĐỨC (AI dừng lại, nói ngắn, đưa sẵn giá trị)
a) Supabase: nếu chưa làm thì bật Anonymous sign-ins; SQL Editor chạy file migration cũ (nếu chưa) rồi file migration mới AI đưa.
b) Vercel → Settings → Environment Variables (Production + Preview), rồi Redeploy:
   - `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API → service_role). TUYỆT ĐỐI không đưa vào code hay commit.
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (AI tạo sẵn bằng `npx web-push generate-vapid-keys` và đưa Đức, không commit khóa private).
   - `CRON_SECRET` (AI tạo chuỗi ngẫu nhiên), `ADMIN_PIN` (Đức tự chọn 6 số).
   - Sau này nếu có: `GEMINI_API_KEY` (aistudio.google.com) để bật "Hỏi AI".
c) Kiểm ngẫu nhiên: 4 tình huống + 10 điều nguyên văn AI chọn.
d) Thử trên điện thoại: tra cứu điều luật, 1 tình huống, đặt ngày thi, đóng góp 1 câu rồi duyệt ở /quan-tri, bật thông báo.
