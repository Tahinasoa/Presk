import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import { buildWorld } from "@/engine/sim/buildWorld";
import { PreskCompileError, PreskRuntimeError } from "@/lang/diagnostics";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";
import type { Pt } from "@/geom/vec";

const catalog = createDefaultCatalog();
const objectEnv = createTestEnv();
const scene = { width: 800, height: 600 };
const points: Pt[] = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }];

function document(steps: unknown[]) {
  return { version: "1.0", scene, steps };
}

function compileError(steps: unknown[]): PreskCompileError {
  try {
    compileProgram(document(steps), { catalog, objectEnv });
  } catch (error) {
    if (error instanceof PreskCompileError) return error;
    throw error;
  }
  throw new Error("Expected compilation to fail");
}

describe("polyline model integration", () => {
  it("rejects a polyline with fewer than two points", () => {
    const error = compileError([
      { action: "create", target: "p", type: "polyline", properties: { points: [{ x: 0, y: 0 }] } },
    ]);

    expect(error.diagnostics.map(({ code }) => code)).toContain("E_VALUE_RANGE");
  });

  it("analyzes pathX on a state-closed path and throws at runtime for an open out-of-range t", () => {
    const program = compileProgram(document([
      { action: "create", target: "p", type: "polyline", properties: { points, closed: false } },
      { action: "create", target: "dot", type: "rectangle", properties: { x: "p.pathX(main, 1.5)" } },
    ]), { catalog, objectEnv });

    expect(() => buildWorld(program, { catalog, objectEnv })).toThrow(PreskRuntimeError);
  });
});
