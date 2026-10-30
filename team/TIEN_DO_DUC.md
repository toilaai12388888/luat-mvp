# TIáº¾N Äá»˜ Cá»¦A Äá»¨C â€” CHáº¾ Äá»˜ Má»˜T MÃŒNH (SOLO + Äáº¶C Táº¢ TÃNH NÄ‚NG Má»šI)

- **Dá»± Ã¡n**: Web app Ã´n thi Luáº­t â€” **Luáº­t Láº¹**
- **Quy táº¯c**: TuÃ¢n thá»§ team/TINH_NANG.md (tháº¯ng team/SOLO.md á»Ÿ cÃ¡c Ä‘iá»ƒm khÃ¡c nhau)
- **Repo GitHub**: https://github.com/toilaai12388888/luat-mvp
- **Link web**: https://luat-mvp.vercel.app/
- **Thá»i gian ra máº¯t**: Thá»© SÃ¡u 23/10/2026.
- **Cáº­p nháº­t láº§n cuá»‘i**: Thá»© Hai 19/10/2026 16:50

---

## Tiáº¿n Ä‘á»™ theo Äáº¶C Táº¢ (team/TINH_NANG.md)

| Má»¥c | Ná»™i dung | Tráº¡ng thÃ¡i | Ghi chÃº |
|---|---|---|---|
| **0** | **Sá»­a ná»™i dung trÆ°á»›c** | **HOÃ€N THÃ€NH** | Sá»­a doanh-nghiep-c01-nd05 & tn08 (Ban kiá»ƒm soÃ¡t chá»‰ báº¯t buá»™c vá»›i DNNN theo Ä54 LDN 2020); sá»­a hanh-chinh-c01-tn09 & nd05 theo Luáº­t sá»‘ 88/2025/QH15 (nÃ¢ng má»©c pháº¡t khÃ´ng láº­p biÃªn báº£n lÃªn 500k/1tr tá»« 01/07/2025). |
| **1** | **ThÃªm ChÆ°Æ¡ng 2 má»—i mÃ´n (~150 cÃ¢u tá»•ng)** | **HOÃ€N THÃ€NH** | DÃ¢n sá»± c02 (Há»£p Ä‘á»“ng & Biá»‡n phÃ¡p báº£o Ä‘áº£m), HÃ nh chÃ­nh c02 (Biá»‡n phÃ¡p ngÄƒn cháº·n & báº£o Ä‘áº£m xá»­ pháº¡t VPHC), Doanh nghiá»‡p c02 (CÃ´ng ty cá»• pháº§n). ÄÃ£ xuáº¥t noi-dung/DOI_CHIEU.md vÃ  noi-dung/15_CAU_KIEM.json. |
| **2** | **TÃ i khoáº£n biá»‡t danh (Supabase Anon + SQL)** | **CODE XONG** | Viáº¿t file migration SQL supabase/migrations/20261019_initial_schema.sql (báº£ng players, weekly_xp, challenges, challenge_results, comments, báº­t full RLS); hoÃ n thiá»‡n lib/player.ts, lib/supabase.ts, components/auth/NicknameModal.tsx (chá»n 7 trÆ°á»ng Luáº­t + KhÃ¡c). |
| **3.1** | **Ã”n cÃ¢u sai + ÄÃ¡nh dáº¥u cÃ¢u** | **HOÃ€N THÃ€NH** | NÃºt Ä‘Ã¡nh dáº¥u Bookmark trÃªn QuizTopBar; lÆ°u activeWrongIds, lÃ m Ä‘Ãºng 2 láº§n liÃªn tiáº¿p tá»± rá»i danh sÃ¡ch; trang /on-tap Ã´n táº­p riÃªng cÃ¢u sai / Ä‘Ã£ Ä‘Ã¡nh dáº¥u. |
| **3.2** | **Thi thá»­ cÃ³ giá»** | **HOÃ€N THÃ€NH** | Trang /thi-thu: chá»n mÃ´n, chÆ°Æ¡ng, 10/20/40 cÃ¢u; Ä‘áº¿m ngÆ°á»£c ~1 phÃºt/cÃ¢u; khÃ´ng lá»™ Ä‘Ã¡p Ã¡n khi lÃ m; ná»™p bÃ i tÃ­nh Ä‘iá»ƒm thang 10, xem láº¡i giáº£i thÃ­ch chi tiáº¿t, lÆ°u lá»‹ch sá»­. |
| **3.3** | **Thá»­ thÃ¡ch háº±ng ngÃ y** | **HOÃ€N THÃ€NH** | Trang /hang-ngay: 5 cÃ¢u/ngÃ y deterministic báº±ng PRNG theo ngÃ y; lÃ m 1 láº§n/ngÃ y; xuáº¥t tháº» Wordle chia sáº» vÃ  canvas áº£nh Story 1080Ã—1920 táº£i vá»; cá»™ng streak chuá»—i ngÃ y. |
| **3.4** | **Huy hiá»‡u** | **HOÃ€N THÃ€NH** | ThÆ° viá»‡n lib/badges.ts gá»“m 12 huy hiá»‡u; toast micro-animation khi má»Ÿ khÃ³a; hiá»ƒn thá»‹ gallery huy hiá»‡u trÃªn trang /tien-do. |
| **3.5** | **Thá»‘ng kÃª Ä‘iá»ƒm yáº¿u** | **HOÃ€N THÃ€NH** | PhÃ¢n tÃ­ch Ä‘iá»u luáº­t sai nhiá»u nháº¥t (lib/weakness.ts); nÃºt 'Ã”n ngay' trÃªn /tien-do má»Ÿ trá»±c tiáº¿p bá»™ cÃ¢u há»i xoay quanh Ä‘iá»u luáº­t Ä‘Ã³. |
| **3.6** | **TÃ¬m kiáº¿m** | **HOÃ€N THÃ€NH** | Component HomeSearch.tsx táº¡i trang chá»§; tÃ¬m kiáº¿m khÃ´ng dáº¥u tiáº¿ng Viá»‡t theo tá»« khÃ³a hoáº·c sá»‘ Ä‘iá»u (vÃ­ dá»¥: 'Äiá»u 117', 'bá»“i thÆ°á»ng'); click má»Ÿ bÃ i Ã´n ngay. |
| **3.7** | **Flashcard Ä‘iá»u luáº­t** | **HOÃ€N THÃ€NH** | Trang /mon/[mon]/flashcard/[chuong]: láº­t tháº» trÆ°á»›c/sau (sá»‘ Ä‘iá»u & ná»™i dung); nÃºt 'Nhá»› rá»“i / ChÆ°a nhá»›'; thuáº­t toÃ¡n láº·p láº¡i ngáº¯t quÃ£ng Ä‘Æ¡n giáº£n lÆ°u localStorage. |
| **3.8** | **Báº£ng xáº¿p háº¡ng** | **HOÃ€N THÃ€NH** | Trang /xep-hang: BXH XP theo tuáº§n (thá»© Hai - Chá»§ nháº­t); 2 tab ToÃ n quá»‘c & TrÆ°á»ng tÃ´i; hiá»ƒn thá»‹ Top 50 + thá»© háº¡ng cá»§a báº£n thÃ¢n; tá»± Ä‘á»“ng bá»™ XP lÃªn Supabase khi cÃ³ nickname. |
| **3.9** | **ThÃ¡ch Ä‘áº¥u báº¡n bÃ¨** | **HOÃ€N THÃ€NH** | Sau bÃ i thi / trang káº¿t quáº£ cÃ³ nÃºt 'ThÃ¡ch Ä‘áº¥u báº¡n' -> táº¡o link /thach-dau/[id]; báº¡n má»Ÿ lÃ m Ä‘Ãºng 10 cÃ¢u Ä‘Ã³ -> so Ä‘iá»ƒm 2 bÃªn trÃªn báº£ng Ä‘áº¥u; ngÆ°á»i táº¡o xem danh sÃ¡ch ai Ä‘Ã£ nháº­n Ä‘áº¥u. |
| **3.10** | **BÃ¬nh luáº­n dÆ°á»›i cÃ¢u** | **HOÃ€N THÃ€NH** | Trong FeedbackSheet, nÃºt 'Tháº£o luáº­n' má»Ÿ modal xem/gá»­i bÃ¬nh luáº­n dÆ°á»›i cÃ¢u (<= 500 kÃ½ tá»±); bá»™ lá»c tá»« ngá»¯ thÃ´ tá»¥c cÆ¡ báº£n; nÃºt bÃ¡o cÃ¡o (3 láº§n tá»± áº©n). |
| **3.11** | **Nháº¯c há»c (PWA)** | **HOÃ€N THÃ€NH** | PWA manifest public/manifest.json, service worker public/sw.js, PwaRegister.tsx xin quyá»n thÃ´ng bÃ¡o vÃ  kiá»ƒm tra nháº¯c há»c lÃºc 20h. |
| **4** | **Giao diá»‡n & Navigation** | **HOÃ€N THÃ€NH** | Bottom navigation 5 tab: Há»c (/) Â· Ã”n táº­p (/on-tap) Â· Thi thá»­ (/thi-thu) Â· Xáº¿p háº¡ng (/xep-hang) Â· TÃ´i (/tien-do). Chuáº©n theme Navy design/DESIGN.md. |

---

## ðŸ“¢ Má»¤C 5: VIá»†C Cá»¦A Äá»¨C (Äang chá» Äá»©c thá»±c hiá»‡n)

### a) Supabase
1. VÃ o Supabase Dashboard -> **Authentication** -> **Providers** -> Báº­t **Anonymous sign-ins**.
2. VÃ o **SQL Editor** -> Táº¡o query má»›i -> DÃ¡n toÃ n bá»™ ná»™i dung file `supabase/migrations/20261019_initial_schema.sql` -> Báº¥m **Run**.

### b) Vercel
1. VÃ o Vercel Dashboard dá»± Ã¡n `luat-mvp` -> **Settings** -> **Environment Variables**.
2. ThÃªm 2 biáº¿n mÃ´i trÆ°á»ng:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL Supabase cá»§a báº¡n
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon Key cá»§a báº¡n
3. Chá»n cáº£ **Production** vÃ  **Preview** -> Báº¥m **Save** -> **Redeploy**.

### c) Kiá»ƒm 15 cÃ¢u má»›i
Xem 15 cÃ¢u chá»n lá»c trong file `noi-dung/15_CAU_KIEM.json`.

### d) Thá»­ trÃªn Ä‘iá»‡n thoáº¡i
Sau khi Äá»©c cháº¡y xong Supabase vÃ  Vercel deploy, má»Ÿ link https://luat-mvp.vercel.app/ trÃªn Ä‘iá»‡n thoáº¡i Ä‘á»ƒ tráº£i nghiá»‡m 11 tÃ­nh nÄƒng má»›i!

---

## Nháº­t kÃ½
- [19/10 13:22] Chuyá»ƒn cháº¿ Ä‘á»™ SOLO, gá»¡ khÃ³a main.
- [19/10 13:34] Xong Ná»n mÃ³ng & Giao diá»‡n chung, push main.
- [19/10 13:49] Äá»©c Ä‘Ã£ deploy Vercel vÃ  cung cáº¥p link: https://luat-mvp.vercel.app/
- [19/10 13:56] Xong toÃ n bá»™ Bá»™ lÃ m bÃ i, Tráº¯c nghiá»‡m, Nháº­n Ä‘á»‹nh, Trang chá»§, Äá» cÆ°Æ¡ng, Tiáº¿n Ä‘á»™.
- [19/10 14:07] HoÃ n thÃ nh BÆ°á»›c 7 ban Ä‘áº§u (75 cÃ¢u há»i).
- [19/10 16:05] Nháº­n Äáº¶C Táº¢ má»›i tá»« Äá»©c: lÆ°u team/TINH_NANG.md.
- [19/10 16:15] HoÃ n thÃ nh Má»¥c 0: sá»­a ná»™i dung Äiá»u 54 Luáº­t Doanh nghiá»‡p & Luáº­t Xá»­ lÃ½ VPHC sá»­a Ä‘á»•i 2025.
- [19/10 16:25] HoÃ n thÃ nh Má»¥c 1: thÃªm ChÆ°Æ¡ng 2 cáº£ 3 mÃ´n (tá»•ng 150 cÃ¢u), xuáº¥t 15 cÃ¢u máº«u kiá»ƒm tra.
- [19/10 16:40] HoÃ n thÃ nh Má»¥c 2: tÃ i khoáº£n biá»‡t danh, Supabase Anonymous auth & migration SQL.
- [19/10 16:50] HoÃ n thÃ nh Má»¥c 3 (trá»n bá»™ 11 tÃ­nh nÄƒng) & Má»¥c 4 (TabBar 5 tab). All checks passed (lint 0 err, typecheck 0 err, build 54 static pages ok).
## Tiáº¿n Ä‘á»™ Äá»¢T 2 (team/TINH_NANG_2.md - 20/10/2026)

| Má»¥c | Ná»™i dung | Tráº¡ng thÃ¡i | Ghi chÃº |
|---|---|---|---|
| **0.1** | **Báº£o máº­t bÃ¬nh luáº­n** | **HOÃ€N THÃ€NH** | XÃ³a policy má»Ÿ toang, báº£ng comment_reports, RPC report_comment (3 bÃ¡o cÃ¡o tá»± áº©n), ngÆ°á»i viáº¿t tá»± xÃ³a Ä‘Æ°á»£c bÃ¬nh luáº­n. |
| **0.2** | **Chá»‘ng gian láº­n XP** | **HOÃ€N THÃ€NH** | Bá» INSERT/UPDATE trÃªn weekly_xp, thÃªm RPC add_weekly_xp (1-15 XP, rate limit 2s, cap 5000/tuáº§n). |
| **0.3** | **Icon app chuáº©n** | **HOÃ€N THÃ€NH** | Icon-192, icon-512, apple-touch-icon (#14284B dáº¥u Â§ tráº¯ng), manifest theme_color #14284B, xÃ³a SVG Next thá»«a. |
| **0.4** | **Cho phÃ©p phÃ³ng to** | **HOÃ€N THÃ€NH** | Bá» maximumScale & userScalable trong viewport layout. |
| **0.5** | **Nháº¯c há»c tháº­t (Web Push)** | **HOÃ€N THÃ€NH** | web-push, báº£ng push_subscriptions, modal xin quyá»n sau bÃ i Ä‘áº§u / hÆ°á»›ng dáº«n Safari iPhone, cron 13:00 UTC (20:00 VN). |
| **0.6** | **BÃ¡o sai trong app** | **HOÃ€N THÃ€NH** | Modal bÃ¡o sai in-app 4 lÃ½ do + ghi chÃº, lÆ°u báº£ng item_reports & local fallback. |
| **A** | **NguyÃªn vÄƒn Ä‘iá»u luáº­t** | **ÄANG LÃ€M** | content/van-ban/*.json, chip cÄƒn cá»© trÆ°á»£t lÃªn, trang /tra-cuu. |
| **B** | **Bài tập tình huống** | **HOÀN THÀNH** | 2 tÃ¬nh huá»‘ng má»—i chÆ°Æ¡ng (12 tÃ¬nh huá»‘ng), trang giáº£i tá»«ng bÆ°á»›c. |
| **C** | **Lộ trình ôn thi** | **HOÀN THÀNH** | Äáº·t ngÃ y thi, tháº» tiáº¿n Ä‘á»™ má»—i ngÃ y trÃªn trang chá»§. |
| **D** | **So sánh & Sơ đồ** | **HOÀN THÀNH** | Báº£ng cuá»™n ngang vÃ  sÆ¡ Ä‘á»“ khá»‘i trong Ä‘á» cÆ°Æ¡ng. |
| **E** | **ÄÃ³ng gÃ³p cÃ¢u há»i** | **CHá»œ** | Form Ä‘Ã³ng gÃ³p, báº£ng contributions, cÃ¢u duyá»‡t vÃ o chÆ°Æ¡ng. |
| **F** | **Trang duyệt /quan-tri** | **HOÀN THÀNH** | Quáº£n trá»‹ báº£o vá»‡ mÃ£ PIN: duyá»‡t cÃ¢u, bÃ¡o cÃ¡o bÃ¬nh luáº­n, bÃ¡o sai. |
| **G** | **Há»i AI (áº©n)** | **CHá»œ** | API Gemini, giá»›i háº¡n 5 láº§n/ngÃ y/ngÆ°á»i. |

---

## Nháº­t kÃ½
- [19/10 13:22] Chuyá»ƒn cháº¿ Ä‘á»™ SOLO, gá»¡ khÃ³a main.
- [19/10 13:34] Xong Ná»n mÃ³ng & Giao diá»‡n chung, push main.
- [19/10 13:49] Äá»©c Ä‘Ã£ deploy Vercel vÃ  cung cáº¥p link: https://luat-mvp.vercel.app/
- [19/10 13:56] Xong toÃ n bá»™ Bá»™ lÃ m bÃ i, Tráº¯c nghiá»‡m, Nháº­n Ä‘á»‹nh, Trang chá»§, Äá» cÆ°Æ¡ng, Tiáº¿n Ä‘á»™.
- [19/10 14:07] HoÃ n thÃ nh BÆ°á»›c 7 ban Ä‘áº§u (75 cÃ¢u há»i).
- [19/10 16:05] Nháº­n Äáº¶C Táº¢ má»›i tá»« Äá»©c: lÆ°u team/TINH_NANG.md.
- [19/10 16:15] HoÃ n thÃ nh Má»¥c 0: sá»­a ná»™i dung Äiá»u 54 Luáº­t Doanh nghiá»‡p & Luáº­t Xá»­ lÃ½ VPHC sá»­a Ä‘á»•i 2025.
- [19/10 16:25] HoÃ n thÃ nh Má»¥c 1: thÃªm ChÆ°Æ¡ng 2 cáº£ 3 mÃ´n (tá»•ng 150 cÃ¢u), xuáº¥t 15 cÃ¢u máº«u kiá»ƒm tra.
- [19/10 16:40] HoÃ n thÃ nh Má»¥c 2: tÃ i khoáº£n biá»‡t danh, Supabase Anonymous auth & migration SQL.
- [19/10 16:50] HoÃ n thÃ nh Má»¥c 3 (trá»n bá»™ 11 tÃ­nh nÄƒng) & Má»¥c 4 (TabBar 5 tab). All checks passed.
- [20/10 09:40] Báº¯t Ä‘áº§u Äá»¢T 2 (team/TINH_NANG_2.md). Commit Ä‘áº·c táº£ Ä‘á»£t 2 lÃªn GitHub.
- [20/10 09:52] HoÃ n thÃ nh Má»¥c 0 Ä‘á»£t 2: sá»­a 5 lá»—i + bÃ¡o sai trong app + Web Push nháº¯c há»c tháº­t + chá»‘ng gian láº­n XP + báº£o máº­t bÃ¬nh luáº­n + app icon má»›i + cho phÃ©p phÃ³ng to. Check passed 100%.
- [20/10 10:00] Hoàn thành Mục A: Nguyên văn điều luật ngay trong app (77 điều, /tra-cuu, DieuLuatSheet, HomeSearch).
- [20/10 10:08] Hoàn thành Mục B: Bài tập tình huống 3 bước (12 tình huống, runner đề bài ghim, lời giải mẫu, huy hiệu). All checks passed (66 static pages).
- [20/10 10:11] Hoàn thành Mục D: Bảng so sánh cuộn ngang và sơ đồ khối phân loại trong đề cương. All checks passed.



- [20/10 10:17] Hoàn thành Mục F: Trang quản trị duyệt nội dung /quan-tri (mã PIN trong biến ADMIN_PIN, API server SUPABASE_SERVICE_ROLE_KEY, duyệt câu hỏi đóng góp, bình luận báo cáo, báo sai). All checks passed.
- [20/10 10:22] Hoàn thành Mục C: Lộ trình ôn đến ngày thi (đặt ngày thi theo môn tại tab Tôi, thẻ mục tiêu hôm nay tại trang chủ, công thức tính số câu X chia theo ngày còn lại, chế độ nước rút 3 ngày cuối gợi ý thi thử, thưởng +15 XP khi hoàn thành mục tiêu). All checks passed.
- [20/10 10:25] Hoàn thành Mục E: Sinh viên đóng góp câu hỏi (Modal form đủ trường bắt buộc + link kiểm chứng chính thức, lưu bảng contributions & local fallback, mở khóa huy hiệu "Người đóng góp", nút đóng góp ở tab Tôi và cuối bài làm ResultScreen, danh sách "Câu hỏi cộng đồng" trong môn học ghi nhận tên tác giả). All checks passed.
- [20/10 10:28] Hoàn thành Mục G: Hỏi AI về câu này (Làm sẵn nhưng ẩn; kiểm tra qua API /api/hoi-ai không lộ key, nút Hỏi AI trong FeedbackSheet, API Gemini Flash kèm ngữ cảnh nguyên văn điều luật căn cứ, giới hạn 5 lần/người/ngày lưu bảng ai_usage, dòng cảnh báo "AI có thể sai, hãy đối chiếu điều luật"). All checks passed.
- [30/10 10:35] Hoàn thành Tính năng Luyện án thật & Khắc phục hàm add_weekly_xp trên database:
  + Áp dụng thành công migration trực tiếp lên Supabase zolxwrrhdwssuqlcnkkr qua SQL Editor, khóa dòng FOR UPDATE chống race condition, sửa lỗi COALESCE khi tuần mới chưa có bản ghi, trần 5000 XP/tuần, tự động đảm bảo bản ghi players.
  + Kiểm thử toàn diện test suite trên server thật: thưởng +15 XP cho tài khoản mới thành công, từ chối rate limit < 2s, từ chối delta ngoài [1, 15], cộng dồn chính xác sau 2s, xử lý an toàn 2 request đồng thời.
  + Giao diện CaseStudyRunner cập nhật luồng thưởng XP an toàn: chỉ đánh dấu đã nhận khi server xác nhận thành công, hỗ trợ nút bấm thử lại khi lỗi mạng/giãn cách, giữ nguyên trạng thái làm bài/nháp khi reload, báo sai chính xác từng câu hỏi.
  + Dọn dẹp sạch tài khoản thử nghiệm khỏi database, không làm ô nhiễm bảng xếp hạng công khai. All checks passed.
