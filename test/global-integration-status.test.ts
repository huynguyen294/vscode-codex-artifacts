import { describe, expect, it } from "vitest";
import { classifyGlobalIntegration } from "../src/extension/global-integration-status";

const command = "node C:/Users/me/.codex/codex-artifacts/codex-artifacts-stamp-origin.mjs";

describe("classifyGlobalIntegration", () => {
  it("requires a user-scoped hook instead of accepting a trusted project hook", () => {
    expect(classifyGlobalIntegration([{
      command,
      enabled: true,
      source: "project",
      trustStatus: "trusted",
    }])).toEqual({ status: "missing" });
  });

  it.each([
    [false, "trusted", "disabled"],
    [true, "untrusted", "untrusted"],
    [true, "trusted", "trusted"],
    [true, "pending", "unknown"],
  ] as const)("maps enabled=%s and trust=%s to %s", (enabled, trustStatus, status) => {
    expect(classifyGlobalIntegration([{
      command,
      enabled,
      source: "user",
      trustStatus,
    }]).status).toBe(status);
  });
});
