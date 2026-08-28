---
name: create-plan-artifact
description: Create or revise a reviewable Markdown plan for Codex Artifacts and wait for the user's decision in the same Codex turn. Use when the user asks Codex to make, show, or update a plan artifact, or when a reviewed plan needs a new revision. Do not use for implementation-only requests or casual inline outlines.
---

# Create Plan Artifact

Create a new immutable plan revision that Codex Artifacts can render and annotate. Read [references/artifact-contract.md](references/artifact-contract.md) before writing files.

## Workflow

1. Verify both integrations before creating files:
   - The user hook file (`$CODEX_HOME/hooks.json` when configured, otherwise `~/.codex/hooks.json`) references `codex-artifacts-stamp-origin.mjs`.
   - The `codex_artifacts` MCP server exposes `wait_for_plan_review` in the current chat.
   If either is unavailable, stop and ask the user to run **Codex Artifacts: Install Global Codex Integration**, restart the Codex extension, and start a new chat.
2. Choose the lifecycle operation:
   - Use `create` for an independent plan requested for the first time.
   - Use `replace` when revising an existing artifact or responding to saved review comments.
3. For `replace`, read both the referenced `plan.md` and `comments.json`. Address every comment in the new plan. Do not edit the old plan in place.
4. Generate a unique, filesystem-safe artifact ID. Create these two files in one `apply_patch` call:
   - `.codex-artifacts/plans/<artifact-id>/artifact.json`
   - `.codex-artifacts/plans/<artifact-id>/plan.md`
5. Do not create `comments.json`. The Codex Artifacts hook stamps the originating thread and creates the correctly hashed comments document after the write.
6. Reload `artifact.json` and verify `origin.threadId` is present. Verify `comments.json` exists. If either is missing, report that the global hook may be untrusted or was not loaded. Ask the user to run `/hooks`, trust Codex Artifacts, start a new chat, and create the artifact again. Never invent a thread ID.
7. Immediately call `wait_for_plan_review` with the absolute artifact directory. Do not return a final response or end the turn before calling it; the VS Code extension opens the Plan Review automatically.
8. Handle the tool result:
   - `decision: "revise"`: read the returned `planPath` and `commentsPath`, address every comment in a new `replace` artifact, validate it as above, and call `wait_for_plan_review` again for the new artifact. Stay in the same Codex turn throughout the review loop.
   - `decision: "approve"`: read `commentsPath` (if comments were left with Proceed, take them into account) and proceed to execute the plan in the current chat.
   - `decision: "save"`: ask the user where they want to store the plan file in the workspace, save the plan content there, and complete the turn without executing code.
9. If the wait is cancelled or expires, keep the artifact files intact and explain that the user can reopen the plan, but a fresh plan review lifecycle is required to reconnect it to a live Codex turn.

## Revision rules

- Treat every generated revision as a new review lifecycle.
- Set `operation` to `replace` and `replacesArtifactId` to the old artifact ID for updates.
- Let the global hook retire the replaced artifact after validating the new one. Never delete or move the old directory yourself.
- Keep unrelated independent plans.
- Never carry old comment IDs, resolution state, progress state, or checklist state into a new revision.
- Treat `review-submission.json` as immutable extension-owned input. Never create, edit, delete, or copy it yourself.
