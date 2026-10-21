import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import { Simulation } from "@/engine/sim/simulation";
import { PreskCompileError } from "@/lang/diagnostics";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { FakeImageInfo, FakeTextMeasurer } from "@/model/ports";

const env = {
  catalog: createDefaultCatalog(),
  objectEnv: { measurer: new FakeTextMeasurer(), images: new FakeImageInfo() },
};
const scene = { width: 800, height: 600 };

function document(steps: unknown[]): { version: "1.0"; scene: typeof scene; steps: unknown[] } {
  return { version: "1.0", scene, steps };
}

function run(doc: unknown, time: number): Simulation {
  const program = compileProgram(doc, env);
  const simulation = new Simulation(program, { ...env, fps: 60 });
  simulation.seek(time);
  return simulation;
}

function compileError(doc: unknown): PreskCompileError {
  try {
    compileProgram(doc, env);
  } catch (error) {
    if (error instanceof PreskCompileError) return error;
    throw error;
  }
  throw new Error("Expected compilation to fail");
}

function expectPoint(actual: unknown, expected: { x: number; y: number }): void {
  expect(actual).toEqual(expect.objectContaining({
    x: expect.closeTo(expected.x, 6),
    y: expect.closeTo(expected.y, 6),
  }));
}

describe("shape golden documents", () => {
  it("S1 binds segment endpoints to bounded-object anchors", () => {
    const simulation = run(document([
      { action: "create", target: "a", type: "rectangle", properties: { width: 10, height: 10 } },
      { action: "create", target: "b", type: "rectangle", properties: { x: 100, y: 50, width: 10, height: 10 } },
      { action: "create", target: "s", type: "segment", properties: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } } },
      {
        action: "bind",
        target: "s",
        properties: { start: "a.center", end: "b.center" },
        start: 0,
      },
    ]), 0);

    const segment = simulation.world.require("s");
    expectPoint(segment.readProp("start"), { x: 5, y: 5 });
    expectPoint(segment.readProp("end"), { x: 105, y: 55 });
  });

  it("S2 resolves indexed triangle vertices in object properties", () => {
    const simulation = run(document([
      {
        action: "create",
        target: "tri",
        type: "triangle",
        properties: { x: 10, y: 10, points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 80 }] },
      },
      { action: "create", target: "d", type: "circle", properties: { radius: 5, x: "tri.vertex[1].x", y: "tri.vertex[1].y" } },
    ]), 0);

    expectPoint(simulation.world.require("d").readProp("pos"), { x: 110, y: 10 });
  });

  it("S3 reveals and hides a segment by drawing it forwards and backwards", () => {
    const doc = document([
      { action: "create", target: "seg", type: "segment", properties: { start: { x: 0, y: 0 }, end: { x: 100, y: 0 } } },
      { action: "animate", target: "seg", properties: { reveal: "draw" }, duration: 1, ease: "linear" },
      { action: "animate", target: "seg", properties: { reveal: false }, start: 3, duration: 1, ease: "linear" },
    ]);

    for (const [time, presence, drawProgress] of [
      [0, 0, 0],
      [0.5, 1, 0.5],
      [1, 1, 1],
      [3.5, 1, 0.5],
      [4, 0, 0],
    ] as const) {
      const segment = run(doc, time).world.require("seg");
      expect(segment.getNumber("presence")).toBe(presence);
      expect(segment.getNumber("drawProgress")).toBe(drawProgress);
    }
  });

  it("S4 travels along a segment at its midpoint", () => {
    const simulation = run(document([
      { action: "create", target: "s", type: "segment", properties: { start: { x: 0, y: 0 }, end: { x: 100, y: 0 } } },
      { action: "create", target: "dot", type: "circle", properties: { radius: 5 } },
      { action: "travel", target: "dot", along: "s", duration: 2, ease: "linear" },
    ]), 1);

    expectPoint(simulation.world.require("dot").readProp("pos"), { x: 50, y: 0 });
  });

  it("S5 rejects a travel range past an open segment", () => {
    const error = compileError(document([
      { action: "create", target: "s", type: "segment", properties: { start: { x: 0, y: 0 }, end: { x: 100, y: 0 } } },
      { action: "create", target: "dot", type: "circle", properties: { radius: 5 } },
      { action: "travel", target: "dot", along: "s", from: 0, to: 1.5, duration: 1 },
    ]));

    expect(error.diagnostics.map(({ code }) => code)).toContain("E_TRAVEL_RANGE");
  });

  it("S6 requires polygon points", () => {
    const error = compileError(document([
      { action: "create", target: "p", type: "polygon", properties: {} },
    ]));

    expect(error.diagnostics.map(({ code }) => code)).toContain("E_FIELD_REQUIRED");
  });

  it("S7 rejects a bounding-box reference on an unbounded ray", () => {
    const error = compileError(document([
      { action: "create", target: "r", type: "ray", properties: { origin: { x: 0, y: 0 }, through: { x: 1, y: 0 } } },
      { action: "create", target: "a", type: "rectangle", properties: { x: "r.boundingBox.center.x" } },
    ]));

    expect(error.diagnostics.map(({ code }) => code)).toContain("E_EXPR_INFINITE_REF");
  });

  it("S8 resolves the endpoint of an arc", () => {
    const simulation = run(document([
      { action: "create", target: "a", type: "arc", properties: { x: 100, y: 100, radius: 50, startAngle: 0, endAngle: 90 } },
      { action: "create", target: "d", type: "circle", properties: { radius: 3, pos: "a.end" } },
    ]), 0);

    expectPoint(simulation.world.require("d").readProp("pos"), { x: 100, y: 150 });
  });

  it("S9 resolves a rotated rectangle's top-left anchor", () => {
    const simulation = run(document([
      { action: "create", target: "a", type: "rectangle", properties: { rotation: 90, width: 100, height: 50 } },
      { action: "create", target: "d", type: "circle", properties: { radius: 1, pos: "a.topLeft" } },
    ]), 0);

    expectPoint(simulation.world.require("d").readProp("pos"), { x: 75, y: -25 });
  });

  it("S10 resolves a circle's top-left bounding-box anchor", () => {
    const simulation = run(document([
      { action: "create", target: "c", type: "circle", properties: { x: 100, y: 100, radius: 50 } },
      { action: "create", target: "r", type: "rectangle", properties: { topLeft: "c.boundingBox.topLeft" } },
    ]), 0);

    expect(simulation.world.require("r").readProp("x")).toBe(50);
    expect(simulation.world.require("r").readProp("y")).toBe(50);
  });
});
