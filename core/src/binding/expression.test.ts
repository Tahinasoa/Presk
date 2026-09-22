// Tests the spec §8.2 expression grammar: arithmetic, scalar refs, point
// refs (must end on .x/.y).
import { describe, it, expect } from "vitest";
import KScene from "@/primitives/kscene";
import KRectangle from "@/primitives/krectangle";
import { evaluateExpression } from "./expression";

function makeScene() {
  const scene = new KScene({ id: "scene", x: 0, y: 0, width: 1920, height: 1080 });
  const title = new KRectangle({ id: "title", x: 100, y: 200, width: 40, height: 20 });
  scene.add(title);
  return scene;
}

describe("evaluateExpression", () => {
  it("evaluates plain numeric arithmetic", () => {
    const scene = makeScene();
    expect(evaluateExpression("2 + 3 * 4", scene)).toBe(14);
  });

  it("resolves a scalar property on an object", () => {
    const scene = makeScene();
    expect(evaluateExpression("title.x", scene)).toBe(100);
  });

  it("resolves the reserved scene identifier", () => {
    const scene = makeScene();
    expect(evaluateExpression("scene.width", scene)).toBe(1920);
  });

  it("resolves a point property followed by .x/.y", () => {
    const scene = makeScene();
    expect(evaluateExpression("title.topRight.x", scene)).toBe(120);
  });

  it("supports arithmetic combining two references", () => {
    const scene = makeScene();
    expect(evaluateExpression("title.topRight.x + 20", scene)).toBe(140);
  });

  it("throws on an unknown identifier", () => {
    const scene = makeScene();
    expect(() => evaluateExpression("ghost.x", scene)).toThrow(/unknown reference/);
  });

  it("resolves nested point properties or objects generically", () => {
    const scene = makeScene();
    // topRight returns an object { x, y }, accessing .x yields its number
    expect(evaluateExpression("title.topRight.x", scene)).toBe(120);
  });

  it("throws when performing arithmetic on a non-scalar property", () => {
    const scene = makeScene();
    expect(() => evaluateExpression("title.topRight + 10", scene)).toThrow(/arithmetic operations require scalar/);
  });
});
