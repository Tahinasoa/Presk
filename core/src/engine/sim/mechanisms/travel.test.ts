import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import { Simulation } from "@/engine/sim/simulation";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";
import type { Pt } from "@/geom/vec";

const catalog = createDefaultCatalog();
const objectEnv = createTestEnv();
const scene = { width: 800, height: 600 };

function createSimulation(steps: unknown[]): Simulation {
  const program = compileProgram({ version: "1.0", scene, steps }, { catalog, objectEnv });
  return new Simulation(program, { catalog, objectEnv, fps: 60 });
}

function expectPoint(actual: Pt, expected: Pt): void {
  expect(actual.x).toBeCloseTo(expected.x, 6);
  expect(actual.y).toBeCloseTo(expected.y, 6);
}

function circleTravelSteps(extraTravel: Record<string, unknown> = {}) {
  return [
    { action: "create", target: "orbit", type: "circle", properties: { x: 200, y: 200, radius: 100 } },
    { action: "create", target: "p", type: "circle", properties: { radius: 10 } },
    { action: "travel", target: "p", along: "orbit", duration: 4, ease: "linear", ...extraTravel },
  ];
}

function rectangleTravelSteps(actions: unknown[] = []) {
  return [
    { action: "create", target: "track", type: "rectangle", properties: { x: 0, y: 0, width: 100, height: 100 } },
    { action: "create", target: "dot", type: "circle" },
    { action: "travel", target: "dot", along: "track", duration: 4, ease: "linear" },
    ...actions,
  ];
}

describe("TravelMechanism", () => {
  it("moves a circle around a circular path and finalizes at its start", () => {
    const simulation = createSimulation(circleTravelSteps());
    for (const [time, point] of [
      [0, { x: 300, y: 200 }],
      [1, { x: 200, y: 300 }],
      [2, { x: 100, y: 200 }],
      [3, { x: 200, y: 100 }],
      [4, { x: 300, y: 200 }],
    ] as const) {
      simulation.seek(time);
      expectPoint(simulation.world.require("p").readProp("pos") as Pt, point);
    }
  });

  it("follows a rectangle path clockwise", () => {
    const simulation = createSimulation(rectangleTravelSteps());
    for (const [time, point] of [
      [1, { x: 100, y: 0 }],
      [2, { x: 100, y: 100 }],
      [3, { x: 0, y: 100 }],
    ] as const) {
      simulation.seek(time);
      expectPoint(simulation.world.require("dot").readProp("pos") as Pt, point);
    }
  });

  it("restarts the path on repeated travel passes", () => {
    const repeated = createSimulation([
      ...rectangleTravelSteps().slice(0, 2),
      { action: "travel", target: "dot", along: "track", duration: 4, ease: "linear", repeat: 2 },
    ]);
    repeated.seek(5);
    expectPoint(repeated.world.require("dot").readProp("pos") as Pt, { x: 100, y: 0 });
  });

  it("travels backward during yoyo repeat and returns to the start when finished", () => {
    const simulation = createSimulation([
      ...rectangleTravelSteps().slice(0, 2),
      { action: "travel", target: "dot", along: "track", duration: 4, ease: "linear", repeat: 2, repeatMode: "yoyo" },
    ]);
    simulation.seek(5);
    expectPoint(simulation.world.require("dot").readProp("pos") as Pt, { x: 0, y: 100 });
    simulation.seek(8);
    expectPoint(simulation.world.require("dot").readProp("pos") as Pt, { x: 0, y: 0 });
  });

  it.each([
    [true, 90],
    [{ offset: 90 }, 180],
  ] as const)("orients a rectangle anchor with orient=%s", (orient, expected) => {
    const simulation = createSimulation([
      { action: "create", target: "track", type: "rectangle", properties: { width: 100, height: 100 } },
      { action: "create", target: "arrow", type: "rectangle", properties: { width: 20, height: 10 } },
      { action: "travel", target: "arrow", along: "track", duration: 4, ease: "linear", anchor: "center", orient },
    ]);
    simulation.seek(1.5);
    expect(simulation.world.require("arrow").readProp("rotation")).toBeCloseTo(expected, 6);
  });

  it("keeps evaluating y after an animation takes ownership of x", () => {
    const simulation = createSimulation(rectangleTravelSteps([
      { action: "animate", target: "dot", properties: { x: 500 }, duration: 0.1, ease: "linear", start: "1" },
    ]));
    simulation.seek(1.2);
    expect(simulation.world.require("dot").readProp("x")).toBe(500);
    expect(simulation.world.require("dot").readProp("y")).toBeCloseTo(20, 6);
  });

  it("freezes position after a stop on pos", () => {
    const simulation = createSimulation(rectangleTravelSteps([
      { action: "stop", target: "dot", properties: ["pos"], start: "1" },
    ]));
    simulation.seek(2);
    expectPoint(simulation.world.require("dot").readProp("pos") as Pt, { x: 100, y: 0 });
  });
});
