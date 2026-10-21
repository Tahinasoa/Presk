import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import { Simulation } from "@/engine/sim/simulation";
import { PreskCompileError } from "@/lang/diagnostics";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";
import { readRef } from "@/model/refs";
import type { RefSegment } from "@/lang/expr/ast";
import type { Pt } from "@/geom/vec";

const catalog = createDefaultCatalog();
const objectEnv = createTestEnv();
const scene = { width: 800, height: 600 };
const ref = (name: string, index?: number): RefSegment => ({ name, ...(index === undefined ? {} : { index }) });
const trianglePoints: Pt[] = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }];

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

function errorCodes(error: PreskCompileError): string[] {
  return error.diagnostics.map(({ code }) => code);
}

describe("polygon model integration", () => {
  it("requires points when compiling a polygon", () => {
    expect(errorCodes(compileError([
      { action: "create", target: "poly", type: "polygon", properties: {} },
    ]))).toContain("E_FIELD_REQUIRED");
  });

  it("rejects a polygon with fewer than three points", () => {
    expect(errorCodes(compileError([
      { action: "create", target: "poly", type: "polygon", properties: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] } },
    ]))).toContain("E_VALUE_RANGE");
  });

  it("rejects a triangle with more than three points", () => {
    expect(errorCodes(compileError([
      {
        action: "create",
        target: "tri",
        type: "triangle",
        properties: {
          points: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }],
        },
      },
    ]))).toContain("E_VALUE_RANGE");
  });

  it("sets an indexed vertex from another object's center", () => {
    const program = compileProgram(document([
      { action: "create", target: "a", type: "rectangle", properties: { x: 100, y: 200, width: 20, height: 20 } },
      { action: "create", target: "poly", type: "polygon", properties: { points: trianglePoints } },
      { action: "set", target: "poly", properties: { "vertex[1]": "a.center" } },
    ]), { catalog, objectEnv });
    const simulation = new Simulation(program, { catalog, objectEnv, fps: 60 });
    simulation.seek(0);

    expect(readRef(simulation.world.require("poly"), [ref("vertex", 1)])).toEqual({ x: 110, y: 210 });
  });

  it("binds an indexed vertex to another object's center", () => {
    const program = compileProgram(document([
      { action: "create", target: "a", type: "rectangle", properties: { x: 100, y: 200, width: 20, height: 20 } },
      { action: "create", target: "poly", type: "polygon", properties: { points: trianglePoints } },
      { action: "bind", target: "poly", properties: { "vertex[1]": "a.center" } },
    ]), { catalog, objectEnv });
    const simulation = new Simulation(program, { catalog, objectEnv, fps: 60 });
    simulation.seek(0);

    expect(readRef(simulation.world.require("poly"), [ref("vertex", 1)])).toEqual({ x: 110, y: 210 });
  });
});
