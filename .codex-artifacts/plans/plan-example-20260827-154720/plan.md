# Plan mẫu: Bộ lọc trạng thái cho danh sách artifact

## Mục tiêu

Bổ sung bộ lọc trạng thái vào danh sách plan artifact để người dùng nhanh chóng thu hẹp kết quả theo các nhóm đang chờ review, đã có nhận xét hoặc đã được thay thế.

Plan này là ví dụ minh họa cho quy trình review của Agent Plus; chưa cho phép bắt đầu triển khai.

## Phạm vi

- Thêm một điều khiển lọc trạng thái phía trên danh sách artifact.
- Hỗ trợ lựa chọn `Tất cả`, `Chờ review`, `Có nhận xét` và `Đã thay thế`.
- Áp dụng bộ lọc trên dữ liệu artifact đã được workspace tải vào giao diện.
- Hiển thị trạng thái rỗng phù hợp khi không có artifact thỏa điều kiện.
- Giữ nguyên lựa chọn lọc trong phiên làm việc hiện tại.

Ngoài phạm vi: tìm kiếm toàn văn, sắp xếp, phân trang, đồng bộ lựa chọn giữa nhiều workspace và thay đổi schema artifact.

## Quyết định thiết kế

- Dùng một bộ lọc chọn đơn để giao diện dễ hiểu và tránh các tổ hợp trạng thái mơ hồ.
- Xem trạng thái là dữ liệu suy ra từ metadata hiện có, không ghi thêm trạng thái vào `artifact.json`.
- Mặc định là `Tất cả` để hành vi hiện tại không thay đổi sau khi nâng cấp.
- Lưu lựa chọn ở state cấp phiên; khi mở workspace mới, bộ lọc trở về mặc định.

## Hướng triển khai

### 1. Chuẩn hóa trạng thái hiển thị

Xác định một hàm ánh xạ artifact và comments metadata thành trạng thái giao diện. Hàm này cần có thứ tự ưu tiên rõ ràng khi một artifact đồng thời có nhận xét và đã được thay thế.

### 2. Bổ sung state và logic lọc

Thêm state cho lựa chọn hiện tại, sau đó tạo danh sách đã lọc từ danh sách nguồn. Không thay đổi hoặc loại bỏ dữ liệu gốc để thao tác đổi bộ lọc luôn có thể khôi phục toàn bộ kết quả.

### 3. Thêm điều khiển giao diện

Đặt bộ lọc gần tiêu đề danh sách, dùng nhãn rõ nghĩa và bảo đảm có thể thao tác bằng bàn phím. Số lượng artifact hiển thị cần phản ánh kết quả sau lọc.

### 4. Xử lý trạng thái rỗng

Phân biệt giữa workspace chưa có artifact và bộ lọc hiện tại không có kết quả. Trường hợp thứ hai cần gợi ý chuyển về `Tất cả`.

## Rủi ro và biện pháp giảm thiểu

- Quy tắc suy ra trạng thái có thể không khớp lifecycle thực tế. Giảm thiểu bằng cách gom quy tắc vào một hàm thuần và kiểm thử riêng từng trường hợp.
- Danh sách có thể cập nhật trong lúc người dùng đang lọc. Giảm thiểu bằng cách tính kết quả từ dữ liệu nguồn mới nhất thay vì lưu một bản sao đã lọc.
- Điều khiển mới có thể làm chật khu vực tiêu đề. Giảm thiểu bằng layout co giãn và kiểm tra ở chiều rộng panel nhỏ.

## Kiểm thử và xác nhận

- Unit test cho ánh xạ trạng thái và từng lựa chọn lọc.
- Kiểm thử trường hợp artifact có nhiều tín hiệu trạng thái để xác nhận thứ tự ưu tiên.
- Component test cho thay đổi lựa chọn, số lượng kết quả và trạng thái rỗng.
- Kiểm tra bàn phím, focus và tên truy cập của điều khiển.
- Chạy bộ test và kiểm tra kiểu dữ liệu hiện có của dự án.
- Kiểm tra thủ công với danh sách rỗng, một artifact và nhiều artifact có trạng thái khác nhau.

## Tiêu chí hoàn tất

- Người dùng có thể lọc danh sách theo bốn lựa chọn đã định nghĩa.
- Kết quả và thông báo rỗng cập nhật ngay khi lựa chọn thay đổi.
- Hành vi mặc định giữ nguyên khi người dùng chưa chọn bộ lọc.
- Không có thay đổi đối với schema hoặc nội dung các artifact hiện hữu.
- Các kiểm thử liên quan vượt qua và điều khiển sử dụng được bằng bàn phím.
