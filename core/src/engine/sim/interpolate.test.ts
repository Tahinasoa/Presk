import { describe, expect, it } from "vitest";
import { interpolate } from "@/engine/sim/interpolate";

describe("interpolate", () => {
  it("interpolates numbers", () => {
    expect(interpolate("number", 0, 10, 0.5)).toBe(5);
  });

  it("interpolates points", () => {
    expect(interpolate("point", { x: 0, y: 0 }, { x: 10, y: 20 }, 0.5)).toEqual({ x: 5, y: 10 });
  });

  it("interpolates colors", () => {
    expect(interpolate("color", 0x000000, 0xffffff, 0.5)).toBe(0x808080);
  });

  it("does not clamp numeric progress", () => {
    expect(interpolate("number", 0, 10, 1.5)).toBe(15);
  });

  it("rejects unsupported property kinds", () => {
    expect(() => interpolate("string", "a", "b", 0.5)).toThrow();
  });
});
