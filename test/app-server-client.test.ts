import { describe, expect, it } from "vitest";
import {
  AppServerRequestError,
  createAppServerLaunch,
  parseHookListResult,
} from "../src/extension/app-server-client";

describe("AppServerRequestError", () => {
  it.each(["thread has an active writer", "a turn is already running", "thread is busy"])(
    "marks busy errors as retryable: %s",
    (message) => expect(new AppServerRequestError(message).retryable).toBe(true),
  );

  it("does not retry unrelated protocol errors", () => {
    expect(new AppServerRequestError("thread not found").retryable).toBe(false);
  });
});

describe("parseHookListResult", () => {
  it("extracts trust state from hooks/list", () => {
    expect(parseHookListResult({ data: [{ cwd: "C:/repo", hooks: [{
      command: "node C:/Users/me/.codex/codex-artifacts/codex-artifacts-stamp-origin.mjs",
      enabled: true,
      source: "user",
      trustStatus: "untrusted",
    }] }] })).toEqual([{
      command: "node C:/Users/me/.codex/codex-artifacts/codex-artifacts-stamp-origin.mjs",
      enabled: true,
      source: "user",
      trustStatus: "untrusted",
    }]);
  });

  it("ignores malformed hook entries", () => {
    expect(parseHookListResult({ data: [{ hooks: [null, { command: "missing enabled" }] }] })).toEqual([]);
  });
});

describe("createAppServerLaunch", () => {
  it("launches a Windows codex.exe directly", () => {
    const executable = "C:\\Codex\\codex.exe";
    expect(createAppServerLaunch("codex", "win32", {
      PATH: "C:\\Codex",
      PATHEXT: ".EXE;.CMD",
    }, (candidate) => candidate.toLowerCase() === executable.toLowerCase())).toEqual({
      executable,
      args: ["app-server"],
    });
  });

  it("launches a Windows codex.cmd through cmd.exe", () => {
    const command = "C:\\npm\\codex.cmd";
    expect(createAppServerLaunch("codex", "win32", {
      PATH: "C:\\npm",
      PATHEXT: ".EXE;.CMD",
      ComSpec: "C:\\Windows\\System32\\cmd.exe",
    }, (candidate) => candidate.toLowerCase() === command.toLowerCase())).toEqual({
      executable: "C:\\Windows\\System32\\cmd.exe",
      args: ["/d", "/s", "/c", "call", command, "app-server"],
    });
  });

  it("keeps non-Windows launches shell-free", () => {
    expect(createAppServerLaunch("codex", "linux", {})).toEqual({
      executable: "codex",
      args: ["app-server"],
    });
  });
});
