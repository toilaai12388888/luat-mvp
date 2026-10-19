# Sổ tay của Vy — Người C

File này viết cho **Claude Code trên máy Vy**. Claude đọc hết rồi dắt Vy làm đúng thứ tự dưới đây. Luật chung của đội nằm ở `AGENTS.md`, giao diện ở `design/DESIGN.md`, nội dung từng việc code ở `PROMPTS.md`. Mâu thuẫn → `AGENTS.md` thắng.

## 1. Vy là ai, làm gì

- Vy là **Người C**. Phụ trách:
  - **Trang nhận định đúng/sai** `app/mon/[mon]/nhan-dinh/**`, `components/nhan-dinh/**`.
  - **Trang tiến độ** `app/tien-do/**`, `components/tien-do/**`.
  - **Nội dung môn Luật Doanh nghiệp**, 2 chương: `content/doanh-nghiep/c01.json`, `c02.json`.
- Vy dùng lại **bộ làm bài dùng chung** `components/quiz/**` do Lan làm. Bộ này xong muộn nhất 22h Thứ Ba; trước đó Vy code theo đúng chữ ký đã chốt ở `AGENTS.md` mục 4.4.
- Đồng đội: **Đức** (Người A: nền móng, đăng nhập, trang chủ, môn Dân sự; là người điều phối, duyệt và merge PR), **Lan** (Người B: bộ làm bài, trắc nghiệm, môn Hành chính).
- Cả đội liên lạc qua Zalo. Vy **chưa từng code**, máy có thể là Windows hoặc Mac: hỏi Vy ngay ở bước đầu.

## 2. Cách Claude làm việc với Vy (bắt buộc)

1. **Mỗi lượt chỉ một bước.** Nói ngắn: làm gì, vì sao (1 câu), bấm gì hoặc gõ gì. Chờ Vy trả lời "xong" hoặc dán kết quả rồi mới sang bước sau.
2. **Lệnh trên máy thì Claude tự chạy.** Chỉ nhờ Vy làm việc Claude không làm được: tạo tài khoản trên web, mở email, bấm nút trên trang, gửi Zalo, kiểm tra link luật.
3. Khi Claude Code hiện hộp hỏi quyền chạy lệnh, nói trước cho Vy: lệnh này làm gì, nên chọn "Yes".
4. Không dùng từ chuyên môn khi không cần. Phải dùng thì giải thích trong ngoặc, ví dụ: "PR (bản đề nghị gộp code để Đức duyệt)".
5. Cần nhắn Đức hoặc Lan → **soạn sẵn tin Zalo** trong khung trích dẫn để Vy copy gửi.
6. Ghi tiến độ vào `TIEN_DO_VY.md` sau mỗi bước xong (bước nào xong, đang chờ ai, việc tiếp theo). Đầu mỗi phiên đọc file này trước. File này không được commit (nằm trong `.gitignore`).
7. Đang chờ người khác → giao Vy việc nội dung (mục 5) để không ngồi không.
8. Không bao giờ sửa file ngoài phần của Vy (kể cả `components/quiz/**` của Lan), không push thẳng `main`, không xóa gì của người khác (chi tiết ở `AGENTS.md` mục 3 và 9).

## 3. Lịch của Vy

| Khi nào | Việc | Chờ ai |
|---|---|---|
| Thứ Hai 19/10 | Giai đoạn 0: chuẩn bị máy, tạo GitHub · Bắt đầu chương 1 Doanh nghiệp | Đức mời vào repo |
| Thứ Ba 20/10 sáng | Chương 1 xong, chương 2 · Giai đoạn 1: nhận repo khi Đức báo | Đức báo "nền móng đã merge" (dự kiến 12h) |
| Thứ Ba 20/10 chiều | Giai đoạn 2: phần riêng của nhận định + trang tiến độ | Đức duyệt |
| Thứ Tư 21/10 | Giai đoạn 3: ghép bộ làm bài của Lan vào nhận định, hoàn thiện tiến độ · nội dung xong cả 2 chương | Đức merge bộ làm bài của Lan (dự kiến trước 22h Thứ Ba), Đức duyệt PR của Vy |
| Thứ Năm 22/10 | Giai đoạn 4: soi giao diện, sửa lỗi bạn bè báo · 21h khóa code | Đức |
| Thứ Sáu 23/10 | Đăng bài giới thiệu vào nhóm sinh viên Luật | |

Trễ thì báo Đức ngay (soạn tin Zalo), không im lặng. Nếu trễ nặng, trang tiến độ là phần đầu tiên được cắt (theo `PROMPTS.md` mục 0): hỏi Đức trước khi cắt.

## 4. Giai đoạn 0 — Chuẩn bị máy (Thứ Hai 19/10)

**0.1 Hỏi máy.** Hỏi Vy dùng Windows hay Mac. Ghi vào `TIEN_DO_VY.md`.

**0.2 Kiểm tra công cụ.** Tự chạy `git --version`, `node --version`, `gh --version`. Cần: git bất kỳ, Node 20 trở lên (bản LTS), gh bất kỳ. Thiếu cái nào thì cài:
- Windows: `winget install --id Git.Git -e`, `winget install --id OpenJS.NodeJS.LTS -e`, `winget install --id GitHub.cli -e`. Cài xong nhờ Vy đóng terminal, mở lại đúng thư mục, gõ `claude`, rồi gõ "Tôi là Vy, làm tiếp".
- Mac: git → `xcode-select --install` (Vy bấm Install trên hộp thoại). Node → nhờ Vy tải bản LTS (.pkg) ở nodejs.org rồi cài như phần mềm thường. gh → có Homebrew thì `brew install gh`, không có thì nhờ Vy tải bản .pkg ở cli.github.com. Cài xong mở lại terminal như trên.

**0.3 Tạo GitHub.** Nhờ Vy vào github.com/signup, dùng email hay dùng, đặt tên người dùng dễ nhớ, xác minh email. Hỏi lại tên người dùng. Soạn tin Zalo:
> Đức ơi, GitHub của Vy là: `<tên>`. Đức mời Vy vào repo luat-mvp nhé.

**0.4 Đăng nhập GitHub trên máy.** Lệnh này hỏi từng câu nên Vy tự gõ: nhờ Vy mở thêm một cửa sổ terminal (như lúc đầu), gõ `gh auth login`, chọn GitHub.com → HTTPS → Yes → Login with a web browser, copy mã 8 ký tự hiện ra, bấm Enter, dán mã vào trang web vừa mở. Xong Vy báo, Claude kiểm bằng `gh auth status` rồi chạy `gh auth setup-git`. Đặt `git config --global user.name "<tên Vy>"` và `git config --global user.email "<email GitHub>"`.

**0.5 Nhận lời mời.** Khi Đức báo đã mời: nhờ Vy mở email "invited you to collaborate" (hoặc github.com/notifications) và bấm Accept. Chưa có thì làm mục 5 trong lúc chờ.

## 5. Nội dung Luật Doanh nghiệp (làm xen kẽ, xong cả 2 chương trước tối Thứ Tư)

1. **Chọn chương.** Đề xuất cho Vy 3–4 chủ đề hay thi trong môn Luật Doanh nghiệp có căn cứ ở Luật Doanh nghiệp đang hiệu lực, để Vy chốt 2 (Vy có thể hỏi bạn học luật). Luật Doanh nghiệp 2020 đã được sửa đổi; luôn dẫn cả văn bản sửa đổi nếu điều đó bị sửa.
2. **Lấy nguyên văn.** Thử tự mở trang văn bản trên thuvienphapluat.vn hoặc vbpl.vn để lấy nguyên văn các điều và link; kiểm dòng "Tình trạng: Còn hiệu lực". Không mở được → hướng dẫn Vy copy nguyên văn dán vào `nhap/doanh-nghiep-c01-nguon.txt`.
3. **Soạn.** Làm đúng khối "Viết nội dung một chương" ở `PROMPTS.md` mục 6 và luật ở `AGENTS.md` mục 4.1 và 8. Chưa có repo → lưu `nhap/doanh-nghiep/c01.json`; có repo rồi → `content/doanh-nghiep/c01.json` trong nhánh `c/noi-dung-c01`.
4. **Vy kiểm.** Tạo `nhap/doanh-nghiep-c01-kiem.md`: mỗi dòng một căn cứ (văn bản, điều, link) kèm ô `[ ]`. Vy mở từng link, xem điều đó có thật và đúng ý câu hỏi không, tick. **Claude không tick thay.** Câu nào Vy thấy sai hoặc không chắc → bỏ hoặc sửa.
5. **Gửi.** Có repo rồi: "Kiểm tra và gửi PR" (`AGENTS.md` mục 9) với tiêu đề `C: nội dung chương 1 Doanh nghiệp`. Soạn tin Zalo báo Đức có PR.

Chương 2 làm y hệt (`c02`, nhánh `c/noi-dung-c02`).

## 6. Giai đoạn 1 — Nhận repo (Thứ Ba 20/10, khi Đức báo)

Đức sẽ gửi qua Zalo: tin "nền móng đã merge" và 2 giá trị `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
1. Clone repo vào **cùng thư mục cha với thư mục bộ tài liệu**, tên `luat-mvp`.
2. Chép `TIEN_DO_VY.md` và thư mục `nhap/` từ thư mục bộ tài liệu sang `luat-mvp/`.
3. `npm install`. Tạo `.env.local` với 2 giá trị Đức gửi (nhờ Vy dán vào chat).
4. Xem web trên máy: nhờ Vy mở thêm một cửa sổ terminal ở thư mục `luat-mvp`, gõ `npm run dev` và để cửa sổ đó chạy (không tắt), rồi mở http://localhost:3000. Khi không cần nữa, bấm Ctrl+C trong cửa sổ đó.
5. Hướng dẫn Vy từ giờ mở terminal ở thư mục `luat-mvp` (Windows: mở thư mục, gõ powershell trên thanh địa chỉ; Mac: Terminal, gõ cd và dấu cách, kéo thư mục `luat-mvp` vào, Enter), gõ `claude`, rồi gõ "Tôi là Vy, làm tiếp".
6. Nếu đã có nội dung trong `nhap/`: chuyển vào `content/doanh-nghiep/` và gửi PR như mục 5.

## 7. Giai đoạn 2 — Phần riêng của nhận định + trang tiến độ (Thứ Ba chiều)

Làm đúng khối **C1** trong `PROMPTS.md`. Bộ làm bài của Lan chưa có → **không import gì từ `components/quiz`** (sẽ làm hỏng kiểm tra); chỉ làm phần riêng của Vy, ghép ở Giai đoạn 3. So từng chi tiết với `design/prototype.dc.html` (khối nhận định `stmt`, đáp án `opt`, màn tiến độ). Trước khi sửa > 3 file: nêu kế hoạch ngắn bằng lời thường cho Vy, chờ "ok".

Gửi PR xong: nhờ Vy mở link xem thử Vercel trên điện thoại, tick checklist `design/DESIGN.md` mục 8 cùng Vy, soạn tin Zalo báo Đức.

## 8. Giai đoạn 3 — Ghép thành trang nhận định hoàn chỉnh (Thứ Tư 21/10)

Đầu phiên: kiểm `components/quiz/` đã có trong `main` chưa (`git pull` rồi xem thư mục). Chưa có → soạn tin Zalo hỏi Lan và Đức, trong lúc chờ làm nội dung. Có rồi → làm đúng khối **C2** trong `PROMPTS.md`. Thấy bộ làm bài thiếu gì → không tự sửa file của Lan; viết đề xuất, soạn tin Zalo gửi Lan.

Xong: checklist DESIGN mục 8, gửi PR, soạn tin Zalo báo Đức.

## 9. Giai đoạn 4 — Soi và sửa (Thứ Năm 22/10)

- Sáng: cùng Vy mở web thật trên điện thoại, đi hết trang nhận định và tiến độ ở chế độ sáng và tối, so với prototype. Lỗi trong phần Vy → sửa, gửi PR nhỏ. Lỗi phần người khác → soạn tin Zalo báo người đó.
- Chiều: đọc lỗi bạn bè báo (Đức chuyển qua Zalo), sửa phần của Vy.
- **21h: khóa code.** Sau giờ này không gửi PR nữa trừ khi Đức đồng ý.

## 10. Gặp sự cố

| Chuyện | Làm gì |
|---|---|
| Gõ `node`, `git`, `gh` báo không tìm thấy sau khi cài | Đóng terminal, mở lại, gõ `claude`, "Tôi là Vy, làm tiếp" |
| Push bị từ chối (permission denied, 403) | Vy chưa bấm Accept lời mời, hoặc chưa `gh auth setup-git` |
| `npm run check` lỗi ở file của người khác | Dừng, soạn tin Zalo gửi chủ file kèm nguyên văn lỗi |
| Xung đột khi `git merge origin/main` | Trong file của Vy → tự gỡ. File người khác → `git merge --abort`, báo Đức |
| Bộ làm bài của Lan khác chữ ký ở `AGENTS.md` 4.4 | Không sửa file của Lan. Báo Lan và Đức, hai người thống nhất |
| Cần thêm hàm, component chung, thư viện | Không tự thêm. Viết đề xuất, soạn tin Zalo gửi Đức |
| Link xem thử Vercel không hiện trên PR | Báo Đức kiểm tra Vercel |
| Port 3000 đang bận | Tắt terminal cũ đang chạy `npm run dev`, hoặc chạy cổng khác |
| Vy muốn đổi giao diện khác bản mẫu | Giải thích giao diện đã chốt; ghi ý tưởng vào `TIEN_DO_VY.md` để sau ra mắt |
