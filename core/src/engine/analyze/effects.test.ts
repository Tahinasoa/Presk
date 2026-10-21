import { describe, expect, it } from "vitest";
import { planForTest } from "@/engine/testing";
import { revealWithDraw } from "@/model/effects";
import { RectangleObject, RECTANGLE_DEF } from "@/model/classes/rectangleObject";
import { createDefaultCatalog } from "@/model/defaultCatalog";
import type { Catalog } from "@/model/catalog";
import type { ClassDef } from "@/model/values";
import type { CompiledEffect } from "@/engine/program";

const DRAWABLE_DEF: ClassDef = {
  ...RECTANGLE_DEF,
  type: "drawable",
  effects: { reveal: revealWithDraw() },
  create: (id, env) => new RectangleObject(id, DRAWABLE_DEF, env, { drawProgress: 1 }),
};

const cat: Catalog = createDefaultCatalog();
cat.register(DRAWABLE_DEF);

function falseVariants(result: ReturnType<typeof planForTest>, target = "a"): string[] {
  return result.actions
    .flatMap((action) => {
      if ((action.action !== "set" && action.action !== "animate") || action.target !== target) return [];
      return action.entries;
    })
    .filter((entry): entry is CompiledEffect => entry.kind === "effect" && !entry.on)
    .map((entry) => entry.variant);
}

describe("resolveEffectVariants through planForTest", () => {
  it("resolves a standalone false effect to default", () => {
    const result = planForTest([
      { action: "create", target: "a", type: "rectangle" },
      { action: "set", target: "a", properties: { reveal: false } },
    ], undefined, cat);
    expect(result.diagnostics).toEqual([]);
    expect(falseVariants(result)).toEqual(["default"]);
  });

  it("reports draw as unknown for rectangle", () => {
    const result = planForTest([
      { action: "create", target: "a", type: "rectangle" },
      { action: "set", target: "a", properties: { reveal: "draw" } },
    ], undefined, cat);
    expect(result.diagnostics.map(({ code }) => code)).toContain("E_EFFECT_VALUE");
  });

  it("uses a draw variant declared at create as the inverse variant", () => {
    const result = planForTest([
      { action: "create", target: "a", type: "drawable", properties: { reveal: "draw" } },
      { action: "set", target: "a", properties: { reveal: false } },
    ], undefined, cat);
    expect(result.diagnostics).toEqual([]);
    expect(result.init[0]?.entries).toContainEqual(expect.objectContaining({ kind: "effect", variant: "draw", on: true }));
    expect(falseVariants(result)).toEqual(["draw"]);
  });

  it("keeps default after a true effect when inverting the default variant", () => {
    const result = planForTest([
      { action: "create", target: "a", type: "rectangle" },
      { action: "animate", target: "a", properties: { reveal: true } },
      { action: "animate", target: "a", properties: { reveal: false } },
    ], undefined, cat);
    expect(result.diagnostics).toEqual([]);
    expect(falseVariants(result)).toEqual(["default"]);
  });

  it("updates the last variant only when an effect is on", () => {
    const result = planForTest([
      { action: "create", target: "a", type: "drawable" },
      { action: "animate", target: "a", properties: { reveal: "draw" } },
      { action: "animate", target: "a", properties: { reveal: false } },
      { action: "animate", target: "a", properties: { reveal: true } },
      { action: "animate", target: "a", properties: { reveal: false } },
    ], undefined, cat);
    expect(result.diagnostics).toEqual([]);
    expect(falseVariants(result)).toEqual(["draw", "default"]);
  });

  it("resolves variants by start time rather than declaration order", () => {
    const result = planForTest([
      { action: "create", target: "a", type: "drawable" },
      { action: "animate", target: "a", start: "5", properties: { reveal: false } },
      { action: "animate", target: "a", start: "1", properties: { reveal: "draw" } },
    ], undefined, cat);
    expect(result.diagnostics).toEqual([]);
    expect(falseVariants(result)).toEqual(["draw"]);
  });

  it("keeps separate histories for different objects", () => {
    const result = planForTest([
      { action: "create", target: "a", type: "drawable" },
      { action: "create", target: "b", type: "drawable" },
      { action: "set", target: "a", properties: { reveal: "draw" } },
      { action: "set", target: "b", properties: { reveal: true } },
      { action: "set", target: "a", properties: { reveal: false } },
      { action: "set", target: "b", properties: { reveal: false } },
    ], undefined, cat);
    expect(result.diagnostics).toEqual([]);
    expect(falseVariants(result, "a")).toEqual(["draw"]);
    expect(falseVariants(result, "b")).toEqual(["default"]);
  });
});
