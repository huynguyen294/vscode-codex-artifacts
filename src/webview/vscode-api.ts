import type { WebviewToExtensionMessage } from "../shared/contracts";

declare function acquireVsCodeApi<TState = unknown>(): {
  postMessage(message: WebviewToExtensionMessage): void;
  getState(): TState | undefined;
  setState(state: TState): void;
};

export const vscode = acquireVsCodeApi();
