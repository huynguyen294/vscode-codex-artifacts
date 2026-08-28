import { createHash } from "node:crypto";
import type { MarkdownBlock } from "./contracts";

function createBlockId(type: MarkdownBlock["type"], index: number, source: string): string {
  const digest = createHash("sha256")
    .update(`${type}\0${index}\0${source}`)
    .digest("hex")
    .slice(0, 12);
  return `block-${index}-${digest}`;
}

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let currentHeading: string | null = null;

  const push = (
    type: MarkdownBlock["type"],
    text: string,
    source: string,
    extra: Pick<MarkdownBlock, "level" | "language"> = {},
  ): void => {
    if (!text && type !== "code") return;
    const index = blocks.length;
    blocks.push({
      id: createBlockId(type, index, source),
      index,
      type,
      text,
      heading: currentHeading,
      ...extra,
    });
  };

  for (let cursor = 0; cursor < lines.length; ) {
    const line = lines[cursor] ?? "";
    if (!line.trim()) {
      cursor += 1;
      continue;
    }

    const fence = line.match(/^\s*```([^`]*)$/);
    if (fence) {
      const source = [line];
      const content: string[] = [];
      cursor += 1;
      while (cursor < lines.length && !/^\s*```\s*$/.test(lines[cursor] ?? "")) {
        source.push(lines[cursor] ?? "");
        content.push(lines[cursor] ?? "");
        cursor += 1;
      }
      if (cursor < lines.length) {
        source.push(lines[cursor] ?? "");
        cursor += 1;
      }
      push("code", content.join("\n"), source.join("\n"), { language: fence[1]?.trim() ?? "" });
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const text = heading[2] ?? "";
      currentHeading = text;
      push("heading", text, line, { level: heading[1]?.length ?? 1 });
      cursor += 1;
      continue;
    }

    const listItem = line.match(/^\s*(?:[-+*]|\d+[.)])\s+(.+)$/);
    if (listItem) {
      push("list-item", listItem[1] ?? "", line);
      cursor += 1;
      continue;
    }

    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      push("quote", quote[1] ?? "", line);
      cursor += 1;
      continue;
    }

    const paragraph = [line.trim()];
    const source = [line];
    cursor += 1;
    while (
      cursor < lines.length &&
      (lines[cursor] ?? "").trim() &&
      !/^\s*```/.test(lines[cursor] ?? "") &&
      !/^#{1,6}\s+/.test(lines[cursor] ?? "") &&
      !/^\s*(?:[-+*]|\d+[.)])\s+/.test(lines[cursor] ?? "") &&
      !/^\s*>/.test(lines[cursor] ?? "")
    ) {
      paragraph.push((lines[cursor] ?? "").trim());
      source.push(lines[cursor] ?? "");
      cursor += 1;
    }
    push("paragraph", paragraph.join(" "), source.join("\n"));
  }

  return blocks;
}
