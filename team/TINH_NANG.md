# Tính năng bản ra mắt 23/10

## 0. Sửa nội dung trước
- doanh-nghiep-c01-nd05: giải thích sai. Theo Điều 54 Luật Doanh nghiệp 2020, chỉ công ty là doanh nghiệp nhà nước (hoặc công ty con của DNNN) mới bắt buộc lập Ban kiểm soát; công ty khác tự quyết, không phụ thuộc 11 thành viên (đó là luật 2014). Sửa giải thích và câu liên quan.
- Kiểm lại toàn bộ câu Hành chính và Doanh nghiệp theo các luật sửa đổi năm 2025 (Luật Doanh nghiệp, Luật Xử lý vi phạm hành chính, thay đổi thẩm quyền do chính quyền địa phương 2 cấp). Câu nào điều/khoản đã bị sửa thì cập nhật căn cứ và đáp án, dẫn cả văn bản sửa đổi. Cập nhật noi-dung/DOI_CHIEU.md.

## 1. Nội dung: thêm chương 2 mỗi môn (3 môn × 2 chương ≈ 150 câu)
Cùng quy trình bước 7 của team/SOLO.md (lấy nguyên văn, kiểm còn hiệu lực, soạn, tự đối chiếu). Chọn chủ đề hay thi, có luật làm căn cứ rõ. Xong chọn 15 câu mới (ưu tiên kém chắc) đưa Đức kiểm.

## 2. Tài khoản biệt danh (không mật khẩu)
- Dùng Supabase Anonymous Sign-ins (supabase.auth.signInAnonymously). Lần đầu người dùng cần tính năng cộng đồng (xếp hạng, thách đấu, bình luận) thì hỏi biệt danh + trường (danh sách gợi ý các trường Luật: ĐH Luật Hà Nội, ĐH Luật TP.HCM, Khoa Luật ĐHQGHN, Học viện Tư pháp, ĐH Kinh tế - Luật, Học viện Ngoại giao, ĐH Ngoại thương, khác). Học bài thường vẫn không cần tài khoản.
- XP, chuỗi, câu sai, đánh dấu vẫn lưu localStorage; có tài khoản thì đồng bộ thêm XP tuần lên Supabase.
- Bảng: players(id = auth.uid, nickname, school, created_at), weekly_xp(player_id, week_start, xp), challenges(id, creator_id, item_ids text[], creator_score, created_at), challenge_results(challenge_id, player_id, score, created_at), comments(id, item_id, player_id, body ≤ 500 ký tự, hidden bool, reports int, created_at). RLS bật hết: ai cũng đọc được bảng xếp hạng, comment không ẩn, challenge; chỉ ghi dòng của mình. Có lọc từ ngữ thô tục cơ bản. Viết SQL vào supabase/migrations/ và đưa Đức dán vào SQL Editor.

## 3. Danh sách tính năng (làm theo thứ tự, mỗi cái xong là check + commit + push)
1. Ôn câu sai + đánh dấu câu: nút đánh dấu trên mỗi câu; trang "Ôn tập" gom câu sai và câu đã đánh dấu, làm lại được, làm đúng 2 lần liên tiếp thì rời danh sách câu sai.
2. Thi thử có giờ: chọn môn, chương (1 hoặc nhiều), 10/20/40 câu, trộn trắc nghiệm + nhận định, ~1 phút/câu, đồng hồ đếm ngược, không hiện đáp án khi đang làm, nộp bài → điểm thang 10, xem lại từng câu kèm giải thích. Lưu lịch sử điểm.
3. Thử thách hằng ngày: mỗi ngày 5 câu giống nhau cho mọi người (chọn theo ngày, không cần máy chủ), làm 1 lần/ngày, xong được thẻ kết quả kiểu Wordle (ô vuông đúng/sai, "Luật Lẹ ngày 23/10: 4/5") có nút chia sẻ/tải ảnh để đăng story. Tính vào chuỗi ngày.
4. Huy hiệu: 10–12 huy hiệu (ví dụ Câu đầu tiên, 10 câu đúng liên tiếp, Chuỗi 3/7 ngày, Hoàn thành 1 chương, Thi thử 8+ điểm, Thử thách 5/5, Hoàn thành môn). Hiện khi đạt (chuyển động nhẹ), xem ở trang Tiến độ.
5. Thống kê điểm yếu: ở trang Tiến độ, liệt kê điều luật/chủ đề sai nhiều nhất, nút "Ôn ngay" mở bài gồm các câu đó.
6. Tìm kiếm: ô tìm ở trang chủ, tìm theo từ khóa hoặc "Điều 117" trong câu hỏi, giải thích, đề cương; có bỏ dấu tiếng Việt khi so khớp.
7. Flashcard điều luật: theo chương, mặt trước "Điều 117 · BLDS 2015" + tên điều, mặt sau tóm tắt nội dung; nút "Nhớ rồi / Chưa nhớ", thẻ chưa nhớ quay lại sớm hơn (lặp lại ngắt quãng đơn giản, lưu localStorage).
8. Bảng xếp hạng: XP theo tuần (thứ Hai–Chủ nhật), tab Toàn quốc / Trường tôi, top 50 + hạng của mình.
9. Thách đấu bạn bè: sau bài 10 câu có nút "Thách đấu bạn" → tạo link; bạn mở link làm đúng 10 câu đó, xong thấy hai điểm cạnh nhau; người tạo xem được danh sách ai đã nhận thách đấu.
10. Bình luận dưới câu: trong khung giải thích, nút "Thảo luận (n)" mở danh sách bình luận; viết cần có biệt danh; nút báo cáo; bị báo 3 lần tự ẩn. Đức ẩn/xóa thủ công trong Supabase.
11. Nhắc học: biến web thành PWA (manifest, icon, cài lên màn hình chính), xin quyền thông báo sau khi người dùng hoàn thành bài đầu tiên; nhắc 20h nếu hôm đó chưa học (Web Push + lịch chạy phía máy chủ). Nếu không kịp hoặc quá phức tạp thì bỏ, chỉ giữ PWA.
Thứ tự cắt khi trễ: 11 → 10 → 7 → 6. Không cắt: 1, 2, 3, nội dung.

## 4. Giao diện
Mọi màn mới theo đúng design/DESIGN.md (navy, viền 1px, không gradient, Be Vietnam Pro, icon Lucide, sáng + tối). Thêm tab dưới cùng: Học · Ôn tập · Thi thử · Xếp hạng · Tôi (Tiến độ + huy hiệu + biệt danh). Trước khi code mỗi màn mới, tự phác bố cục theo phong cách prototype rồi làm; không hỏi Đức.

## 5. VIỆC CỦA ĐỨC (chỉ dừng ở đây)
a) Supabase: Authentication → bật Anonymous sign-ins; SQL Editor → dán SQL bạn đưa → Run.
b) Vercel: Settings → Environment Variables → thêm NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY (lấy trong .env.local) cho Production + Preview → Redeploy.
c) Kiểm 15 câu mới.
d) Thử trên điện thoại sau khi xong mục 1–5 và sau khi xong hết.
e) Thứ Năm gửi link cho bạn, Thứ Sáu đăng bài (bạn soạn sẵn).
