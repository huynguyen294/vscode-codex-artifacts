# Highlight Inventory

Đọc file này khi tạo hoặc materially cập nhật `HIGHLIGHTS.md` của một project.

## Authority và coverage

Đặt block sau ở đầu artifact:

```markdown
> **Trạng thái:** Derived reference artifact — dùng để khám phá, đối chiếu và tổng hợp; không phải source of truth, không phải CV-ready wording và không thay thế `ASSESSMENT.md`.
> **Snapshot/date:**
> **Repositories inspected:**
> **Audit coverage:**
> **Known blind spots:**
```

“Toàn bộ highlights” chỉ nghĩa là toàn bộ credible candidates tìm được trong snapshot và coverage đã ghi. Không claim exhaustiveness cho source/Git chưa audit.

## Discovery surfaces

Broad-scan tối thiểu:

- problem/domain constraints và complex workflows;
- architecture, state/data flow và integration boundaries;
- custom mechanisms hoặc adaptation vượt library default;
- reusable abstractions, APIs và cross-module reuse;
- browser/platform APIs, offline, export, visualization hoặc automation;
- correctness, testing, security, reliability và measured performance;
- tooling, packaging, documentation, DX và distribution;
- Git evolution, refactor, migration, compatibility và maintenance;
- deployment, real use, operational utility và outcomes;
- cross-project consumption hoặc feedback loop có artifact.

Không dùng dependency count, feature count, line count hoặc novelty làm highlight nếu thiếu problem, decision, ownership hoặc hiring signal.

## Categories

| Category | Ý nghĩa |
| --- | --- |
| `primary differentiator` | Signal hiếm trong peer cohort, evidence mạnh và defend được. |
| `strong supporting strength` | Vượt baseline hoặc củng cố narrative chính nhưng chưa đủ khác biệt độc lập. |
| `specialized/role-specific` | Mạnh cho một role/domain cụ thể, không mặc định quan trọng với mọi target. |
| `breadth/additional technology` | Chứng minh usable breadth, không nâng thành core expertise. |
| `pending owner verification` | Có implementation signal nhưng ownership/intent/outcome có thể đổi kết luận. |
| `downgraded/rejected` | Candidate đã xem nhưng là baseline, library default, unsupported hoặc dễ overclaim. |

## Entry contract

Entry nhỏ có thể dùng một hàng bảng. Candidate quan trọng dùng template:

```markdown
### H-01 — Tên highlight

- Category:
- Evidence state:
- Capability tags:
- Problem/constraint:
- Implementation:
- Ownership:
- Decision/trade-off:
- Capability demonstrated:
- Peer comparison:
- Hiring signal:
- Relevant roles:
- Confidence:
- Source pointers:
- Owner clarification:
- Selected for ASSESSMENT: yes/no
- Combination hooks:
```

Chỉ điền field ảnh hưởng classification hoặc downstream reasoning; không tạo boilerplate rỗng.

## Combination hooks

Ghi hook ngắn để task tổng hợp sau có thể ghép signal, ví dụ `library design + consumer usage`, `data-heavy UI + document export` hoặc `tooling + operational workflow`. Gắn capability tags ổn định như `data-heavy-ui`, `form-architecture`, `browser-tooling`, `document-export`, `offline-data`, `developer-experience`, `domain-modeling` và `automation`.

Không tự kết luận năng lực xuyên project trong artifact này. Cross-project synthesis phải đọc evidence của từng project và loại duplicate signal trước khi hợp nhất.

## Selection rule

- Lưu mọi credible candidate tìm được trong scope, kể cả candidate chưa được chọn.
- Deep-validate primary differentiators và candidate ảnh hưởng scoring/CV handoff.
- Chuyển ambiguity quan trọng sang Owner Calibration Gate.
- Ghi lý do hạ hoặc loại candidate để tránh overclaim lặp lại.
- Chỉ đưa subset mạnh, relevant và có evidence phù hợp vào `ASSESSMENT.md`.
