# Kế hoạch mẫu: thêm lịch sử hội thoại cho agent

## Mục tiêu

Cho phép agent lưu và khôi phục lịch sử hội thoại theo từng phiên, để người dùng có thể tiếp tục một cuộc trò chuyện sau khi đóng và mở lại ứng dụng.

## Phạm vi và kiểm thử

- Lưu tin nhắn của người dùng và agent theo `sessionId`.
- Hiển thị danh sách các phiên gần đây, sắp xếp theo thời gian cập nhật mới nhất.
- Khôi phục toàn bộ tin nhắn khi người dùng chọn một phiên.
- Cho phép đổi tên và xóa một phiên hội thoại.
- Bao gồm unit test, integration test, kiểm thử giao diện và kiểm thử hồi quy cho các luồng lưu, khôi phục, đổi tên, xóa và retry.
- Không bao gồm đồng bộ đa thiết bị, chia sẻ phiên, hoặc tìm kiếm toàn văn trong giai đoạn này.

## Quyết định kỹ thuật

- Dùng kho dữ liệu hiện có của dự án thay vì thêm một hệ quản trị dữ liệu mới.
- Tách dữ liệu phiên và dữ liệu tin nhắn để danh sách phiên có thể tải nhanh mà không phải đọc toàn bộ nội dung.
- Việc xóa phiên sẽ xóa cả các tin nhắn liên quan trong cùng một transaction.
- Nội dung hội thoại được xem là dữ liệu riêng tư; log ứng dụng chỉ ghi định danh và metadata cần thiết, không ghi nguyên văn tin nhắn.

## Cách triển khai

### 1. Mô hình dữ liệu

Thêm thực thể `ConversationSession` gồm định danh, tiêu đề, thời điểm tạo và thời điểm cập nhật. Thêm thực thể `ConversationMessage` gồm định danh, `sessionId`, vai trò người gửi, nội dung và thời điểm tạo.

Tạo index theo `ConversationSession.updatedAt` và cặp `ConversationMessage.sessionId`, `ConversationMessage.createdAt` để tối ưu hai truy vấn chính: danh sách phiên gần đây và lịch sử của một phiên.

### 2. Lớp truy cập dữ liệu

Tạo repository cho các thao tác tạo phiên, thêm tin nhắn, đọc lịch sử, đổi tên và xóa phiên. Repository chịu trách nhiệm transaction và không để chi tiết lưu trữ rò rỉ sang lớp giao diện.

Khi thêm tin nhắn, đồng thời cập nhật `updatedAt` của phiên. Nếu một thao tác ghi thất bại, cả tin nhắn và metadata phiên phải được rollback.

### 3. API và luồng agent

Mở các endpoint hoặc handler nội bộ để lấy danh sách phiên, lấy nội dung một phiên, đổi tên và xóa phiên. Luồng gửi tin nhắn hiện tại sẽ nhận `sessionId`; nếu chưa có, hệ thống tạo phiên trước khi gọi agent.

Chỉ đưa số lượng tin nhắn phù hợp với giới hạn context vào model. Việc lưu trữ vẫn giữ toàn bộ lịch sử, còn chiến lược cắt gọn context được xử lý riêng tại lớp điều phối agent.

### 4. Giao diện

Thêm thanh danh sách phiên với trạng thái tải, rỗng và lỗi. Khi chuyển phiên, khóa tạm thao tác gửi để tránh ghi tin nhắn vào nhầm `sessionId`.

Hành động xóa cần xác nhận rõ tên phiên. Sau khi xóa phiên đang mở, giao diện chuyển sang phiên gần nhất; nếu không còn phiên nào, tạo trạng thái hội thoại mới chưa lưu.

### 5. Khả năng tương thích

Áp dụng migration có thể chạy an toàn trên dữ liệu hiện tại. Người dùng chưa có lịch sử sẽ thấy trạng thái rỗng và luồng chat mới vẫn hoạt động như trước.

Nếu ứng dụng từng lưu hội thoại theo định dạng cũ, bổ sung bước chuyển đổi một lần và đánh dấu hoàn tất để tránh nhập trùng dữ liệu.

## Rủi ro và biện pháp giảm thiểu

- Lịch sử dài có thể làm chậm tải trang: phân trang tin nhắn và chỉ tải phần gần nhất trước.
- Ghi tin nhắn trùng khi retry: dùng khóa idempotency cho mỗi lượt gửi.
- Chuyển phiên trong lúc agent đang phản hồi có thể ghi sai dữ liệu: gắn mọi phản hồi với `sessionId` cố định từ lúc bắt đầu request.
- Migration thất bại có thể làm ứng dụng không khởi động: kiểm thử migration trên bản sao dữ liệu và giữ đường rollback tương thích.
- Nội dung nhạy cảm có thể xuất hiện trong log: kiểm tra toàn bộ đường lỗi và che nội dung trước khi ghi log.

## Kiểm thử và xác minh

- Unit test cho repository, bao gồm thứ tự tin nhắn, rollback và xóa cascade.
- Integration test cho luồng tạo phiên, gửi nhiều tin nhắn, đóng ứng dụng và khôi phục lại phiên.
- Test idempotency bằng cách gửi lại cùng một request và xác nhận không có tin nhắn trùng.
- Test giao diện cho trạng thái rỗng, tải, lỗi, đổi tên, xóa và chuyển phiên khi agent đang phản hồi.
- Chạy migration trên dữ liệu trống và dữ liệu mẫu từ phiên bản trước.
- Chạy toàn bộ bộ test hồi quy của luồng chat hiện tại trước khi phát hành.
- Xác nhận log và telemetry không chứa nguyên văn nội dung hội thoại.

## Tiêu chí hoàn thành

- Người dùng có thể tiếp tục một phiên sau khi khởi động lại ứng dụng mà không mất hoặc đảo thứ tự tin nhắn.
- Danh sách phiên phản ánh đúng thứ tự cập nhật và các thao tác đổi tên, xóa.
- Retry không tạo bản ghi trùng và lỗi ghi không để lại dữ liệu dở dang.
- Các unit test, integration test, test giao diện và test hồi quy liên quan đều vượt qua.
