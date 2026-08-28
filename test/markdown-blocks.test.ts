import { describe, expect, it } from "vitest";
import { parseMarkdownBlocks } from "../src/shared/markdown-blocks";

describe("parseMarkdownBlocks", () => {
  it("creates selectable blocks for supported Markdown", () => {
    const blocks = parseMarkdownBlocks(`# Plan

First line
continues here.

- One item

> A note

\`\`\`ts
const value = 1;
\`\`\``);
    expect(blocks.map(({ type, text }) => ({ type, text }))).toEqual([
      { type: "heading", text: "Plan" },
      { type: "paragraph", text: "First line continues here." },
      { type: "list-item", text: "One item" },
      { type: "quote", text: "A note" },
      { type: "code", text: "const value = 1;" },
    ]);
    expect(new Set(blocks.map((block) => block.id)).size).toBe(blocks.length);
  });
});
