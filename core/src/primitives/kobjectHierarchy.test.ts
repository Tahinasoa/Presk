import { describe, it, expect } from "vitest";
import KRectangle from "./krectangle";
import KScene from "./kscene";
import { evaluateExpression } from "@/binding/expression";

describe("KObject Hierarchy & transformation-matrix", () => {
  it("allows any arbitrary KObject (like KRectangle) to receive a child via addChild", () => {
    const parentRect = new KRectangle({ id: "parent", x: 100, y: 100, width: 200, height: 200 });
    const childRect = new KRectangle({ id: "child", x: 50, y: 50, width: 50, height: 50 });

    parentRect.addChild("subChild", childRect);

    expect(parentRect.getChild("subChild")).toBe(childRect);
    expect(childRect.parent).toBe(parentRect);
    expect(parentRect.children()).toHaveLength(1);
  });

  it("resolves nested IDs and transforms in KScene and expressions", () => {
    const scene = new KScene({ id: "scene", x: 0, y: 0, width: 1000, height: 1000 });
    const rect = new KRectangle({ id: "r1", x: 20, y: 20, width: 40, height: 40 });
    const parent = new KRectangle({ id: "box", x: 100, y: 200, width: 300, height: 300 });

    parent.addChild("inner", rect);
    scene.add(parent);

    expect(scene.get("box.inner")).toBe(rect);
    
    // World position of child rect should be parent (100, 200) + child local (20, 20) = (120, 220)
    expect(rect.x).toBe(120);
    expect(rect.y).toBe(220);

    const val = evaluateExpression("box.inner.width", scene);
    expect(val).toBe(40);
  });

  it("computes correct world position for a rotated parent and offset child", () => {
    const parent = new KRectangle({ id: "parent", x: 100, y: 100, width: 100, height: 100, rotation: Math.PI / 2, scale: 1 });
    const child = new KRectangle({ id: "child", x: 50, y: 0, width: 20, height: 20 });

    parent.addChild("child", child);

    const worldPos = child.toWorld({ x: 0, y: 0 });
    expect(worldPos.x).toBeCloseTo(100);
    expect(worldPos.y).toBeCloseTo(150);
  });

  it("computes correct world position across multiple depth levels (grandparent -> parent -> child)", () => {
    const grandparent = new KRectangle({ id: "gp", x: 100, y: 100, width: 200, height: 200 });
    const parent = new KRectangle({ id: "p", x: 50, y: 50, width: 100, height: 100 });
    const child = new KRectangle({ id: "c", x: 10, y: 20, width: 10, height: 10 });

    parent.addChild("c", child);
    grandparent.addChild("p", parent);

    const worldPos = child.toWorld({ x: 0, y: 0 });
    expect(worldPos.x).toBeCloseTo(160);
    expect(worldPos.y).toBeCloseTo(170);
    expect(child.x).toBeCloseTo(160);
    expect(child.y).toBeCloseTo(170);
  });
});
