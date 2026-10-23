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

function isPoint(value: unknown): value is { x: number; y: number } {
  return typeof value === "object" && value !== null
    && "x" in value && typeof value.x === "number"
    && "y" in value && typeof value.y === "number";
}

function expectPoint(actual: unknown, expected: { x: number; y: number }): void {
  expect(isPoint(actual)).toBe(true);
  if (!isPoint(actual)) return;
  expect(actual.x).toBeCloseTo(expected.x, 6);
  expect(actual.y).toBeCloseTo(expected.y, 6);
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

describe("travel golden documents", () => {
  it("V1 travels around a circle at the specified instants", () => {
    const doc = document([
      circle("orbit", { x: 200, y: 200, radius: 100 }),
      circle("p", { radius: 10 }),
      { action: "travel", target: "p", along: "orbit", duration: 4, ease: "linear" },
    ]);

    for (const [time, point] of [
      [0, { x: 300, y: 200 }],
      [1, { x: 200, y: 300 }],
      [2, { x: 100, y: 200 }],
      [3, { x: 200, y: 100 }],
      [4, { x: 300, y: 200 }],
    ] as const) {
      expectPoint(run(doc, time).world.require("p").readProp("pos"), point);
    }
  });

  it("V2 derives the travel duration from path length and speed", () => {
    const simulation = run(document([
      rectangle("track", { width: 100, height: 100 }),
      circle("dot", { radius: 5 }),
      { action: "travel", target: "dot", along: "track", speed: 100, ease: "linear" },
    ]), 0);

    expect(simulation.duration).toBe(4);
  });

  it("V3 resolves from current after a stop on the prior travel", () => {
    const simulation = run(document([
      rectangle("track", { width: 100, height: 100 }),
      circle("dot", { radius: 5 }),
      { action: "travel", target: "dot", along: "track", speed: 100, ease: "linear" },
      { action: "stop", target: "dot", properties: ["pos"], start: 1 },
      { action: "travel", target: "dot", along: "track", from: "current", to: 1, duration: 3, start: 2 },
    ]), 3.5);

    expectPoint(simulation.world.require("dot").readProp("pos"), { x: 50, y: 100 });
  });

  it("V4 evaluates path coordinates in object properties", () => {
    const simulation = run(document([
      rectangle("track", { width: 100, height: 100 }),
      circle("m", {
        radius: 5,
        x: "track.pathX(main,0.5)",
        y: "track.pathY(main,0.5)",
      }),
    ]), 0);

    expectPoint(simulation.world.require("m").readProp("pos"), { x: 100, y: 100 });
  });

  it("V5 rejects a partial stop on travel ownership", () => {
    const error = compileError(document([
      rectangle("track", { width: 100, height: 100 }),
      circle("dot", { radius: 5 }),
      { action: "travel", target: "dot", along: "track", duration: 4 },
      { action: "stop", target: "dot", properties: ["x"], start: 1 },
    ]));

    expect(error.diagnostics.map(({ code }) => code)).toContain("E_STOP_PARTIAL_TRAVEL");
  });

  it("V6 reports an unknown travel path object", () => {
    const error = compileError(document([
      circle("dot", { radius: 5 }),
      { action: "travel", target: "dot", along: "zzz", duration: 1 },
    ]));

    expect(error.diagnostics.map(({ code }) => code)).toContain("E_TRAVEL_ALONG");
  });
});
