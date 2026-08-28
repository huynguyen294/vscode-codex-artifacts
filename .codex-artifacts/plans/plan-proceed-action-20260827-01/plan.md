# Thêm hành động Proceed cho plan đã duyệt

## Mục tiêu

Cho phép người dùng duyệt một plan trong Plan Review rồi chọn **Proceed** để gửi yêu cầu triển khai tới đúng cuộc hội thoại Codex đã tạo plan đó. Luồng mới phải giữ nguyên các bảo đảm hiện có về origin binding, kiểm tra artifact và xử lý thread đang bận.

## Phạm vi

- Thêm nút **Proceed** vào webview cạnh hành động **Send review**.
- Chỉ bật **Proceed** khi artifact hợp lệ và không còn nhận xét chưa gửi.
- Gửi một prompt triển khai có cấu trúc tới `origin.threadId` bằng App Server hiện có.
- Hiển thị trạng thái gửi, thành công, lỗi có thể thử lại và lỗi không thể thử lại trong Plan Review.
- Bổ sung kiểm thử cho contract, prompt, giao tiếp webview–extension và luồng App Server.

Ngoài phạm vi: theo dõi tiến độ triển khai trong Plan Review, stream phản hồi Codex vào webview, tự động sửa plan trước khi triển khai, hoặc chuyển yêu cầu sang một thread khác khi thread gốc bận.

## Quyết định thiết kế

- **Proceed là một turn mới trên thread gốc.** Extension dùng `thread/resume` rồi `turn/start`, giống Send Review, để mọi quyết định và bối cảnh của plan vẫn nằm trong đúng cuộc hội thoại.
- **Không gộp comment với Proceed.** Nếu còn comment chưa gửi, giao diện yêu cầu người dùng gửi review trước. Điều này tránh một thao tác vừa yêu cầu sửa plan vừa yêu cầu triển khai một phiên bản có thể đã lỗi thời.
- **Plan là nguồn nội dung được phê duyệt.** Prompt Proceed nêu rõ artifact ID và yêu cầu Codex triển khai theo `plan.md`, nhưng không chép toàn bộ Markdown vào message để tránh trùng lặp và prompt quá lớn.
- **Không thêm hàng đợi.** Nếu origin thread đang xử lý turn khác, giữ nguyên trạng thái và cho phép thử lại, phù hợp với ranh giới MVP hiện tại.
- **Không thay đổi vòng đời artifact.** Proceed không sửa `artifact.json`, `plan.md`, `comments.json` và không chuyển artifact vào `.trash`.

## Cách triển khai

### 1. Mở rộng contract dùng chung

Cập nhật `src/shared/contracts.ts` để thêm message `proceed` từ webview và response tương ứng từ extension host. Dùng discriminated union hiện có để cả React và extension host nhận được kiểm tra kiểu đầy đủ; dữ liệu gửi từ webview chỉ cần artifact ID vì extension phải tự tải lại dữ liệu đáng tin cậy từ đĩa.

### 2. Tạo prompt Proceed

Thêm một hàm tạo prompt thuần, đặt cạnh `src/extension/review-prompt.ts` hoặc đổi module này thành nơi chứa cả hai loại prompt. Prompt cần chứa artifact ID, đường dẫn tuyệt đối tới `plan.md`, chỉ dẫn triển khai toàn bộ plan, chạy kiểm tra phù hợp và báo lại các sai lệch hoặc blocker.

Hàm tạo prompt không được đọc file hoặc gọi App Server để có thể kiểm thử bằng snapshot hoặc so sánh chuỗi ổn định.

### 3. Điều phối trong extension host

Trong `src/extension/plan-review-provider.ts`, xử lý message `proceed` theo cùng ranh giới tin cậy của Send Review:

1. Tải lại artifact qua store và xác thực cả ba file.
2. Từ chối nếu artifact ID không khớp tài liệu đang mở hoặc có comment chưa gửi.
3. Tạo prompt Proceed từ metadata đã xác thực.
4. Resume `origin.threadId` và start turn với `origin.cwd`.
5. Ánh xạ kết quả thành trạng thái thành công, retryable hoặc terminal cho webview.

Tách phần gọi App Server dùng chung giữa Send Review và Proceed nếu việc thêm nhánh mới làm lặp logic phân loại lỗi, nhưng giữ các hàm tạo prompt riêng để ý định của hai hành động không bị trộn lẫn.

### 4. Cập nhật Plan Review UI

Trong `src/webview/App.tsx`, thêm nút **Proceed** ở vùng hành động chính và một hộp xác nhận ngắn trước khi gửi. Hộp xác nhận phải nói rõ rằng Codex sẽ bắt đầu triển khai trên thread gốc và thao tác không thể bị hủy từ Plan Review.

Vô hiệu hóa nút khi đang lưu comment, đang gửi review hoặc Proceed, artifact không hợp lệ, hay còn comment chưa gửi. Tái sử dụng cách hiển thị lỗi và nút retry hiện tại; bổ sung nhãn riêng để người dùng phân biệt lỗi gửi review với lỗi bắt đầu triển khai.

Cập nhật `src/webview/styles.css` chỉ cho phần bố cục và trạng thái nút mới, giữ nguyên hệ thống màu và focus style của VS Code.

### 5. Cập nhật tài liệu

Bổ sung luồng Proceed vào `README.md` và `docs/ARCHITECTURE.md`, bao gồm acknowledgement boundary: thành công nghĩa là App Server đã chấp nhận `turn/start`, không có nghĩa là phần triển khai đã hoàn tất.

## Xử lý lỗi và tình huống biên

- Nếu thiếu `origin.threadId`, chặn Proceed và hướng dẫn tạo lại plan trong một chat có workspace hook đang hoạt động.
- Nếu `plan.md` hoặc manifest thay đổi sau khi mở editor, extension dùng bản vừa tải lại và báo lỗi nếu validation không còn hợp lệ.
- Nếu có comment chưa gửi, giữ nguyên comment và không gọi App Server.
- Nếu thread gốc đang bận, giữ nút retry và không tạo turn trên thread khác.
- Nếu người dùng bấm nhiều lần, khóa thao tác trong lúc request đang chạy; mỗi lần retry sau lỗi vẫn là một yêu cầu rõ ràng của người dùng.
- Nếu webview được mở lại sau khi `turn/start` thành công, không suy đoán trạng thái triển khai vì MVP chưa lưu execution state.

## Kiểm thử

- Kiểm thử contract chấp nhận message Proceed hợp lệ và từ chối payload thừa hoặc sai kiểu.
- Kiểm thử prompt chứa artifact ID, đường dẫn plan và chỉ dẫn triển khai, đồng thời không nhúng comment hay toàn bộ nội dung plan.
- Kiểm thử provider luôn tải lại artifact, chặn comment chưa gửi và không gọi App Server khi validation thất bại.
- Kiểm thử luồng thành công gọi resume/start đúng thread và cwd; luồng busy được phân loại retryable; lỗi origin được phân loại terminal.
- Kiểm thử UI cho trạng thái enable/disable, hộp xác nhận, khóa double-submit và retry.
- Chạy `npm run check`, `npm test` và `npm run build` để xác nhận type safety, hành vi và bundle webview/extension.

## Tiêu chí chấp nhận

- Người dùng có thể mở một plan hợp lệ, xác nhận Proceed và khởi tạo một turn triển khai trên đúng `origin.threadId`.
- Proceed không hoạt động khi có comment chưa gửi, artifact không hợp lệ hoặc thiếu origin binding.
- Thread bận tạo ra lỗi có thể thử lại mà không mất dữ liệu và không chuyển sang thread khác.
- Một lần bấm chỉ tạo tối đa một request đang chạy trong webview.
- Các artifact file không bị thay đổi bởi thao tác Proceed.
- Type check, test suite và production build đều thành công.

## Rủi ro

- App Server chấp nhận `turn/start` nhưng client không có idempotency key; retry sau lỗi mạng mơ hồ có thể tạo turn trùng. Giảm thiểu bằng cách chỉ hiện retry khi lỗi được phân loại chắc chắn là chưa bắt đầu hoặc thread đang bận, và coi lỗi kết nối không rõ kết quả là terminal với hướng dẫn kiểm tra chat gốc.
- Trạng thái comment có thể thay đổi giữa webview và extension host. Giảm thiểu bằng cách luôn tải lại `comments.json` ngay trước khi gửi.
- Prompt tham chiếu đường dẫn file phụ thuộc Codex chạy trong đúng workspace. Giảm thiểu bằng cách truyền `origin.cwd` đã xác thực cho `turn/start` và đưa cả artifact ID lẫn đường dẫn tuyệt đối vào prompt.
