# Kế hoạch mẫu: Trung tâm thông báo người dùng

## Mục tiêu

Xây dựng một trung tâm thông báo cơ bản để người dùng xem các sự kiện quan trọng trong sản phẩm, đánh dấu từng thông báo hoặc toàn bộ thông báo là đã đọc, và mở nhanh nội dung liên quan.

Kế hoạch này là artifact mẫu phục vụ việc thử nghiệm quy trình review của Agent Plus. Nội dung mô tả một tính năng giả định và chưa cho phép bắt đầu triển khai.

## Phạm vi

- Hiển thị danh sách thông báo theo thứ tự mới nhất trước, có phân trang hoặc tải thêm.
- Phân biệt rõ trạng thái đã đọc và chưa đọc.
- Cho phép đánh dấu một thông báo hoặc tất cả thông báo là đã đọc.
- Hiển thị số lượng thông báo chưa đọc trên thanh điều hướng.
- Điều hướng người dùng đến tài nguyên liên quan khi chọn một thông báo.
- Bao gồm trạng thái tải, danh sách trống và lỗi có thể thử lại.

Các hạng mục không thuộc phạm vi của phiên bản đầu gồm thông báo đẩy trên thiết bị, gửi email, cấu hình sở thích theo từng loại thông báo, tìm kiếm toàn văn và lưu trữ thông báo dài hạn.

## Quyết định chính

- Máy chủ là nguồn dữ liệu chuẩn cho trạng thái đã đọc để trạng thái nhất quán giữa nhiều thiết bị.
- Giao diện cập nhật lạc quan khi đánh dấu đã đọc, nhưng phải hoàn tác và báo lỗi nếu yêu cầu thất bại.
- Số lượng chưa đọc được trả về từ API riêng hoặc metadata của danh sách; giao diện không tự suy ra từ một trang dữ liệu chưa đầy đủ.
- Mỗi thông báo chứa loại sự kiện và một đích điều hướng có cấu trúc. Client chỉ cho phép các loại đích đã biết để tránh điều hướng không an toàn.
- Phiên bản đầu dùng tải thêm thay vì cuộn vô hạn để hành vi dễ dự đoán và dễ tiếp cận bằng bàn phím.

## Cách triển khai

### 1. Mô hình dữ liệu và API

Định nghĩa bản ghi thông báo với mã định danh, người nhận, loại sự kiện, tiêu đề, nội dung ngắn, thời điểm tạo, thời điểm đọc và dữ liệu điều hướng. Bổ sung chỉ mục phù hợp cho truy vấn theo người nhận, thời điểm tạo và trạng thái chưa đọc.

Thiết kế các endpoint để lấy danh sách, lấy số lượng chưa đọc, đánh dấu một thông báo là đã đọc và đánh dấu toàn bộ là đã đọc. Mọi thao tác phải xác thực người dùng hiện tại và không cho phép truy cập thông báo của tài khoản khác.

### 2. Giao diện người dùng

Thêm biểu tượng thông báo và badge số lượng chưa đọc vào thanh điều hướng. Tạo màn hình hoặc panel danh sách với các mục có trạng thái trực quan, thời gian tương đối, nút tải thêm và hành động đánh dấu đã đọc.

Giữ khả năng sử dụng bằng bàn phím, thứ tự focus hợp lý, nhãn hỗ trợ trình đọc màn hình và thông báo trạng thái khi một thao tác hoàn tất hoặc thất bại.

### 3. Đồng bộ trạng thái

Tạo một lớp truy cập dữ liệu dùng chung cho danh sách và badge. Sau khi đánh dấu đã đọc, cập nhật cache liên quan; nếu máy chủ từ chối yêu cầu, khôi phục dữ liệu trước đó và đồng bộ lại số lượng chưa đọc.

Khi người dùng mở tài nguyên từ thông báo, đánh dấu đã đọc trước khi điều hướng nhưng không chặn điều hướng nếu thao tác cập nhật trạng thái gặp lỗi.

### 4. Quan sát và phát hành

Ghi nhận lỗi API, độ trễ tải danh sách và tỷ lệ điều hướng thất bại mà không đưa nội dung nhạy cảm của thông báo vào log. Đặt tính năng sau feature flag để có thể bật theo môi trường và tăng dần tỷ lệ người dùng.

Phát hành trước cho nhóm nội bộ, theo dõi lỗi và phản hồi, sau đó mở rộng theo từng giai đoạn. Chuẩn bị phương án tắt feature flag mà không cần rollback toàn bộ bản phát hành.

## Rủi ro và biện pháp giảm thiểu

- Badge và danh sách có thể lệch trạng thái do cache; giảm thiểu bằng một nguồn cache dùng chung và tái xác thực sau thao tác ghi.
- Truy vấn thông báo có thể chậm khi dữ liệu tăng; giảm thiểu bằng phân trang theo cursor, chỉ mục phù hợp và giới hạn payload.
- Đích điều hướng cũ có thể không còn tồn tại; client cần xử lý đích không hợp lệ và đưa người dùng về màn hình an toàn.
- Nội dung do người dùng tạo có thể xuất hiện trong thông báo; mọi nội dung phải được escape và không render HTML tùy ý.
- Thao tác “đánh dấu tất cả” có thể tạo tải lớn; thực hiện bằng cập nhật theo người nhận ở phía máy chủ thay vì gửi nhiều yêu cầu cho từng mục.

## Kiểm chứng

- Kiểm thử đơn vị cho ánh xạ loại thông báo, định dạng thời gian, cập nhật cache và hoàn tác khi lỗi.
- Kiểm thử tích hợp API cho phân quyền, phân trang, đếm chưa đọc và tính idempotent của các thao tác đánh dấu đã đọc.
- Kiểm thử giao diện cho các trạng thái tải, trống, lỗi, tải thêm, đánh dấu từng mục và đánh dấu tất cả.
- Kiểm thử end-to-end trên hai phiên đăng nhập để xác nhận trạng thái đã đọc được đồng bộ giữa thiết bị.
- Kiểm tra accessibility bằng bàn phím và công cụ tự động, đồng thời xác nhận badge có nhãn đọc được.
- Kiểm tra feature flag ở trạng thái bật và tắt, bao gồm khả năng tắt nhanh sau khi phát hành.

## Tiêu chí hoàn thành

Tính năng được xem là sẵn sàng khi các luồng chính hoạt động trên thiết bị hỗ trợ, không có lỗi phân quyền đã biết, số lượng chưa đọc nhất quán sau các thao tác, bộ kiểm thử liên quan vượt qua, dashboard quan sát đã hoạt động và phương án tắt tính năng đã được xác nhận.
