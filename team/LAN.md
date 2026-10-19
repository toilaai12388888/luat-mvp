# Sổ tay của Lan — Người B

File này viết cho **Claude Code trên máy Lan**. Claude đọc hết rồi dắt Lan làm đúng thứ tự dưới đây. Luật chung của đội nằm ở `AGENTS.md`, giao diện ở `design/DESIGN.md`, nội dung từng việc code ở `PROMPTS.md`. Mâu thuẫn → `AGENTS.md` thắng.

## 1. Lan là ai, làm gì

- Lan là **Người B**. Phụ trách:
  - **Bộ làm bài dùng chung** `components/quiz/**` (Vy dùng lại cho phần nhận định).
  - **Trang trắc nghiệm** `app/mon/[mon]/trac-nghiem/**`, `components/trac-nghiem/**`.
  - **Nội dung môn Luật Hành chính**, 2 chương: `content/hanh-chinh/c01.json`, `c02.json`.
- Đồng đội: **Đức** (Người A: nền móng, đăng nhập, trang chủ, môn Dân sự; là người điều phối, duyệt và merge PR), **Vy** (Người C: nhận định, tiến độ, môn Doanh nghiệp).
- Cả đội liên lạc qua Zalo. Lan **chưa từng code**, máy có thể là Windows hoặc Mac: hỏi Lan ngay ở bước đầu.

## 2. Cách Claude làm việc với Lan (bắt buộc)

1. **Mỗi lượt chỉ một bước.** Nói ngắn: làm gì, vì sao (1 câu), bấm gì hoặc gõ gì. Chờ Lan trả lời "xong" hoặc dán kết quả rồi mới sang bước sau.
2. **Lệnh trên máy thì Claude tự chạy.** Chỉ nhờ Lan làm việc Claude không làm được: tạo tài khoản trên web, mở email, bấm nút trên trang, gửi Zalo, kiểm tra link luật.
3. Khi Claude Code hiện hộp hỏi quyền chạy lệnh, nói trước cho Lan: lệnh này làm gì, nên chọn "Yes".
4. Không dùng từ chuyên môn khi không cần. Phải dùng thì giải thích trong ngoặc, ví dụ: "PR (bản đề nghị gộp code để Đức duyệt)".
5. Cần nhắn Đức hoặc Vy → **soạn sẵn tin Zalo** trong khung trích dẫn để Lan copy gửi.
6. Ghi tiến độ vào `TIEN_DO_LAN.md` sau mỗi bước xong (bước nào xong, đang chờ ai, việc tiếp theo). Đầu mỗi phiên đọc file này trước. File này không được commit (nằm trong `.gitignore`).
7. Đang chờ người khác → giao Lan việc nội dung (mục 5) để không ngồi không.
8. Không bao giờ sửa file ngoài phần của Lan, không push thẳng `main`, không xóa gì của người khác (chi tiết ở `AGENTS.md` mục 3 và 9).

## 3. Lịch của Lan

| Khi nào | Việc | Chờ ai |
|---|---|---|
| Thứ Hai 19/10 | Giai đoạn 0: chuẩn bị máy, tạo GitHub · Bắt đầu chương 1 Hành chính | Đức mời vào repo |
| Thứ Ba 20/10 sáng | Chương 1 xong, chương 2 · Giai đoạn 1: nhận repo khi Đức báo | Đức báo "nền móng đã merge" (dự kiến 12h) |
| Thứ Ba 20/10 chiều | Giai đoạn 2: bộ làm bài dùng chung, **gửi PR trước 20h** để Đức merge trước 22h | Đức duyệt |
| Thứ Tư 21/10 | Giai đoạn 3: trang trắc nghiệm hoàn chỉnh · nội dung xong cả 2 chương | Đức duyệt |
| Thứ Năm 22/10 | Giai đoạn 4: soi giao diện, sửa lỗi bạn bè báo · 21h khóa code | Đức |
| Thứ Sáu 23/10 | Đăng bài giới thiệu vào nhóm sinh viên Luật | |

Trễ thì báo Đức ngay (soạn tin Zalo), không im lặng.

## 4. Giai đoạn 0 — Chuẩn bị máy (Thứ Hai 19/10)

**0.1 Hỏi máy.** Hỏi Lan dùng Windows hay Mac. Ghi vào `TIEN_DO_LAN.md`.

**0.2 Kiểm tra công cụ.** Tự chạy `git --version`, `node --version`, `gh --version`. Cần: git bất kỳ, Node 20 trở lên (bản LTS), gh bất kỳ. Thiếu cái nào thì cài:
- Windows: `winget install --id Git.Git -e`, `winget install --id OpenJS.NodeJS.LTS -e`, `winget install --id GitHub.cli -e`. Cài xong nhờ Lan đóng terminal, mở lại đúng thư mục, gõ `claude`, rồi gõ "Tôi là Lan, làm tiếp".
- Mac: git → `xcode-select --install` (Lan bấm Install trên hộp thoại). Node → nhờ Lan tải bản LTS (.pkg) ở nodejs.org rồi cài như phần mềm thường. gh → có Homebrew thì `brew install gh`, không có thì nhờ Lan tải bản .pkg ở cli.github.com. Cài xong mở lại terminal như trên.

**0.3 Tạo GitHub.** Nhờ Lan vào github.com/signup, dùng email hay dùng, đặt tên người dùng dễ nhớ, xác minh email. Hỏi lại tên người dùng. Soạn tin Zalo:
> Đức ơi, GitHub của Lan là: `<tên>`. Đức mời Lan vào repo luat-mvp nhé.

**0.4 Đăng nhập GitHub trên máy.** Lệnh này hỏi từng câu nên Lan tự gõ: nhờ Lan mở thêm một cửa sổ terminal (như lúc đầu), gõ `gh auth login`, chọn GitHub.com → HTTPS → Yes → Login with a web browser, copy mã 8 ký tự hiện ra, bấm Enter, dán mã vào trang web vừa mở. Xong Lan báo, Claude kiểm bằng `gh auth status` rồi chạy `gh auth setup-git`. Đặt `git config --global user.name "<tên Lan>"` và `git config --global user.email "<email GitHub>"`.

**0.5 Nhận lời mời.** Khi Đức báo đã mời: nhờ Lan mở email "invited you to collaborate" (hoặc github.com/notifications) và bấm Accept. Chưa có thì làm mục 5 trong lúc chờ.

## 5. Nội dung Luật Hành chính (làm xen kẽ, xong cả 2 chương trước tối Thứ Tư)

1. **Chọn chương.** Đề xuất cho Lan 3–4 chủ đề hay thi trong môn Luật Hành chính mà **có văn bản luật đang hiệu lực làm căn cứ**, để Lan chốt 2 (Lan có thể hỏi bạn học luật). Lưu ý: năm 2025 Việt Nam sửa nhiều luật về bộ máy và chính quyền địa phương; chỉ chọn chủ đề mà văn bản gốc còn hiệu lực, ghi rõ văn bản sửa đổi nếu có.
2. **Lấy nguyên văn.** Thử tự mở trang văn bản trên thuvienphapluat.vn hoặc vbpl.vn để lấy nguyên văn các điều và link từng văn bản; kiểm dòng "Tình trạng: Còn hiệu lực". Không mở được → hướng dẫn Lan copy nguyên văn dán vào `nhap/hanh-chinh-c01-nguon.txt`.
3. **Soạn.** Làm đúng khối "Viết nội dung một chương" ở `PROMPTS.md` mục 6 và luật ở `AGENTS.md` mục 4.1 và 8. Chưa có repo → lưu `nhap/hanh-chinh/c01.json`; có repo rồi → `content/hanh-chinh/c01.json` trong nhánh `b/noi-dung-c01`.
4. **Lan kiểm.** Tạo `nhap/hanh-chinh-c01-kiem.md`: mỗi dòng một căn cứ (văn bản, điều, link) kèm ô `[ ]`. Lan mở từng link, xem điều đó có thật và đúng ý câu hỏi không, tick. **Claude không tick thay.** Câu nào Lan thấy sai hoặc không chắc → bỏ hoặc sửa.
5. **Gửi.** Có repo rồi: "Kiểm tra và gửi PR" (`AGENTS.md` mục 9) với tiêu đề `B: nội dung chương 1 Hành chính`. Soạn tin Zalo báo Đức có PR.

Chương 2 làm y hệt (`c02`, nhánh `b/noi-dung-c02`).

## 6. Giai đoạn 1 — Nhận repo (Thứ Ba 20/10, khi Đức báo)

Đức sẽ gửi qua Zalo: tin "nền móng đã merge" và 2 giá trị `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
1. Clone repo vào **cùng thư mục cha với thư mục bộ tài liệu**, tên `luat-mvp`.
2. Chép `TIEN_DO_LAN.md` và thư mục `nhap/` từ thư mục bộ tài liệu sang `luat-mvp/`.
3. `npm install`. Tạo `.env.local` với 2 giá trị Đức gửi (nhờ Lan dán vào chat).
4. Xem web trên máy: nhờ Lan mở thêm một cửa sổ terminal ở thư mục `luat-mvp`, gõ `npm run dev` và để cửa sổ đó chạy (không tắt), rồi mở http://localhost:3000. Khi không cần nữa, bấm Ctrl+C trong cửa sổ đó.
5. Hướng dẫn Lan từ giờ mở terminal ở thư mục `luat-mvp` (Windows: mở thư mục, gõ powershell trên thanh địa chỉ; Mac: Terminal, gõ cd và dấu cách, kéo thư mục `luat-mvp` vào, Enter), gõ `claude`, rồi gõ "Tôi là Lan, làm tiếp".
6. Nếu đã có nội dung trong `nhap/`: chuyển vào `content/hanh-chinh/` và gửi PR như mục 5.

## 7. Giai đoạn 2 — Bộ làm bài dùng chung (Thứ Ba chiều, PR trước 20h)

Làm đúng khối **B1** trong `PROMPTS.md`, chữ ký đúng `AGENTS.md` mục 4.4 (Vy đang code theo chữ ký này, không được đổi). So từng chi tiết với `design/prototype.dc.html` (khối `qtop`, `dock`, `fb`, `res`). Trước khi sửa > 3 file: nêu kế hoạch ngắn bằng lời thường cho Lan, chờ "ok".

Gửi PR xong:
- Nhờ Lan mở link xem thử Vercel trên điện thoại, tick checklist `design/DESIGN.md` mục 8 cùng Lan.
- Soạn tin Zalo:
> Đức ơi, Lan gửi PR bộ làm bài rồi: `<link PR>`. Vy ơi, merge xong là Vy ghép vào nhận định được nhé.

## 8. Giai đoạn 3 — Trang trắc nghiệm (Thứ Tư 21/10)

Làm đúng khối **B2** trong `PROMPTS.md`. Nếu PR bộ làm bài chưa merge, nhắc Lan nhắn Đức trước. Xong: checklist DESIGN mục 8, gửi PR, soạn tin Zalo báo Đức.

## 9. Giai đoạn 4 — Soi và sửa (Thứ Năm 22/10)

- Sáng: cùng Lan mở web thật trên điện thoại, đi hết trang trắc nghiệm ở chế độ sáng và tối, so với prototype. Lỗi trong phần Lan → sửa, gửi PR nhỏ. Lỗi phần người khác → soạn tin Zalo báo người đó.
- Chiều: đọc lỗi bạn bè báo (Đức chuyển qua Zalo), sửa phần của Lan.
- **21h: khóa code.** Sau giờ này không gửi PR nữa trừ khi Đức đồng ý.

## 10. Gặp sự cố

| Chuyện | Làm gì |
|---|---|
| Gõ `node`, `git`, `gh` báo không tìm thấy sau khi cài | Đóng terminal, mở lại, gõ `claude`, "Tôi là Lan, làm tiếp" |
| Push bị từ chối (permission denied, 403) | Lan chưa bấm Accept lời mời, hoặc chưa `gh auth setup-git` |
| `npm run check` lỗi ở file của người khác | Dừng, soạn tin Zalo gửi chủ file kèm nguyên văn lỗi |
| Xung đột khi `git merge origin/main` | Trong file của Lan → tự gỡ. File người khác → `git merge --abort`, báo Đức |
| Cần thêm hàm, component chung, thư viện | Không tự thêm. Viết đề xuất (file nào, đổi gì, vì sao), soạn tin Zalo gửi Đức |
| Link xem thử Vercel không hiện trên PR | Báo Đức kiểm tra Vercel |
| Port 3000 đang bận | Tắt terminal cũ đang chạy `npm run dev`, hoặc chạy cổng khác |
| Lan muốn đổi giao diện khác bản mẫu | Giải thích giao diện đã chốt; ghi ý tưởng vào `TIEN_DO_LAN.md` để sau ra mắt |
