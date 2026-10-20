import { describe, expect, it } from "vitest";
import { DiagnosticCollector } from "@/lang/diagnostics";
import { compileSteps } from "@/engine/compile/steps";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import type { ClassDef } from "@/model/values";
import type { Step } from "@/lang/types";

const objectTypes = new Map([
  ["a", "rectangle"],
  ["b", "rectangle"],
  ["orbit", "circle"],
  ["dot", "circle"],
  ["r", "rectangle"],
  ["ray1", "unboundedTest"],
  ["open1", "openTest"],
]);

function createCatalog() {
  const catalog = createDefaultCatalog();
  const unboundedDef: ClassDef = { ...RECTANGLE_DEF, type: "unboundedTest", family: "unbounded" };
  const openDef: ClassDef = {
    ...RECTANGLE_DEF,
    type: "openTest",
    paths: { main: { ...RECTANGLE_DEF.paths.main, closed: "never" } },
  };
  catalog.register(unboundedDef);
  catalog.register(openDef);
  return catalog;
}

function compile(steps: readonly Step[]) {
  const d = new DiagnosticCollector();
  const result = compileSteps(steps, objectTypes, createCatalog(), d);
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

  it("ignores creates and compiles a travel draft", () => {
    const result = compile([
      { action: "create", target: "dot", type: "circle" },
      { action: "travel", target: "dot", along: "orbit", duration: 4 },
    ]);
    expect(result.drafts[0]).toMatchObject({
      action: "travel",
      along: { object: "orbit", path: "main" },
      anchor: "pos",
      orient: null,
      ease: "linear",
      repeat: 1,
      repeatMode: "restart",
      fromT: 0,
      toT: 1,
      fromSpec: 0,
      explicitDuration: 4,
    });
    expect(result.diagnostics).toEqual([]);
  });

  it("parses an explicit path name", () => {
    const result = compile([{ action: "travel", target: "dot", along: "orbit.main", duration: 4 }]);
    expect(result.drafts[0]).toMatchObject({ along: { object: "orbit", path: "main" } });
    expect(result.diagnostics).toEqual([]);
  });

  it.each(["zzz", "orbit.foo"])("rejects invalid along value %s", (along) => {
    expect(errors(compile([{ action: "travel", target: "dot", along, duration: 4 }]))).toEqual(["E_TRAVEL_ALONG"]);
  });

  it("rejects unbounded paths before checking their path name", () => {
    expect(errors(compile([{ action: "travel", target: "dot", along: "ray1.missing", duration: 4 }]))).toEqual([
      "E_TRAVEL_INFINITE_PATH",
    ]);
  });

  it.each(["center", "topLeft"])("accepts rectangle anchor %s", (anchor) => {
    const result = compile([{ action: "travel", target: "r", along: "orbit", anchor, duration: 4 }]);
    expect(result.drafts[0]).toMatchObject({ anchor });
    expect(result.diagnostics).toEqual([]);
  });

  it.each([
    ["width", "r"],
    ["bogus", "r"],
    ["center", "dot"],
  ])("rejects anchor %s on %s", (anchor, target) => {
    expect(errors(compile([{ action: "travel", target, along: "orbit", anchor, duration: 4 }]))).toEqual([
      "E_TRAVEL_OPTION",
    ]);
  });

  it.each([
    [true, { offset: 0 }],
    [{ offset: 90 }, { offset: 90 }],
    [false, null],
    [undefined, null],
  ] as const)("compiles orient %s", (orient, expected) => {
    const result = compile([{
      action: "travel",
      target: "dot",
      along: "orbit",
      ...(orient === undefined ? {} : { orient }),
      duration: 4,
    }]);
    expect(result.drafts[0]).toMatchObject({ orient: expected });
    expect(result.diagnostics).toEqual([]);
  });

  it.each([
    [{ to: 1.5 }, "E_TRAVEL_RANGE"],
    [{ from: -0.1 }, "E_TRAVEL_RANGE"],
  ] as const)("rejects out-of-range travel on an open path", (range, code) => {
    expect(errors(compile([{
      action: "travel",
      target: "dot",
      along: "open1",
      duration: 4,
      ...range,
    }]))).toEqual([code]);
  });

  it("allows out-of-range values on a closed path", () => {
    const result = compile([{ action: "travel", target: "dot", along: "orbit", from: 5, duration: 4 }]);
    expect(result.diagnostics).toEqual([]);
    expect(result.drafts[0]).toMatchObject({ fromSpec: 5 });
  });

  it("preserves from current and explicit to", () => {
    const result = compile([{
      action: "travel",
      target: "dot",
      along: "orbit",
      from: "current",
      to: 0.75,
      duration: 4,
    }]);
    expect(result.drafts[0]).toMatchObject({ fromSpec: "current", toSpec: 0.75 });
    expect(result.diagnostics).toEqual([]);
  });

  it("preserves speed without an explicit duration", () => {
    const result = compile([{ action: "travel", target: "dot", along: "orbit", speed: 100 }]);
    expect(result.drafts[0]).toMatchObject({ speed: 100 });
    expect(result.drafts[0]).not.toHaveProperty("explicitDuration");
    expect(result.diagnostics).toEqual([]);
  });
});
