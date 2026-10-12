import { describe, it, expect } from "vitest";
import KLine from "./kline";

describe("KLine", () => {
  it("initializes properties correctly", () => {
    const line = new KLine({
      id: "l1",
      x: 10,
      y: 20,
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 50,
    });

    expect(line.id).toBe("l1");
    expect(line.x).toBe(10);
    expect(line.y).toBe(20);
    expect(line.startX).toBe(0);
    expect(line.startY).toBe(0);
    expect(line.endX).toBe(100);
    expect(line.endY).toBe(50);
  });

  it("allows updating properties", () => {
    const line = new KLine({
      id: "l1",
      x: 0,
      y: 0,
      startX: 0,
      startY: 0,
      endX: 50,
      endY: 50,
    });

    line.startX = 10;
    line.startY = 10;
    line.endX = 90;
    line.endY = 90;

    expect(line.startX).toBe(10);
    expect(line.startY).toBe(10);
    expect(line.endX).toBe(90);
    expect(line.endY).toBe(90);
  });
});
