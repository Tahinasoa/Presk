import { describe, expect, it } from "vitest";
import { compileProgram } from "@/engine/compileProgram";
import { Simulation } from "@/engine/sim/simulation";
import { COLOR_STRING_RE } from "@/geom/color";
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

function fillAt(doc: unknown, time: number, id = "a", prop = "fill"): unknown {
  return run(doc, time).world.require(id).readProp(prop);
}

describe("colour golden documents", () => {
  it("C1 animates a colour from the default to a target", () => {
    const doc = document([
      rectangle("a", {}),
      { action: "animate", target: "a", properties: { fill: "#ff0000" }, duration: 1, ease: "linear" },
    ]);
    expect(fillAt(doc, 0)).toBe("#9c9c9c");
    expect(fillAt(doc, 0.5)).toBe("#ce4e4e");
    expect(fillAt(doc, 1)).toBe("#ff0000");
  });

  it("C2 keeps an explicit alpha", () => {
    expect(fillAt(document([rectangle("a", { fill: "#ff000080" })]), 0)).toBe("#ff000080");
  });

  it("C3 interpolates the alpha channel", () => {
    const doc = document([
      rectangle("a", {}),
      { action: "animate", target: "a", properties: { fill: "#ff000000" }, duration: 1, ease: "linear" },
    ]);
    expect(fillAt(doc, 0.5)).toBe("#ce4e4e80");
  });

  it("C4 rejects an invalid colour", () => {
    const error = compileError(document([rectangle("a", { fill: "nope" })]));
    expect(error.diagnostics.some((d) => d.code === "E_COLOR_INVALID")).toBe(true);
  });

  it("C5 normalises a colour written by set", () => {
    const doc = document([
      rectangle("a", { fill: "blue" }),
      { action: "set", target: "a", properties: { fill: "#F00" }, start: 1 },
    ]);
    expect(fillAt(doc, 1)).toBe("#ff0000");
  });

  it("C6 normalises a named text colour", () => {
    const doc = document([{ action: "create", target: "t", type: "text", properties: { text: "x", color: "red" } }]);
    expect(fillAt(doc, 0, "t", "color")).toBe("#ff0000");
  });

  it("C7 accepts a JSON integer colour", () => {
    expect(fillAt(document([rectangle("a", { fill: 65280 })]), 0)).toBe("#00ff00");
  });

  it("C8 never produces an invalid colour string while animating", () => {
    const doc = document([
      rectangle("a", { fill: "#102030" }),
      { action: "animate", target: "a", properties: { fill: "#ff8040c0" }, duration: 1, ease: "linear" },
    ]);
    for (const t of [0.25, 0.5, 0.75]) {
      const value = fillAt(doc, t);
      expect(typeof value).toBe("string");
      expect(String(value)).not.toMatch(/NaN|undefined/);
      expect(COLOR_STRING_RE.test(value as string)).toBe(true);
    }
  });
});
