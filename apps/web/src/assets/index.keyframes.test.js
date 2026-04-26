import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const cssContent = readFileSync(resolve(process.cwd(), "src/assets/index.css"), "utf8");

function extractKeyframeBlock(name) {
  const regex = new RegExp(`@keyframes\\s+${name}\\s*\\{([\\s\\S]*?)\\}`);
  return cssContent.match(regex)?.[1] ?? "";
}

describe("Animaciones de modal", () => {
  it("atlas-content-in no usa transform para evitar saltos de posicion", () => {
    const block = extractKeyframeBlock("atlas-content-in");

    expect(block).toContain("scale:");
    expect(block).not.toMatch(/transform\s*:/);
  });

  it("atlas-content-out no usa transform para evitar saltos de posicion", () => {
    const block = extractKeyframeBlock("atlas-content-out");

    expect(block).toContain("scale:");
    expect(block).not.toMatch(/transform\s*:/);
  });
});
