# HƯỚNG DẪN THÊM VÀ BIÊN TẬP VỤ ÁN THẬT MỚI (LUYỆN ÁN THẬT)

Tài liệu hướng dẫn chi tiết quy trình tìm nguồn, chuẩn hóa dữ liệu, ẩn danh và thêm một vụ án/án lệ mới vào tính năng **"Luyện án thật"** trên Luật Lẹ.

---

## 1. Nguyên tắc cốt lõi khi chọn và biên tập vụ án

1. **Nguồn chính thức:** Chỉ lấy bản án/quyết định được công bố chính thức trên Cổng thông tin điện tử của Tòa án nhân dân tối cao (`congbobanan.toaan.gov.vn`, `anle.toaan.gov.vn`) hoặc website chính thức của Tòa án nhân dân các cấp.
2. **Đọc toàn văn:** Phải đọc toàn văn cả phần tình tiết, nhận định và quyết định cuối cùng; không dùng trích đoạn tìm kiếm hoặc tóm tắt thứ cấp chưa kiểm chứng.
3. **Phân biệt Án lệ và Bản án thông thường:** Chỉ đánh dấu `la_an_le: true` khi vụ án đã được Hội đồng Thẩm phán TANDTC thông qua và ban hành theo Quyết định công bố án lệ chính thức của Chánh án TANDTC.
4. **Bảo vệ dữ liệu cá nhân và bí mật đời tư:** 
   - Giữ nguyên việc ẩn danh trong bản án công bố (hoặc đặt nhãn trung tính: Bên A, Bên B, Công ty Đ6, ông N, bà H).
   - Lược bỏ hoàn toàn số CCCD, tài khoản ngân hàng, biển số xe, địa chỉ nhà chi tiết.
5. **Đúng môn học & chương trình:** Gắn liền với các chương đang có trên Luật Lẹ (Dân sự, Doanh nghiệp, Hành chính).
6. **Thời lượng vừa sức:** Thiết kế gói gọn 5–8 phút (tóm tắt súc tích, 3–5 câu hỏi logic: vấn đề → tình tiết then chốt → căn cứ → áp dụng → kết quả).

---

## 2. Cấu trúc file JSON (`content/luyen-an/<id>.json`)

Mỗi vụ án được lưu trữ thành 1 file JSON độc lập đặt tại thư mục `content/luyen-an/`.

Ví dụ: `content/luyen-an/dan-su-an-le-25.json`

```json
{
  "id": "dan-su-an-le-25",
  "slug": "tranh-chap-phat-coc-mua-ban-nha-do-ly-do-khach-quan",
  "title": "Tranh chấp phạt cọc mua bán nhà khi chậm cấp sổ đỏ vì lý do khách quan",
  "mon": "dan-su",
  "chuong": "c02",
  "ten_chuong": "Hợp đồng dân sự và Biện pháp bảo đảm",
  "thoi_gian_phut": 7,
  "do_kho": "vua-suc",
  "nguon": {
    "so_hieu": "Án lệ số 25/2018/AL (Quyết định GĐT số 79/2012/DS-GĐT)",
    "ngay_ban_hanh": "2018-11-06",
    "toa_an": "Hội đồng Thẩm phán Tòa án nhân dân tối cao",
    "cap_xet_xu": "Giám đốc thẩm",
    "loai_nguon": "an-le",
    "url_cong_bo": "https://anle.toaan.gov.vn/webcenter/portal/anle/chi-tiet-an-le?dDocName=TAND072049",
    "ngay_truy_cap": "2026-10-28",
    "hieu_luc": "Án lệ chính thức có hiệu lực áp dụng trên toàn quốc",
    "la_an_le": true,
    "so_an_le": "Án lệ số 25/2018/AL"
  },
  "luat_ap_dung": {
    "luat_thoi_diem": "Điều 358 Bộ luật Dân sự 2005",
    "luat_hien_hanh": "Điều 328 Bộ luật Dân sự 2015",
    "ghi_chu_thay_doi": "Bản chất quy định về đặt cọc và hậu quả xử lý cọc tại Điều 328 BLDS 2015 kế thừa Điều 358 BLDS 2005..."
  },
  "ho_so": {
    "cac_ben": [
      {
        "vai_tro": "Bên đặt cọc (Nguyên đơn)",
        "ten": "Bên A",
        "mo_ta": "Mô tả vai trò và thỏa thuận của bên A..."
      },
      {
        "vai_tro": "Bên nhận đặt cọc (Bị đơn)",
        "ten": "Bên B",
        "mo_ta": "Mô tả tình trạng tài sản và nghĩa vụ của bên B..."
      }
    ],
    "dien_bien": [
      "Diễn biến 1: Hai bên ký hợp đồng đặt cọc...",
      "Diễn biến 2: Bên B nộp hồ sơ xin cấp giấy chứng nhận...",
      "Diễn biến 3: Cơ quan nhà nước chậm giải quyết thủ tục dẫn đến quá hạn..."
    ],
    "yeu_cau_khoi_kien": "Bên A yêu cầu Tòa án buộc Bên B hoàn trả tiền cọc và phạt cọc gấp đôi...",
    "can_cu_tom_tat": [
      "Trích đoạn 1, 3, 4 phần Nhận định của Tòa án trong Quyết định..."
    ]
  },
  "cau_hoi": [
    {
      "id": "ds-al25-q1",
      "cau_hoi": "Mục đích pháp lý của thỏa thuận đặt cọc trong vụ việc này là gì?",
      "lua_chon": [
        "Bảo đảm cho việc giao kết hợp đồng mua bán nhà ở",
        "Lựa chọn sai 1",
        "Lựa chọn sai 2",
        "Lựa chọn sai 3"
      ],
      "dap_an": 0,
      "giai_thich": "Giải thích chi tiết kèm điều luật (chỉ mở ở bước Đối chiếu)...",
      "can_cu": [
        {
          "van_ban": "Bộ luật Dân sự 2015",
          "dieu": "Điều 328 Khoản 1",
          "link": "https://thuvienphapluat.vn/van-ban/Quyen-dan-su/Bo-luat-dan-su-2015-283877.aspx"
        }
      ]
    }
  ],
  "goi_y_lap_luan": {
    "van_de": "Gợi ý xác định vấn đề pháp lý mấu chốt...",
    "can_cu": "Gợi ý điều luật và quy tắc pháp lý cần vận dụng...",
    "ket_luan": "Gợi ý hướng đánh giá và kết luận công bằng..."
  },
  "doi_chieu": {
    "nhan_dinh_toa_an": [
      "Trích đoạn 1 nhận định thực tế của Tòa án...",
      "Trích đoạn 2 nhận định thực tế của Tòa án..."
    ],
    "quyet_dinh_cuoi_cung": "Phán quyết chính thức cuối cùng của Hội đồng xét xử...",
    "bang_tu_doi_chieu": [
      {
        "van_de": "Vấn đề pháp lý 1",
        "y_chinh_toa_an": "Quan điểm lập luận của Tòa án...",
        "cau_hoi_tu_ra": "Câu hỏi gợi mở để người học tự kiểm tra lại bài viết..."
      }
    ],
    "luu_y_bien_tap": "Ghi chú nguồn gốc và thông tin bảo vệ quyền riêng tư."
  }
}
```

---

## 3. Kiểm tra tính hợp lệ tự động

Sau khi tạo hoặc chỉnh sửa file JSON trong `content/luyen-an/`, chạy lệnh kiểm tra tự động:

```bash
npm run check:content
```

Hệ thống sẽ tự động xác minh:
- Cấu trúc khớp 100% với `CaseStudySchema` trong `lib/case-study-schema.ts`.
- Tính duy nhất của `id` vụ án, `slug` và `id` của từng câu hỏi.
- Số lượng câu hỏi nằm trong khoảng 3–5 câu.
- `dap_an` nằm trong phạm vi 0..3 (khớp với 4 lựa chọn).
- Tất cả đường dẫn `url_cong_bo` và `link` điều luật bắt đầu bằng `https://`.

---

## 4. Xem phản ánh lỗi nội dung từ người học

Khi người học phát hiện sai sót về điều luật hoặc giải thích trong quá trình luyện án thật, họ có thể bấm nút **"Báo sai"** trên thanh tiêu đề của vụ án.

Nội dung báo sai được lưu tự động vào bảng `item_reports` trên Supabase:
- `item_id`: Chứa ID của vụ án (ví dụ `dan-su-an-le-25`, `doanh-nghiep-126-2022`, `hanh-chinh-01-2021`).
- `reason`: Lý do (Đáp án sai, Điều luật hết hiệu lực, Giải thích chưa chính xác, Khác).
- `note`: Chi tiết góp ý từ người học.

Đức có thể vào trang Quản trị `/quan-tri` để xem và xử lý các báo cáo này trực tiếp.
