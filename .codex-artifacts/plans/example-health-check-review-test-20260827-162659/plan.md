# Kế hoạch mẫu kiểm thử Plan Review: bổ sung endpoint health check

## Mục đích của bản mẫu

Plan này là nội dung mẫu để kiểm thử toàn bộ luồng Plan Review: mở artifact, chọn một đoạn, thêm comment, yêu cầu revision và phê duyệt bản thay thế.

Tình huống kỹ thuật minh họa là bổ sung endpoint `GET /health` để hệ thống giám sát xác định dịch vụ đang chạy và sẵn sàng nhận lưu lượng.

## Phạm vi

- Thêm route `GET /health` vào ứng dụng hiện tại.
- Trả về mã HTTP `200` cùng trạng thái cơ bản khi dịch vụ hoạt động bình thường.
- Kiểm tra kết nối tới các dependency bắt buộc, chẳng hạn cơ sở dữ liệu, trước khi báo trạng thái sẵn sàng.
- Bổ sung kiểm thử tự động và tài liệu ngắn cho endpoint mới.

Không thay đổi cơ chế xác thực, cấu hình triển khai hoặc hệ thống giám sát bên ngoài trong phạm vi kế hoạch này.

## Quyết định thiết kế

- Response sử dụng JSON ổn định, gồm `status`, `timestamp` và trạng thái của từng dependency.
- Endpoint không yêu cầu xác thực để nền tảng triển khai có thể gọi trực tiếp, nhưng không trả về bí mật, chuỗi kết nối hoặc chi tiết lỗi nội bộ.
- Dịch vụ trả `200` khi mọi dependency bắt buộc sẵn sàng và `503` khi ít nhất một dependency bắt buộc không khả dụng.
- Mỗi phép kiểm tra dependency có timeout ngắn để endpoint không bị treo lâu hơn ngưỡng của hệ thống giám sát.

## Hướng triển khai

1. Xác định cấu trúc route, conventions xử lý lỗi và dependency bắt buộc trong codebase hiện tại.
2. Tạo health service gom các phép kiểm tra và chuẩn hóa kết quả trả về.
3. Đăng ký route `GET /health`, ánh xạ kết quả tổng hợp sang mã HTTP `200` hoặc `503`.
4. Thêm cấu hình timeout với giá trị mặc định an toàn và cho phép ghi đè qua cấu hình ứng dụng.
5. Cập nhật tài liệu API với response mẫu cho cả trạng thái khỏe mạnh và suy giảm.

## Kiểm thử và xác minh

- Unit test xác nhận trạng thái tổng hợp khi tất cả dependency đều sẵn sàng.
- Unit test xác nhận mã `503` và nội dung response khi một dependency bắt buộc lỗi hoặc timeout.
- Integration test gọi `GET /health` trên ứng dụng đang chạy và kiểm tra schema response.
- Kiểm tra rằng response không chứa thông tin nhạy cảm hoặc stack trace.
- Chạy toàn bộ test suite và lint/type-check hiện có để phát hiện hồi quy.

## Rủi ro và biện pháp giảm thiểu

- Health check có thể tạo tải phụ lên dependency; dùng phép kiểm tra nhẹ và giới hạn tần suất ở tầng giám sát.
- Timeout quá dài có thể làm chậm quyết định điều phối; đặt timeout ngắn và kiểm thử đường lỗi.
- Schema response có thể trở thành contract ngoài ý muốn; tài liệu hóa các trường ổn định và tránh đưa chi tiết nội bộ vào payload.

## Tiêu chí hoàn tất

- Endpoint phản hồi đúng mã HTTP và schema trong cả trường hợp khỏe mạnh lẫn dependency gặp lỗi.
- Các kiểm thử mới và bộ kiểm thử hiện tại đều vượt qua.
- Tài liệu mô tả cách gọi endpoint, ý nghĩa trạng thái và giới hạn dữ liệu trả về.
- Người review có thể phê duyệt revision này trong Plan Review sau khi xác nhận comment “test” đã được phản ánh rõ trong mục đích bản mẫu.
