---
name: project-assessment
description: Assess or materially reassess one software project and inventory its credible technical highlights using project documents, source code, Git history, owner context, current market expectations, and a relevant peer cohort. Use when creating or substantively revising a project's ASSESSMENT.md or HIGHLIGHTS.md, or when owner feedback changes its evidence, strengths, score, role fit, or hiring conclusion. Do not use for repository orientation without evaluation, code or security review alone, cross-project aggregate assessment, CV drafting, technology inventory only, or mechanical metadata edits.
---

# Project Assessment

Áp dụng skill này cùng [INSTRUCTION.ai.md](../../../INSTRUCTION.ai.md) và [FLOW.ai.md](../../../working/FLOW.ai.md). Skill quy định phương pháp đánh giá một project; FLOW điều phối review, apply và đồng bộ tài liệu. [IMPROVE.ai.md](../../../working/IMPROVE.ai.md) và [CURRENT_LEVEL.ai.md](../../../working/CURRENT_LEVEL.ai.md) là hai source of truth dùng chung, không phải evidence thay thế cho project.

## Nguyên tắc vận hành

1. Đánh giá mặc định cho portfolio Frontend Engineer khoảng 4+ năm tại Việt Nam; bổ sung role chuyên biệt khi project có evidence phù hợp.
2. Tôn trọng đúng scope Chú yêu cầu. Không tự re-assess, không tự chuyển một yêu cầu “chỉ xem/hiểu project” thành đánh giá.
3. Phân biệt implementation, ownership, decision-making, outcome và hiring signal. Một lớp không tự động chứng minh lớp tiếp theo.
4. Xây market benchmark độc lập với evidence cá nhân; không suy tiêu chí thị trường ngược từ project đang audit.
5. Broad-scan toàn bộ audit scope để tìm mọi credible highlight candidate, lưu inventory tham khảo, rồi deep-dive những candidate có khả năng thay đổi kết luận; không chỉ xác nhận highlight đã có trong docs.
6. Chỉ hỏi Chú unknown có khả năng thay đổi classification, ownership, score, role fit hoặc conclusion.
7. Không gửi tên nội bộ, source riêng tư hoặc chi tiết nhạy cảm vào truy vấn web; dùng capability và project archetype ở mức tổng quát.
8. Không tạo percentile hoặc xác suất tuyển dụng giả. Mọi phần trăm là heuristic có evidence và phải được phân biệt theo loại.

## Routing theo task

| Task | Mức áp dụng |
| --- | --- |
| Full assessment mới | Chạy đầy đủ sáu cơ chế; tạo/cập nhật `HIGHLIGHTS.md` và full assessment output. |
| Highlight discovery riêng | Chạy external calibration rút gọn, evidence audit, comprehensive discovery và owner gate; cập nhật `HIGHLIGHTS.md`, không scoring nếu Chú chưa yêu cầu. |
| Material re-assessment | Tái sử dụng benchmark còn hiệu lực; chạy lại cơ chế bị ảnh hưởng và consistency check toàn assessment. |
| Apply owner review | Cập nhật evidence boundary và highlight inventory trước, rồi recalibrate score/conclusion liên quan; không rewrite phần không bị ảnh hưởng. |
| Minor/supporting project | Chạy benchmark, evidence, highlight discovery, owner gate và validation ở dạng rút gọn; weighted score là optional. |
| Chỉ hiểu repository, code/security review, inventory hoặc mechanical edit | Không dùng skill này. |

## Project profile

Phân loại project theo bốn trục trước khi chọn rubric:

| Trục | Giá trị thường gặp |
| --- | --- |
| Context | `worked`, `independent`, `academic` |
| Artifact | `application`, `library/package`, `developer tool/extension`, `prototype` |
| Lifecycle | `prototype`, `deployed`, `production`, `retired` |
| Collaboration | `solo`, `team`, `inherited/extended` |

Không dùng một nhãn duy nhất để suy toàn bộ kỳ vọng. Prototype không bị giả định là production; solo authorship không đồng nghĩa ownership toàn bộ architecture, concept, generated code hoặc reused assets.

## Cơ chế 1 — External Calibration

Xác định target roles, market, project profile và peer cohort trước khi chấm điểm.

1. Kiểm tra external benchmark artifact đã có. Chỉ tái sử dụng khi target, market, level, project archetype, capability clusters và thời điểm còn phù hợp.
2. Tái sử dụng nguồn/criteria đã khảo sát, không tái sử dụng score hoặc kết luận của project khác làm market expectation.
3. Khi thiếu benchmark, ưu tiên JD hiện hành, official engineering/career guidance và nguồn chuyên môn sơ cấp phù hợp project type.
4. Ghi target, market, nguồn/ngày, expected baseline, strong signal, differentiating signal và pattern bị loại.
5. Không dùng số lượng JD cố định như quality metric; dừng khi nguồn mới không còn khả năng thay đổi rubric.
6. Không dùng năm kinh nghiệm hoặc keyword frequency như bằng chứng độc lập cho technical depth.

Với full assessment hoặc material re-assessment có thay đổi scoring, đọc [assessment-rubric.md](references/assessment-rubric.md) và [peer-cohorts.md](references/peer-cohorts.md) trước khi chọn weights. Với owner review không đổi scoring, không cần load lại references.

## Cơ chế 2 — Evidence and Ownership Audit

Tuân theo hierarchy trong `INSTRUCTION.ai.md`:

1. Đọc existing `ASSESSMENT.md` nếu có để biết prior conclusion; không xem nó là evidence tự chứng minh.
2. Đọc `EVIDENCE.md`, `RESPONSIBILITY.md`, `REVIEW.md`, `SUMMARY.md`/`README.md` theo file hiện có.
3. Xác định initial highlight candidates và các claim có khả năng ảnh hưởng scoring, nhưng không xem docs hiện có là inventory đầy đủ.
4. Broad-scan architecture, feature/domain modules, custom mechanisms, integrations, quality/reliability, tooling/distribution và Git evolution để tìm thêm candidates và counter-evidence.
5. Deep-dive source/Git của candidate quan trọng; kiểm tra log, blame, semantic commit history và nested repositories khi có client/server hoặc legacy/current source.
6. Ghi rõ phần source/Git không thể xác minh thay vì suy đoán.

Phân loại mỗi claim đáng kể bằng năm trạng thái:

| Trạng thái | Cách sử dụng |
| --- | --- |
| `verified` | Source, Git hoặc artifact xác nhận; được dùng trong scoring và hiring signal. |
| `owner-confirmed` | Chú xác nhận nhưng chưa có artifact độc lập; được dùng với attribution và confidence phù hợp. |
| `inferred` | Suy luận hợp lý nhưng chưa xác nhận; không được viết thành fact hoặc tự tạo strong signal. |
| `target state` | Kế hoạch chưa release; không scoring như current capability. |
| `no evidence` | Không tìm thấy cơ sở; không scoring như tín hiệu dương. |

Xác minh ownership theo từng lớp:

- implementation và maintenance;
- architecture/technical decisions;
- product/problem framing;
- reused, generated, inherited hoặc externally designed parts;
- operational outcome.

Sole-author Git history chỉ chứng minh implementation provenance trong phạm vi source đã kiểm tra. Không mặc định 100% ownership cho các lớp còn lại.

## Cơ chế 3 — Comprehensive Highlight Discovery

Tạo hoặc cập nhật `HIGHLIGHTS.md` như một derived reference artifact chứa mọi credible highlight candidate tìm được trong repository snapshot và audit coverage đã ghi. Đọc [highlight-inventory.md](references/highlight-inventory.md) trước khi tạo hoặc materially cập nhật inventory.

Với mỗi candidate, kiểm tra:

- problem/constraint có vượt feature thông thường không;
- implementation có custom/adapt beyond library default không;
- ownership thuộc lớp nào và có evidence gì;
- decision/trade-off có deliberate hay chỉ là framework default;
- reuse, evolution, operational utility hoặc outcome có thật không;
- so với peer cohort, đây là differentiator, strong support, baseline hay unsupported idea;
- claim có defend được khi phỏng vấn không.

Chuyển candidate qua chuỗi:

`Implementation evidence → Problem/constraint → Technical decision → Personal capability → Peer differentiation → Hiring signal`

Không thưởng novelty tự thân. Giữ lại giải pháp thực dụng nếu nó giải quyết constraint thật, có ownership và tạo hiring signal, kể cả khi công nghệ không mới.

Phân loại inventory thành `primary differentiator`, `strong supporting strength`, `specialized/role-specific`, `breadth/additional technology`, `pending owner verification` và `downgraded/rejected`. Ghi capability tags và combination hooks để task tổng hợp sau này có thể ghép các signal liên quan; không tự tạo cross-project conclusion trong skill này.

Deep-validate tất cả primary differentiators và những candidate có thể thay đổi score, role fit hoặc CV handoff. `ASSESSMENT.md` chỉ chọn subset quan trọng; `HIGHLIGHTS.md` giữ inventory rộng hơn và lý do candidate bị hạ/loại.

## Cơ chế 4 — Owner Calibration Gate

Sau evidence audit và trước khi finalize scoring, xác định unknown nào có thể thay đổi kết luận.

Bắt buộc hỏi khi chưa thể xác định từ artifact:

- project origin, lifecycle hoặc production boundary;
- Chú thiết kế hay kế thừa architecture/technical decision;
- contribution boundary trong team;
- custom, generated, adapted hoặc legacy-derived implementation;
- deliberate trade-off so với framework/library default;
- outcome, user impact hoặc lý do feature bị retire/disable.

Hỏi một lượt 1–5 câu có mục tiêu. Mỗi câu phải nêu evidence hiện có và decision bị ảnh hưởng, ví dụ: `Git cho thấy X; source-legacy cho thấy Y. Chú trực tiếp thiết kế phần Z hay kế thừa rồi adapt?`

Không hỏi lại điều source/Git đã trả lời hoặc fact Chú đã xác nhận. Nếu Chú chưa trả lời, tiếp tục bảo thủ bằng `inferred`/`no evidence`, giảm evidence confidence và ghi rõ điều có thể thay đổi assessment; không fabricate fact.

Chuyển các candidate `pending owner verification` vào gate này khi câu trả lời có thể thay đổi category, ownership hoặc hiring signal.

## Cơ chế 5 — Scoring and Peer Comparison

Tách bốn kết quả, không dùng một con số cho nhiều ý nghĩa:

1. **Project engineering score (0–100):** chất lượng kỹ thuật của artifact theo rubric và lifecycle.
2. **Role-fit estimate (%):** mức yêu thích dự kiến của recruiter/hiring manager cho từng target role; đây là heuristic, không phải xác suất đo được.
3. **Evidence confidence (%):** độ chắc chắn của kết luận dựa trên evidence state và coverage.
4. **Peer position:** `below expected`, `meets expected`, `strong` hoặc `differentiating` trong cohort đã nêu.

Tính base engineering score bằng `Σ(dimension score × weight) / 100`. Chọn weights trước khi nhìn vào điểm mạnh/yếu cuối cùng, tổng weights bằng 100 và giải thích mọi deviation khỏi default rubric. Không dùng hidden cross-dimension adjustment. Nếu có gate/cap, nêu tên gate, lý do và ảnh hưởng rõ trong assessment.

Role-fit và evidence confidence dùng khoảng hẹp hoặc bước 5% khi uncertainty đáng kể; không dùng chữ số lẻ để tạo cảm giác chính xác. Không coi project score là candidate seniority hoặc CV placement.

Peer comparison phải ghi:

- cohort và lý do chọn;
- project đạt baseline ở đâu;
- vượt baseline ở đâu;
- còn thua strong peers ở đâu;
- differentiating signal, nếu có;
- comparison confidence.

Không dùng `top X%` nếu không có sample và phương pháp thống kê đáng tin cậy.

## Cơ chế 6 — Adversarial Validation

Kiểm tra assessment dưới bốn góc nhìn:

1. **Technical recruiter:** role, scope và signal có rõ, không bị technology-listing lấn át?
2. **Hiring manager:** depth, decisions và outcome có đủ để shortlist và hỏi sâu?
3. **Peer engineer cùng cohort:** code/decisions đạt baseline nào, thiếu gì so với strong peer?
4. **Skeptical reviewer:** claim nào sụp nếu kiểm tra source, Git hoặc hỏi về contribution?

Chỉ lưu weak point làm thay đổi score, conclusion, claim boundary hoặc interview risk. Nếu assessment chỉ đứng vững nhờ owner-confirmed context, giữ attribution và phản ánh điều đó trong evidence confidence.

## Output contract

### `HIGHLIGHTS.md` — reference inventory

Đánh dấu rõ file là `Derived reference artifact`: dùng để Chú xem toàn bộ candidates, hỗ trợ reasoning và combination; không phải project source of truth, không phải CV-ready wording và không tự động thay thế `ASSESSMENT.md`.

Ghi snapshot/date, repositories và audit coverage, known blind spots, category của candidate, evidence/ownership, capability tags, source pointers, selection status và combination hooks theo [highlight-inventory.md](references/highlight-inventory.md). “Toàn bộ” nghĩa là mọi credible candidate tìm được trong scope đã ghi, không tuyên bố exhaustiveness ngoài phần source/Git đã audit.

### `ASSESSMENT.md` — official judgment

Với full assessment mới, tích hợp các nội dung sau vào `ASSESSMENT.md`:

1. Project profile và trạng thái đánh giá.
2. Kết luận điều hành.
3. Market benchmark và peer cohort.
4. Role-fit estimate.
5. Technical dimensions và project engineering score.
6. Evidence confidence và ownership boundaries.
7. Technical highlights: chỉ subset mạnh và decision-relevant được chọn từ `HIGHLIGHTS.md`.
8. Limitations và hiring risks.
9. Seniority signal.
10. Hiring recommendation và interview verification.
11. CV handoff: verified hiring signals, placement recommendation và claims cần tránh.
12. Improvement priorities.
13. References.

Với existing assessment, giữ heading phù hợp và chỉ tái cấu trúc khi nó làm rõ meaning của score hoặc evidence. Với minor project, dùng compact output và bỏ section không tạo quyết định; không sinh `Not applicable` hàng loạt.

`CV handoff` không được draft Summary, Experience hoặc project bullet. Khi cần wording CV, chuyển verified signals sang `evidence-based-cv-improver`.

Nếu task cho phép cập nhật tài liệu, đồng bộ fact vào `EVIDENCE.md`, inventory dẫn xuất vào `HIGHLIGHTS.md`, owner clarification vào `REVIEW.md`, mô tả trung lập vào `SUMMARY.md` và thay đổi vào `AI_CHANGE_LOGS.md` theo FLOW. Chỉ cập nhật `IMPROVE.ai.md`/`CURRENT_LEVEL.ai.md` khi project thực sự thay đổi kết luận tổng thể. Không tự tạo `HIGHLIGHTS.md` hoặc re-assess project cũ chỉ vì skill được cập nhật.

## Quality gate

Trước khi trình Chú assessment, xác nhận:

- task thực sự yêu cầu assessment hoặc material re-assessment;
- project profile, target roles, market và cohort đã rõ;
- market criteria không được suy ngược từ project hoặc assessment cũ;
- existing assessment được xem là prior conclusion, không phải evidence;
- broad discovery đã tìm candidates ngoài những gì docs hiện có mô tả và ghi rõ audit coverage;
- mọi credible candidate trong scope đã được phân loại trong `HIGHLIGHTS.md`, gồm cả pending và downgraded/rejected khi hữu ích;
- primary highlight đã được deep-dive vào source/Git và đã breadth-scan counter-evidence;
- mỗi selected highlight chứng minh capability của Chú, không chỉ sự tồn tại của feature/dependency;
- giải pháp thực dụng không bị hạ thấp chỉ vì công nghệ không mới;
- implementation, ownership, decision và outcome không bị đánh đồng;
- owner calibration đã chạy hoặc unresolved unknown đã được ghi bảo thủ;
- engineering score, role fit, confidence và peer position không bị trộn;
- weights, formula và mọi gate/cap đều hiển thị và có rationale;
- comparison không tạo percentile giả;
- CV handoff không vượt evidence và không lấn sang CV wording;
- chỉ còn ambiguity mà Chú thực sự cần quyết định.
