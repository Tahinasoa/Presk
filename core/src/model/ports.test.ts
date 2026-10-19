import { describe, expect, it } from "vitest";
import { createTestEnv, FakeImageInfo, FakeTextMeasurer } from "@/model/ports";

describe("model test ports", () => {
  it("measures text deterministically", () => {
    const measurer = new FakeTextMeasurer();
    const style = { fontSize: 10, fontFamily: "x", fontWeight: "bold" as const };
    expect(measurer.measure("Hello", style)).toEqual({ width: 30, height: 12 });
    expect(measurer.measure("", style)).toEqual({ width: 0, height: 12 });
  });

  it("provides configured image sizes and returns undefined for unknown URLs", () => {
    const images = new FakeImageInfo({ "a.png": { width: 4, height: 3 } });
    expect(images.sizeOf("a.png")).toEqual({ width: 4, height: 3 });
    expect(images.sizeOf("zzz")).toBeUndefined();
  });

  it("creates a default test environment", () => {
    expect(createTestEnv().measurer).toBeInstanceOf(FakeTextMeasurer);
  });
});
