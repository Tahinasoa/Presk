import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import { Simulation } from "@/engine/sim/simulation";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";

const catalog = createDefaultCatalog();
const objectEnv = createTestEnv();
const scene = { width: 800, height: 600 };

function createSimulation(steps: unknown[]): Simulation {
  const program = compileProgram(
    { version: "1.0", scene, steps },
    { catalog, objectEnv },
  );
  return new Simulation(program, { catalog, objectEnv, fps: 60 });
}

function expectPoint(
  actual: unknown,
  expected: { x: number; y: number },
): void {
  expect(actual).toEqual(expect.objectContaining({
    x: expect.closeTo(expected.x, 6),
    y: expect.closeTo(expected.y, 6),
  }));
}

function baseChildren() {
  return [
    { action: "create", target: "a", type: "rectangle", properties: { x: 0, y: 0, width: 100, height: 50 } },
    { action: "create", target: "b", type: "rectangle", properties: { x: 500, y: 300, width: 60, height: 40 } },
  ];
}

describe("group and ungroup simulation actions", () => {
  it("reparents children without changing their world appearance", () => {
    const simulation = createSimulation([
      ...baseChildren(),
      { action: "group", target: "menu", properties: { children: ["a", "b"] } },
    ]);
    const a = simulation.world.require("a");
    const b = simulation.world.require("b");

    simulation.seek(0);

    expect(a.parent?.id).toBe("menu");
    expectPoint(a.readProp("topLeft"), { x: 0, y: 0 });
    expectPoint(b.readProp("topLeft"), { x: 500, y: 300 });
  });

  it("applies a vertical layout immediately", () => {
    const simulation = createSimulation([
      ...baseChildren(),
      { action: "group", target: "menu", properties: { children: ["a", "b"], layout: "vertical", gap: 10 } },
    ]);

    simulation.seek(0);

    expectPoint(simulation.world.require("a").readProp("topLeft"), { x: 0, y: 0 });
    expectPoint(simulation.world.require("b").readProp("topLeft"), { x: 0, y: 60 });
  });

  it("transitions layout positions over the requested duration", () => {
    const simulation = createSimulation([
      ...baseChildren(),
      {
        action: "group",
        target: "menu",
        properties: { children: ["a", "b"], layout: "vertical", gap: 10 },
        duration: 1,
        ease: "linear",
      },
    ]);
    const b = simulation.world.require("b");

    simulation.seek(0);
    expectPoint(b.readProp("topLeft"), { x: 500, y: 300 });
    simulation.seek(0.5);
    expectPoint(b.readProp("topLeft"), { x: 250, y: 180 });
    simulation.seek(1);
    expectPoint(b.readProp("topLeft"), { x: 0, y: 60 });
  });

  it("accounts for layout margin in child placement and group anchors", () => {
    const simulation = createSimulation([
      ...baseChildren(),
      { action: "group", target: "menu", properties: { children: ["a", "b"], layout: "vertical", margin: 5 } },
    ]);

    simulation.seek(0);

    expectPoint(simulation.world.require("a").readProp("topLeft"), { x: 5, y: 5 });
    expectPoint(simulation.world.require("menu").readProp("topLeft"), { x: 0, y: 0 });
  });

  it("lays children out in the group's translated coordinate space", () => {
    const simulation = createSimulation([
      ...baseChildren(),
      { action: "create", target: "menu", type: "group", properties: { x: 100 } },
      { action: "group", target: "menu", properties: { children: ["a", "b"], layout: "vertical" } },
    ]);

    simulation.seek(0);

    expectPoint(simulation.world.require("a").readProp("topLeft"), { x: 100, y: 0 });
  });

  it("detaches all children while preserving their world position", () => {
    const simulation = createSimulation([
      ...baseChildren(),
      { action: "group", target: "menu", properties: { children: ["a", "b"] } },
      { action: "ungroup", target: "menu", start: 2 },
    ]);
    const a = simulation.world.require("a");

    simulation.seek(0);
    const topLeft = a.readProp("topLeft");
    simulation.seek(2);

    expect(a.parent).toBeNull();
    expectPoint(a.readProp("topLeft"), topLeft as { x: number; y: number });
  });

  it("detaches only the requested child", () => {
    const simulation = createSimulation([
      ...baseChildren(),
      { action: "group", target: "menu", properties: { children: ["a", "b"] } },
      { action: "ungroup", target: "menu", properties: { children: ["a"] }, start: 2 },
    ]);

    simulation.seek(2);

    expect(simulation.world.require("a").parent).toBeNull();
    expect(simulation.world.require("b").parent?.id).toBe("menu");
  });

  it("restores the original hierarchy after seeking backward", () => {
    const simulation = createSimulation([
      ...baseChildren(),
      { action: "group", target: "menu", properties: { children: ["a", "b"] }, start: 1 },
      { action: "ungroup", target: "menu", start: 2 },
    ]);

    simulation.seek(2);
    expect(simulation.world.require("a").parent).toBeNull();
    simulation.seek(0);

    expect(simulation.world.require("a").parent).toBeNull();
    expect(simulation.world.require("b").parent).toBeNull();
    expect(simulation.world.require("menu").children()).toEqual([]);
  });
});
