import { describe, expect, it } from "vitest";
import { DiagnosticCollector } from "@/lang/diagnostics";
import { compileSteps } from "@/engine/compile/steps";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import type { Step } from "@/lang/types";

function compile(steps: readonly Step[]) {
  const d = new DiagnosticCollector();
  const result = compileSteps(steps, new Map([["a", "rectangle"], ["b", "rectangle"]]), createDefaultCatalog(), d);
  return { drafts: result, diagnostics: d.items };
}

function errors(result: ReturnType<typeof compile>): string[] {
  return result.diagnostics.filter(({ severity }) => severity === "error").map(({ code }) => code);
}

describe("compileSteps", () => {
  it("compiles animate defaults and keeps its duration as explicit", () => {
    const [draft] = compile([{ action: "animate", target: "a", properties: { x: 100 }, duration: 1 }]).drafts;
    expect(draft).toMatchObject({
      action: "animate",
      target: "a",
      ease: "linear",
      repeat: 1,
      repeatMode: "restart",
      explicitDuration: 1,
    });
  });

  it("requires duration for interpolated properties", () => {
    expect(errors(compile([{ action: "animate", target: "a", properties: { x: 100 } }]))).toEqual(["E_DURATION_MISSING"]);
  });

  it("uses effect default duration and ease when animating effects only", () => {
    const result = compile([{ action: "animate", target: "a", properties: { reveal: true } }]);
    expect(result.drafts[0]).toMatchObject({ action: "animate", effectDefaultDuration: 0.5, ease: "cubicOut" });
    expect(result.diagnostics).toEqual([]);
  });

  it("uses linear ease when properties are interpolated alongside effects", () => {
    const result = compile([{ action: "animate", target: "a", properties: { x: 100, reveal: true }, duration: 2 }]);
    expect(result.drafts[0]).toMatchObject({ action: "animate", ease: "linear", explicitDuration: 2 });
  });

  it("reports unknown targets and compiles binds", () => {
    expect(errors(compile([{ action: "set", target: "zzz", properties: { x: 1 } }]))).toEqual(["E_OBJECT_UNKNOWN"]);
    const result = compile([{ action: "bind", target: "a", properties: { x: "b.x" } }]);
    expect(result.drafts[0]).toMatchObject({ action: "bind", entries: [{ name: "x", reads: ["b"] }] });
  });

  it("compiles stop and unbind keys and validates names", () => {
    expect(compile([{ action: "stop", target: "a", properties: ["x"] }]).drafts[0]).toMatchObject({ action: "stop", keys: ["x"] });
    expect(compile([{ action: "stop", target: "a" }]).drafts[0]).toMatchObject({ action: "stop", keys: null });
    expect(compile([{ action: "unbind", target: "a", properties: ["reveal"] }]).drafts[0]).toMatchObject({ action: "unbind", keys: ["reveal"] });
    expect(errors(compile([{ action: "stop", target: "a", properties: ["nope"] }]))).toEqual(["E_PROPERTY_UNKNOWN"]);
  });

  it("parses starts, uses the default, and copies names", () => {
    const result = compile([
      { action: "set", target: "a", name: "label", start: "<2", properties: { x: 1 } },
      { action: "set", target: "a", properties: { y: 2 } },
    ]);
    expect(result.drafts[0]).toMatchObject({ name: "label", startSpec: { kind: "prevStart", offset: 2 } });
    expect(result.drafts[1]?.startSpec).toEqual({ kind: "prevEnd", offset: 0 });
  });

  it("ignores creates and rejects actions not implemented yet", () => {
    const result = compile([
      { action: "create", target: "a", type: "rectangle" },
      { action: "travel", target: "a", along: "b", duration: 1 },
    ]);
    expect(result.drafts).toEqual([]);
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: "E_ACTION_UNKNOWN", stepIndex: 1 }));
  });
});
