import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import { PreskCompileError } from "@/lang/diagnostics";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";
import type { Pt } from "@/geom/vec";

const catalog = createDefaultCatalog();
const objectEnv = createTestEnv();
const scene = { width: 800, height: 600 };
const pts = (count: number): Pt[] => Array.from({ length: count }, (_, index) => ({ x: index * 10, y: index % 2 ? 10 : 0 }));

function document(steps: unknown[]) {
  return { version: "1.0", scene, steps };
}

function compile(steps: unknown[]) {
  return compileProgram(document(steps), { catalog, objectEnv });
}

function compileError(steps: unknown[]): PreskCompileError {
  try {
    compile(steps);
  } catch (error) {
    if (error instanceof PreskCompileError) return error;
    throw error;
  }
  throw new Error("Expected compilation to fail");
}

const create = (properties: Record<string, unknown>) => (
  { action: "create", target: "c", type: "curve", properties }
);

describe("curve model integration", () => {
  it("compiles an open bezier curve with 4 points and rejects 5", () => {
    expect(() => compile([create({ points: pts(4), interpolation: "bezier" })])).not.toThrow();
    const error = compileError([create({ points: pts(5), interpolation: "bezier" })]);
    expect(error.diagnostics.map(({ code }) => code)).toContain("E_VALUE_RANGE");
  });

  it("compiles a closed bezier curve with 6 points and rejects 5", () => {
    expect(() => compile([create({ points: pts(6), interpolation: "bezier", closed: true })])).not.toThrow();
    const error = compileError([create({ points: pts(5), interpolation: "bezier", closed: true })]);
    expect(error.diagnostics.map(({ code }) => code)).toContain("E_VALUE_RANGE");
  });

  it("rejects fewer than two points", () => {
    const error = compileError([create({ points: [{ x: 0, y: 0 }] })]);
    expect(error.diagnostics.map(({ code }) => code)).toContain("E_VALUE_RANGE");
  });

  it("rejects a travel range past an open curve", () => {
    const error = compileError([
      create({ points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }], closed: false }),
      { action: "create", target: "dot", type: "circle", properties: { radius: 5 } },
      { action: "travel", target: "dot", along: "c", from: 0, to: 1.5, duration: 1 },
    ]);

    expect(error.diagnostics.map(({ code }) => code)).toContain("E_TRAVEL_RANGE");
  });
});
