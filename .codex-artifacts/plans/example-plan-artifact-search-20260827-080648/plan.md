# Example: Plan artifact search and filtering

## Goal

Add lightweight search and filtering to the Agent Plus plan-artifact list so users can quickly find a plan by title, artifact ID, or lifecycle state without changing the existing review workflow.

## Scope

The first version will add a text search field and a lifecycle filter to the existing plan list. Search will match plan titles and artifact IDs case-insensitively, while the lifecycle filter will distinguish active and retired artifacts.

This work will preserve the current artifact directory format, immutable revision behavior, comment files, and workspace hook. It will not add full-text search inside `plan.md`, remote indexing, saved searches, or cross-workspace discovery.

## Decisions

- Filtering will run locally against artifact metadata already loaded by the extension. This avoids a new persistence layer and keeps results responsive for normal workspace sizes.
- Text search and lifecycle filtering will combine with AND semantics. A result must satisfy both controls when both are set.
- An empty search and the default lifecycle option will retain the current unfiltered list.
- The UI will show a compact empty state when no plans match, with a single action to clear all filters.
- Search input will be debounced briefly to avoid unnecessary list recomputation while typing.

## Implementation approach

### Artifact-list model

Extend the list query state with a normalized search string and lifecycle selection. Add a pure filtering function that accepts the current artifact summaries and returns the visible results without mutating or reordering the source collection.

Keep lifecycle classification in the existing artifact-loading layer so the UI does not infer state from directory names or missing files.

### User interface

Add the search field and lifecycle selector above the artifact list. Preserve keyboard navigation through the list and give both controls accessible labels.

Display the number of matching plans when a filter is active. When there are no matches, explain that the workspace still contains plans and offer a clear-filters action instead of showing the generic no-artifacts state.

### State behavior

Keep filter state for the lifetime of the current Agent Plus view. Do not persist it across editor restarts in the first version.

When artifacts are created, replaced, or retired, apply the active filters again to the refreshed collection. If the selected artifact disappears from the filtered results, clear the selection and keep the filters unchanged.

### Tests

Add unit coverage for case-insensitive title matching, artifact-ID matching, combined filters, empty queries, and retired-state handling.

Add UI-level coverage for clearing filters, the filtered empty state, keyboard focus, and list refresh after a new plan revision is created.

## Risks and mitigations

- Large workspaces could make filtering noticeable if every keystroke causes repeated rendering. Use normalized metadata, a short debounce, and one filtering pass per state update.
- Lifecycle state could become inconsistent if the UI derives it separately. Keep a single classification source in the artifact loader.
- New controls could reduce usable list space. Use a compact horizontal layout where space allows and a stacked layout for narrow panels.
- Filtered results could make users think artifacts were deleted. Show the active result count and a clear-filters action whenever filtering hides all plans.

## Verification

- Run the artifact-list unit and UI test suites.
- Confirm search finds plans by partial title and partial artifact ID regardless of case.
- Confirm active and retired filters return the correct revisions after a replacement lifecycle.
- Confirm creating or replacing a plan refreshes the visible list while preserving current filters.
- Confirm the controls and results are usable with keyboard-only navigation and expose meaningful accessibility labels.
- Confirm an unfiltered view behaves identically to the current artifact list.

## Rollout

Ship the feature with the existing Agent Plus extension release process. After release, monitor user feedback for workspaces with unusually large artifact collections before considering full-text search or persisted filter preferences.
