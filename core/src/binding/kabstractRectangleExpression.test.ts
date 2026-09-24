import { describe, it, expect } from "vitest";
import KScene from "@/primitives/kscene";
import KRectangle from "@/primitives/krectangle";
import { evaluateExpression } from "./expression";

describe("KAbstractRectangle getters via evaluateExpression", () => {
  it("evaluates scalar base properties and scalar dimensions/anchors", () => {
    const scene = new KScene({ id: "scene", x: 0, y: 0, width: 1000, height: 1000 });
    const rect = new KRectangle({
      id: "box",
      x: 100,
      y: 200,
      width: 80,
      height: 40,
      anchorX: 0.5,
      anchorY: 0.5,
      scale: 1.5,
      rotation: 0,
      opacity: 0.8,
    });
    scene.add(rect);

    expect(evaluateExpression("box.x", scene)).toBe(100);
    expect(evaluateExpression("box.y", scene)).toBe(200);
    expect(evaluateExpression("box.width", scene)).toBe(80);
    expect(evaluateExpression("box.height", scene)).toBe(40);
    expect(evaluateExpression("box.anchorX", scene)).toBe(0.5);
    expect(evaluateExpression("box.anchorY", scene)).toBe(0.5);
    expect(evaluateExpression("box.scale", scene)).toBe(1.5);
    expect(evaluateExpression("box.rotation", scene)).toBe(0);
    expect(evaluateExpression("box.opacity", scene)).toBe(0.8);
  });

  it("evaluates scalar anchor getters (top, bottom, left, right)", () => {
    const scene = new KScene({ id: "scene", x: 0, y: 0, width: 1000, height: 1000 });
    const rect = new KRectangle({
      id: "box",
      x: 100,
      y: 200,
      width: 80,
      height: 40,
      anchorX: 0.5,
      anchorY: 0.5,
    });
    scene.add(rect);

    // width 80, height 40, anchor (0.5, 0.5) at (100, 200) -> left: 60, right: 140, top: 180, bottom: 220
    expect(evaluateExpression("box.left", scene)).toBe(60);
    expect(evaluateExpression("box.right", scene)).toBe(140);
    expect(evaluateExpression("box.top", scene)).toBe(180);
    expect(evaluateExpression("box.bottom", scene)).toBe(220);
  });

  it("evaluates all point anchor getters directly as objects", () => {
    const scene = new KScene({ id: "scene", x: 0, y: 0, width: 1000, height: 1000 });
    const rect = new KRectangle({
      id: "box",
      x: 100,
      y: 200,
      width: 80,
      height: 40,
      anchorX: 0.5,
      anchorY: 0.5,
    });
    scene.add(rect);

    expect(evaluateExpression("box.pos", scene)).toEqual({ x: 100, y: 200 });
    expect(evaluateExpression("box.topLeft", scene)).toEqual({ x: 60, y: 180 });
    expect(evaluateExpression("box.topCenter", scene)).toEqual({ x: 100, y: 180 });
    expect(evaluateExpression("box.topRight", scene)).toEqual({ x: 140, y: 180 });
    expect(evaluateExpression("box.leftCenter", scene)).toEqual({ x: 60, y: 200 });
    expect(evaluateExpression("box.center", scene)).toEqual({ x: 100, y: 200 });
    expect(evaluateExpression("box.rightCenter", scene)).toEqual({ x: 140, y: 200 });
    expect(evaluateExpression("box.bottomLeft", scene)).toEqual({ x: 60, y: 220 });
    expect(evaluateExpression("box.bottomCenter", scene)).toEqual({ x: 100, y: 220 });
    expect(evaluateExpression("box.bottomRight", scene)).toEqual({ x: 140, y: 220 });
  });

  it("evaluates point anchor component properties (.x / .y)", () => {
    const scene = new KScene({ id: "scene", x: 0, y: 0, width: 1000, height: 1000 });
    const rect = new KRectangle({
      id: "box",
      x: 100,
      y: 200,
      width: 80,
      height: 40,
      anchorX: 0.5,
      anchorY: 0.5,
    });
    scene.add(rect);

    expect(evaluateExpression("box.topLeft.x", scene)).toBe(60);
    expect(evaluateExpression("box.topLeft.y", scene)).toBe(180);
    expect(evaluateExpression("box.topCenter.x", scene)).toBe(100);
    expect(evaluateExpression("box.topCenter.y", scene)).toBe(180);
    expect(evaluateExpression("box.topRight.x", scene)).toBe(140);
    expect(evaluateExpression("box.topRight.y", scene)).toBe(180);
    expect(evaluateExpression("box.leftCenter.x", scene)).toBe(60);
    expect(evaluateExpression("box.leftCenter.y", scene)).toBe(200);
    expect(evaluateExpression("box.center.x", scene)).toBe(100);
    expect(evaluateExpression("box.center.y", scene)).toBe(200);
    expect(evaluateExpression("box.rightCenter.x", scene)).toBe(140);
    expect(evaluateExpression("box.rightCenter.y", scene)).toBe(200);
    expect(evaluateExpression("box.bottomLeft.x", scene)).toBe(60);
    expect(evaluateExpression("box.bottomLeft.y", scene)).toBe(220);
    expect(evaluateExpression("box.bottomCenter.x", scene)).toBe(100);
    expect(evaluateExpression("box.bottomCenter.y", scene)).toBe(220);
    expect(evaluateExpression("box.bottomRight.x", scene)).toBe(140);
    expect(evaluateExpression("box.bottomRight.y", scene)).toBe(220);
  });

  it("evaluates boundingBox and its nested properties", () => {
    const scene = new KScene({ id: "scene", x: 0, y: 0, width: 1000, height: 1000 });
    const rect = new KRectangle({
      id: "box",
      x: 100,
      y: 200,
      width: 80,
      height: 40,
      anchorX: 0.5,
      anchorY: 0.5,
    });
    scene.add(rect);

    expect(evaluateExpression("box.boundingBox.topLeft", scene)).toEqual({ x: 60, y: 180 });
    expect(evaluateExpression("box.boundingBox.topLeft.x", scene)).toBe(60);
    expect(evaluateExpression("box.boundingBox.topLeft.y", scene)).toBe(180);
    expect(evaluateExpression("box.boundingBox.center", scene)).toEqual({ x: 100, y: 200 });
    expect(evaluateExpression("box.boundingBox.center.x", scene)).toBe(100);
    expect(evaluateExpression("box.boundingBox.center.y", scene)).toBe(200);
  });

  it("supports arithmetic expressions involving KAbstractRectangle getters", () => {
    const scene = new KScene({ id: "scene", x: 0, y: 0, width: 1000, height: 1000 });
    const rect = new KRectangle({
      id: "box",
      x: 100,
      y: 200,
      width: 80,
      height: 40,
      anchorX: 0.5,
      anchorY: 0.5,
    });
    scene.add(rect);

    expect(evaluateExpression("box.width + box.height", scene)).toBe(120);
    expect(evaluateExpression("box.right - box.left", scene)).toBe(80);
    expect(evaluateExpression("box.topLeft.x + 10", scene)).toBe(70);
  });
});
