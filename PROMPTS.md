# Prompt sẵn cho cả đội — làm trong 3 ngày

Claude trên máy mỗi người tự lấy khối việc phù hợp theo sổ tay `team/<TEN>.md`; người dùng không cần tự dán. Có thể dán tay khi cần. Chữ trong `<...>` thì thay bằng thông tin thật.

## 0. Lịch

| Khi nào | Đức (A) | Lan (B) | Vy (C) |
|---|---|---|---|
| **Thứ Hai 19/10 (hôm nay)** | Duyệt giao diện, chốt tên app · **A0**: repo, Supabase, Google login, Vercel | Chuẩn bị máy (team/LAN.md) · Viết chương 1 Hành chính (mục 6) | Chuẩn bị máy (team/VY.md) · Viết chương 1 Doanh nghiệp (mục 6) |
| **Thứ Ba 20/10 sáng** | **A1** nền móng + giao diện chung, **merge trước 12h** | Viết chương 2 Hành chính | Viết chương 2 Doanh nghiệp |
| **Thứ Ba 20/10 chiều** | **A2** đăng nhập, lưu kết quả, XP, chuỗi ngày | **B1** bộ làm bài dùng chung, **gửi PR trước 20h** (Đức merge trước 22h) | **C1** phần riêng của nhận định + trang tiến độ |
| **Thứ Tư 21/10** | **A3** trang chủ, trang môn, đề cương · Chương 1–2 Dân sự | **B2** trang trắc nghiệm hoàn chỉnh | **C2** ghép bộ làm bài vào nhận định, xong tiến độ |
| **Thứ Năm 22/10** | Sáng: cả đội soi checklist "đẹp long lanh", kiểm link nội dung · 14h: gửi link cho 5–10 bạn đã phỏng vấn · đến 20h: sửa lỗi · 21h: khóa main · A viết bài đăng | | |
| **Thứ Sáu 23/10** | Cả ba đăng bài vào các nhóm Facebook sinh viên Luật | | |

Nguyên tắc 3 ngày: việc nào trễ thì cắt bớt, không lùi ngày ra mắt. Thứ tự cắt: trang tiến độ → chế độ tối → âm thanh. Không bao giờ cắt: giải thích + căn cứ, hiệu ứng đúng/sai, XP.

---

## 1. Ba câu dùng hằng ngày (cả 3 người)

```
Bắt đầu phiên.
```

```
Kiểm tra và gửi PR.
```

```
Có lỗi này, sửa giúp tôi nhưng chỉ trong phần của tôi theo AGENTS.md. Nếu lỗi nằm ở phần người khác thì dừng và viết đề xuất để tôi gửi họ:
<dán nguyên lỗi>
```

---

## 2. Đức — Người A

### A0. Tạo dự án (hôm nay 19/10)

Mở Claude Code trong thư mục `D:\Projects`, dán:

```
Tôi là Người A của dự án app ôn thi Luật. Bộ file chung ở D:\Projects\luat-mvp-kit — đọc hết AGENTS.md và design/DESIGN.md trước.

Việc lần này: tạo dự án, chưa làm tính năng.
1. Kiểm tra máy có git, node LTS, npm, gh. Thiếu cái nào thì hướng dẫn tôi cài từng bước, chờ tôi xong mới làm tiếp.
2. Tạo Next.js mới ở D:\Projects\luat-mvp: TypeScript, Tailwind, App Router, ESLint, không thư mục src, alias @/*.
3. Chép AGENTS.md, CLAUDE.md, PROMPTS.md và cả hai thư mục design/, team/ từ luat-mvp-kit vào gốc dự án (ghi đè file trùng tên). Không chép TIEN_DO_*.md, nhap/, các file .txt gửi Zalo.
4. Thêm vào .gitignore: CLAUDE.local.md, TIEN_DO_*.md, nhap/. git init, commit đầu tiên trên main. Dùng gh tạo repo PUBLIC tên luat-mvp và push. Chưa đăng nhập gh: nhờ tôi tự gõ `gh auth login` trong một cửa sổ terminal khác (lệnh này hỏi từng câu, bạn không trả lời thay được), xong bạn kiểm bằng `gh auth status` rồi chạy `gh auth setup-git`.
5. Hướng dẫn tôi từng bước trên web (chờ tôi xác nhận từng bước):
   a) GitHub: bật luật cho main: bắt buộc qua Pull Request, cấm force push, và BỎ TICK "Require approvals" (tôi tự merge PR của mình). Sau khi GitHub Actions chạy lần đầu thì thêm "Require status checks: check". Chưa mời ai lúc này (mời khi Lan, Vy gửi tên, theo team/DUC.md 4.4).
   b) Supabase: tạo project (region Singapore), bật Google provider (tạo OAuth client trên Google Cloud, màn đồng ý External, chỉ email + profile). Redirect URLs: http://localhost:3000/**, https://*-<tên-team-vercel>.vercel.app/** (link xem thử) và https://<domain-chính>.vercel.app/** (thêm sau khi có domain).
   c) Vercel: import repo, thêm NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY cho CẢ Production và Preview.
6. Ghi 2 biến Supabase vào .env.local (không commit). Chưa gửi cho Lan, Vy lúc này; gửi ở team/DUC.md 5.2.
7. Chuyển TIEN_DO_DUC.md từ luat-mvp-kit sang luat-mvp.
Xong thì báo theo mục 11 của AGENTS.md.
```

### A1. Nền móng + giao diện chung (Thứ Ba 20/10 sáng, merge trước 12h)

```
Bắt đầu phiên. Việc: nền móng, nhánh a/nen-mong. Làm đúng mục 4 và 5 của AGENTS.md, giao diện đúng design/DESIGN.md và design/prototype.dc.html. Nêu kế hoạch ngắn, chờ tôi "ok". Ưu tiên tốc độ: B và C đang chờ PR này.

1. Thư viện: @supabase/supabase-js, @supabase/ssr, zod, server-only, react-markdown, lucide-react; dev: tsx.
2. Giao diện chung:
   - app/globals.css = nguyên văn design/theme.css.
   - app/layout.tsx: lang="vi", nạp Be Vietnam Pro (400–700) và Lora (600) bằng next/font/google (subsets latin + vietnamese, biến --font-be-vietnam, --font-lora), khung giữa màn rộng tối đa 480px, script nhỏ đặt data-theme từ localStorage trước khi vẽ để không nháy màu (thêm suppressHydrationWarning vào thẻ <html>).
   - Chép design/photos/*.jpg sang public/photos/.
   - lib/config.ts: APP_NAME = "<tên app đã chốt>", REPORT_FORM_URL = "" (link Google Form báo sai, điền ở Thứ Năm; ReportButton ẩn khi rỗng, có link thì mở link kèm id câu).
   - components/ui: Button, Card, Chip, IconButton, TopBar (logo § + tên app), TabBar, PhotoCard (ảnh + lớp phủ + chữ trắng), CanCuList, AiNote, ReportButton, LoginButton (tạm chưa nối Supabase), ThemeToggle, Skeleton. Đúng công thức mục 3 DESIGN.md, so từng chi tiết với prototype.
3. Nội dung: lib/content-schema.ts (zod đúng 4.1), lib/content.ts, lib/game.ts. File content/dan-su/c01.json mẫu 2 câu trắc nghiệm + 2 nhận định lấy từ prototype (ghi "MẪU" trong ten_chuong). Không tạo file trong content/hanh-chinh hay content/doanh-nghiep.
4. scripts/check-content.ts: chỉ import lib/content-schema.ts (KHÔNG import lib/content.ts vì có server-only, chạy bằng tsx sẽ lỗi); kiểm mọi file bằng zod, mon/chuong khớp tên, id đúng mẫu và không trùng, mỗi câu ≥ 1 căn cứ link https; lỗi in rõ file + id + lý do, thoát mã 1.
5. lib/attempts.ts và lib/stats.ts: đúng chữ ký ở 4.3, tạm thời saveAttempt chỉ lưu localStorage, getMyStats trả loggedIn=false. (A2 sẽ nối Supabase, chữ ký giữ nguyên.)
6. Trang tạm "Đang xây dựng" trong app/mon/[mon]/trac-nghiem/[chuong], app/mon/[mon]/nhan-dinh/[chuong], app/tien-do (ghi đầu file: "File của B" / "File của C"). Trang chủ tạm liệt kê 3 môn.
7. package.json scripts: lint, typecheck, check:content, build, check. .github/workflows/check.yml chạy npm ci + npm run check trên mọi pull request (biến NEXT_PUBLIC_* giá trị giả).
8. README ngắn: cách chạy trên máy.
Xong thì "Kiểm tra và gửi PR". Check xanh và tôi bấm thử link xem thử xong thì tự merge (team/DUC.md mục 8), rồi báo Lan và Vy.
```

### A2. Đăng nhập, lưu kết quả, XP, chuỗi ngày (Thứ Ba 20/10 chiều)

```
Bắt đầu phiên. Việc: nhánh a/dang-nhap. Nêu kế hoạch, chờ ok.
1. supabase/migrations/0001_init.sql đúng 4.2 (có cột xp), RLS, policy chỉ dòng của mình, trigger tạo profiles, index attempts(user_id, created_at desc). Hướng dẫn tôi chạy migration trên Supabase.
2. lib/supabase/client.ts, server.ts, middleware/proxy làm mới phiên (đúng bản Next.js đang dùng), app/auth/callback/route.ts.
3. LoginButton: "Tiếp tục với Google", quay về đúng trang đang đứng sau khi đăng nhập.
4. lib/attempts.ts: đã đăng nhập → insert Supabase; chưa → localStorage; sau đăng nhập tự gửi phần đang chờ rồi xóa. Không ném lỗi ra UI.
5. lib/stats.ts: getMyStats đúng 4.3, chuỗi ngày theo giờ Việt Nam (đếm ngày liên tiếp có ít nhất 1 lần làm, tính đến hôm nay hoặc hôm qua).
6. TopBar hiện Chip chuỗi ngày + Chip XP khi đã đăng nhập; chưa đăng nhập thì ẩn 2 chip, không thêm nút (lời mời đăng nhập nằm ở màn kết quả và trang tiến độ). getMyStats trả thêm lastChapter cho thẻ "Tiếp tục học".
Xong thì "Kiểm tra và gửi PR".
```

### A3. Trang chủ, trang môn, đề cương (Thứ Tư 21/10)

```
Bắt đầu phiên. Việc: nhánh a/trang-chinh. Dựng đúng 3 màn "Trang chủ", "Môn", "Đề cương" ở mục 4 DESIGN.md, so từng chi tiết với design/prototype.dc.html. Nêu kế hoạch, chờ ok.
- Trang chủ: "Chào bạn," + tiêu đề, thẻ ảnh "Tiếp tục học" (chương làm gần nhất; chưa có thì chương 1 Dân sự), Card chuỗi 7 chấm (getMyStats), 3 thẻ môn có ảnh bìa, TabBar, dòng ghi nguồn ảnh nhỏ ở cuối trang.
- Môn: ảnh bìa 220px + nút quay lại tròn, dòng số liệu, mỗi chương một Card với 3 dòng bấm được; chương chưa có file → "Đang soạn", dòng mờ.
- Đề cương: kiểu bài viết Khan Academy, tom_tat render markdown, danh sách điều hay ra đề, nút dính đáy sang trắc nghiệm.
- Cả 3 màn: sáng và tối, 375px, Skeleton khi tải.
Xong thì tick checklist mục 8 DESIGN.md và "Kiểm tra và gửi PR".
```

---

## 3. Lan — Người B

### B0. Chuẩn bị máy

Bỏ qua: dùng `team/LAN.md` mục 4 và 6.

### B1. Bộ làm bài dùng chung (Thứ Ba 20/10 chiều, merge trước 22h — C đang chờ)

```
Bắt đầu phiên. Việc: bộ làm bài dùng chung, nhánh b/quiz-kit. Nêu kế hoạch ngắn bằng lời thường, chờ tôi "ok".

Chỉ sửa components/quiz/** và trang thử trong app/mon/[mon]/trac-nghiem/**. Đúng chữ ký ở mục 4.4 AGENTS.md (C sẽ code theo đúng chữ ký đó, không được đổi). Giao diện đúng design/DESIGN.md mục 3, 4, 6 và design/prototype.dc.html (khối qtop, dock, fb, res).
- useQuizSession: chọn → kiểm tra → tiếp; giữ câu hiện tại, đáp án đang chọn, kết quả từng câu, combo, XP (xpFor từ lib/game.ts), câu sai; restart(true) chỉ làm lại câu sai; check() gọi saveAttempt và phát tiếng.
- sound.ts: Web Audio, 3 tiếng đúng/sai/xong bài đúng tần số ở DESIGN.md mục 6, âm lượng nhỏ; bật/tắt lưu localStorage "sound".
- optionState, QuizTopBar (nút X, thanh vạch mỗi câu một vạch xanh/đỏ, chip combo vàng từ x2, nút tắt tiếng), CheckBar (nút "Kiểm tra" mờ khi chưa chọn), FeedbackSheet (thay chỗ CheckBar, trượt lên, tiêu đề xoay vòng, chip +XP, giải thích, CanCuList, AiNote, ReportButton, nút Tiếp tục/Xem kết quả), ResultScreen (vòng điểm tự vẽ, 3 ô số, thẻ đăng nhập khi chưa đăng nhập, 3 nút). Không pháo giấy, không gradient.
- Thêm 1 trang thử tạm trong app/mon/[mon]/trac-nghiem/[chuong]/page.tsx dùng bộ này với dữ liệu thật của getChapter, để xem được trên link Vercel.
Xong thì tick checklist DESIGN.md mục 8, "Kiểm tra và gửi PR", nhắn tôi gửi link PR cho A duyệt.
```

### B2. Trang trắc nghiệm hoàn chỉnh (Thứ Tư 21/10)

```
Bắt đầu phiên. Việc: trang trắc nghiệm, nhánh b/trac-nghiem. Nêu kế hoạch ngắn, chờ "ok".
Phạm vi: app/mon/[mon]/trac-nghiem/[chuong]/page.tsx và components/trac-nghiem/*. Dùng bộ components/quiz.
- page.tsx (server): getChapter, null → notFound(), generateStaticParams. Chương không có câu → "Chương này đang được soạn".
- Màn câu hỏi: nhãn "Trắc nghiệm · Câu x trên y", câu hỏi, 4 đáp án A–D (không xáo), chọn rồi bấm "Kiểm tra", trạng thái chọn/đúng/sai/mờ đúng DESIGN.md.
- Hết bài: ResultScreen, nút chuyển sang nhận định cùng chương.
- So từng chi tiết với prototype ở 375px, cả sáng và tối.
Xong thì tick checklist DESIGN.md mục 8 và "Kiểm tra và gửi PR".
```

---

## 4. Vy — Người C

### C0. Chuẩn bị máy

Bỏ qua: dùng `team/VY.md` mục 4 và 6.

### C1. Phần riêng của nhận định + trang tiến độ (Thứ Ba 20/10 chiều)

```
Bắt đầu phiên. Việc: nhánh c/nhan-dinh-1. Nêu kế hoạch, chờ ok.
Bộ làm bài chung (components/quiz) do B làm, chưa có. Đừng chờ, và KHÔNG import gì từ components/quiz trong việc này (chưa có thì typecheck và build sẽ lỗi). Ghép vào ở C2.
1. components/nhan-dinh/NhanDinhCard.tsx: ô nền bg-2 bo 16, nhãn nhỏ "Nhận định", câu nhận định 20px đậm 600.
2. components/nhan-dinh/TrueFalseOptions.tsx: 2 đáp án "Đúng" (icon tick) và "Sai" (icon X), cùng kiểu đáp án trắc nghiệm; nhận prop states: { dung, sai } với giá trị "idle" | "sel" | "good" | "bad" | "dim" và onChoose("dung" | "sai"); tự định nghĩa kiểu này trong components/nhan-dinh, không import của B.
3. app/tien-do/page.tsx + components/tien-do/*: dùng getMyStats (lib/stats.ts). Card chuỗi + 7 chấm tuần, 3 ô số, Card "Theo môn" (ảnh nhỏ 48px + tên + % + thanh), TabBar. Chưa đăng nhập → lời mời + LoginButton.
4. So từng chi tiết với design/prototype.dc.html ở 375px, cả sáng và tối.
Xong thì "Kiểm tra và gửi PR".
```

### C2. Ghép thành trang nhận định hoàn chỉnh (Thứ Tư 21/10)

```
Bắt đầu phiên. Việc: nhánh c/nhan-dinh-2. Bộ components/quiz của B đã có trong main. Nêu kế hoạch, chờ ok.
- app/mon/[mon]/nhan-dinh/[chuong]/page.tsx (server): getChapter, null → notFound(), generateStaticParams. Không có nhận định → "Chương này đang được soạn".
- Ghép useQuizSession + QuizTopBar + NhanDinhCard + TrueFalseOptions + CheckBar + FeedbackSheet (phụ đề "Nhận định này đúng/sai") + ResultScreen (nút chuyển sang trắc nghiệm cùng chương).
- Hoàn thiện trang tiến độ với dữ liệu thật sau khi đăng nhập.
Xong thì tick checklist DESIGN.md mục 8 và "Kiểm tra và gửi PR".
```

---

## 5. Người duyệt PR (ai cũng dùng được)

```
Xem PR <link PR>. Chỉ đọc, không sửa gì. Trả lời:
1. Người gửi là A, B hay C? Có file nào ngoài phần của họ theo mục 3 AGENTS.md không?
2. Có đổi phần chốt trước (mục 4) mà không nói rõ không?
3. Có mã màu #..., style inline cho màu, font lạ, thư viện mới, console.log, any không?
4. Với nội dung: id đúng mẫu không, câu nào thiếu căn cứ hoặc link lạ?
Kết luận: "Merge được" hoặc "Chưa, vì ...".
```

---

## 6. Viết nội dung một chương (mỗi người môn của mình, 2 chương)

Claude Code làm theo sổ tay `team/<TEN>.md` mục 5: lấy nguyên văn điều luật (tự mở link, không được thì nhờ người dùng copy), soạn theo khối dưới đây, tạo danh sách link để người dùng tự mở kiểm và tick, rồi lưu `content/<mon>/<chuong>.json` trong nhánh riêng và "Kiểm tra và gửi PR".

```
Bạn là giảng viên Luật soạn tài liệu ôn thi cho sinh viên năm 2–3.
Môn: <Luật Dân sự / Luật Hành chính / Luật Doanh nghiệp> — slug: <dan-su / hanh-chinh / doanh-nghiep>
Chương: <c01 hoặc c02> — tên chương: <...>
Các điều luật của chương (nguyên văn tôi copy, kèm link):
<dán ở đây>

Viết MỘT file JSON đúng mẫu dưới đây, đặt trọn trong một khối ```json (trong khối không có chữ nào ngoài JSON):
{"mon":"<slug>","chuong":"<c01>","ten_chuong":"...",
 "de_cuong":{"tom_tat":"markdown, tối đa ~400 chữ, gạch đầu dòng ý chính, mỗi ý ghi (Điều ...)","dieu_hay_ra_de":[{"van_ban":"...","dieu":"Điều ...","link":"https://...","ten":"tên điều, tối đa 6 chữ","ghi_chu":"vì sao hay ra đề, 1 câu ngắn"}]},
 "trac_nghiem":[{"id":"<slug>-<c01>-tn01","cau_hoi":"...","lua_chon":["...","...","...","..."],"dap_an":0,"giai_thich":"2–4 câu: vì sao đúng và vì sao phương án gây nhầm là sai","can_cu":[{"van_ban":"Tên văn bản + năm","dieu":"Điều ..., khoản ...","link":"https://..."}]}],
 "nhan_dinh":[{"id":"<slug>-<c01>-nd01","nhan_dinh":"...","dap_an":"dung","giai_thich":"Mở đầu 'Nhận định này đúng/sai.' rồi giải thích 2–4 câu","can_cu":[...]}]}

Yêu cầu:
- 15 câu trắc nghiệm (tn01–tn15), 10 nhận định (nd01–nd10), 5–8 điều hay ra đề.
- Chỉ dùng các điều tôi đã dán. Không bịa số điều, không bịa link: link lấy đúng link tôi đưa.
- Trắc nghiệm: 1 đáp án đúng duy nhất, 3 phương án sai hợp lý (lỗi sinh viên hay mắc), đáp án đúng rải đều A/B/C/D. Mỗi phương án tối đa ~25 chữ cho vừa màn điện thoại.
- Nhận định: khoảng một nửa sai, kiểu đề thi thật ("Mọi...", "Chỉ...", "Trong mọi trường hợp..."). Không lặp ý trắc nghiệm.
- Văn phong rõ, ngắn, tiếng Việt chuẩn pháp lý. Tự viết, không chép đề thi hay giáo trình.
Sau khối JSON, liệt kê riêng: các link cần tôi mở kiểm, và câu nào bạn kém chắc chắn nhất.
```
