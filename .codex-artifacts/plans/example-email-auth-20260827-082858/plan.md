# Kế hoạch mẫu: Triển khai đăng nhập bằng email

## Mục tiêu

Cho phép người dùng tạo tài khoản, đăng nhập và đăng xuất bằng email/password. Phiên đăng nhập phải tồn tại sau khi tải lại trang, hết hạn an toàn và không làm thay đổi trải nghiệm của người dùng chưa đăng nhập.

Kết quả mong đợi là một luồng xác thực đủ dùng cho bản phát hành đầu tiên, có log vận hành và có thể tắt nhanh bằng feature flag nếu phát sinh lỗi.

## Phạm vi

- Thêm API đăng ký, đăng nhập, đăng xuất và lấy thông tin người dùng hiện tại.
- Lưu password dưới dạng hash bằng thuật toán phù hợp; không ghi password hoặc token vào log.
- Quản lý phiên bằng cookie `HttpOnly`, `Secure` và `SameSite=Lax`.
- Thêm màn hình đăng ký/đăng nhập và trạng thái lỗi dễ hiểu.
- Bảo vệ một trang hồ sơ mẫu để kiểm chứng cơ chế phân quyền.
- Bổ sung telemetry cho tỷ lệ đăng nhập thành công, lỗi xác thực và độ trễ API.

## Ngoài phạm vi

- Đăng nhập qua Google, Microsoft hoặc nhà cung cấp OAuth khác.
- Xác thực đa yếu tố.
- Phân quyền theo vai trò chi tiết.
- Trang quản trị người dùng.

## Quyết định kỹ thuật

### Mô hình phiên

Server tạo session ngẫu nhiên sau khi xác thực thành công và chỉ gửi session ID qua cookie. Dữ liệu session được lưu phía server để có thể thu hồi ngay khi người dùng đăng xuất hoặc khi phát hiện rủi ro.

Session có thời hạn tuyệt đối 7 ngày và thời gian không hoạt động tối đa 24 giờ. Mỗi lần đăng nhập thành công phải xoay session ID để tránh session fixation.

### Dữ liệu người dùng

Email được chuẩn hóa trước khi kiểm tra trùng lặp và có unique index ở database. Password chỉ tồn tại dạng hash kèm tham số thuật toán; schema giữ chỗ cho việc nâng cấp thuật toán trong tương lai.

### Xử lý lỗi

API đăng nhập trả cùng một thông báo cho email không tồn tại và password sai để hạn chế dò tài khoản. Client hiển thị lỗi validation theo trường, nhưng lỗi server không làm lộ chi tiết nội bộ.

## Các giai đoạn triển khai

### 1. Nền tảng dữ liệu và dịch vụ xác thực

- Tạo migration cho bảng người dùng và session, gồm unique index cho email và index phục vụ dọn session hết hạn.
- Xây dựng lớp hash/verify password và lớp tạo, kiểm tra, thu hồi session.
- Thêm cấu hình thời hạn session và feature flag với giá trị mặc định tắt ở production.

### 2. API và kiểm soát truy cập

- Thêm endpoint đăng ký, đăng nhập, đăng xuất và `me` với validation thống nhất.
- Thêm middleware đọc session cookie, nạp người dùng hiện tại và chặn route cần xác thực.
- Áp dụng rate limit cho đăng ký và đăng nhập; ghi audit event không chứa dữ liệu bí mật.

### 3. Giao diện người dùng

- Tạo form đăng ký và đăng nhập có trạng thái loading, validation và xử lý lỗi mạng.
- Khôi phục phiên khi ứng dụng khởi động và điều hướng người dùng về trang họ định truy cập.
- Thêm menu tài khoản, thao tác đăng xuất và trang hồ sơ được bảo vệ.

### 4. Rollout và vận hành

- Bật feature flag ở môi trường thử nghiệm và chạy smoke test trên các trình duyệt được hỗ trợ.
- Bật cho nhóm nội bộ trước, theo dõi error rate, login success rate và p95 latency trong 24 giờ.
- Mở dần cho toàn bộ người dùng nếu chỉ số ổn định; tắt flag nếu tỷ lệ lỗi tăng vượt ngưỡng đã thống nhất.

## Kiểm thử và xác minh

- Unit test bao phủ chuẩn hóa email, hash/verify password, hết hạn session và xoay session ID.
- Integration test bao phủ đăng ký thành công, email trùng, sai password, đăng xuất và truy cập route được bảo vệ.
- E2E test xác nhận phiên còn hiệu lực sau khi tải lại trang và bị xóa sau khi đăng xuất.
- Security check xác nhận cookie flags, rate limit, thông báo lỗi đồng nhất và log không chứa password/token.
- Migration test xác nhận có thể áp dụng trên dữ liệu hiện tại và rollback an toàn trước khi phát hành.

## Rủi ro và biện pháp giảm thiểu

- Tấn công brute force: áp dụng rate limit theo IP và tài khoản, đồng thời cảnh báo khi lỗi tăng bất thường.
- Rò rỉ session: chỉ dùng HTTPS, cookie an toàn, session ID đủ entropy và thu hồi phía server.
- Migration ảnh hưởng hiệu năng: tạo index theo chiến lược phù hợp với database và đo thời gian trên bản sao dữ liệu gần production.
- Người dùng bị kẹt sau khi bật tính năng: feature flag cho phép tắt luồng mới mà không rollback toàn bộ bản phát hành.

## Tiêu chí hoàn tất

- Người dùng có thể đăng ký, đăng nhập, tải lại trang mà vẫn giữ phiên và đăng xuất thành công.
- Route được bảo vệ từ chối session thiếu, sai hoặc hết hạn.
- Bộ kiểm thử tự động liên quan đều đạt và không phát hiện secret trong log.
- Dashboard vận hành hiển thị đủ ba chỉ số: tỷ lệ thành công, tỷ lệ lỗi và p95 latency.
- Runbook mô tả cách bật/tắt feature flag, thu hồi session và xử lý sự cố đăng nhập.
