# Change Logs

Tất cả các thay đổi quan trọng của dự án **Codex Artifacts** (`agent-plus`) sẽ được ghi nhận tại tài liệu này.

---

## [0.2.6] - 2026-08-28

### 🚀 Tính năng & Giao diện mới (Topbar UI)
- **Nút "Proceed"** *(Primary màu xanh, ngoài cùng bên phải)*:
  - Cho phép người dùng duyệt và yêu cầu Codex tiến hành thực thi kế hoạch ngay lập tức.
  - Luôn được kích hoạt (enabled) cả khi có hoặc không có comment. Nếu có để lại comment, Codex sẽ đọc và kết hợp áp dụng ngay trong quá trình code.
- **Nút "Review"** *(Thay thế cho label "Request revision")*:
  - Kích hoạt khi có ít nhất 1 comment trên tài liệu.
  - Gửi toàn bộ danh sách góp ý về cho Codex để viết lại bản kế hoạch mới.
- **Nút "Just save"** *(Style Ghost đồng bộ)*:
  - Cho phép lưu lại kế hoạch mà không tiến hành code.
  - Gửi quyết định `decision: "save"` để Codex hỏi vị trí lưu file trong workspace và dừng lại.
- **Nút Icon Copy Markdown**:
  - Tích hợp icon clipboard trên thanh Topbar giúp sao chép nhanh toàn văn Markdown gốc vào Clipboard.
  - Hiển thị hiệu ứng tích xanh ✓ trong 2 giây khi copy thành công.

### 🐛 Sửa lỗi & Nâng cấp hệ thống (Core & MCP)
- **Sửa lỗi xác thực Hash trong MCP Server (`review-wait-mcp.mjs`)**:
  - Khắc phục lỗi `"The plan or comments changed after review submission"` khi người dùng thêm comment trong quá trình mở review.
  - Cập nhật hàm `readValidatedSubmission` để đọc và tính toán mã băm SHA256 trực tiếp từ file `comments.json` và `plan.md` trên đĩa tại thời điểm submit.
- **Mở rộng Contracts & Schema (`contracts.ts`)**:
  - Bổ sung giá trị `"save"` vào `reviewDecisionSchema`: `z.enum(["revise", "approve", "save"])`.
  - Bổ sung trường `markdown: string` vào `ReviewState` để webview truy cập trực tiếp nội dung Markdown raw.
- **Nới lỏng ràng buộc Comment (`artifact-store.ts`, `review-wait-mcp.mjs`)**:
  - Bỏ kiểm tra bắt buộc xóa hết comment khi duyệt (`approve`/Proceed) và khi chỉ lưu (`save`).
- **Cập nhật Codex Skill (`create-plan-artifact`)**:
  - Hướng dẫn AI xử lý chi tiết cho cả 3 kịch bản: `revise`, `approve` (Proceed), và `save`.

---

## [0.2.4] - 2026-08-27

### Khởi tạo & Tích hợp
- Hỗ trợ xem xét và review kế hoạch trực tiếp qua VS Code Custom Editor.
- Tích hợp STDIO MCP Server `wait_for_plan_review` để giữ kết nối với lượt chat Codex.
- Tự động đóng dấu `origin.threadId` qua hook toàn cục của Codex.
