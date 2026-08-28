# Ví dụ: cải thiện trạng thái trống của Plan Review

## Mục tiêu

Cải thiện màn hình Plan Review khi một plan chưa có bình luận, giúp người dùng hiểu ngay cách chọn nội dung, thêm nhận xét và gửi review về đúng cuộc trò chuyện Codex.

## Phạm vi

- Thêm empty state ngắn gọn trong webview khi `comments` rỗng.
- Hiển thị hướng dẫn ba bước: chọn một khối Markdown, nhập nhận xét, rồi gửi review.
- Giữ nguyên luồng lưu bình luận, liên kết thread và gửi review hiện tại.
- Không thay đổi schema của `artifact.json` hoặc `comments.json`.

## Quyết định thiết kế

- Empty state chỉ xuất hiện khi plan đã tải thành công và chưa có bình luận; nó không thay thế trạng thái loading hay error.
- Nội dung hướng dẫn dùng văn bản tĩnh, không thêm onboarding nhiều màn hình hoặc trạng thái đã xem.
- Giao diện tái sử dụng màu sắc, khoảng cách và typography hiện có để tương thích với theme sáng và tối của VS Code.
- Khi người dùng tạo bình luận đầu tiên, empty state biến mất ngay dựa trên state hiện tại của webview.

## Cách triển khai

### Webview

Cập nhật `src/webview/App.tsx` để suy ra trạng thái `hasComments` từ dữ liệu review hiện tại và render empty state trong khu vực bình luận khi danh sách rỗng. Giữ logic điều kiện gần nơi danh sách bình luận được render để tránh tạo thêm state đồng bộ dư thừa.

Cập nhật `src/webview/styles.css` với các class dành riêng cho empty state. Dùng token màu của VS Code, giới hạn chiều rộng nội dung và bảo đảm bố cục không đẩy phần plan ra khỏi vùng nhìn hữu ích.

### Hợp đồng dữ liệu

Không thêm message hoặc field mới vào `src/shared/contracts.ts`. Empty state được xác định hoàn toàn từ dữ liệu bình luận đã có, vì vậy extension host và artifact store không cần thay đổi.

### Kiểm thử

Bổ sung kiểm thử UI cho hai trường hợp: review không có bình luận hiển thị hướng dẫn, và review có ít nhất một bình luận không hiển thị empty state. Nếu test hiện tại chưa có helper render webview, tạo helper nhỏ dùng chung thay vì kiểm thử chi tiết triển khai nội bộ.

## Rủi ro và xử lý

- Nội dung hướng dẫn có thể chiếm nhiều chỗ ở cửa sổ hẹp. Giới hạn độ dài từng bước và cho phép xuống dòng tự nhiên.
- Trạng thái rỗng có thể lóe lên trong lúc dữ liệu đang tải. Chỉ render sau khi dữ liệu review đã sẵn sàng.
- CSS mới có thể khó đọc ở một số theme. Dùng các biến `--vscode-*` thay cho màu cố định và kiểm tra cả theme sáng lẫn tối.

## Xác minh

- Chạy `npm run check` để xác nhận TypeScript hợp lệ.
- Chạy `npm test` để xác nhận hành vi cũ và kiểm thử empty state đều qua.
- Chạy `npm run build` để kiểm tra bundle extension và webview.
- Mở một plan chưa có bình luận trong Extension Development Host, xác nhận hướng dẫn hiển thị và biến mất sau khi thêm bình luận đầu tiên.
- Kiểm tra thủ công ở theme sáng, theme tối và cửa sổ hẹp.

## Tiêu chí hoàn thành

- Người dùng mở plan chưa có bình luận sẽ thấy hướng dẫn rõ ràng về cách review.
- Empty state không xuất hiện trong loading, error hoặc khi đã có bình luận.
- Không có thay đổi đối với định dạng artifact hay luồng gửi review.
- Type check, test và build đều thành công.
