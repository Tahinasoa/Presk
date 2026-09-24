import { describe, it, expect } from "vitest";
import KScene from "@/primitives/kscene";
import KRectangle from "@/primitives/krectangle";
import { evaluateExpression } from "./expression";

describe("KScene getters via evaluateExpression", () => {
  it("evaluates scalar base properties and dimensions on the scene", () => {
    const scene = new KScene({
      id: "scene",
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      anchorX: 0.5,
      anchorY: 0.5,
      scale: 1,
      rotation: 0,
      opacity: 1,
    });

    expect(evaluateExpression("scene.x", scene)).toBe(0);
    expect(evaluateExpression("scene.y", scene)).toBe(0);
    expect(evaluateExpression("scene.width", scene)).toBe(1920);
    expect(evaluateExpression("scene.height", scene)).toBe(1080);
    expect(evaluateExpression("scene.anchorX", scene)).toBe(0.5);
    expect(evaluateExpression("scene.anchorY", scene)).toBe(0.5);
    expect(evaluateExpression("scene.scale", scene)).toBe(1);
    expect(evaluateExpression("scene.rotation", scene)).toBe(0);
    expect(evaluateExpression("scene.opacity", scene)).toBe(1);
  });

  it("evaluates scalar anchors on the scene (top, bottom, left, right)", () => {
    const scene = new KScene({
      id: "scene",
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      anchorX: 0.5,
      anchorY: 0.5,
    });

    expect(evaluateExpression("scene.left", scene)).toBe(-960);
    expect(evaluateExpression("scene.right", scene)).toBe(960);
    expect(evaluateExpression("scene.top", scene)).toBe(-540);
    expect(evaluateExpression("scene.bottom", scene)).toBe(540);
  });

  it("evaluates point anchors and components on the scene", () => {
    const scene = new KScene({
      id: "scene",
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      anchorX: 0.5,
      anchorY: 0.5,
    });

    expect(evaluateExpression("scene.pos", scene)).toEqual({ x: 0, y: 0 });
    expect(evaluateExpression("scene.center", scene)).toEqual({ x: 0, y: 0 });
    expect(evaluateExpression("scene.center.x", scene)).toBe(0);
    expect(evaluateExpression("scene.center.y", scene)).toBe(0);

    expect(evaluateExpression("scene.topLeft", scene)).toEqual({ x: -960, y: -540 });
    expect(evaluateExpression("scene.topLeft.x", scene)).toBe(-960);
    expect(evaluateExpression("scene.topLeft.y", scene)).toBe(-540);

    expect(evaluateExpression("scene.bottomRight", scene)).toEqual({ x: 960, y: 540 });
    expect(evaluateExpression("scene.bottomRight.x", scene)).toBe(960);
    expect(evaluateExpression("scene.bottomRight.y", scene)).toBe(540);
  });

  it("evaluates boundingBox on the scene and its nested properties", () => {
    const scene = new KScene({
      id: "scene",
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      anchorX: 0.5,
      anchorY: 0.5,
    });

    expect(evaluateExpression("scene.boundingBox.topLeft", scene)).toEqual({ x: -960, y: -540 });
    expect(evaluateExpression("scene.boundingBox.topLeft.x", scene)).toBe(-960);
    expect(evaluateExpression("scene.boundingBox.center.y", scene)).toBe(0);
  });

  it("supports cross-reference expressions between scene and children", () => {
    const scene = new KScene({
      id: "scene",
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
    });
    const child = new KRectangle({
      id: "child",
      x: 100,
      y: 200,
      width: 50,
      height: 50,
      anchorX: 0,
      anchorY: 0,
    });
    scene.add(child);

    expect(evaluateExpression("scene.width + child.x", scene)).toBe(2020);
    expect(evaluateExpression("scene.center.x + child.width", scene)).toBe(50);
  });
});
