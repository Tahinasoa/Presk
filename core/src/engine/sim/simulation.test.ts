import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import { Simulation } from "@/engine/sim/simulation";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";

const catalog = createDefaultCatalog();
const objectEnv = createTestEnv();
const scene = { width: 800, height: 600 };

function createSimulation(steps: unknown[]): Simulation {
  const program = compileProgram({ version: "1.0", scene, steps }, { catalog, objectEnv });
  return new Simulation(program, { catalog, objectEnv, fps: 60 });
}

describe("Simulation", () => {
  it("advances an animation and clamps seek to the program duration", () => {
    const simulation = createSimulation([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear" },
    ]);

    simulation.seek(1);
    expect(simulation.world.require("a").readProp("x")).toBe(50);
    simulation.seek(2);
    expect(simulation.world.require("a").readProp("x")).toBe(100);
    simulation.seek(5);
    expect(simulation.world.require("a").readProp("x")).toBe(100);
    expect(simulation.time).toBe(2);
  });

  it("replays from the beginning when seeking backward", () => {
    const simulation = createSimulation([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear" },
    ]);

    simulation.seek(1);
    expect(simulation.world.require("a").readProp("x")).toBe(50);
    simulation.seek(0.25);
    expect(simulation.world.require("a").readProp("x")).toBe(12.5);
    expect(simulation.time).toBe(0.25);
  });

  it("evaluates actions at time zero", () => {
    const simulation = createSimulation([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear" },
    ]);

    simulation.seek(0);

    expect(simulation.world.require("a").readProp("x")).toBe(0);
    expect(simulation.time).toBe(0);
  });

  it("evaluates sequential animations at their exact transition time", () => {
    const simulation = createSimulation([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0, y: 0 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 1, ease: "linear" },
      { action: "animate", target: "a", properties: { y: 50 }, duration: 1, ease: "linear" },
    ]);

    simulation.seek(0.5);
    expect(simulation.world.require("a").readProp("x")).toBe(50);
    expect(simulation.world.require("a").readProp("y")).toBe(0);
    simulation.seek(1.5);
    expect(simulation.world.require("a").readProp("x")).toBe(100);
    expect(simulation.world.require("a").readProp("y")).toBe(25);
    expect(simulation.duration).toBe(2);
  });

  it("is idempotent when seeking to the current time", () => {
    const simulation = createSimulation([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear" },
    ]);

    simulation.seek(0.5);
    const value = simulation.world.require("a").readProp("x");
    simulation.seek(0.5);

    expect(simulation.world.require("a").readProp("x")).toBe(value);
    expect(simulation.time).toBe(0.5);
  });

  it("executes a set action on its start tick", () => {
    const simulation = createSimulation([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "set", target: "a", properties: { x: 5 } },
    ]);

    simulation.seek(0);

    expect(simulation.world.require("a").readProp("x")).toBe(5);
  });

  it("activates and evaluates an effect mechanism", () => {
    const simulation = createSimulation([
      { action: "create", target: "a", type: "rectangle" },
      { action: "animate", target: "a", properties: { reveal: true }, duration: 1, ease: "linear" },
    ]);

    simulation.seek(0.5);

    expect(simulation.world.require("a").getState("presence")).toBe(0.5);
  });

  it("stops an animation at its current value", () => {
    const simulation = createSimulation([
      { action: "create", target: "a", type: "rectangle", properties: { x: 0 } },
      { action: "animate", target: "a", properties: { x: 100 }, duration: 2, ease: "linear", start: "0" },
      { action: "stop", target: "a", properties: ["x"], start: "1" },
    ]);

    simulation.seek(1.5);

    expect(simulation.world.require("a").readProp("x")).toBe(50);
  });

  it("unbinds a key and freezes it while the source continues changing", () => {
    const simulation = createSimulation([
      { action: "create", target: "a", type: "rectangle", properties: { y: 0 } },
      { action: "create", target: "b", type: "rectangle", properties: { x: 0 } },
      { action: "animate", target: "b", properties: { x: 100 }, duration: 1, ease: "linear", start: "0" },
      { action: "bind", target: "a", properties: { y: "b.x" }, start: "0" },
      { action: "unbind", target: "a", properties: ["y"], start: "0.5" },
    ]);

    simulation.seek(0.5);
    expect(simulation.world.require("a").readProp("y")).toBe(50);
    simulation.seek(0.75);
    expect(simulation.world.require("a").readProp("y")).toBe(50);
  });
});
