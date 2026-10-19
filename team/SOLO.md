# Chế độ một mình — Đức + Antigravity làm hết (chốt 19/10/2026 chiều)

**File này THẮNG mọi file khác** (AGENTS.md, PROMPTS.md, DESIGN.md, team/*.md) ở những điểm khác nhau dưới đây. Những gì file này không nhắc tới thì vẫn theo các file kia.

## 1. Đã chốt
- Chỉ Đức làm, AI làm gần như toàn bộ. **Lan, Vy không làm gì.** Bỏ chia việc A/B/C, bỏ Pull Request, bỏ duyệt.
- **AI tự chạy liên tục**: xong việc này làm ngay việc sau, không hỏi xin phép từng bước. Chỉ dừng gọi Đức ở các mốc "VIỆC CỦA ĐỨC" (mục 4).
- Mỗi việc xong: `npm run check` qua → commit tiếng Việt ngắn → push thẳng `main`. Gỡ khóa nhánh main 1 lần: `gh api -X DELETE repos/toilaai12388888/luat-mvp/branches/main/protection`.
- Tên app: **Luật Lẹ** (`lib/config.ts`).
- Ra mắt **thứ Sáu 23/10/2026**.

## 2. Phạm vi bản đầu
- 3 tính năng như cũ: đề cương, trắc nghiệm (15 câu), nhận định đúng/sai (10 câu); mỗi giải thích có căn cứ + link.
- **3 môn × 1 chương** (~75 câu):
  - `content/dan-su/c01.json` — Giao dịch dân sự (Bộ luật Dân sự 2015, Điều 116–133).
  - `content/hanh-chinh/c01.json` — AI chọn 1 chủ đề hay thi của môn Luật Hành chính có luật làm căn cứ rõ ràng và **đang còn hiệu lực** (2025 có nhiều luật mới về bộ máy, chính quyền địa phương: phải kiểm).
  - `content/doanh-nghiep/c01.json` — AI chọn 1 chủ đề hay thi của Luật Doanh nghiệp (ví dụ công ty TNHH), dẫn cả luật sửa đổi nếu điều đó đã bị sửa.
  - Trang môn hiện chương 2 là "Đang soạn".
- **Bỏ đăng nhập Google và Supabase.** XP, combo, chuỗi ngày, tiến độ, câu sai lưu trên trình duyệt (localStorage) qua `lib/attempts.ts` và `lib/stats.ts` (giữ tên hàm, đổi ruột). Bỏ thẻ "Lưu XP… Tiếp tục với Google" ở màn kết quả. Không cần `.env.local` cho app (giữ file, không dùng).
- **Đo người dùng**: Vercel Web Analytics (`@vercel/analytics`, gắn `<Analytics />` trong layout).
- "Báo sai": `REPORT_FORM_URL` trong `lib/config.ts`; rỗng thì ẩn nút.
- Giao diện giữ nguyên 100% theo `design/DESIGN.md` và `design/prototype.dc.html` (navy, Be Vietnam Pro, ảnh thật, chọn rồi "Kiểm tra", có chế độ tối, âm thanh).
- Thứ tự cắt nếu trễ: trang tiến độ → chế độ tối → âm thanh. Không cắt: giải thích + căn cứ, hiệu ứng đúng/sai, XP.

## 3. Thứ tự AI làm (tự chạy nối tiếp)
1. Gỡ khóa main. Ghi `TIEN_DO_DUC.md`: đã chuyển chế độ một mình.
2. **Nền móng + giao diện chung** (khối A1 trong PROMPTS.md, bỏ phần Supabase; dùng `lib/attempts.ts`/`lib/stats.ts` bản localStorage).
3. **Bộ làm bài dùng chung** (khối B1) → **trang trắc nghiệm** (B2).
4. **Trang nhận định** (C1 + C2 gộp, dùng luôn bộ làm bài).
5. **Trang chủ, trang môn, đề cương** (A3; thẻ "Tiếp tục học" lấy từ localStorage).
6. **Trang tiến độ** (dữ liệu localStorage).
7. **Nội dung 3 chương**: tự mở thuvienphapluat.vn / vbpl.vn lấy nguyên văn, kiểm "Còn hiệu lực", soạn đúng khối PROMPTS.md mục 6. Sau đó **tự đối chiếu từng câu**: mở lại link, so số điều/khoản và ý với nguyên văn, sửa hoặc bỏ câu sai. Ghi bảng `noi-dung/DOI_CHIEU.md` (gitignore thư mục `noi-dung/` nếu chưa): mỗi câu một dòng gồm id, đáp án, căn cứ, link, đoạn nguyên văn ngắn đã đối chiếu, mức chắc chắn. Chọn **15 câu ngẫu nhiên** (5 mỗi môn, ưu tiên câu kém chắc nhất) đưa Đức kiểm.
8. **Chuẩn bị ra mắt**: Vercel Analytics, trang 404, ghi nguồn ảnh ở chân trang chủ, kiểm checklist DESIGN mục 8 bằng cách đọc code và chạy build; soạn sẵn tin nhắn mời bạn dùng thử và 3 bản bài đăng Facebook.

Gặp lỗi thì tự sửa; chỉ dừng gọi Đức khi thật sự cần người (mục 4) hoặc phải chọn giữa hai hướng mà file này không nói.

## 4. VIỆC CỦA ĐỨC (AI dừng lại, nói ngắn gọn, chờ Đức xong)
1. **Lúc bắt đầu**: dán prompt; trong Antigravity bật chế độ cho AI tự chạy lệnh nếu có (để khỏi bấm Accept liên tục).
2. **Sau bước 2 (nền móng)**: đăng nhập vercel.com bằng GitHub → Add New Project → import `luat-mvp` → Deploy → tab Analytics bấm Enable. Gửi AI link web. (~10 phút)
3. **Sau bước 5**: mở link web trên điện thoại, bấm thử 1 bài, nói AI thấy gì chưa ổn.
4. **Sau bước 7**: kiểm 15 câu AI đưa (mở link, đọc đoạn nguyên văn, trả lời "ok" hoặc "câu X sai").
5. **Thứ Năm 22/10**: gửi tin AI soạn cho 5–10 bạn đã phỏng vấn, chuyển góp ý cho AI sửa. 21h khóa code.
6. **Thứ Sáu 23/10**: đăng bài AI soạn vào các nhóm Facebook sinh viên Luật.

## 5. Cách AI báo cáo
Sau mỗi bước: 2–3 dòng (đã xong gì, đang làm gì tiếp) và cập nhật `TIEN_DO_DUC.md`. Không hỏi lại những gì file này đã chốt.
