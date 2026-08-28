# Example plan: Share a plan with teammates

## Mục tiêu

Cho phép người dùng tạo một liên kết chỉ đọc cho plan artifact hiện tại để đồng đội có thể xem nội dung mà không cần truy cập trực tiếp vào workspace cục bộ.

## Phạm vi

- Thêm hành động **Share plan** trên màn hình chi tiết plan.
- Tạo liên kết có mã định danh khó đoán và ngày hết hạn mặc định là 7 ngày.
- Hiển thị trạng thái chia sẻ, ngày hết hạn và thao tác sao chép hoặc thu hồi liên kết.
- Cung cấp trang chỉ đọc hiển thị tiêu đề, nội dung Markdown và thời điểm cập nhật của plan.

Các khả năng chỉnh sửa plan, thêm nhận xét từ liên kết công khai và quản lý quyền theo từng người dùng không thuộc phạm vi của phiên bản đầu tiên.

## Quyết định chính

- Liên kết chia sẻ chỉ cho phép đọc và không làm lộ đường dẫn workspace hoặc thread ID nguồn.
- Mỗi plan chỉ có một liên kết đang hoạt động tại một thời điểm; tạo lại liên kết sẽ vô hiệu hóa liên kết cũ.
- Nội dung được tải từ revision đã chia sẻ, vì vậy thay đổi ở revision mới không tự động xuất hiện trên liên kết cũ.
- Người dùng có thể thu hồi liên kết ngay lập tức trước ngày hết hạn.

## Cách triển khai

### Mô hình dữ liệu

Thêm bản ghi chia sẻ gồm mã token đã băm, artifact ID, revision ID, thời điểm tạo, thời điểm hết hạn và thời điểm thu hồi. Chỉ lưu token dạng rõ ở thời điểm tạo để trả về cho người dùng.

### API

- Tạo endpoint phát hành hoặc xoay vòng liên kết chia sẻ cho một plan revision.
- Tạo endpoint thu hồi liên kết đang hoạt động.
- Tạo endpoint công khai tra cứu nội dung chỉ đọc bằng token, có kiểm tra hết hạn và trạng thái thu hồi.
- Áp dụng rate limit và trả về phản hồi không phân biệt token không tồn tại với token đã thu hồi.

### Giao diện

- Thêm hộp thoại chia sẻ với ngày hết hạn, nút sao chép và nút thu hồi.
- Hiển thị thông báo rõ ràng khi liên kết đã hết hạn hoặc không còn hợp lệ.
- Render Markdown công khai bằng cùng bộ quy tắc an toàn đang dùng cho plan nội bộ.

## Rủi ro và biện pháp giảm thiểu

- Token bị lộ có thể cho phép người ngoài đọc plan; dùng token entropy cao, thời hạn ngắn và hỗ trợ thu hồi tức thì.
- Nội dung Markdown có thể chứa liên kết hoặc markup không an toàn; dùng sanitizer hiện có và không cho phép HTML tùy ý.
- Liên kết cũ có thể tiếp tục hiển thị dữ liệu nhạy cảm sau khi plan được sửa; giao diện cần nhấn mạnh revision đang được chia sẻ và cung cấp thao tác thu hồi dễ thấy.

## Xác minh

- Kiểm thử đơn vị cho việc tạo token, băm token, hết hạn, thu hồi và xoay vòng liên kết.
- Kiểm thử tích hợp cho các endpoint với plan hợp lệ, token sai, token hết hạn và token đã thu hồi.
- Kiểm thử giao diện cho luồng tạo, sao chép, mở và thu hồi liên kết.
- Kiểm tra bảo mật để đảm bảo phản hồi công khai không chứa workspace path, thread ID hoặc dữ liệu của revision khác.
- Kiểm thử thủ công trên trình duyệt desktop và mobile với plan có Markdown dài, code block và liên kết ngoài.

## Tiêu chí hoàn thành

- Người dùng có thể tạo, sao chép và thu hồi một liên kết chỉ đọc từ màn hình plan.
- Liên kết hoạt động cho đến khi hết hạn hoặc bị thu hồi và luôn cố định vào revision đã chia sẻ.
- Trang công khai hiển thị plan an toàn, dễ đọc và không tiết lộ metadata nội bộ.
- Toàn bộ kiểm thử liên quan vượt qua và hành vi mới được ghi lại trong tài liệu người dùng.
