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

describe("core golden documents", () => {
  it("G1 interpolates a linear animation", () => {
    const simulation = run(document([
      rectangle("a", { x: 0 }),
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear" },
    ]), 1);

    expect(simulation.world.require("a").readProp("x")).toBe(50);
  });

  it("G2 starts sequential animations without explicit start values", () => {
    const simulation = run(document([
      rectangle("a", { x: 0, y: 0 }),
      { action: "animate", target: "a", properties: { x: 100 }, duration: 1, ease: "linear" },
      { action: "animate", target: "a", properties: { y: 50 }, duration: 1, ease: "linear" },
    ]), 1.5);

    expect(simulation.world.require("a").readProp("x")).toBe(100);
    expect(simulation.world.require("a").readProp("y")).toBe(25);
  });

  it("G3 binds to an animation and freezes after unbind", () => {
    const doc = document([
      rectangle("a", { x: 0 }),
      rectangle("b", { x: 200 }),
      { action: "animate", target: "b", properties: { x: 400 }, duration: 2, ease: "linear" },
      { action: "bind", target: "a", properties: { x: "b.x - 50" }, start: "<" },
      { action: "unbind", target: "a", start: 1.5 },
    ]);

    expect(run(doc, 1).world.require("a").readProp("x")).toBe(250);
    expect(run(doc, 2).world.require("a").readProp("x")).toBe(300);
  });

  it("G4 reveals and hides text over time", () => {
    const doc = document([
      { action: "create", target: "t", type: "text", properties: { text: "Hi" } },
      { action: "animate", target: "t", properties: { reveal: true }, start: 1, duration: 1, ease: "linear" },
      { action: "animate", target: "t", properties: { reveal: false }, start: 3, duration: 1, ease: "linear" },
    ]);

    expect(run(doc, 0).world.require("t").effectiveAlpha()).toBe(0);
    expect(run(doc, 1.5).world.require("t").effectiveAlpha()).toBe(0.5);
    expect(run(doc, 2).world.require("t").effectiveAlpha()).toBe(1);
    expect(run(doc, 3.5).world.require("t").effectiveAlpha()).toBe(0.5);
    expect(run(doc, 4).world.require("t").effectiveAlpha()).toBe(0);
  });

  it("G5 lets set take ownership from an animation", () => {
    const doc = document([
      rectangle("a", { x: 0 }),
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2 },
      { action: "set", target: "a", properties: { x: 0 }, start: 1 },
    ]);

    expect(run(doc, 1).world.require("a").readProp("x")).toBe(0);
    expect(run(doc, 2).world.require("a").readProp("x")).toBe(0);
  });

  it("G6 stops an animation and keeps its current value", () => {
    const doc = document([
      rectangle("a", { x: 0 }),
      { action: "animate", target: "a", properties: { x: 100 }, duration: 4, ease: "linear" },
      { action: "stop", target: "a", properties: ["x"], start: 1 },
    ]);

    expect(run(doc, 1).world.require("a").readProp("x")).toBe(25);
    expect(run(doc, 4).world.require("a").readProp("x")).toBe(25);
  });

  it("G7 evaluates yoyo repeats and finalizes at the source value", () => {
    const doc = document([
      rectangle("a", { x: 0 }),
      { action: "animate", target: "a", properties: { x: 100 }, duration: 1, repeat: 2, repeatMode: "yoyo", ease: "linear" },
    ]);

    expect(run(doc, 0.5).world.require("a").readProp("x")).toBe(50);
    expect(run(doc, 1.25).world.require("a").readProp("x")).toBe(75);
    expect(run(doc, 1.5).world.require("a").readProp("x")).toBe(50);
    expect(run(doc, 2).world.require("a").readProp("x")).toBe(0);
  });

  it("G8 reports a forward reference during compilation", () => {
    const doc = document([
      rectangle("b", { x: "a.x" }),
      rectangle("a", {}),
    ]);

    expect(compileError(doc).diagnostics.map(({ code }) => code)).toContain("E_FORWARD_REFERENCE");
  });

  it("G9 measures text for an anchor reference", () => {
    const simulation = run(document([
      { action: "create", target: "title", type: "text", properties: { text: "Hello", fontSize: 10, x: 100, y: 100 } },
      rectangle("sub", { topLeft: "title.bottomLeft" }),
    ]), 0);

    expect(simulation.world.require("sub").readProp("x")).toBe(100);
    expect(simulation.world.require("sub").readProp("y")).toBe(112);
  });

  it("G10 reports unknown objects and types together", () => {
    const doc = document([
      { action: "animate", target: "zzz", properties: { x: 1 }, duration: 1 },
      { action: "create", target: "a", type: "hexagon" },
    ]);

    expect(compileError(doc).diagnostics.map(({ code }) => code))
      .toEqual(expect.arrayContaining(["E_OBJECT_UNKNOWN", "E_TYPE_UNKNOWN"]));
  });

  it("G11 lets a later animation take ownership at its start time", () => {
    const doc = document([
      rectangle("a", { x: 0 }),
      { action: "animate", target: "a", properties: { x: 10 }, duration: 1 },
      { action: "animate", target: "a", properties: { x: 20 }, duration: 1, start: "<0.5" },
    ]);

    expect(run(doc, 0.5).world.require("a").readProp("x")).toBe(5);
    expect(run(doc, 1.5).world.require("a").readProp("x")).toBe(20);
  });

  it("G12 returns transformed rectangle anchors", () => {
    const simulation = run(document([
      rectangle("a", { scale: 2, pivot: "topLeft", x: 10, y: 20 }),
    ]), 0);
    const object = simulation.world.require("a");

    expect(object.readProp("topLeft")).toEqual({ x: 10, y: 20 });
    expect(object.readProp("bottomRight")).toEqual({ x: 210, y: 220 });
  });

  it("G13 freezes an expression target when an animation activates", () => {
    const doc = document([
      rectangle("a", { x: 0 }),
      { action: "animate", target: "a", properties: { x: 100 }, duration: 1, ease: "linear" },
      { action: "animate", target: "a", properties: { x: "a.x + 10" }, duration: 1, start: "<0.5" },
    ]);

    expect(run(doc, 1.5).world.require("a").readProp("x")).toBe(60);
  });
});
