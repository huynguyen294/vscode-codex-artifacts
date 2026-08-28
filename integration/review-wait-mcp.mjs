import { createHash } from "node:crypto";
import { promises as fs, watch as watchFs } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";

const SERVER_NAME = "codex-artifacts";
const SERVER_VERSION = "1.0.0";
const TOOL_NAME = "wait_for_plan_review";
const SUBMISSION_FILE = "review-submission.json";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function samePath(left, right) {
  const a = path.resolve(left);
  const b = path.resolve(right);
  return process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value;
}

async function loadArtifactContext(rawDirectory) {
  if (typeof rawDirectory !== "string" || !path.isAbsolute(rawDirectory)) {
    throw new Error("artifactDirectory must be an absolute path.");
  }
  const artifactDirectory = path.resolve(rawDirectory);
  const manifestPath = path.join(artifactDirectory, "artifact.json");
  const planPath = path.join(artifactDirectory, "plan.md");
  const commentsPath = path.join(artifactDirectory, "comments.json");
  const [manifestRaw, plan, commentsRaw] = await Promise.all([
    readJson(manifestPath),
    fs.readFile(planPath, "utf8"),
    fs.readFile(commentsPath, "utf8"),
  ]);
  const manifest = requireObject(manifestRaw, "artifact.json");
  const comments = requireObject(JSON.parse(commentsRaw), "comments.json");
  const artifactId = manifest.artifactId;
  const threadId = manifest.origin?.threadId;
  const cwd = manifest.origin?.cwd;
  if (manifest.schemaVersion !== 1 || manifest.kind !== "plan") throw new Error("Unsupported artifact manifest.");
  if (typeof artifactId !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(artifactId)) {
    throw new Error("Invalid artifactId.");
  }
  if (typeof threadId !== "string" || !threadId) throw new Error("The artifact is not linked to a Codex thread.");
  if (typeof cwd !== "string" || !path.isAbsolute(cwd)) throw new Error("The artifact origin cwd is invalid.");
  const expectedDirectory = path.join(path.resolve(cwd), ".codex-artifacts", "plans", artifactId);
  if (!samePath(artifactDirectory, expectedDirectory)) {
    throw new Error("artifactDirectory does not match the artifact origin and id.");
  }
  const planSha256 = sha256(plan);
  if (comments.schemaVersion !== 1 || comments.artifactId !== artifactId || comments.planSha256 !== planSha256) {
    throw new Error("comments.json does not match this plan artifact.");
  }
  if (!Array.isArray(comments.comments)) throw new Error("comments.json has an invalid comments array.");
  return {
    artifactDirectory,
    artifactId,
    threadId,
    planPath,
    commentsPath,
    submissionPath: path.join(artifactDirectory, SUBMISSION_FILE),
    planSha256,
    commentsSha256: sha256(commentsRaw),
    commentCount: comments.comments.length,
  };
}

async function readValidatedSubmission(context) {
  let submission;
  try {
    submission = requireObject(await readJson(context.submissionPath), SUBMISSION_FILE);
  } catch (error) {
    if (error?.code === "ENOENT") return undefined;
    throw error;
  }
  if (submission.schemaVersion !== 1 || submission.artifactId !== context.artifactId) {
    throw new Error(`${SUBMISSION_FILE} does not belong to this artifact.`);
  }
  if (submission.threadId !== context.threadId) throw new Error(`${SUBMISSION_FILE} targets a different thread.`);

  const [currentPlan, currentCommentsRaw] = await Promise.all([
    fs.readFile(context.planPath, "utf8"),
    fs.readFile(context.commentsPath, "utf8"),
  ]);
  const currentPlanSha256 = sha256(currentPlan);
  const currentCommentsSha256 = sha256(currentCommentsRaw);

  if (submission.planSha256 !== currentPlanSha256 || submission.commentsSha256 !== currentCommentsSha256) {
    throw new Error("The plan or comments changed after review submission.");
  }

  const currentComments = requireObject(JSON.parse(currentCommentsRaw), "comments.json");
  if (currentComments.planSha256 !== currentPlanSha256) {
    throw new Error("comments.json does not match this plan artifact.");
  }
  const commentCount = Array.isArray(currentComments.comments) ? currentComments.comments.length : 0;

  if (submission.decision !== "revise" && submission.decision !== "approve" && submission.decision !== "save") {
    throw new Error("Unsupported review decision.");
  }
  if (!Number.isFinite(Date.parse(submission.submittedAt))) throw new Error("Invalid review submission timestamp.");
  if (submission.decision === "revise" && commentCount === 0) {
    throw new Error("A revision request must include at least one comment.");
  }
  // "approve" and "save" have no comment constraints — allowed with or without comments.
  return {
    schemaVersion: 1,
    artifactId: context.artifactId,
    threadId: context.threadId,
    decision: submission.decision,
    submittedAt: submission.submittedAt,
    planPath: context.planPath,
    commentsPath: context.commentsPath,
  };
}

async function waitForSubmission(context, signal) {
  const existing = await readValidatedSubmission(context);
  if (existing) return existing;
  return new Promise((resolve, reject) => {
    let settled = false;
    let checking = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      watcher.close();
      clearInterval(interval);
      signal.removeEventListener("abort", onAbort);
      error ? reject(error) : resolve(value);
    };
    const check = async () => {
      if (settled || checking) return;
      checking = true;
      try {
        const submission = await readValidatedSubmission(context);
        if (submission) finish(undefined, submission);
      } catch (error) {
        finish(error);
      } finally {
        checking = false;
      }
    };
    const onAbort = () => finish(Object.assign(new Error("Plan review wait was cancelled."), { name: "AbortError" }));
    const watcher = watchFs(context.artifactDirectory, { persistent: true }, (_event, filename) => {
      if (filename == null || String(filename) === SUBMISSION_FILE) void check();
    });
    watcher.on("error", (error) => finish(error));
    const interval = setInterval(() => void check(), 1000);
    signal.addEventListener("abort", onAbort, { once: true });
    if (signal.aborted) onAbort();
  });
}

const pending = new Map();

function write(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function respond(id, result) {
  write({ jsonrpc: "2.0", id, result });
}

function respondError(id, code, message) {
  write({ jsonrpc: "2.0", id, error: { code, message } });
}

function requestKey(id) {
  return JSON.stringify(id);
}

async function handleRequest(message) {
  const { id, method, params } = message;
  if (method === "initialize") {
    const protocolVersion = typeof params?.protocolVersion === "string" ? params.protocolVersion : "2025-06-18";
    respond(id, {
      protocolVersion,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
      instructions: "Use wait_for_plan_review after creating and validating a Codex plan artifact. Keep the current turn open until the user requests a revision or approves the plan.",
    });
    return;
  }
  if (method === "ping") {
    respond(id, {});
    return;
  }
  if (method === "tools/list") {
    respond(id, { tools: [{
      name: TOOL_NAME,
      title: "Wait for plan review",
      description: "Wait for the user to review a Codex plan artifact in VS Code, then return either a revision request with comments or approval. Call this immediately after validating the artifact and do not end the current turn first.",
      inputSchema: {
        type: "object",
        properties: {
          artifactDirectory: {
            type: "string",
            description: "Absolute path to .codex-artifacts/plans/<artifact-id>.",
          },
        },
        required: ["artifactDirectory"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    }] });
    return;
  }
  if (method === "tools/call") {
    if (params?.name !== TOOL_NAME) {
      respond(id, { content: [{ type: "text", text: `Unknown tool: ${String(params?.name)}` }], isError: true });
      return;
    }
    const controller = new AbortController();
    pending.set(requestKey(id), controller);
    try {
      const context = await loadArtifactContext(params?.arguments?.artifactDirectory);
      const result = await waitForSubmission(context, controller.signal);
      respond(id, {
        content: [{ type: "text", text: JSON.stringify(result) }],
        structuredContent: result,
      });
    } catch (error) {
      respond(id, {
        content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
        isError: true,
      });
    } finally {
      pending.delete(requestKey(id));
    }
    return;
  }
  respondError(id, -32601, `Method not found: ${String(method)}`);
}

function handleMessage(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "notifications/cancelled") {
    pending.get(requestKey(message.params?.requestId))?.abort();
    return;
  }
  if (message.id === undefined) return;
  void handleRequest(message).catch((error) => {
    respondError(message.id, -32603, error instanceof Error ? error.message : String(error));
  });
}

const lines = createInterface({ input: process.stdin });
for await (const line of lines) {
  if (!line.trim()) continue;
  try {
    handleMessage(JSON.parse(line));
  } catch (error) {
    process.stderr.write(`Invalid MCP message: ${error instanceof Error ? error.message : String(error)}\n`);
  }
}
for (const controller of pending.values()) controller.abort();
