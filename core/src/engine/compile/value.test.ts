import { describe, expect, it } from "vitest";
import { DiagnosticCollector } from "@/lang/diagnostics";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createScope } from "@/engine/analyze/scope";
import { compileValue, CUSTOM_COMPILERS } from "@/engine/compile/value";
import { createTestEnv } from "@/model/ports";
import { RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import { createSceneRoot } from "@/model/classes/sceneRoot";
import { World } from "@/model/world";
import type { PropSpec } from "@/model/values";
import type { JsonValue } from "@/lang/types";

function spec(kind: PropSpec["kind"], extras: Partial<PropSpec> = {}): PropSpec {
  return { kind, writes: [], mode: "rw", animatable: false, order: 0, ...extras, get: () => 0 };
}

function setup() {
  const env = createTestEnv();
  const world = new World(createSceneRoot(800, 600, env));
  const a = RECTANGLE_DEF.create("a", env);
  a.setState("height", 50);
  a.setState("width", 100);
  world.add(a);
  const scope = createScope(createDefaultCatalog(), new Map([["a", "rectangle"]]));
  const d = new DiagnosticCollector();
  const ctx = { scope, d, where: { field: "properties.value" } };
  return { world, ctx };
}

function compile(kind: PropSpec["kind"], raw: JsonValue, extras: Partial<PropSpec> = {}) {
  const { ctx, world } = setup();
  const result = compileValue(spec(kind, extras), raw, ctx);
  return { result, diagnostics: ctx.d.items, world };
}

describe("compileValue", () => {
  it("compiles numeric constants and checks bounds and types", () => {
    expect(compile("number", 100).result?.value(compile("number", 100).world)).toBe(100);
    expect(compile("number", -1, { min: 0 }).diagnostics[0]?.code).toBe("E_VALUE_RANGE");
    expect(compile("number", "x").diagnostics[0]?.code).toBe("E_EXPR_SYNTAX");
    expect(compile("number", true).diagnostics[0]?.code).toBe("E_VALUE_TYPE");
    expect(compile("number", 0, { min: 0, minExclusive: true }).diagnostics[0]?.code).toBe("E_VALUE_RANGE");
    expect(compile("number", 0.5, { min: 0, minExclusive: true }).diagnostics).toEqual([]);
  });

  it("compiles numeric expressions with reads and enforces scalar type", () => {
    const result = compile("number", "a.height / 2");
    expect(result.result?.value(result.world)).toBe(25);
    expect(result.result?.reads).toEqual(["a"]);
    expect(compile("number", "a.center").diagnostics[0]?.code).toBe("E_EXPR_TYPE_MISMATCH");
  });

  it("compiles point expressions and point literals", () => {
    const pointExpr = compile("point", "scene.center");
    expect(pointExpr.result?.value(pointExpr.world)).toEqual({ x: 400, y: 300 });
    expect(compile("point", "a.width").diagnostics[0]?.code).toBe("E_EXPR_TYPE_MISMATCH");
    const pointObject = compile("point", { x: 10, y: "a.width" });
    expect(pointObject.result?.value(pointObject.world)).toEqual({ x: 10, y: 100 });
    const invalidPoints: JsonValue[] = [{ x: 1 }, { x: 1, y: 2, z: 3 }, [1, 2]];
    for (const raw of invalidPoints) {
      expect(compile("point", raw).diagnostics[0]?.code).toBe("E_VALUE_TYPE");
    }
  });

  it("compiles colors and reports invalid colors", () => {
    expect(compile("color", "#f00").result?.value(setup().world)).toBe("#ff0000");
    expect(compile("color", "blue").result?.value(setup().world)).toBe("#0000ff");
    expect(compile("color", 65280).result?.value(setup().world)).toBe("#00ff00");
    expect(compile("color", "nope").diagnostics[0]?.code).toBe("E_COLOR_INVALID");
  });

  it("validates string, boolean and enum literals", () => {
    expect(compile("string", "Hi").result?.value(setup().world)).toBe("Hi");
    expect(compile("string", 3).diagnostics[0]?.code).toBe("E_VALUE_TYPE");
    expect(compile("boolean", true).result?.value(setup().world)).toBe(true);
    expect(compile("enum", "pos", { values: ["center", "pos"] }).diagnostics).toEqual([]);
    expect(compile("enum", "left", { values: ["center", "pos"] }).diagnostics[0]?.code).toBe("E_VALUE_RANGE");
    expect(compile("enum", 1, { values: ["center", "pos"] }).diagnostics[0]?.code).toBe("E_VALUE_TYPE");
  });

  it("validates point lists and copies their points", () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    const result = compile("pointList", points);
    expect(result.result?.value(result.world)).toEqual(points);
    expect(result.result?.reads).toEqual([]);
    expect(compile("pointList", [[0, 0]]).diagnostics[0]?.code).toBe("E_VALUE_TYPE");
    expect(compile("pointList", [{ x: "a", y: 0 }]).diagnostics[0]?.code).toBe("E_VALUE_TYPE");
    expect(compile("pointList", points, { minItems: 3 }).diagnostics[0]?.code).toBe("E_VALUE_RANGE");
  });

  it("rejects unregistered custom compilers and unsupported kinds", () => {
    expect(compile("number", 1, { customKind: "x.y" }).diagnostics[0]?.message).toBe("custom compiler not registered");
    expect(compile("objectRef", "a").diagnostics[0]?.message).toBe("not supported yet");
    expect(Object.keys(CUSTOM_COMPILERS).sort()).toEqual(["scene.focusOn", "scene.view", "scene.zoom"]);
  });
});
