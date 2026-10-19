import { describe, expect, it } from "vitest";
import { analyzeActivity } from "@/engine/analyze/activity";
import { DiagnosticCollector } from "@/lang/diagnostics";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { planForTest } from "@/engine/testing";

const catalog = createDefaultCatalog();

function codes(steps: unknown[]): string[] {
  const planned = planForTest(steps);
  expect(planned.diagnostics).toEqual([]);
  const types = new Map(planned.init.map(({ id, type }) => [id, type]));
  const diagnostics = new DiagnosticCollector();
  analyzeActivity(planned.actions, (id) => types.get(id), catalog, diagnostics);
  return diagnostics.items.map(({ code }) => code);
}

const pair = (steps: unknown[]) => [
  { action: "create", target: "a", type: "rectangle" },
  { action: "create", target: "b", type: "rectangle" },
  ...steps,
];

describe("analyzeActivity", () => {
  it("allows stopping an active animation", () => {
    expect(codes(pair([
      { action: "animate", target: "a", properties: { x: 100 }, duration: 4 },
      { action: "stop", target: "a", properties: ["x"], start: "1" },
    ]))).toEqual([]);
  });

  it("rejects stopping an animation that has already ended", () => {
    expect(codes(pair([
      { action: "animate", target: "a", properties: { x: 100 }, duration: 1 },
      { action: "stop", target: "a", properties: ["x"], start: "2" },
    ]))).toEqual(["E_STOP_NOTHING"]);
  });

  it("rejects stopping when no mechanism owns the key", () => {
    expect(codes(pair([
      { action: "stop", target: "a", properties: ["x"] },
    ]))).toEqual(["E_STOP_NOTHING"]);
  });

  it("rejects stopping a bound key", () => {
    expect(codes(pair([
      { action: "bind", target: "a", properties: { x: "b.x" } },
      { action: "stop", target: "a", properties: ["x"] },
    ]))).toEqual(["E_STOP_ON_BIND"]);
  });

  it("allows unbinding a bound key", () => {
    expect(codes(pair([
      { action: "bind", target: "a", properties: { x: "b.x" } },
      { action: "unbind", target: "a", properties: ["x"] },
    ]))).toEqual([]);
  });

  it("rejects unbinding an animated key", () => {
    expect(codes(pair([
      { action: "animate", target: "a", properties: { x: 100 }, duration: 4 },
      { action: "unbind", target: "a", properties: ["x"], start: "1" },
    ]))).toEqual(["E_UNBIND_ON_ANIMATE"]);
  });

  it("rejects unbinding when no mechanism owns a key", () => {
    expect(codes(pair([
      { action: "unbind", target: "a", properties: ["x"] },
    ]))).toEqual(["E_UNBIND_NOTHING"]);
  });

  it("resolves equivalent property names through writes", () => {
    expect(codes(pair([
      { action: "animate", target: "a", properties: { pos: "b.center" }, duration: 4 },
      { action: "stop", target: "a", properties: ["x"], start: "1" },
    ]))).toEqual([]);
  });

  it("lets set take ownership from an animation", () => {
    expect(codes(pair([
      { action: "animate", target: "a", properties: { x: 100 }, duration: 4 },
      { action: "set", target: "a", properties: { x: 0 }, start: "1" },
      { action: "stop", target: "a", properties: ["x"], start: "2" },
    ]))).toEqual(["E_STOP_NOTHING"]);
  });

  it("lets a later animation take ownership from the previous animation", () => {
    expect(codes(pair([
      { action: "animate", target: "a", properties: { x: 100 }, duration: 4 },
      { action: "animate", target: "a", properties: { x: 0 }, duration: 4, start: "1" },
      { action: "stop", target: "a", properties: ["x"], start: "2" },
    ]))).toEqual([]);
  });

  it("tracks effects under their pseudo keys", () => {
    expect(codes(pair([
      { action: "animate", target: "a", properties: { reveal: true } },
      { action: "stop", target: "a", properties: ["reveal"], start: "0.2" },
    ]))).toEqual([]);
  });

  it("reports a bind when stop has no key list and no animation", () => {
    expect(codes(pair([
      { action: "bind", target: "a", properties: { x: "b.x" } },
      { action: "stop", target: "a" },
    ]))).toEqual(["E_STOP_ON_BIND"]);
  });

  it("stops all active animations when no key list is given", () => {
    expect(codes(pair([
      { action: "animate", target: "a", properties: { x: 100 }, duration: 4 },
      { action: "stop", target: "a", start: "1" },
    ]))).toEqual([]);
  });
});
