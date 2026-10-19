# DESIGN.md — Giao diện đã chốt (bản 2)

Mọi AI đọc file này trước khi làm bất kỳ màn hình nào. Giao diện đã được duyệt; việc của AI là **dựng đúng y bản mẫu**, không sáng tạo thêm.

- Bản mẫu chuẩn: `design/prototype.dc.html` — HTML + CSS thật của prototype. Đọc phần `<style>` và từng khối `<sc-if>` (mỗi khối là một màn), rồi dịch sang React + Tailwind. Khoảng cách, cỡ chữ, bo góc, viền, hiệu ứng: lấy đúng số trong file đó. Đường dẫn ảnh `/_blob/...` trong bản mẫu thay bằng `/photos/...` (mục 5).
- Màu và hiệu ứng: `app/globals.css` (bản gốc `design/theme.css`). Chỉ dùng class theo biến: `bg-btn`, `text-ink`, `border-line`, `bg-good-soft`, `animate-shake`...
- Mâu thuẫn giữa file này và bản mẫu → làm theo bản mẫu, ghi vào mục "Tự quyết" khi báo cáo.

## 1. Tinh thần

Tĩnh, rõ, đáng tin — như Brilliant và Khan Academy, màu navy của ngành luật. Bốn luật:

1. **Nền trắng, nhiều khoảng trống, viền 1px, gần như không bóng đổ.** Không gradient trang trí, không kính mờ, không emoji.
2. **Màu chỉ lấy từ biến.** Không gõ mã màu `#...` trong component.
3. `btn`/`navy` cho thương hiệu và nút chính. `gold` cho XP và chuỗi. `good` chỉ cho "đúng", `bad` chỉ cho "sai".
4. **Ảnh thật chỉ ở trang chủ và bìa môn.** Màn làm bài, đề cương, kết quả không có ảnh.

Thiết kế cho điện thoại 375–430px trước. Trên máy tính: nội dung giữa màn, rộng tối đa 480px.

## 2. Chữ

Một họ chữ: **Be Vietnam Pro** (400, 500, 600, 700). Riêng dấu § trong logo dùng Lora 600. Nạp bằng `next/font/google`, subsets `latin` + `vietnamese`. Số dùng `tabular-nums`.

| Dùng cho | Đậm | Cỡ / dòng | Ghi chú |
|---|---|---|---|
| Tiêu đề trang | 700 | 28 / 1.2 | letter-spacing -0.02em |
| Tiêu đề bìa môn | 700 | 26 | chữ trắng trên ảnh có lớp phủ |
| Câu hỏi, nhận định | 600 | 20 / 1.45 | -0.01em |
| Tiêu đề mục | 700 | 17–18 | |
| Đáp án, đoạn đọc | 400 | 15–16 / 1.6 | |
| Nhãn nhỏ | 600 | 12, chữ hoa, letter-spacing 0.06em | màu `ink-3` |
| Chữ phụ | 400–500 | 13–14 | màu `ink-2` |

## 3. Công thức component (Tailwind)

- **Button chính**: `press flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-btn text-btn-ink font-bold text-base disabled:opacity-30`
- **Button đúng / sai** (sau khi kiểm tra): `bg-good text-white` / `bg-bad text-white`
- **Button phụ**: `bg-transparent text-ink border-[1.5px] border-line-2`
- **Card**: `rounded-2xl border border-line bg-surface p-4`
- **Chip** (chuỗi, XP): `inline-flex h-8 items-center gap-1.5 rounded-full bg-bg-2 px-2.5 text-sm font-semibold tabular-nums`
- **Đáp án** (`press flex w-full items-center gap-3.5 rounded-xl border-[1.5px] px-4 py-3.5 text-left`, ô chữ cái tròn 28px):
  - chưa chọn: `border-line-2 bg-surface`
  - đang chọn: `border-navy-bar bg-navy-soft shadow-[inset_0_0_0_1px_var(--navy-bar)]`, ô chữ `bg-navy-bar text-on-navy`
  - đúng: `border-good bg-good-soft shadow-[inset_0_0_0_1px_var(--good)] animate-pop`, ô chữ `bg-good text-white`
  - sai: `border-bad bg-bad-soft shadow-[inset_0_0_0_1px_var(--bad)] animate-shake`, ô chữ `bg-bad text-white`
  - còn lại sau khi kiểm tra: `opacity-45`; mọi đáp án `pointer-events-none`
- **Thanh tiến độ bài**: một vạch 6px cho mỗi câu, cách nhau 4px. Đã làm đúng `bg-good`, sai `bg-bad`, câu đang làm `bg-ink-3`, chưa tới `bg-line`.
- **Khung giải thích**: nằm dưới cùng, thay chỗ nút "Kiểm tra" (không che câu hỏi), nền `good-soft`/`bad-soft`, `animate-rise`, cao tối đa ~440px, phần giải thích tự cuộn.
- **Thẻ có ảnh**: ảnh `object-cover`, phủ `.photo-shade` (trong prototype tên là `.shade`), chữ trắng ở đáy; môn chưa có nội dung: ảnh `grayscale`.
- **Icon**: nét 2px kiểu Lucide (`lucide-react`). Không emoji.

## 4. Từng màn hình

| Màn | Đường dẫn | Ai | Có gì (đúng thứ tự trên màn) |
|---|---|---|---|
| Trang chủ | `/` | A | Thanh trên: logo § + tên app, chip chuỗi và chip XP (chỉ khi đã đăng nhập), nút sáng/tối · "Chào bạn," + tiêu đề "Hôm nay ôn gì?" · Thẻ ảnh lớn "Tiếp tục học" (ảnh kệ sách; tên môn + chương từ `lastChapter`, chưa có thì chương 1 Dân sự; thanh tiến độ trắng = câu đã làm / tổng; nút trắng "Tiếp tục") · Card chuỗi ngày: 7 chấm tuần · "Môn học": mỗi môn một thẻ có ảnh bìa cao 112px, tên, số chương, % đúng, thanh tiến độ; môn chưa có nội dung gắn nhãn "Đang soạn" · Thanh tab dưới: Học, Tiến độ |
| Môn | `/mon/[mon]` | A | Ảnh bìa cao 220px, nút quay lại tròn trắng, nhãn tên văn bản, tên môn · Dòng số liệu: số chương, số câu, % đúng · Mỗi chương một Card: ô số chương `navy-soft`, tên, rồi 3 dòng bấm được: Đề cương / Trắc nghiệm (số câu thật) / Nhận định đúng/sai (số câu thật) |
| Đề cương | `/mon/[mon]/de-cuong/[chuong]` | A | Thanh trên mảnh: nút quay lại + tên môn · nhãn "Chương 1 · Đề cương", tiêu đề, dòng văn bản nguồn · "Tóm tắt" (gạch đầu dòng, 16/1.65) · "Điều hay ra đề": mỗi dòng một thẻ số điều `navy-soft` + tên + ghi chú, ngăn bằng viền 1px · Nút dính đáy "Làm 15 câu trắc nghiệm" |
| Trắc nghiệm | `/mon/[mon]/trac-nghiem/[chuong]` | B | Thanh trên: nút X, thanh vạch, chip combo vàng (từ x2), nút tắt tiếng · "Trắc nghiệm · Câu 2 trên 15" · Câu hỏi · 4 đáp án · Nút "Kiểm tra" (mờ khi chưa chọn) · Kiểm tra xong: khung giải thích |
| Nhận định | `/mon/[mon]/nhan-dinh/[chuong]` | C | Như trắc nghiệm, nhưng câu hỏi nằm trong ô nền `bg-2` có nhãn "Nhận định", 2 đáp án "Đúng" (icon tick) và "Sai" (icon X) dạng giống đáp án trắc nghiệm |
| Kết quả | trong trang làm bài | B (C dùng lại) | Vòng tròn điểm 156px tự vẽ, giữa ghi "2/3 câu đúng" · Tiêu đề "Xuất sắc" / "Hoàn thành bài" / "Xong rồi" · 3 ô: XP nhận, Combo cao nhất, Chuỗi · Chưa đăng nhập: Card `navy-soft` "Lưu X XP và chuỗi N ngày" + nút trắng viền "Tiếp tục với Google" · Nút chính sang phần còn lại của chương · Nút phụ "Làm lại N câu sai" · Nút phụ "Về danh sách chương" |
| Tiến độ | `/tien-do` | C | Tiêu đề "Tiến độ" + chip XP · Card chuỗi + 7 chấm · 3 ô số: Tổng XP, Câu đã làm, Tỉ lệ đúng · "Theo môn": Card, mỗi dòng ảnh nhỏ 48px + tên + % + thanh · Chưa đăng nhập: lời mời + nút đăng nhập · Thanh tab |

Khung giải thích: icon tròn (tick hoặc X) · tiêu đề ("Chính xác", "Rất tốt", "Chuẩn rồi" xoay vòng; sai: "Chưa đúng") · phụ đề (đúng: "Giữ nhịp này nhé", từ combo 3: "Combo x3, câu này được 15 XP"; sai: "Đáp án đúng là C"; nhận định: "Nhận định này sai") · chip "+10 XP" bên phải · giải thích · nút căn cứ (icon sách, "Điều 132 · BLDS 2015", màu `link`, mở tab mới) · dòng nhỏ "Giải thích do AI soạn, đã đối chiếu điều luật. Báo sai" · nút to `good`/`bad`: "Tiếp tục" hoặc "Xem kết quả".

## 5. Ảnh thật

Nằm trong `public/photos/` (A chép từ `design/photos/`). Ảnh miễn phí theo Unsplash License, được dùng thương mại; ghi nguồn ở chân trang chủ cho lịch sự.

| File | Dùng ở | Tác giả |
|---|---|---|
| `hero-books.jpg` | Thẻ "Tiếp tục học" trang chủ | Krists Luhaers |
| `dan-su.jpg` | Bìa Luật Dân sự (`object-position: 50% 30%`) | Tingey Injury Law Firm |
| `hanh-chinh.jpg` | Bìa Luật Hành chính (`50% 40%`) | Nathan Cima |
| `doanh-nghiep.jpg` | Bìa Luật Doanh nghiệp (`60% 50%`) | Sasun Bughdaryan |

Dùng `next/image` với `sizes`, luôn có lớp phủ `.photo-shade` khi đặt chữ lên ảnh.

## 6. Chất game, kiểu tiết chế

| Khi nào | Hiện gì | Tiếng |
|---|---|---|
| Chọn đáp án | viền navy, chưa chấm | không |
| Bấm "Kiểm tra", đúng | đáp án `animate-pop`, khung giải thích `animate-rise`, chip "+10 XP" pop, vạch xanh | 2 nốt (784, 1175 Hz, sine, âm lượng nhỏ) |
| Sai | đáp án `animate-shake`, khung đỏ nhạt, vạch đỏ | 2 nốt (233, 175 Hz, triangle) |
| Đúng liên tiếp | từ câu thứ 2: chip vàng lửa "x2"; từ câu thứ 3: 15 XP mỗi câu | như đúng |
| Xong bài | vòng điểm `animate-draw`, không pháo giấy | 3 nốt (659, 880, 1319 Hz) |

Âm thanh bằng Web Audio, mặc định bật, nút tắt lưu localStorage `sound`. Hiệu ứng tắt khi máy bật giảm chuyển động (có sẵn trong `globals.css`).

## 7. Lời văn

Ngắn, thân thiện, xưng "bạn", không chấm than thừa. Không dùng "người dùng", "hệ thống", "lỗi xảy ra". Đã chốt: "Hôm nay ôn gì?", "Làm 1 bài để giữ chuỗi", "Chưa đúng", "Lưu 135 XP và chuỗi 4 ngày", "Đang soạn". Lỗi mạng: "Mạng đang chập chờn, thử lại nhé" + nút "Thử lại".

## 8. Checklist trước khi merge PR có giao diện

Người gửi mở link xem thử Vercel trên điện thoại thật và tick:

- [ ] Đặt cạnh prototype: không lệch màu, cỡ chữ, bo góc, khoảng cách
- [ ] Sáng và tối đều đọc rõ; không còn chữ tối trên nền tối
- [ ] Không có gradient, bóng đổ, emoji, màu nào ngoài biến
- [ ] Mọi vùng bấm ≥ 44px; không chữ tràn, không cuộn ngang ở 375px
- [ ] Hiệu ứng mượt, âm thanh bật/tắt được
- [ ] Đang tải có khung xám (`Skeleton`), trống có câu "Đang soạn"
- [ ] Không còn chữ tiếng Anh, chữ mẫu, `console.log`
