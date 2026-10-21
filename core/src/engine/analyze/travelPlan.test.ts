import { describe, expect, it } from "vitest";
import { tryCompileProgram } from "@/engine/compileProgram";
import { planTimeline } from "@/engine/plan/timeline";
import { DiagnosticCollector } from "@/lang/diagnostics";
import { DEFAULT_START } from "@/lang/start";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";
import type { TravelDraft } from "@/engine/program";

const env = { catalog: createDefaultCatalog(), objectEnv: createTestEnv() };
const scene = { width: 800, height: 600 };

function compileTravel(
  steps: unknown[],
  trackProperties: Record<string, unknown> = { x: 0, y: 0, width: 100, height: 100 },
) {
  return tryCompileProgram({
    version: "1.0",
    scene,
    steps: [
      { action: "create", target: "track", type: "rectangle", properties: trackProperties },
      { action: "create", target: "dot", type: "circle" },
      ...steps,
    ],
  }, env);
}

function travelActions(result: ReturnType<typeof compileTravel>) {
  return result.program?.actions.filter((action) => action.action === "travel") ?? [];
}

function expectError(result: ReturnType<typeof compileTravel>, code: string): void {
  expect(result.diagnostics.map(({ code: actual }) => actual)).toContain(code);
  expect(result.program).toBeUndefined();
}

describe("travel resolver", () => {
  it("derives duration from path length and speed", () => {
    const result = compileTravel([{ action: "travel", target: "dot", along: "track", speed: 100 }]);
    const action = travelActions(result)[0];
    expect(action).toMatchObject({ duration: 4, end: 4 });
    expect(action).not.toHaveProperty("speed");
    expect(action).not.toHaveProperty("fromSpec");
    expect(result.diagnostics).toEqual([]);
  });

  it("plans provisional travel values when no resolver hook is supplied", () => {
    const draft: TravelDraft = {
      action: "travel",
      index: 0,
      target: "dot",
      along: { object: "track", path: "main" },
      fromT: 0,
      toT: 1,
      ease: "linear",
      repeat: 1,
      repeatMode: "restart",
      orient: null,
      anchor: "pos",
      startSpec: DEFAULT_START,
      explicitDuration: 4,
      fromSpec: 0,
    };
    const result = planTimeline([draft], new DiagnosticCollector());
    expect(result.actions[0]).toMatchObject({ fromT: 0, toT: 1, duration: 4 });
    expect(result.actions[0]).not.toHaveProperty("fromSpec");
  });

  it("includes the path object's world scale in speed duration", () => {
    const result = compileTravel(
      [{ action: "travel", target: "dot", along: "track", speed: 100 }],
      { x: 0, y: 0, width: 100, height: 100, scale: 2 },
    );
    expect(travelActions(result)[0]).toMatchObject({ duration: 8 });
    expect(result.diagnostics).toEqual([]);
  });

  it("rejects from current without an earlier travel", () => {
    expectError(
      compileTravel([{ action: "travel", target: "dot", along: "track", from: "current", duration: 1 }]),
      "E_TRAVEL_FROM_CURRENT",
    );
  });

  it("resolves from current at a previous travel stopped by pos", () => {
    const result = compileTravel([
      { action: "travel", target: "dot", along: "track", duration: 4 },
      { action: "stop", target: "dot", properties: ["pos"], start: "1" },
      { action: "travel", target: "dot", along: "track", from: "current", to: 1, duration: 3, start: "2" },
    ]);
    expect(travelActions(result)[1]).toMatchObject({ fromT: 0.25, toT: 1 });
    expect(result.diagnostics).toEqual([]);
  });

  it("resolves from current at the final value of a finished travel", () => {
    const result = compileTravel([
      { action: "travel", target: "dot", along: "track", from: 0, to: 0.5, duration: 2 },
      { action: "travel", target: "dot", along: "track", from: "current", duration: 1, start: "2" },
    ]);
    expect(travelActions(result)[1]).toMatchObject({ fromT: 0.5, toT: 1.5 });
    expect(result.diagnostics).toEqual([]);
  });

  it("resolves from current during an active travel", () => {
    const result = compileTravel([
      { action: "travel", target: "dot", along: "track", duration: 4 },
      { action: "travel", target: "dot", along: "track", from: "current", duration: 1, start: "1" },
    ]);
    expect(travelActions(result)[1]).toMatchObject({ fromT: 0.25 });
    expect(result.diagnostics).toEqual([]);
  });

  it("rejects from current when it exceeds an explicit to", () => {
    expectError(compileTravel([
      { action: "travel", target: "dot", along: "track", from: 0, to: 0.5, duration: 2 },
      { action: "travel", target: "dot", along: "track", from: "current", to: 0.25, duration: 1, start: "2" },
    ]), "E_TRAVEL_RANGE");
  });

  it("defaults to one full closed-path turn after a nonzero from", () => {
    const result = compileTravel([{ action: "travel", target: "dot", along: "track", from: 0.3, duration: 1 }]);
    expect(travelActions(result)[0]).toMatchObject({ fromT: 0.3, toT: 1.3 });
    expect(result.diagnostics).toEqual([]);
  });

  it("rejects zero speed", () => {
    expectError(
      compileTravel([{ action: "travel", target: "dot", along: "track", speed: 0 }]),
      "E_TRAVEL_DURATION",
    );
  });
});

describe("speed path warning", () => {
  const travelBySpeed = { action: "travel", target: "dot", along: "track", speed: 100 };
  const warningCodes = (result: ReturnType<typeof compileTravel>): string[] =>
    result.diagnostics.filter(({ severity }) => severity === "warning").map(({ code }) => code);

  it("does not warn when nothing acts on the path object", () => {
    const result = compileTravel([travelBySpeed]);
    expect(warningCodes(result)).toEqual([]);
    expect(result.program).toBeDefined();
  });

  it("warns when a length-changing property is animated before a speed travel", () => {
    const result = compileTravel([
      { action: "animate", target: "track", properties: { scale: 2 }, duration: 1 },
      travelBySpeed,
    ]);
    expect(warningCodes(result)).toEqual(["W_SPEED_PATH_MAY_CHANGE"]);
    expect(result.diagnostics.find(({ code }) => code === "W_SPEED_PATH_MAY_CHANGE")?.stepIndex).toBe(3);
    expect(result.program).toBeDefined();
    expect(result.program?.warnings.map(({ code }) => code)).toEqual(["W_SPEED_PATH_MAY_CHANGE"]);
  });

  it("does not warn for a translation, which keeps the path length", () => {
    const result = compileTravel([
      { action: "animate", target: "track", properties: { x: 100 }, duration: 1 },
      travelBySpeed,
    ]);
    expect(warningCodes(result)).toEqual([]);
  });

  it("does not warn when the change is planned after the travel", () => {
    const result = compileTravel([
      travelBySpeed,
      { action: "animate", target: "track", properties: { width: 200 }, duration: 1 },
    ]);
    expect(warningCodes(result)).toEqual([]);
  });

  it("does not warn when the travel has an explicit duration", () => {
    const result = compileTravel([
      { action: "animate", target: "track", properties: { scale: 2 }, duration: 1 },
      { action: "travel", target: "dot", along: "track", duration: 2 },
    ]);
    expect(warningCodes(result)).toEqual([]);
  });
});
