import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import { buildWorld } from "@/engine/sim/buildWorld";
import { PreskCompileError } from "@/lang/diagnostics";
import type { RefSegment } from "@/lang/expr/ast";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";
import { readRef } from "@/model/refs";

const catalog = createDefaultCatalog();
const objectEnv = createTestEnv();
const scene = { width: 800, height: 600 };
const ref = (name: string): RefSegment => ({ name });

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

describe("point and ray-line model integration", () => {
  it("builds a ray from origin and through properties", () => {
    const program = compileProgram(document([
      {
        action: "create",
        target: "ray1",
        type: "ray",
        properties: { origin: { x: 10, y: 20 }, through: { x: 110, y: 20 } },
      },
    ]), { catalog, objectEnv });
    const ray = buildWorld(program, { catalog, objectEnv }).require("ray1");

    expect(readRef(ray, [ref("origin")])).toEqual({ x: 10, y: 20 });
    expect(readRef(ray, [ref("through")])).toEqual({ x: 110, y: 20 });
    expect(readRef(ray, [ref("pos")])).toEqual({ x: 10, y: 20 });
  });

  it("rejects travel along a ray as an infinite path", () => {
    const error = compileError([
      { action: "create", target: "ray1", type: "ray", properties: { origin: { x: 0, y: 0 }, through: { x: 1, y: 0 } } },
      { action: "create", target: "dot", type: "circle" },
      { action: "travel", target: "dot", along: "ray1", duration: 1 },
    ]);

    expect(error.diagnostics.map(({ code }) => code)).toContain("E_TRAVEL_INFINITE_PATH");
  });
});
