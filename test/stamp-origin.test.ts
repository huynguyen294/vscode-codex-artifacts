import { spawn } from "node:child_process";
import { access, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const temporaryDirectories: string[] = [];

function runHook(hookPath: string, input: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [hookPath], { stdio: ["pipe", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(stderr || `Hook exited ${code}`)));
    child.stdin.end(JSON.stringify(input));
  });
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("stamp-origin hook", () => {
  it("links the origin, creates comments, and retires a replaced artifact", async () => {
    const workspace = await mkdtemp(path.join(tmpdir(), "agent-plus-hook-"));
    temporaryDirectories.push(workspace);
    const plans = path.join(workspace, ".codex-artifacts", "plans");
    const oldDirectory = path.join(plans, "plan-old");
    const nextDirectory = path.join(plans, "plan-next");
    const unrelatedDirectory = path.join(plans, "plan-unrelated");
    await mkdir(oldDirectory, { recursive: true });
    await mkdir(nextDirectory, { recursive: true });
    await mkdir(unrelatedDirectory, { recursive: true });
    await writeFile(path.join(oldDirectory, "plan.md"), "# Old\n", "utf8");
    await writeFile(path.join(oldDirectory, "artifact.json"), "{}", "utf8");
    await writeFile(path.join(nextDirectory, "plan.md"), "# Next\n", "utf8");
    await writeFile(path.join(nextDirectory, "artifact.json"), JSON.stringify({
      schemaVersion: 1,
      kind: "plan",
      artifactId: "plan-next",
      title: "Next",
      createdAt: new Date().toISOString(),
      operation: "replace",
      replacesArtifactId: "plan-old",
      origin: { cwd: workspace },
    }), "utf8");
    await writeFile(path.join(unrelatedDirectory, "plan.md"), "# Unrelated\n", "utf8");
    await writeFile(path.join(unrelatedDirectory, "artifact.json"), JSON.stringify({
      schemaVersion: 1,
      kind: "plan",
      artifactId: "plan-unrelated",
      title: "Unrelated",
      createdAt: new Date().toISOString(),
      operation: "create",
      origin: { cwd: workspace },
    }), "utf8");

    const hookPath = path.resolve(import.meta.dirname, "../integration/stamp-origin.mjs");
    await runHook(hookPath, {
        session_id: "thread-origin",
        turn_id: "turn-origin",
        cwd: workspace,
        tool_input: {
          source: "const result = await tools.apply_patch('*** Add File: .codex-artifacts/plans/plan-next/artifact.json')",
        },
    });

    const manifest = JSON.parse(await readFile(path.join(nextDirectory, "artifact.json"), "utf8"));
    const comments = JSON.parse(await readFile(path.join(nextDirectory, "comments.json"), "utf8"));
    const trash = await readdir(path.join(workspace, ".codex-artifacts", ".trash"));
    expect(manifest.origin).toMatchObject({ threadId: "thread-origin", turnId: "turn-origin", cwd: workspace });
    expect(comments).toMatchObject({ schemaVersion: 1, artifactId: "plan-next", comments: [] });
    expect(trash[0]).toMatch(/^plan-old-/);
    const nextFiles = await readdir(nextDirectory);
    expect(nextFiles.some((f) => f.includes(".tmp"))).toBe(false);
    await expect(access(path.join(unrelatedDirectory, "comments.json"))).rejects.toThrow();
    const unrelatedManifest = JSON.parse(await readFile(path.join(unrelatedDirectory, "artifact.json"), "utf8"));
    expect(unrelatedManifest.origin.threadId).toBeUndefined();
  });
});
