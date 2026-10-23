import { describe, expect, it } from "vitest";
import { makeTestObject } from "@/model/testing";
import { REVEAL_FADE, revealWithDraw } from "@/model/effects";

describe("reveal effects", () => {
  it("fades presence and clamps progress", () => {
    const object = makeTestObject("object", { presence: 0, drawProgress: 1 });
    REVEAL_FADE.apply(object, "default", 0.5);
    expect(object.getNumber("presence")).toBe(0.5);
    REVEAL_FADE.apply(object, "default", -1);
    expect(object.getNumber("presence")).toBe(0);
    REVEAL_FADE.apply(object, "default", 2);
    expect(object.getNumber("presence")).toBe(1);
    expect(() => REVEAL_FADE.apply(object, "draw", 1)).toThrow("Presk internal:");
  });

  it("supports the draw variant and preserves draw progress in the default variant", () => {
    const object = makeTestObject("object", { presence: 0, drawProgress: 1 });
    const effect = revealWithDraw();
    effect.apply(object, "draw", 0);
    expect(object.getNumber("presence")).toBe(0);
    expect(object.getNumber("drawProgress")).toBe(0);
    effect.apply(object, "draw", 0.3);
    expect(object.getNumber("presence")).toBe(1);
    expect(object.getNumber("drawProgress")).toBe(0.3);
    effect.apply(object, "default", 0.4);
    expect(object.getNumber("presence")).toBe(0.4);
    expect(object.getNumber("drawProgress")).toBe(0.3);
  });

  it("publishes the supported variants", () => {
    expect(REVEAL_FADE.variants).toEqual(["default"]);
    expect(revealWithDraw().variants).toEqual(["default", "draw"]);
  });
});
