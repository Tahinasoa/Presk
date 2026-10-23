import { describe, expect, it } from "vitest";
import { DiagnosticCollector } from "@/lang/diagnostics";
import { createScope } from "@/engine/analyze/scope";
import { compileProperties } from "@/engine/compile/properties";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import { RAY_DEF } from "@/model/classes/rayLineObject";
import { SCENE_DEF, createSceneRoot } from "@/model/classes/sceneRoot";
import { createTestEnv } from "@/model/ports";
import type { ViewTarget } from "@/model/values";
import { World } from "@/model/world";
import type { PropertiesObject } from "@/lang/types";

function setup() {
  const env = createTestEnv();
  const world = new World(createSceneRoot(1600, 900, env));
  const earth = RECTANGLE_DEF.create("earth", env);
  earth.setState("x", 700);
  earth.setState("y", 400);
  earth.setState("width", 200);
  earth.setState("height", 100);
  world.add(earth);
  world.add(RAY_DEF.create("r", env));

  const scope = createScope(
    createDefaultCatalog(),
    new Map([["earth", "rectangle"], ["r", "ray"]]),
  );
  return { world, scope };
}

function compile(raw: PropertiesObject, mode: "set" | "bind" = "set") {
  const { scope } = setup();
  const d = new DiagnosticCollector();
  const entries = compileProperties(raw, mode, SCENE_DEF, {
    scope,
    d,
    stepIndex: 0,
  });
  return { entries, diagnostics: d.items };
}

function viewTarget(raw: PropertiesObject, mode: "set" | "bind" = "set") {
  const result = compile(raw, mode);
  const { world } = setup();
  const entry = result.entries?.[0];
  return {
    value: entry?.kind === "prop" ? entry.value(world) as ViewTarget : undefined,
    result,
    world,
  };
}

function codes(result: ReturnType<typeof compile>): string[] {
  return result.diagnostics.filter(({ severity }) => severity === "error").map(({ code }) => code);
}

describe("scene view compilation", () => {
  it("compiles zoom from the current scene center", () => {
    expect(viewTarget({ zoom: 2 }).value).toEqual({ cx: 800, cy: 450, zoom: 2 });
  });

  it("reads omitted zoom fields from the current scene state at evaluation time", () => {
    const { result, world } = viewTarget({ zoom: 2 });
    world.root.writeProp("view", { cx: 310, cy: 205, zoom: 3 });
    const entry = result.entries?.[0];

    expect(entry?.kind === "prop" ? entry.value(world) : undefined)
      .toEqual({ cx: 310, cy: 205, zoom: 2 });
  });

  it("rejects non-positive constant zoom values", () => {
    expect(codes(compile({ zoom: 0 }))).toEqual(["E_VIEW_RANGE"]);
    expect(codes(compile({ zoom: -1 }))).toEqual(["E_VIEW_RANGE"]);
  });

  it("evaluates zoom expressions against the current world and rejects non-positive results", () => {
    const { value, world } = viewTarget({ zoom: "earth.width / 100" });
    expect(value).toEqual({ cx: 800, cy: 450, zoom: 2 });

    world.get("earth")?.setState("width", 0);
    const entry = compile({ zoom: "earth.width / 100" }).entries?.[0];
    if (!entry || entry.kind !== "prop") throw new Error("Expected a compiled scene property");
    expect(() => entry.value(world)).toThrow("E_VIEW_RANGE");
  });

  it("fits an explicit view region", () => {
    expect(viewTarget({ view: { x: 400, y: 200, width: 800, height: 450 } }).value)
      .toEqual({ cx: 800, cy: 425, zoom: 2 });
  });

  it("uses the scene ratio when only width is supplied", () => {
    expect(viewTarget({ view: { width: 800 } }).value).toEqual({ cx: 800, cy: 450, zoom: 2 });
  });

  it("reads omitted region fields from the current scene state at evaluation time", () => {
    const { result, world } = viewTarget({ view: { x: 100 } });
    world.root.writeProp("zoom", { cx: 800, cy: 450, zoom: 2 });
    const entry = result.entries?.[0];

    expect(entry?.kind === "prop" ? entry.value(world) : undefined)
      .toEqual({ cx: 500, cy: 450, zoom: 2 });
  });

  it("validates view region dimensions and keys", () => {
    expect(codes(compile({ view: { width: 0 } }))).toEqual(["E_VIEW_RANGE"]);
    expect(codes(compile({ view: { foo: 1 } }))).toEqual(["E_VALUE_TYPE"]);
  });

  it("focuses the view on a bounded object", () => {
    expect(viewTarget({ focusOn: "earth" }).value).toEqual({ cx: 800, cy: 450, zoom: 8 });
  });

  it("expands focus bounds by the supplied margin", () => {
    const { value } = viewTarget({ focusOn: "earth", focusMargin: 80 });
    expect(value?.cx).toBe(800);
    expect(value?.cy).toBe(450);
    expect(value?.zoom).toBeCloseTo(3.4615, 3);
  });

  it("focuses on the scene or unions scene and object bounds", () => {
    expect(viewTarget({ focusOn: "scene" }).value).toEqual({ cx: 800, cy: 450, zoom: 1 });
    expect(viewTarget({ focusOn: ["earth", "scene"] }).value).toEqual({ cx: 800, cy: 450, zoom: 1 });
  });

  it("validates focus targets and rejects unbounded objects", () => {
    expect(codes(compile({ focusOn: "zzz" }))).toEqual(["E_OBJECT_UNKNOWN"]);
    expect(codes(compile({ focusOn: "r" }))).toEqual(["E_VIEW_FOCUS_UNBOUNDED"]);
  });

  it("requires focusOn when focusMargin is given", () => {
    expect(codes(compile({ focusMargin: 10 }))).toEqual(["E_VIEW_MARGIN_WITHOUT_FOCUS"]);
    expect(codes(compile({ focusOn: "earth", focusMargin: "10" }))).toEqual(["E_VALUE_TYPE"]);
    expect(codes(compile({ focusOn: "earth", focusMargin: Number.POSITIVE_INFINITY }))).toEqual(["E_VALUE_TYPE"]);
  });

  it("rejects scene properties outside the viewport contract", () => {
    expect(codes(compile({ x: 1 }))).toEqual(["E_SCENE_PROPERTY"]);
    expect(codes(compile({ opacity: 1 }))).toEqual(["E_SCENE_PROPERTY"]);
  });

  it("allows focusOn to be bound", () => {
    expect(compile({ focusOn: "earth" }, "bind").entries).toHaveLength(1);
    expect(codes(compile({ focusOn: "earth" }, "bind"))).toEqual([]);
  });
});
