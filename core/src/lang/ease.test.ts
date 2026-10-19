import { describe, expect, it } from "vitest";
import { easings } from "@/timer/easing/easing";
import { EASE_NAMES, isEaseName } from "./ease";

describe("ease names", () => {
  it("matches the timer easing library", () => {
    expect(new Set(EASE_NAMES)).toEqual(new Set(Object.keys(easings)));
    expect(EASE_NAMES).toHaveLength(31);
  });

  it("has the expected endpoint values", () => {
    for (const name of EASE_NAMES) {
      const easing = easings[name as keyof typeof easings];
      const isSpecial = /^(elastic|back|bounce)/.test(name);

      if (!isSpecial || name.endsWith("In") || name.endsWith("InOut")) {
        expect(easing(0), `${name}(0)`).toBeCloseTo(0, 6);
      }
      if (!isSpecial || name.endsWith("Out") || name.endsWith("InOut")) {
        expect(easing(1), `${name}(1)`).toBeCloseTo(1, 6);
      }
    }
  });

  it("recognizes exact easing names only", () => {
    expect(isEaseName("cubicInOut")).toBe(true);
    expect(isEaseName("CubicInOut")).toBe(false);
    expect(isEaseName("cubic")).toBe(false);
    expect(isEaseName("")).toBe(false);
    expect(isEaseName(3)).toBe(false);
    expect(isEaseName("alternate")).toBe(false);
  });
});
