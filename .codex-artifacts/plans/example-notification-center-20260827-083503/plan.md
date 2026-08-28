# Example plan: Notification Center

## Mục tiêu

Xây dựng một trung tâm thông báo trong ứng dụng để người dùng có thể xem thông báo mới, đánh dấu đã đọc và mở nhanh nội dung liên quan. Bản đầu tiên tập trung vào trải nghiệm trong ứng dụng; email, push notification và thiết lập theo từng loại sự kiện nằm ngoài phạm vi.

## Phạm vi

- Thêm biểu tượng chuông trên thanh điều hướng, hiển thị số thông báo chưa đọc.
- Thêm bảng thông báo với trạng thái tải, rỗng và lỗi rõ ràng.
- Cho phép đánh dấu một thông báo hoặc toàn bộ thông báo là đã đọc.
- Điều hướng người dùng đến đúng màn hình khi chọn một thông báo.
- Lưu và trả về tối đa 50 thông báo gần nhất cho mỗi người dùng.

## Quyết định chính

- Máy chủ là nguồn dữ liệu chuẩn cho trạng thái đã đọc để trạng thái nhất quán giữa các thiết bị.
- Client cập nhật lạc quan khi đánh dấu đã đọc, sau đó hoàn tác nếu API thất bại.
- Giai đoạn đầu dùng polling theo chu kỳ thay vì WebSocket để giảm độ phức tạp vận hành.
- Mỗi thông báo chứa `type`, `title`, `body`, `targetUrl`, `createdAt` và `readAt`; client ánh xạ `type` sang biểu tượng và cách trình bày.

## Cách triển khai

### 1. Mô hình dữ liệu và API

- Tạo bảng thông báo với chỉ mục theo `userId`, `createdAt` và `readAt`.
- Thêm endpoint lấy danh sách có phân trang bằng cursor và trả kèm tổng số chưa đọc.
- Thêm endpoint đánh dấu một thông báo đã đọc và endpoint đánh dấu tất cả đã đọc.
- Kiểm tra quyền sở hữu trên mọi thao tác để người dùng chỉ truy cập thông báo của chính mình.

### 2. Giao diện người dùng

- Thêm chuông thông báo và badge chưa đọc vào thanh điều hướng hiện tại.
- Tạo panel danh sách, phân biệt trực quan thông báo đã đọc và chưa đọc.
- Hỗ trợ tải thêm khi cuộn, thao tác đánh dấu tất cả và điều hướng qua `targetUrl` đã được kiểm tra.
- Bổ sung trạng thái skeleton, empty state và thông báo thử lại khi tải lỗi.

### 3. Đồng bộ và khả năng phục hồi

- Poll số lượng chưa đọc khi ứng dụng được focus và theo một chu kỳ cấu hình được.
- Hủy hoặc gộp request trùng lặp khi người dùng chuyển tab nhanh.
- Giữ trạng thái hiện tại khi làm mới thất bại và hiển thị dấu hiệu dữ liệu có thể chưa cập nhật.
- Ghi log có cấu trúc cho lỗi tạo, tải và cập nhật thông báo.

### 4. Phát hành

- Bảo vệ tính năng bằng feature flag ở cả API và giao diện.
- Bật trước cho môi trường thử nghiệm và nhóm nội bộ.
- Theo dõi tỷ lệ lỗi API, độ trễ, số request polling và tỷ lệ mở thông báo.
- Mở dần cho toàn bộ người dùng sau khi các chỉ số ổn định trong thời gian quan sát đã thống nhất.

## Rủi ro và biện pháp giảm thiểu

- Polling có thể tăng tải máy chủ; giảm thiểu bằng khoảng thời gian hợp lý, cache ngắn hạn và tạm dừng khi tab không hoạt động.
- Badge có thể lệch sau thao tác đồng thời trên nhiều thiết bị; đồng bộ lại từ máy chủ khi focus và sau mỗi mutation.
- `targetUrl` không hợp lệ có thể dẫn đến điều hướng sai; chỉ cho phép route nội bộ thuộc danh sách được hỗ trợ.
- Danh sách dài có thể ảnh hưởng hiệu năng; dùng cursor pagination, giới hạn 50 mục và tránh render toàn bộ lịch sử.

## Kiểm chứng

- Unit test logic đếm chưa đọc, phân trang và chuyển trạng thái đã đọc.
- Integration test quyền truy cập, cursor ổn định và tính idempotent của thao tác đánh dấu đã đọc.
- UI test các trạng thái tải, rỗng, lỗi, badge và cập nhật lạc quan có hoàn tác.
- End-to-end test luồng tạo thông báo, mở panel, chọn thông báo và điều hướng đến nội dung đích.
- Kiểm tra thủ công trên màn hình hẹp, điều hướng bàn phím và trình đọc màn hình.

## Tiêu chí hoàn thành

- Người dùng nhìn thấy số chưa đọc chính xác sau khi đăng nhập, focus lại ứng dụng và thao tác trên thiết bị khác.
- Các thao tác đọc và đánh dấu tất cả phản hồi ngay, đồng thời tự phục hồi khi request lỗi.
- Không có route ngoài danh sách cho phép được mở từ thông báo.
- Dashboard vận hành thể hiện độ trễ, tỷ lệ lỗi và tải do polling trước khi phát hành rộng rãi.
