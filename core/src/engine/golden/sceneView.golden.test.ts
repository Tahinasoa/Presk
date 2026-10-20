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
const scene = { width: 1600, height: 900 };

function document(steps: unknown[]): { version: "1.0"; scene: typeof scene; steps: unknown[] } {
  return { version: "1.0", scene, steps };
}

function rectangle(target: string, properties: Record<string, unknown>): unknown {
  return { action: "create", target, type: "rectangle", properties };
}

function circle(target: string, properties: Record<string, unknown>): unknown {
  return { action: "create", target, type: "circle", properties };
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

function expectView(simulation: Simulation, expected: { cx: number; cy: number; zoom: number }): void {
  const root = simulation.world.root;
  expect(root.getNumber("viewCx")).toBeCloseTo(expected.cx, 4);
  expect(root.getNumber("viewCy")).toBeCloseTo(expected.cy, 4);
  expect(root.getNumber("viewZoom")).toBeCloseTo(expected.zoom, 4);
}

describe("scene view golden documents", () => {
  it("W1 sets the scene zoom instantly", () => {
    expectView(run(document([
      { action: "set", target: "scene", properties: { zoom: 2 } },
    ]), 0), { cx: 800, cy: 450, zoom: 2 });
  });

  it("W2 interpolates zoom geometrically", () => {
    expectView(run(document([
      { action: "animate", target: "scene", properties: { zoom: 4 }, duration: 2, ease: "linear" },
    ]), 1), { cx: 800, cy: 450, zoom: 2 });
  });

  it("W3 animates to a specified view region", () => {
    expectView(run(document([
      { action: "animate", target: "scene", properties: { view: { x: 0, y: 0, width: 800, height: 450 } }, duration: 1, ease: "linear" },
    ]), 1), { cx: 400, cy: 225, zoom: 2 });
  });

  it("W4 captures a focus target at animation start", () => {
    expectView(run(document([
      rectangle("earth", { x: 700, y: 400, width: 200, height: 100 }),
      { action: "animate", target: "scene", properties: { focusOn: "earth" }, duration: 1, ease: "linear" },
      { action: "animate", target: "earth", properties: { x: 0 }, duration: 1, ease: "linear", start: "<" },
    ]), 1), { cx: 800, cy: 450, zoom: 8 });
  });

  it("W5 reevaluates bound focus targets as their objects move", () => {
    expectView(run(document([
      rectangle("earth", { x: 700, y: 400, width: 200, height: 100 }),
      { action: "animate", target: "earth", properties: { x: 0 }, duration: 2, ease: "linear" },
      { action: "bind", target: "scene", properties: { focusOn: "earth" }, start: "<" },
    ]), 2), { cx: 100, cy: 450, zoom: 8 });
  });

  it("W6 stops a view animation at its geometrically interpolated zoom", () => {
    const doc = document([
      { action: "animate", target: "scene", properties: { zoom: 4 }, duration: 4, ease: "linear" },
      { action: "stop", target: "scene", properties: ["zoom"], start: 1 },
    ]);

    expectView(run(doc, 1), { cx: 800, cy: 450, zoom: Math.sqrt(2) });
    expectView(run(doc, 4), { cx: 800, cy: 450, zoom: Math.sqrt(2) });
  });

  it("W7 lets an instant focus set take ownership from an animation", () => {
    const doc = document([
      { action: "animate", target: "scene", properties: { zoom: 2 }, duration: 1 },
      { action: "set", target: "scene", properties: { focusOn: "scene" }, start: 0.5 },
    ]);

    expectView(run(doc, 0.5), { cx: 800, cy: 450, zoom: 1 });
    expectView(run(doc, 1), { cx: 800, cy: 450, zoom: 1 });
  });

  it("W8 keeps scene creation reserved and rejects travel targeting scene", () => {
    const createError = compileError(document([
      { action: "create", target: "scene", type: "rectangle" },
    ]));
    expect(createError.diagnostics.map(({ code }) => code)).toContain("E_OBJECT_RESERVED");

    const travelError = compileError(document([
      rectangle("earth", { width: 100, height: 100 }),
      { action: "travel", target: "scene", along: "earth", duration: 1 },
    ]));
    expect(travelError.diagnostics.map(({ code }) => code)).toContain("E_SCENE_ACTION");
  });

  it("W9 binds a circle position to the visible top-right scene view anchor", () => {
    const simulation = run(document([
      circle("d", { radius: 1 }),
      { action: "set", target: "scene", properties: { zoom: 2 } },
      { action: "bind", target: "d", properties: { pos: "scene.view.topRight" }, start: "<" },
    ]), 0);

    expect(simulation.world.require("d").readProp("pos")).toEqual({ x: 1200, y: 225 });
  });
});
