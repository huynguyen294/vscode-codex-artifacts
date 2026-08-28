import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import * as vscode from "vscode";
import type { CodexAppServerClient } from "./app-server-client";
import {
  classifyGlobalIntegration,
  type IntegrationCheck,
} from "./global-integration-status";
import {
  CODEX_ARTIFACTS_HOOK_MARKER,
  LEGACY_AGENT_PLUS_HOOK_MARKER,
  removeCodexArtifactsHooks,
  upsertCodexArtifactsHook,
  type HooksFile,
} from "./hook-config";
import { upsertCodexArtifactsMcp } from "./mcp-config";

function codexHome(): string {
  const configured = process.env.CODEX_HOME?.trim();
  return configured ? path.resolve(configured) : path.join(os.homedir(), ".codex");
}

function commandFor(scriptPath: string): string {
  return process.platform === "win32"
    ? `node "${scriptPath.replaceAll('"', '\\"')}"`
    : `node '${scriptPath.replaceAll("'", "'\\''")}'`;
}

async function readHooksFile(hooksPath: string): Promise<HooksFile> {
  try {
    return JSON.parse(await fs.readFile(hooksPath, "utf8")) as HooksFile;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return {};
    throw error;
  }
}

async function writeHooksFile(hooksPath: string, config: HooksFile): Promise<void> {
  await writeTextFile(hooksPath, `${JSON.stringify(config, null, 2)}\n`);
}

async function writeTextFile(filePath: string, contents: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.codex-artifacts-${process.pid}-${Date.now()}.tmp`;
  await fs.writeFile(temporaryPath, contents, "utf8");
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await fs.rename(temporaryPath, filePath);
        return;
      } catch (error: any) {
        if (attempt < 2 && (error?.code === "EPERM" || error?.code === "EBUSY" || error?.code === "EACCES")) {
          await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
          continue;
        }
        if (error?.code === "EPERM" || error?.code === "EACCES" || error?.code === "EBUSY" || error?.code === "EXDEV") {
          await fs.copyFile(temporaryPath, filePath);
          return;
        }
        throw error;
      }
    }
  } finally {
    await fs.unlink(temporaryPath).catch(() => {});
  }
}

async function migrateCurrentWorkspace(
  workspaceRoot: string,
  globalHooksPath: string,
  globalSkillPath: string,
): Promise<void> {
  const legacyHooksPath = path.join(workspaceRoot, ".codex", "hooks.json");
  if (path.resolve(legacyHooksPath) === path.resolve(globalHooksPath)) return;
  const config = await readHooksFile(legacyHooksPath);
  const migration = removeCodexArtifactsHooks(config);
  if (!migration.changed) return;
  await writeHooksFile(legacyHooksPath, migration.config);

  const legacySkillPath = path.join(workspaceRoot, ".agents", "skills", "create-plan-artifact");
  const removals: Promise<void>[] = [
    fs.rm(path.join(workspaceRoot, ".codex", "hooks", LEGACY_AGENT_PLUS_HOOK_MARKER), { force: true }),
    fs.rm(path.join(workspaceRoot, ".codex", "hooks", CODEX_ARTIFACTS_HOOK_MARKER), { force: true }),
  ];
  if (path.resolve(legacySkillPath) !== path.resolve(globalSkillPath)) {
    removals.push(fs.rm(legacySkillPath, { recursive: true, force: true }));
  }
  await Promise.all(removals);
}

export async function checkGlobalIntegration(
  appServer: CodexAppServerClient,
  cwd: string,
): Promise<IntegrationCheck> {
  return classifyGlobalIntegration(await appServer.listHooks(cwd));
}

export async function installGlobalIntegration(
  context: vscode.ExtensionContext,
  appServer: CodexAppServerClient,
): Promise<IntegrationCheck> {
  const home = os.homedir();
  const globalCodexDirectory = codexHome();
  const targetDirectory = path.join(globalCodexDirectory, "codex-artifacts");
  const targetScript = path.join(targetDirectory, CODEX_ARTIFACTS_HOOK_MARKER);
  const targetMcpScript = path.join(targetDirectory, "codex-artifacts-review-mcp.mjs");
  const targetSkill = path.join(home, ".agents", "skills", "create-plan-artifact");
  const hooksPath = path.join(globalCodexDirectory, "hooks.json");
  const configPath = path.join(globalCodexDirectory, "config.toml");
  const sourceScript = vscode.Uri.joinPath(context.extensionUri, "integration", "stamp-origin.mjs").fsPath;
  const sourceMcpScript = vscode.Uri.joinPath(context.extensionUri, "integration", "review-wait-mcp.mjs").fsPath;
  const sourceSkill = vscode.Uri.joinPath(context.extensionUri, "skills", "create-plan-artifact").fsPath;

  await fs.mkdir(targetDirectory, { recursive: true });
  await fs.copyFile(sourceScript, targetScript);
  await fs.copyFile(sourceMcpScript, targetMcpScript);
  await fs.mkdir(path.dirname(targetSkill), { recursive: true });
  await fs.cp(sourceSkill, targetSkill, { recursive: true, force: true });

  const existingConfig = await readHooksFile(hooksPath);
  existingConfig.description ??= "User lifecycle hooks, including Codex Artifacts.";
  const config = upsertCodexArtifactsHook(existingConfig, commandFor(targetScript));
  await writeHooksFile(hooksPath, config);
  let codexConfig = "";
  try {
    codexConfig = await fs.readFile(configPath, "utf8");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  }
  await writeTextFile(configPath, upsertCodexArtifactsMcp(codexConfig, targetMcpScript));

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspaceRoot) await migrateCurrentWorkspace(workspaceRoot, hooksPath, targetSkill);
  return checkGlobalIntegration(appServer, workspaceRoot ?? home);
}
