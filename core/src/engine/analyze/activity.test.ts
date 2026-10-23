import { describe, expect, it } from "vitest";
import { tryCompileProgram } from "@/engine/compileProgram";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createTestEnv } from "@/model/ports";

const catalog = createDefaultCatalog();
const objectEnv = createTestEnv();

function codes(steps: unknown[]): string[] {
  const result = tryCompileProgram(
    { version: "1.0", scene: { width: 800, height: 600 }, steps },
    { catalog, objectEnv },
  );
  return result.diagnostics.map(({ code }) => code);
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

  it("rejects stopping only x on an active travel", () => {
    expect(codes(pair([
      { action: "travel", target: "a", along: "b", duration: 4, orient: true },
      { action: "stop", target: "a", properties: ["x"], start: "1" },
    ]))).toEqual(["E_STOP_PARTIAL_TRAVEL"]);
  });

  it("allows stopping both position keys through pos", () => {
    expect(codes(pair([
      { action: "travel", target: "a", along: "b", duration: 4 },
      { action: "stop", target: "a", properties: ["pos"], start: "1" },
    ]))).toEqual([]);
  });

  it("allows animation to take ownership of x during a travel", () => {
    expect(codes(pair([
      { action: "travel", target: "a", along: "b", duration: 4 },
      { action: "animate", target: "a", properties: { x: 0 }, duration: 1, start: "1" },
    ]))).toEqual([]);
  });
});
