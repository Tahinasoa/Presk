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

describe("group golden documents", () => {
  it("H1 moves grouped children with the group's translation", () => {
    const simulation = run(document([
      { action: "create", target: "a", type: "rectangle", properties: { width: 100, height: 50 } },
      { action: "create", target: "b", type: "rectangle", properties: { x: 200, y: 100, width: 50, height: 50 } },
      { action: "group", target: "g", properties: { children: ["a", "b"] } },
      { action: "animate", target: "g", properties: { x: 100 }, duration: 1, ease: "linear" },
    ]), 1);

    expectPoint(simulation.world.require("a").readProp("topLeft"), { x: 100, y: 0 });
    expectPoint(simulation.world.require("b").readProp("topLeft"), { x: 300, y: 100 });
  });

  it("H2 rotates grouped children around the group's bounds center", () => {
    const simulation = run(document([
      { action: "create", target: "a", type: "rectangle", properties: { width: 100, height: 50 } },
      { action: "create", target: "b", type: "rectangle", properties: { x: 200, y: 100, width: 50, height: 50 } },
      { action: "group", target: "g", properties: { children: ["a", "b"] } },
      { action: "animate", target: "g", properties: { rotation: 90 }, duration: 1, ease: "linear" },
    ]), 1);
    const a = simulation.world.require("a");

    expect(a.getNumber("rotation")).toBe(0);
    expectPoint(a.readProp("topLeft"), { x: 200, y: -50 });
  });

  it("H3 composes the opacity of a visible child and its group", () => {
    const simulation = run(document([
      { action: "create", target: "a", type: "rectangle", properties: { width: 100, height: 50, reveal: true } },
      { action: "group", target: "g", properties: { children: ["a"] } },
      { action: "animate", target: "g", properties: { opacity: 0.5 }, duration: 1 },
    ]), 1);

    expect(simulation.world.require("a").effectiveAlpha()).toBe(0.5);
  });

  it("H4 leaves an unrevealed child invisible when it is grouped", () => {
    const simulation = run(document([
      { action: "create", target: "a", type: "rectangle", properties: {} },
      { action: "group", target: "g", properties: { children: ["a"] } },
    ]), 0);

    expect(simulation.world.require("a").effectiveAlpha()).toBe(0);
  });

  it("H5 does not propagate a group's reveal effect to its child", () => {
    const simulation = run(document([
      { action: "create", target: "a", type: "rectangle", properties: {} },
      { action: "group", target: "g", properties: { children: ["a"] } },
      { action: "animate", target: "g", properties: { reveal: true } },
    ]), 0.5);

    expect(simulation.world.require("g").effectiveAlpha()).toBe(1);
    expect(simulation.world.require("a").effectiveAlpha()).toBe(0);
  });

  it("H6 reports an unknown group child during compilation", () => {
    const error = compileError(document([
      { action: "group", target: "g", properties: { children: ["zzz"] } },
    ]));

    expect(error.diagnostics.map(({ code }) => code)).toContain("E_GROUP_CHILD_UNKNOWN");
  });

  it("H7 reapplies the active layout to every current group child", () => {
    const simulation = run(document([
      { action: "create", target: "a", type: "rectangle", properties: { width: 50, height: 50 } },
      { action: "create", target: "b", type: "rectangle", properties: { width: 50, height: 50 } },
      { action: "group", target: "g", properties: { children: ["a"], layout: "vertical", gap: 10 } },
      { action: "group", target: "g", properties: { children: ["b"] } },
    ]), 0);

    expectPoint(simulation.world.require("b").readProp("topLeft"), { x: 0, y: 60 });
  });
});
