import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import { Simulation } from "@/engine/sim/simulation";
import { buildWorld } from "@/engine/sim/buildWorld";
import type { RefSegment } from "@/lang/expr/ast";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";
import { readRef } from "@/model/refs";

const catalog = createDefaultCatalog();
const objectEnv = createTestEnv();
const scene = { width: 800, height: 600 };
const ref = (name: string): RefSegment => ({ name });

function createWorld(steps: unknown[]) {
  const program = compileProgram({ version: "1.0", scene, steps }, { catalog, objectEnv });
  return buildWorld(program, { catalog, objectEnv });
}

describe("segment model integration", () => {
  it("builds a normalized segment from start and end properties", () => {
    const segment = createWorld([
      {
        action: "create",
        target: "seg",
        type: "segment",
        properties: { start: { x: 10, y: 20 }, end: { x: 110, y: 20 } },
      },
    ]).require("seg");

    expect(segment.readProp("x")).toBe(10);
    expect(segment.readProp("y")).toBe(20);
    expect(segment.readProp("pos")).toEqual({ x: 10, y: 20 });
    expect(readRef(segment, [ref("start")])).toEqual({ x: 10, y: 20 });
    expect(readRef(segment, [ref("end")])).toEqual({ x: 110, y: 20 });
    expect(readRef(segment, [ref("boundingBox"), ref("width")])).toBe(100);
    expect(readRef(segment, [ref("boundingBox"), ref("height")])).toBe(0);
  });

  it("rotates a segment around its center after geometry normalization", () => {
    const segment = createWorld([
      {
        action: "create",
        target: "seg",
        type: "segment",
        properties: { start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, rotation: 90 },
      },
    ]).require("seg");

    const start = segment.readProp("start") as { x: number; y: number };
    const end = segment.readProp("end") as { x: number; y: number };
    expect(start.x).toBeCloseTo(50, 6);
    expect(start.y).toBeCloseTo(-50, 6);
    expect(end.x).toBeCloseTo(50, 6);
    expect(end.y).toBeCloseTo(50, 6);
  });

  it("binds start and end independently to object centers", () => {
    const program = compileProgram({
      version: "1.0",
      scene,
      steps: [
        { action: "create", target: "a", type: "rectangle", properties: { x: 0, y: 0, width: 100, height: 100 } },
        { action: "create", target: "b", type: "rectangle", properties: { x: 200, y: 100, width: 100, height: 100 } },
        { action: "create", target: "seg", type: "segment", properties: { start: { x: 10, y: 20 }, end: { x: 110, y: 20 } } },
        { action: "bind", target: "seg", properties: { start: "a.center", end: "b.center" } },
      ],
    }, { catalog, objectEnv });
    const simulation = new Simulation(program, { catalog, objectEnv, fps: 60 });
    simulation.seek(0);

    expect(simulation.world.require("seg").readProp("start")).toEqual({ x: 50, y: 50 });
    expect(simulation.world.require("seg").readProp("end")).toEqual({ x: 250, y: 150 });
  });
});
