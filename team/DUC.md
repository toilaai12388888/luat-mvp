# Sổ tay của Đức — Người A, điều phối

File này viết cho **Claude Code trên máy Đức** (Windows, thư mục `D:\Projects`). Claude đọc hết rồi dắt Đức làm đúng thứ tự dưới đây. Luật chung ở `AGENTS.md`, giao diện ở `design/DESIGN.md`, nội dung từng việc code ở `PROMPTS.md`. Mâu thuẫn → `AGENTS.md` thắng.

## 1. Đức là ai, làm gì

- Đức là **Người A** và là **người điều phối** cả đội. Phụ trách:
  - **Nền móng + phần dùng chung**: repo, cấu hình, `app/globals.css`, `lib/**`, `components/ui/**`, `supabase/**`, `scripts/**`, `.github/**`, `design/**`, `team/**`, `package.json` (danh sách đủ ở `AGENTS.md` mục 3).
  - **Trang**: trang chủ, trang môn, đề cương; đăng nhập Google, lưu kết quả, XP, chuỗi ngày.
  - **Nội dung môn Luật Dân sự**, 2 chương: `content/dan-su/c01.json`, `c02.json`.
  - **Điều phối**: mời Lan, Vy vào repo; gửi biến môi trường; báo các mốc; duyệt và merge mọi PR; gom lỗi khi cho bạn bè dùng thử; giữ lịch.
- Đồng đội: **Lan** (Người B: bộ làm bài dùng chung, trắc nghiệm, môn Hành chính), **Vy** (Người C: nhận định, tiến độ, môn Doanh nghiệp). Cả hai **chưa từng code**, dùng Claude Code trong terminal, có người dùng Mac. Cả đội liên lạc qua Zalo.

## 2. Cách Claude làm việc với Đức

1. Mỗi lượt một bước rõ ràng; việc trên web (GitHub, Supabase, Google Cloud, Vercel) thì hướng dẫn từng cú bấm và chờ Đức xác nhận.
2. Lệnh trên máy thì Claude tự chạy.
3. Mỗi khi tới **mốc điều phối** (đánh dấu 📣 bên dưới), dừng lại và **soạn sẵn tin Zalo** cho Đức gửi Lan, Vy hoặc cả nhóm.
4. Ghi tiến độ vào `TIEN_DO_DUC.md` (không commit) sau mỗi bước; đầu phiên đọc file này trước.
5. Ưu tiên việc đang chặn người khác: nền móng (chặn Lan, Vy) và duyệt PR bộ làm bài của Lan (chặn Vy) luôn đứng trước việc riêng của Đức.

## 3. Lịch của Đức

| Khi nào | Việc | Ai đang chờ Đức |
|---|---|---|
| Thứ Hai 19/10 | Chốt tên app · gửi bộ tài liệu cho Lan, Vy · A0: repo, Supabase, Google, Vercel · mời Lan, Vy | Lan, Vy chờ lời mời |
| Thứ Ba 20/10 sáng | A1: nền móng + giao diện chung, **merge trước 12h** · 📣 báo Lan, Vy + gửi biến | Lan, Vy chờ để code |
| Thứ Ba 20/10 chiều | A2: đăng nhập, lưu kết quả, XP, chuỗi · duyệt PR nội dung · **duyệt PR bộ làm bài của Lan tối nay** | Vy chờ bộ làm bài |
| Thứ Tư 21/10 | A3: trang chủ, môn, đề cương · nội dung Dân sự 2 chương · duyệt PR | |
| Thứ Năm 22/10 | Soi giao diện · 14h gửi link 5–10 bạn · gom lỗi · 21h khóa code · chuẩn bị ra mắt | |
| Thứ Sáu 23/10 | Ra mắt: đăng bài, theo dõi | |

## 4. Thứ Hai 19/10

**4.1 Chốt tên app.** Hỏi Đức chốt 1 trong: Đậu Luật, Thuộc Luật, Lexi, Luật Lẹ (đã xem trong prototype). Ghi vào `TIEN_DO_DUC.md`; dùng ở A1.

**4.2 📣 Gửi bộ tài liệu cho Lan, Vy.** Nén thư mục `D:\Projects\luat-mvp-kit` thành `luat-mvp-kit.zip` (bỏ `TIEN_DO_*.md`, `nhap/`). Nhắc Đức gửi qua Zalo: file zip + nội dung `GUI_LAN.txt` cho Lan, `GUI_VY.txt` cho Vy.

**4.3 A0.** Làm đúng khối **A0** trong `PROMPTS.md` (đã gồm: `.gitignore` từ đầu, bỏ tick "Require approvals", biến Vercel cho cả Preview, chuyển `TIEN_DO_DUC.md` sang repo), thêm 3 việc:
- Chép cả `team/` vào repo cùng `design/`.
- Trong Google Cloud: màn hình đồng ý OAuth chọn External, chỉ xin email và profile; ghi nhớ phải bấm **Publish app** (đưa sang "In production") trước khi cho bạn bè dùng thử ở Thứ Năm, nếu không chỉ người trong danh sách test mới đăng nhập được.
- Supabase: Site URL tạm là localhost; sẽ đổi sang domain Vercel thật sau khi deploy.

**4.4 Mời Lan, Vy.** Khi Lan, Vy gửi tên GitHub qua Zalo, Claude tự chạy `gh api -X PUT repos/<owner>/luat-mvp/collaborators/<ten> -f permission=push` cho từng người. 📣 Soạn tin:
> Đã mời rồi nhé. Mở email "invited you to collaborate" hoặc github.com/notifications, bấm Accept.

## 5. Thứ Ba 20/10

**5.1 A1 (sáng, merge trước 12h).** Làm đúng khối **A1** trong `PROMPTS.md`. PR này Đức tự duyệt (main không bắt buộc người khác duyệt): chạy `npm run check`, mở link xem thử, rồi merge (mục 8).

**5.2 📣 Báo nền móng xong.** Soạn tin gửi nhóm:
> Nền móng đã merge vào main. Lan, Vy: mở Claude Code, gõ "Tôi là <tên>, làm tiếp" để nhận repo. Hai giá trị cho file .env.local:
> NEXT_PUBLIC_SUPABASE_URL=<giá trị>
> NEXT_PUBLIC_SUPABASE_ANON_KEY=<giá trị>

(Lấy giá trị từ `.env.local` của Đức. Hai giá trị này được phép công khai; tuyệt đối không gửi service role key.)

**5.3 A2 (chiều).** Làm đúng khối **A2** trong `PROMPTS.md`.

**5.4 Duyệt PR.** Trong ngày có thể có PR nội dung chương 1 của Lan, Vy và khoảng 20h có PR bộ làm bài của Lan. Duyệt theo mục 8. PR bộ làm bài: duyệt và merge **ngay trong tối** để sáng mai Vy ghép. 📣 Merge xong soạn tin:
> Bộ làm bài của Lan đã merge. Vy ơi, sáng mai ghép vào nhận định được rồi.

## 6. Thứ Tư 21/10

- **A3** đúng khối **A3** trong `PROMPTS.md`.
- **Nội dung Dân sự** 2 chương: làm như `team/LAN.md` mục 5 (đổi môn thành `dan-su`, nhánh `a/noi-dung-c01`, `a/noi-dung-c02`); Đức tự mở từng link kiểm, Claude không tick thay. Chương 1 thay file mẫu đang có.
- Duyệt PR của Lan (trang trắc nghiệm), Vy (nhận định, tiến độ), nội dung chương 2.
- 📣 Cuối ngày soạn tin hỏi nhóm: ai còn việc gì chưa xong, có cần cắt gì không (thứ tự cắt ở `PROMPTS.md` mục 0).

## 7. Thứ Năm 22/10 và Thứ Sáu 23/10

**Sáng Thứ Năm**
- Cả nhóm soi checklist `design/DESIGN.md` mục 8 trên điện thoại thật, sáng và tối. Đức đi hết luồng: trang chủ → môn → đề cương → trắc nghiệm → kết quả → đăng nhập → tiến độ.
- Google Cloud: bấm **Publish app**. Supabase: Site URL và Redirect URLs thêm domain Vercel thật. Đăng nhập thử bằng một tài khoản Google ngoài danh sách test.
- Tạo Google Form "Báo câu sai" (1 ô id câu, 1 ô mô tả), lấy link điền sẵn id, đặt vào `REPORT_FORM_URL` trong `lib/config.ts` bằng một PR nhỏ.

**14h** 📣 Soạn tin gửi 5–10 bạn đã phỏng vấn:
> Mình đang làm web ôn thi Luật, cho bạn dùng thử trước khi ra mắt nhé: <link>. Bạn làm thử 1 bài trắc nghiệm và 1 bài nhận định, thấy chỗ nào khó dùng, sai, hay xấu thì nhắn mình (chụp màn hình càng tốt). Cảm ơn bạn nhiều!

**14h–20h** Gom góp ý vào `TIEN_DO_DUC.md`, chia theo người phụ trách (theo `AGENTS.md` mục 3). 📣 Soạn tin chuyển lỗi cho Lan, Vy. Lỗi sai nội dung luật: người phụ trách môn sửa trong ngày.

**21h** 📣 Khóa code:
> 21h rồi, khóa code nhé. Từ giờ chỉ merge sửa lỗi nặng và phải nhắn Đức trước.

**Tối Thứ Năm** Soạn bài đăng Facebook cho nhóm sinh viên Luật: 1 câu nói nỗi đau (ôn bị "bơi", không biết nhận định đúng hay sai), 3 thứ app có, nhấn "miễn phí, mỗi câu có điều luật kèm link", link web, 2–3 ảnh chụp màn hình. Soạn 3 phiên bản để Đức, Lan, Vy đăng không trùng chữ.

**Thứ Sáu 23/10** 📣 Nhắc cả nhóm đăng bài. Theo dõi số đăng nhập trên Supabase (bảng `profiles`) và số lần làm (bảng `attempts`), ghi vào `TIEN_DO_DUC.md` mỗi tối.

## 8. Cách duyệt và merge một PR

1. `gh pr list` để thấy PR đang chờ. Với từng PR: `gh pr view <số>` và `gh pr diff <số>`.
2. Chạy đúng khối "Người duyệt PR" ở `PROMPTS.md` mục 5. Kiểm thêm: check GitHub Actions xanh (`gh pr checks <số>`).
3. Nhờ Đức mở link xem thử Vercel trên điện thoại, bấm đúng phần PR đó đổi.
4. Ổn → `gh pr merge <số> --squash --delete-branch`. Chưa ổn → `gh pr comment <số>` ghi rõ cần sửa gì, rồi 📣 soạn tin Zalo báo người gửi.
5. PR đổi phần chốt trước (`AGENTS.md` mục 4) → chỉ merge khi đã báo cả nhóm.

## 9. Gặp sự cố

| Chuyện | Làm gì |
|---|---|
| Lan, Vy push bị từ chối | Kiểm họ đã Accept lời mời chưa: `gh api repos/<owner>/luat-mvp/collaborators` |
| Link xem thử Vercel không có trên PR của Lan, Vy | Kiểm repo có đang public không, Vercel có nối đúng repo không |
| Đăng nhập Google lỗi "redirect_uri_mismatch" hoặc quay về sai trang | Sửa Redirect URLs trong Supabase và Authorized redirect URI trong Google Cloud |
| Bạn bè không đăng nhập được | Google OAuth chưa Publish app |
| Supabase báo dự án tạm dừng | Vào trang Supabase bấm khôi phục |
| Lan hoặc Vy trễ nặng | Cắt theo thứ tự ở `PROMPTS.md` mục 0, không lùi ngày ra mắt; Đức có thể nhận bớt việc nhưng phải báo trước để không sửa trùng file |
| Hai người cần sửa cùng một file | Chủ file sửa, người kia gửi đề xuất |
