import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

async function stdinJson() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  return JSON.parse(input);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function atomicJson(filePath, value) {
  const temporary = `${filePath}.codex-artifacts-${process.pid}-${Date.now()}.tmp`;
  await fs.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await fs.rename(temporary, filePath);
        return;
      } catch (error) {
        if (attempt < 2 && (error?.code === "EPERM" || error?.code === "EBUSY" || error?.code === "EACCES")) {
          await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
          continue;
        }
        if (error?.code === "EPERM" || error?.code === "EACCES" || error?.code === "EBUSY" || error?.code === "EXDEV") {
          await fs.copyFile(temporary, filePath);
          return;
        }
        throw error;
      }
    }
  } finally {
    await fs.unlink(temporary).catch(() => {});
  }
}

async function createJson(filePath, value) {
  try {
    await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
  }
}

function artifactToolInput(input) {
  const serialized = JSON.stringify(input.tool_input ?? input.toolInput ?? {});
  return serialized.includes(".codex-artifacts") && serialized.includes("artifact.json")
    ? serialized
    : null;
}

async function main() {
  const input = await stdinJson();
  const toolInput = artifactToolInput(input);
  if (!input.session_id || !input.cwd || !toolInput) return;

  const plansRoot = path.resolve(input.cwd, ".codex-artifacts", "plans");
  let entries;
  try {
    entries = await fs.readdir(plansRoot, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!toolInput.includes(entry.name)) continue;
    const artifactDirectory = path.join(plansRoot, entry.name);
    const manifestPath = path.join(artifactDirectory, "artifact.json");
    const planPath = path.join(artifactDirectory, "plan.md");
    let manifest;
    try {
      manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    } catch {
      continue;
    }
    if (manifest?.origin?.threadId || manifest?.schemaVersion !== 1 || manifest?.kind !== "plan") continue;
    if (manifest.artifactId !== entry.name || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(entry.name)) continue;
    if (typeof manifest.title !== "string" || !manifest.title.trim()) continue;
    if (!Number.isFinite(Date.parse(manifest.createdAt))) continue;
    if (!['create', 'replace'].includes(manifest.operation)) continue;
    if (manifest.operation === "replace" && !manifest.replacesArtifactId) continue;

    const plan = await fs.readFile(planPath, "utf8");
    manifest.origin = {
      ...(manifest.origin ?? {}),
      threadId: input.session_id,
      turnId: input.turn_id,
      cwd: input.cwd,
    };
    await atomicJson(manifestPath, manifest);

    const commentsPath = path.join(artifactDirectory, "comments.json");
    await createJson(commentsPath, {
      schemaVersion: 1,
      artifactId: manifest.artifactId,
      planSha256: sha256(plan),
      comments: [],
    });

    if (manifest.operation === "replace" && manifest.replacesArtifactId) {
      const oldId = manifest.replacesArtifactId;
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(oldId) || oldId === manifest.artifactId) continue;
      const oldDirectory = path.resolve(plansRoot, oldId);
      if (path.dirname(oldDirectory) !== plansRoot) continue;
      const trashRoot = path.resolve(input.cwd, ".codex-artifacts", ".trash");
      await fs.mkdir(trashRoot, { recursive: true });
      try {
        await fs.rename(oldDirectory, path.join(trashRoot, `${oldId}-${Date.now()}`));
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
    }
  }
}

await main();
