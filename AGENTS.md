# AGENTS.md — App ôn thi Luật (MVP 3 ngày)

Luật chung cho Claude Code trên máy của cả 3 người: Đức (A), Lan (B), Vy (C). Đọc hết file này, `design/DESIGN.md` và sổ tay `team/<TEN>.md` của người đang dùng trước khi làm. Yêu cầu trong chat mâu thuẫn với file này → làm theo file này và hỏi lại.

## 1. Dự án

Web app miễn phí giúp sinh viên Luật ôn thi, phong cách Brilliant/Khan Academy màu navy, chất game tiết chế (XP, combo, chuỗi ngày). 3 tính năng: đề cương, trắc nghiệm, nhận định đúng/sai; mỗi giải thích có điều luật + link. 3 môn × 2 chương: `dan-su`, `hanh-chinh`, `doanh-nghiep`. Code 20–22/10/2026, ra mắt 23/10. Dùng chủ yếu trên điện thoại. Làm bài không cần đăng nhập; đăng nhập Google để lưu XP và chuỗi. Tên app nằm ở `lib/config.ts` (`APP_NAME`).

## 2. Công nghệ (không tự đổi)

Next.js App Router + TypeScript strict + Tailwind v4 · Supabase (`@supabase/ssr`, Google login) · nội dung JSON trong `content/` kiểm bằng zod · `lucide-react` cho icon · GitHub repo public, main bị khóa · Vercel Hobby.
KHÔNG thêm: thư viện UI, thư viện state, ORM, CMS, thư viện animation, gọi API AI.

## 3. Ai sửa gì — luật quan trọng nhất

Chưa biết người dùng là Đức, Lan hay Vy → hỏi trước, rồi đọc `team/DUC.md`, `team/LAN.md` hoặc `team/VY.md`.

| Người | Ai | Được sửa |
|---|---|---|
| A | Đức | `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `app/auth/**`, `app/mon/[mon]/page.tsx`, `app/mon/[mon]/de-cuong/**`, `lib/**`, `components/ui/**`, `supabase/**`, `scripts/**`, `.github/**`, `design/**`, `team/**`, `public/**`, `README.md`, `PROMPTS.md`, `.gitignore`, `.env.example`, `app/not-found.tsx`, `app/loading.tsx`, `middleware.ts`/`proxy.ts`, `package*.json`, file cấu hình gốc, `AGENTS.md`, `CLAUDE.md`, `content/dan-su/**` |
| B | Lan | `components/quiz/**` (bộ làm bài dùng chung), `app/mon/[mon]/trac-nghiem/**`, `components/trac-nghiem/**`, `content/hanh-chinh/**` |
| C | Vy | `app/mon/[mon]/nhan-dinh/**`, `components/nhan-dinh/**`, `app/tien-do/**`, `components/tien-do/**`, `content/doanh-nghiep/**` |

- Ngoài phần của mình: CHỈ ĐỌC, kể cả lỗi nhỏ.
- Cần đổi file của người khác → DỪNG, viết đề xuất (file, đổi gì, vì sao) để người dùng gửi chủ file.
- Không tạo thư mục, route mới ngoài bảng. File `page.tsx` tạm A tạo trong thư mục của B, C thuộc về B, C.

## 4. Phần chốt trước (hợp đồng) — chỉ chủ file sửa, mỗi lần đổi là 1 PR riêng

### 4.1 Nội dung `content/<mon>/<chuong>.json` (`c01`, `c02`)

```ts
type SubjectSlug = "dan-su" | "hanh-chinh" | "doanh-nghiep"
type CanCu = { van_ban: string; dieu: string; link: string }   // link https
type Mcq = { id: string; cau_hoi: string; lua_chon: [string, string, string, string];
  dap_an: 0 | 1 | 2 | 3; giai_thich: string; can_cu: CanCu[] }  // can_cu >= 1
type NhanDinh = { id: string; nhan_dinh: string; dap_an: "dung" | "sai"; giai_thich: string; can_cu: CanCu[] }
type Chapter = { mon: SubjectSlug; chuong: string; ten_chuong: string;
  de_cuong: { tom_tat: string; dieu_hay_ra_de: (CanCu & { ten: string; ghi_chu: string })[] };
  trac_nghiem: Mcq[]; nhan_dinh: NhanDinh[] }
```

id: `<mon>-<chuong>-tn01`, `<mon>-<chuong>-nd01`; không trùng, không đổi sau khi công bố. `mon`, `chuong` khớp tên thư mục, file.

### 4.2 Cơ sở dữ liệu

```sql
profiles(id uuid pk -> auth.users, display_name text, school text, created_at timestamptz)
attempts(id bigint identity pk, user_id uuid -> auth.users default auth.uid(), item_id text,
  item_type text check in ('mcq','nhan_dinh'), subject text check in ('dan-su','hanh-chinh','doanh-nghiep'),
  is_correct boolean, xp int default 0, created_at timestamptz default now())
```

RLS bật: mỗi người chỉ đọc/ghi dòng của mình. `profiles` tạo bằng trigger.

### 4.3 Hàm dùng chung của A

- `lib/content.ts` (server-only): `SUBJECTS`, `getChapters(mon)`, `getChapter(mon, chuong): Chapter | null`. Page gọi `notFound()` khi null, dùng `generateStaticParams`.
- `lib/attempts.ts` (client): `saveAttempt({ itemId, itemType, subject, isCorrect, xp }): Promise<void>`. Chưa đăng nhập → lưu tạm localStorage, tự gửi lên sau khi đăng nhập. Không bao giờ ném lỗi ra UI.
- `lib/config.ts`: `APP_NAME`, `REPORT_FORM_URL` (rỗng thì `ReportButton` ẩn).
- `lib/game.ts`: `XP_CORRECT = 10`, `XP_COMBO = 15`, `COMBO_FROM = 3`, `xpFor(combo)`.
- `lib/stats.ts` (server): `getMyStats(): Promise<{ loggedIn, xp, streak, doneToday, answered, pctCorrect, week: boolean[7], bySubject: { slug, answered, pctCorrect }[], lastChapter: { mon, chuong, done, total } | null }>`. Chuỗi tính theo giờ Việt Nam.
- `lib/supabase/client.ts`, `lib/supabase/server.ts`. Không tự tạo client ở chỗ khác.
- `components/ui/`: `Button` (variant `primary|good|bad|ghost`), `Card`, `Chip`, `IconButton`, `TopBar`, `TabBar`, `PhotoCard`, `CanCuList`, `AiNote`, `ReportButton`, `LoginButton`, `ThemeToggle`, `Skeleton`.

### 4.4 Bộ làm bài của B (`components/quiz/`, client) — C dùng lại

- `useQuizSession({ items, subject, itemType })` với `items: { id, dap_an, giai_thich, can_cu }[]` → `{ current, index, total, selected, picked, isCorrect, results, combo, maxCombo, xpRun, lastGain, correctCount, wrongCount, finished, select(a), check(), next(), restart(onlyWrong) }`. Luồng: chọn (`select`) → bấm "Kiểm tra" (`check`) → khung giải thích → `next`. `results` là mảng `"good" | "bad"` cho thanh vạch. Hook tự gọi `saveAttempt` và phát tiếng khi `check`.
- `optionState(value, selected, picked, dapAn): "idle" | "sel" | "good" | "bad" | "dim"`.
- `QuizTopBar({ results, index, total, combo, exitHref })` — thanh vạch mỗi câu một vạch, gồm nút tắt tiếng.
- `CheckBar({ disabled, onCheck })` — nút "Kiểm tra" dính đáy.
- `FeedbackSheet({ isCorrect, subtitle, gain, giaiThich, canCu, itemId, isLast, onNext })`.
- `ResultScreen({ correct, total, xpRun, maxCombo, wrongCount, streak, xpTotal, loggedIn, onRetryWrong, onRestart, switchHref, switchLabel, backHref })` — `streak`, `xpTotal`, `loggedIn` do page (server) lấy từ `getMyStats()` rồi truyền xuống.

### 4.5 Đường dẫn

`/` (A) · `/mon/[mon]` (A) · `/mon/[mon]/de-cuong/[chuong]` (A) · `/mon/[mon]/trac-nghiem/[chuong]` (B) · `/mon/[mon]/nhan-dinh/[chuong]` (C) · `/tien-do` (C) · `/auth/callback` (A)

## 5. Giao diện (chi tiết trong `design/DESIGN.md`)

- Dựng ĐÚNG Y bản mẫu `design/prototype.dc.html`. Không tự thêm màu, font, kiểu nút, bố cục.
- Chỉ dùng class theo biến (`bg-btn`, `text-ink`, `border-line`...). Không mã màu `#...`, không `style={{ color }}`, không gradient, không emoji trong component.
- Ảnh thật nằm ở `public/photos/` (chỉ trang chủ và bìa môn), hiển thị bằng `next/image`.
- Dùng lại `components/ui` và `components/quiz`; thiếu thì đề xuất cho chủ file.
- Mọi màn phải đẹp ở 375px, cả sáng lẫn tối. Có trạng thái đang tải (`Skeleton`) và trống.
- PR có giao diện: tick checklist mục 8 của DESIGN.md.

## 6. Quy tắc code

- TypeScript strict, không `any`, không `@ts-ignore`.
- Server Component mặc định; `"use client"` chỉ cho phần bấm được. Page đọc nội dung rồi truyền props.
- Chữ giao diện: tiếng Việt có dấu. Biến, hàm: tiếng Anh. Route: không dấu, kebab-case.
- Một file một component, PascalCase. Không `console.log` khi gửi PR.

## 7. Bảo mật

- Chỉ dùng `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Service role key không bao giờ trong app hay repo.
- Không commit `.env*` (trừ `.env.example`). Repo public: commit gì ai cũng đọc được.
- Bảng mới phải bật RLS (chỉ A thêm bảng).

## 8. Nội dung luật

- Mỗi câu ≥ 1 căn cứ: tên văn bản + năm, điều (khoản), link văn bản chính thức (vbpl.vn hoặc thuvienphapluat.vn). Dùng văn bản đang có hiệu lực.
- Không bịa số điều. Không chắc → bỏ câu đó. Tự viết, không chép đề thi, giáo trình.
- AI viết nháp; người phụ trách môn mở từng link kiểm trước khi gửi PR.

## 9. Git — AI làm hết, người dùng không gõ lệnh

Nhánh: `a/<viec>`, `b/<viec>`, `c/<viec>`.

**"Bắt đầu phiên":** `git status` (có thay đổi chưa commit → báo, không xóa) → `git checkout main` → `git pull` → hỏi việc → `git checkout -b <x>/<viec>` (hoặc về nhánh cũ **chưa merge** và `git merge origin/main`; nhánh đã merge thì luôn tạo nhánh mới).

**"Kiểm tra và gửi PR":**
1. `git fetch` → `git merge origin/main`.
2. `npm run check`. Lỗi trong phần mình → sửa. Ngoài phần mình → dừng, báo.
3. `git status`: file ngoài phần mình bị đổi → `git checkout -- <file>`.
4. `git add` từng file của mình, commit tiếng Việt: `B: thêm khung kết quả`.
5. `git push -u origin <nhanh>`, mở PR bằng `gh pr create` (không có `gh` → đưa link `https://github.com/<owner>/<repo>/compare/<nhanh>?expand=1`).
6. Báo theo mục 11.

**Cấm:** push thẳng main, `push --force`, `reset --hard`, rebase nhánh đã push, xóa nhánh người khác (trừ Đức xóa nhánh đã merge), commit bí mật.
**Xung đột:** trong file mình → tự giải. File người khác → `git merge --abort`, báo.

## 10. Kiểm tra

`npm run check` = `lint` + `typecheck` + `check:content` + `build`. GitHub Actions chạy trên mọi PR. Merge khi check xanh, đã bấm thử link xem thử Vercel trên điện thoại, và (nếu có giao diện) đã tick checklist DESIGN.md.

## 11. Báo cáo sau mỗi việc

```
Đã làm: ...
File đã đổi: ...
Tự quyết: ... (chỗ AGENTS/DESIGN không nói rõ)
Cần người khác làm: ...
Link cần kiểm: ... (nội dung)
PR: ...
```

## 12. Cách làm việc

- Việc chạm > 3 file → nêu kế hoạch ngắn bằng lời thường, chờ "ok".
- Lan và Vy chưa từng code: dắt từng bước theo `team/LAN.md`, `team/VY.md` mục 2.
- Ghi tiến độ vào `TIEN_DO_<TEN>.md` (không commit), đọc lại đầu mỗi phiên.
- Không chắc việc có thuộc phần mình → hỏi.
