import { describe, it, expect } from "vitest";
import KText from "./ktext";

describe("KText", () => {
  it("initializes with text and default margins (30)", () => {
    const textObj = new KText({ id: "t1", x: 0, y: 0, text: "Hello" });
    expect(textObj.text).toBe("Hello");
    expect(textObj.verticalMargins).toBe(30);
    expect(textObj.horizontalMargins).toBe(30);
    expect(textObj.margins).toBe(30);
  });

  it("supports setting verticalMargins, horizontalMargins, and margins independently", () => {
    const textObj = new KText({ id: "t1", x: 0, y: 0, text: "Hello" });

    textObj.verticalMargins = 10;
    expect(textObj.verticalMargins).toBe(10);
    expect(textObj.horizontalMargins).toBe(30);

    textObj.horizontalMargins = 20;
    expect(textObj.horizontalMargins).toBe(20);

    textObj.margins = 15;
    expect(textObj.verticalMargins).toBe(15);
    expect(textObj.horizontalMargins).toBe(15);
    expect(textObj.margins).toBe(15);
  });

  it("initializes with explicit margins from parameters", () => {
    const t1 = new KText({ id: "t1", x: 0, y: 0, text: "A", verticalMargins: 5, horizontalMargins: 10 });
    expect(t1.verticalMargins).toBe(5);
    expect(t1.horizontalMargins).toBe(10);

    const t2 = new KText({ id: "t2", x: 0, y: 0, text: "B", margins: 12 });
    expect(t2.verticalMargins).toBe(12);
    expect(t2.horizontalMargins).toBe(12);
    expect(t2.margins).toBe(12);
  });

  it("supports property animators for text and margins via setNow", () => {
    const textObj = new KText({ id: "t1", x: 0, y: 0, text: "Hello", verticalMargins: 0, horizontalMargins: 0 });

    textObj.setNow({ text: "World", verticalMargins: 8, horizontalMargins: 12 });
    expect(textObj.text).toBe("World");
    expect(textObj.verticalMargins).toBe(8);
    expect(textObj.horizontalMargins).toBe(12);

    textObj.setNow({ margins: 25 });
    expect(textObj.verticalMargins).toBe(25);
    expect(textObj.horizontalMargins).toBe(25);
  });

  it("initializes and syncs frame rectangle properly", () => {
    const t = new KText({
      id: "t1",
      x: 100,
      y: 200,
      width: 50,
      height: 20,
      text: "Test",
      verticalMargins: 10,
      horizontalMargins: 15,
      frame: true,
    });

    expect(t.frame.visible).toBe(true);
    expect(t.frame.x).toBe(100);
    expect(t.frame.y).toBe(200);
    expect(t.frame.width).toBe(50 + 15 * 2);
    expect(t.frame.height).toBe(20 + 10 * 2);

    // Update KText position and size
    t.x = 150;
    t.width = 60;
    expect(t.frame.x).toBe(150);
    expect(t.frame.width).toBe(60 + 15 * 2);
  });

  it("supports frame property animator with boolean and object options", () => {
    const t = new KText({
      id: "t1",
      x: 0,
      y: 0,
      text: "Test",
      frame: false,
    });

    expect(t.frame.visible).toBe(false);

    // Enable frame via boolean
    t.setNow({ frame: true });
    expect(t.frame.visible).toBe(true);

    // Configure frame via object with optional fill / stroke
    t.setNow({ frame: { fill: 0xff0000 } });
    expect(t.frame.visible).toBe(true);
    expect(t.frame.fill).toBe(0xff0000);
    expect(t.frame.stroke).toBeUndefined();

    t.setNow({ frame: { stroke: 0x00ff00, strokeWidth: 3 } });
    expect(t.frame.stroke).toBe(0x00ff00);
    expect(t.frame.strokeWidth).toBe(3);
  });

  it("includes margins in boundingBox, left, right, top, bottom", () => {
    const t = new KText({
      id: "t1",
      x: 100,
      y: 200,
      width: 100,
      height: 50,
      text: "Test",
      verticalMargins: 10,
      horizontalMargins: 20,
      anchorX: 0.5,
      anchorY: 0.5,
    });

    expect(t.left).toBe(30);
    expect(t.right).toBe(170);
    expect(t.top).toBe(165);
    expect(t.bottom).toBe(235);
    expect(t.boundingBox.topLeft).toEqual({ x: 30, y: 165 });
  });
});
