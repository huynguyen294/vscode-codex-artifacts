# Assessment Rubric

Đọc file này trước khi scoring một full assessment hoặc material re-assessment. Chọn rubric theo project profile trước khi chấm; không chọn weights sau khi đã thấy điểm mạnh của project.

## Score anchors

| Khoảng | Ý nghĩa |
| --- | --- |
| 90–100 | Differentiating: depth/decision/outcome nổi bật, evidence mạnh và defend được. |
| 80–89 | Strong: vượt baseline 4+ rõ ở dimension được chấm. |
| 70–79 | Meets expectation: có năng lực thực nhưng còn gap đáng kể. |
| 60–69 | Supporting: có tín hiệu liên quan nhưng depth, quality hoặc evidence còn hạn chế. |
| Dưới 60 | Weak/insufficient: implementation cơ bản, evidence yếu hoặc không phù hợp target. |

Không coi anchor là percentile. Chỉ `verified` và `owner-confirmed` có attribution phù hợp mới tạo strong positive signal. `Inferred` có thể định hướng câu hỏi nhưng không độc lập nâng điểm lên band mạnh. `Target state` và `no evidence` không tạo điểm dương.

## Dimension pool

- Problem/constraint complexity
- Implementation depth
- Architecture và decision quality
- Ownership và maintenance
- Engineering quality/correctness
- Security/reliability/performance
- Code/API craftsmanship
- Evolution và compatibility
- DX/documentation/distribution
- Outcome/impact/validation
- Collaboration và production delivery

Chỉ chọn dimension ảnh hưởng hiring signal. Không chấm cùng một evidence hai lần dưới tên khác.

## Default weighted profiles

### Worked enterprise/data application

| Nhóm | Weight |
| --- | ---: |
| Problem/domain complexity | 15 |
| Implementation depth | 20 |
| Architecture/decision quality | 10 |
| Ownership/collaboration | 20 |
| Engineering quality/reliability | 15 |
| Outcome/evolution/maintenance | 20 |

### Independent product application

| Nhóm | Weight |
| --- | ---: |
| Problem/product coherence | 15 |
| Implementation depth | 20 |
| Architecture/data decisions | 15 |
| Engineering quality | 15 |
| UX/workflow completeness | 15 |
| Real use/evolution/outcome | 20 |

### Library/package

| Nhóm | Weight |
| --- | ---: |
| Problem/API thesis | 10 |
| API/architecture design | 25 |
| Correctness/testing/quality | 25 |
| Implementation depth | 15 |
| DX/docs/compatibility | 15 |
| Evolution/adoption/outcome | 10 |

### Developer tool/extension

| Nhóm | Weight |
| --- | ---: |
| Problem framing | 15 |
| Platform architecture | 25 |
| Implementation/integration depth | 20 |
| Security/reliability/quality | 15 |
| DX/distribution | 15 |
| Ownership/evolution/outcome | 10 |

### Prototype/PoC or academic end-to-end project

| Nhóm | Weight |
| --- | ---: |
| Problem/hypothesis/domain modeling | 20 |
| Implementation depth | 25 |
| Architecture/decision quality | 15 |
| Correctness/engineering quality | 15 |
| Ownership/completeness | 15 |
| Validation/learning/evolution | 10 |

Với minor/supporting project, mặc định không cần weighted score. Đánh giá breadth evidence, role relevance, key boundary và confidence ở dạng compact.

## Gates và interpretation

- Không có tests không tạo universal cap; phản ánh mức nghiêm trọng theo lifecycle, correctness risk và target role.
- Prototype không bị trừ vì không có production outcome, nhưng không được tạo production-maturity signal.
- Sole authorship không tự động tạo architecture, product hoặc outcome ownership.
- Library/tooling thiếu tests, compatibility hoặc release evidence phải bị phản ánh mạnh hơn application PoC cùng quy mô.
- Worked production project thiếu quality/reliability evidence phải ảnh hưởng role fit ngay cả khi feature complexity cao.
- Dùng weighted average làm base score. Mọi gate/cap bổ sung phải hiển thị, có evidence và không được dùng để điều chỉnh theo cảm tính.
