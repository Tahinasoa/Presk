import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { checkFile } from "./rules";

const SRC = fileURLToPath(new URL("..", import.meta.url));

function listTs(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listTs(full));
    else if (name.endsWith(".ts")) out.push(full);
  }
  return out;
}

describe("architecture layers (ADR-003)", () => {
  it("no new-layer file violates the dependency rules", () => {
    const problems: string[] = [];
    for (const file of listTs(SRC)) {
      const rel = relative(SRC, file).split("\\").join("/");
      problems.push(...checkFile(rel, readFileSync(file, "utf8")));
    }
    expect(problems).toEqual([]);
  });
});
