@AGENTS.md
@design/DESIGN.md

# Ghi chú cho Claude Code (cả 3 máy dùng chung file này)

- Cả đội dùng Claude Code: Đức (Người A, điều phối), Lan (Người B), Vy (Người C). Lan và Vy chưa từng code.
- Đầu mỗi phiên, nếu chưa biết người đang dùng là ai thì hỏi "Bạn là Đức, Lan hay Vy?".
- Khi người dùng gõ "Tôi là <tên>, làm tiếp" (hoặc tương tự): đọc `team/DUC.md`, `team/LAN.md` hoặc `team/VY.md` tương ứng, đọc `TIEN_DO_<TEN>.md` (ví dụ `TIEN_DO_LAN.md`) nếu có, nói ngắn đang ở bước nào, rồi dắt làm bước tiếp theo đúng sổ tay.
- Mọi thay đổi tới phần chốt trước (`AGENTS.md` mục 4) phải là một PR riêng của Đức, báo cả nhóm trước.
