import { describe, expect, it } from "vitest";
import { interpolate } from "@/engine/sim/interpolate";

describe("interpolate", () => {
  it("interpolates numbers", () => {
    expect(interpolate("number", 0, 10, 0.5)).toBe(5);
  });

  it("interpolates points", () => {
    expect(interpolate("point", { x: 0, y: 0 }, { x: 10, y: 20 }, 0.5)).toEqual({ x: 5, y: 10 });
  });

  it("interpolates colors as canonical strings", () => {
    expect(interpolate("color", 0x000000, 0xffffff, 0.5)).toBe("#808080");
    expect(interpolate("color", "#ff0000", "#0000ff", 0.5)).toBe("#800080");
    expect(interpolate("color", 0x9c9c9c, "#ff0000", 0.5)).toBe("#ce4e4e");
    expect(interpolate("color", "#ff000000", "#ff0000ff", 0.5)).toBe("#ff000080");
    expect(interpolate("color", "#000000", "#ffffff", 1.5)).toBe("#ffffff");
  });

  it("rejects invalid colors", () => {
    expect(() => interpolate("color", "nope", "#ff0000", 0.5)).toThrow("Presk internal: invalid colour in interpolate");
  });

  it("interpolates view centers linearly and zoom geometrically", () => {
    expect(interpolate("view", { cx: 0, cy: 10, zoom: 1 }, { cx: 10, cy: 20, zoom: 4 }, 0.5))
      .toEqual({ cx: 5, cy: 15, zoom: 2 });
  });

  it("rejects non-positive view zoom interpolation endpoints", () => {
    expect(() => interpolate("view", { cx: 0, cy: 0, zoom: 0 }, { cx: 10, cy: 10, zoom: 2 }, 0.5))
      .toThrow();
    expect(() => interpolate("view", { cx: 0, cy: 0, zoom: 1 }, { cx: 10, cy: 10, zoom: -2 }, 0.5))
      .toThrow();
  });

  it("does not clamp numeric progress", () => {
    expect(interpolate("number", 0, 10, 1.5)).toBe(15);
  });

  it("rejects unsupported property kinds", () => {
    expect(() => interpolate("string", "a", "b", 0.5)).toThrow();
  });
});
