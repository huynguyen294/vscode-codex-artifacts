# Kế hoạch mẫu: Dịch vụ rút gọn URL

## Mục tiêu

Xây dựng một dịch vụ web nhỏ nhận URL dài, tạo mã rút gọn duy nhất và chuyển hướng người truy cập đến địa chỉ ban đầu. Phiên bản đầu tiên ưu tiên tính đúng đắn, khả năng quan sát và một giao diện API dễ sử dụng.

## Phạm vi

Phiên bản đầu tiên hỗ trợ tạo liên kết rút gọn, truy cập bằng mã ngắn, đặt ngày hết hạn tùy chọn và xem số lượt truy cập cơ bản.

Chưa triển khai tài khoản người dùng, tên miền tùy chỉnh, mã ngắn do người dùng chọn, phân tích chuyên sâu hoặc hệ thống thanh toán. Những phần này có thể được bổ sung sau khi luồng cốt lõi ổn định.

## Quyết định kỹ thuật

- Dùng API HTTP với phản hồi JSON cho thao tác tạo và đọc thông tin liên kết.
- Dùng cơ sở dữ liệu quan hệ để bảo đảm mã ngắn là duy nhất và giữ lịch sử cập nhật nhất quán.
- Sinh mã bằng bộ tạo ngẫu nhiên an toàn, kiểm tra xung đột trong cơ sở dữ liệu và thử lại với số lần hữu hạn.
- Chỉ chấp nhận URL dùng giao thức `http` hoặc `https`; từ chối đầu vào sai trước khi ghi dữ liệu.
- Ghi nhận lượt truy cập theo cách không làm chậm đáng kể đường dẫn chuyển hướng.

## Cách triển khai

### 1. Khảo sát dự án

Xác định framework, cơ chế cấu hình, lớp truy cập dữ liệu, quy ước lỗi và hạ tầng kiểm thử hiện có. Tận dụng thành phần sẵn có thay vì tạo một kiến trúc song song.

### 2. Mô hình dữ liệu

Tạo bảng liên kết gồm mã ngắn, URL đích, thời điểm tạo, thời điểm hết hạn tùy chọn và bộ đếm truy cập. Đặt chỉ mục duy nhất cho mã ngắn và chỉ mục phù hợp cho các truy vấn bảo trì.

### 3. Sinh và tạo liên kết

Thêm hàm sinh mã ngắn có thể kiểm thử độc lập. Xây dựng endpoint tạo liên kết, chuẩn hóa đầu vào, kiểm tra URL, xử lý xung đột mã và trả về URL rút gọn hoàn chỉnh.

### 4. Chuyển hướng

Xây dựng route nhận mã ngắn, tìm bản ghi tương ứng và trả về chuyển hướng tạm thời. Trả lỗi rõ ràng khi mã không tồn tại hoặc đã hết hạn, đồng thời cập nhật số lượt truy cập theo cơ chế phù hợp với stack hiện tại.

### 5. Quan sát và vận hành

Bổ sung log có cấu trúc cho lỗi tạo liên kết, mã không tìm thấy và lỗi chuyển hướng. Thêm chỉ số về số yêu cầu, tỷ lệ lỗi và độ trễ; không ghi toàn bộ URL nhạy cảm nếu không cần thiết.

## Rủi ro và biện pháp giảm thiểu

- Xung đột mã tăng dần khi dữ liệu lớn; theo dõi tỷ lệ thử lại và tăng độ dài mã khi vượt ngưỡng.
- Dịch vụ có thể bị lợi dụng để phát tán liên kết độc hại; áp dụng giới hạn tốc độ và chừa điểm mở rộng cho cơ chế kiểm duyệt URL.
- Bộ đếm đồng bộ có thể gây tranh chấp ghi; dùng cập nhật nguyên tử hoặc hàng đợi sự kiện khi lưu lượng tăng.
- URL hết hạn vẫn có thể tồn tại lâu trong cơ sở dữ liệu; thêm tác vụ dọn dẹp định kỳ và đo lường số bản ghi đã hết hạn.
- Chuyển hướng mở có thể làm người dùng khó nhận biết đích đến; tài liệu API cần nêu rõ hành vi và chính sách sử dụng.

## Kiểm thử và xác minh

- Kiểm thử đơn vị cho sinh mã, chuẩn hóa URL, kiểm tra giao thức và logic hết hạn.
- Kiểm thử tích hợp cho tạo liên kết, xung đột mã, mã không tồn tại, liên kết hết hạn và cập nhật lượt truy cập.
- Kiểm thử đồng thời để xác minh ràng buộc duy nhất và phép tăng bộ đếm không làm mất dữ liệu.
- Chạy lint, kiểm tra kiểu, toàn bộ test và bản build theo lệnh chuẩn của repository.
- Kiểm tra thủ công bằng cách tạo một liên kết, truy cập URL rút gọn và xác nhận trạng thái chuyển hướng, vị trí đích cùng số lượt truy cập.

## Tiêu chí hoàn thành

API tạo được mã duy nhất cho URL hợp lệ, từ chối đầu vào không an toàn, chuyển hướng đúng với liên kết còn hiệu lực và trả lỗi nhất quán cho các trường hợp còn lại. Dữ liệu tồn tại qua lần khởi động lại, log không rò rỉ thông tin không cần thiết, và toàn bộ kiểm tra tự động đều thành công.
