import { describe, expect, it } from "vitest";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import { createScope } from "@/engine/analyze/scope";
import type { Program } from "@/engine/program";

describe("createScope", () => {
  const catalog = createDefaultCatalog();

  it("returns declared object types and the reserved scene type", () => {
    const scope = createScope(catalog, new Map([["a", "rectangle"]]));

    expect(scope.typeOf("a")).toBe("rectangle");
    expect(scope.typeOf("scene")).toBe("scene");
    expect(scope.typeOf("zzz")).toBeUndefined();
  });

  it("identifies forward references when a set is provided", () => {
    const scope = createScope(catalog, new Map(), new Set(["b"]));

    expect(scope.isForward?.("b")).toBe(true);
    expect(scope.isForward?.("c")).toBe(false);
  });
});

const minimalProgram = {
  scene: { width: 1920, height: 1080 },
  init: [],
  actions: [],
  duration: 0,
  warnings: [],
} satisfies Program;

it("accepts a minimal Program", () => {
  expect(minimalProgram.duration).toBe(0);
});
