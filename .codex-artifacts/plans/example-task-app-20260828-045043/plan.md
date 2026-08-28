# Kế hoạch mẫu: Ứng dụng quản lý công việc

## Mục tiêu

Xây dựng một ứng dụng web nhỏ cho phép người dùng tạo, xem, cập nhật và hoàn thành công việc. Bản đầu tiên ưu tiên luồng sử dụng rõ ràng, dữ liệu bền vững và nền tảng dễ mở rộng.

## Phạm vi

Phiên bản đầu tiên bao gồm danh sách công việc, biểu mẫu tạo và chỉnh sửa, trạng thái chưa làm/đã hoàn thành, mức ưu tiên, hạn hoàn thành và bộ lọc cơ bản.

Chưa triển khai đăng nhập, cộng tác nhiều người, thông báo thời gian thực, tệp đính kèm hoặc ứng dụng di động. Các khả năng này được giữ ngoài phạm vi để ví dụ tập trung vào một lát cắt hoàn chỉnh nhưng nhỏ.

## Quyết định chính

- Dùng kiến trúc một ứng dụng web duy nhất với API nội bộ để giảm chi phí vận hành và giữ luồng phát triển đơn giản.
- Lưu công việc trong cơ sở dữ liệu quan hệ; mỗi bản ghi có tiêu đề, mô tả tùy chọn, trạng thái, mức ưu tiên, hạn hoàn thành và thời điểm tạo/cập nhật.
- Kiểm tra dữ liệu ở cả giao diện và máy chủ; máy chủ là nguồn xác thực cuối cùng.
- Tách lớp truy cập dữ liệu khỏi xử lý HTTP để logic nghiệp vụ có thể kiểm thử độc lập.
- Thiết kế giao diện đáp ứng cho màn hình máy tính và điện thoại, đồng thời hỗ trợ thao tác bàn phím cơ bản.

## Cách triển khai

### 1. Khảo sát cấu trúc dự án

Xác định framework, quy ước thư mục, lệnh kiểm thử và các thành phần giao diện sẵn có. Ghi nhận mọi ràng buộc kỹ thuật trước khi thêm mã để thay đổi hòa hợp với dự án hiện tại.

### 2. Mô hình dữ liệu và lưu trữ

Định nghĩa bảng công việc và migration tương ứng. Thêm lớp repository với các thao tác tạo, đọc danh sách, cập nhật và xóa; chuẩn hóa cách xử lý thời gian và giá trị ưu tiên.

### 3. API và quy tắc nghiệp vụ

Tạo các endpoint phục vụ danh sách, tạo mới, chỉnh sửa, chuyển trạng thái và xóa công việc. Áp dụng validation thống nhất, mã lỗi rõ ràng và giới hạn các giá trị trạng thái/ưu tiên được chấp nhận.

### 4. Giao diện người dùng

Xây dựng trang danh sách, trạng thái rỗng, biểu mẫu tạo/chỉnh sửa và thao tác hoàn thành nhanh. Bổ sung bộ lọc theo trạng thái, sắp xếp theo hạn hoặc ưu tiên, cùng phản hồi tải/lỗi dễ hiểu.

### 5. Hoàn thiện trải nghiệm

Đảm bảo giao diện hoạt động ở các kích thước màn hình chính, có nhãn biểu mẫu đầy đủ, thứ tự focus hợp lý và xác nhận trước thao tác xóa. Giữ thông báo ngắn gọn và không làm mất dữ liệu người dùng khi yêu cầu thất bại.

## Rủi ro và biện pháp giảm thiểu

- Sai lệch múi giờ có thể làm hạn hoàn thành hiển thị không đúng; lưu thời gian theo UTC và chuyển đổi tại ranh giới giao diện.
- Cập nhật lạc hậu có thể ghi đè dữ liệu mới; dùng trường `updatedAt` hoặc cơ chế kiểm soát phiên bản nếu ứng dụng có nhiều phiên hoạt động.
- Bộ lọc phía máy khách có thể không mở rộng khi dữ liệu tăng; giữ hợp đồng API đủ rõ để chuyển lọc và phân trang sang máy chủ.
- Thao tác xóa nhầm gây mất dữ liệu; yêu cầu xác nhận và cân nhắc xóa mềm nếu sản phẩm cần khả năng khôi phục.

## Kiểm thử và xác minh

- Kiểm thử đơn vị cho validation, chuyển trạng thái và quy tắc sắp xếp.
- Kiểm thử tích hợp cho migration, repository và từng endpoint API, bao gồm đầu vào không hợp lệ và bản ghi không tồn tại.
- Kiểm thử giao diện cho tạo, sửa, hoàn thành, lọc và xóa công việc.
- Chạy lint, kiểm tra kiểu, bộ test đầy đủ và build sản phẩm theo các lệnh chuẩn của repository.
- Kiểm tra thủ công trên màn hình rộng và hẹp, tập trung vào bàn phím, trạng thái tải/lỗi và dữ liệu ngày giờ.

## Tiêu chí hoàn thành

Người dùng có thể quản lý toàn bộ vòng đời của một công việc mà không gặp lỗi dữ liệu; dữ liệu vẫn tồn tại sau khi tải lại trang; các đầu vào sai được giải thích rõ ràng; giao diện sử dụng được trên máy tính và điện thoại; toàn bộ kiểm tra tự động và bản build đều thành công.
