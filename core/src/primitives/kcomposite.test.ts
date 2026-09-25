import { describe, it, expect } from "vitest";
import KComposite from "./kcomposite";
import KRectangle from "./krectangle";
import KScene from "./kscene";
import { evaluateExpression } from "@/binding/expression";

describe("KComposite", () => {
  it("manages children correctly and prevents duplicate ids or cycles", () => {
    const parent = new KComposite({ id: "parent", x: 0, y: 0, width: 100, height: 100 });
    const child1 = new KRectangle({ id: "c1", x: 10, y: 10, width: 20, height: 20 });

    // @ts-ignore protected method test
    parent.addChild("child1", child1);

    expect(parent.getChild("child1")).toBe(child1);
    expect(parent.children()).toHaveLength(1);

    // Duplicate id error
    expect(() => {
      // @ts-ignore
      parent.addChild("child1", new KRectangle({ id: "c2", x: 0, y: 0, width: 10, height: 10 }));
    }).toThrow();

    // Self / ancestor cycle check
    expect(() => {
      // @ts-ignore
      parent.addChild("self", parent);
    }).toThrow();
  });

  it("resolves nested IDs in KScene and expressions", () => {
    const scene = new KScene({ id: "scene", x: 0, y: 0, width: 1000, height: 1000 });
    const bar = new KRectangle({ id: "bar1", x: 50, y: 100, width: 30, height: 200 });
    const chart = new KComposite({
      id: "chart1",
      x: 0,
      y: 0,
      width: 500,
      height: 500,
      children: { bar: bar },
    });

    scene.add(chart);

    // Test nested resolution via scene.get()
    expect(scene.get("chart1.bar")).toBe(bar);
    expect(scene.get("chart1.invalid")).toBeUndefined();

    // Test expression evaluating nested property
    const val = evaluateExpression("chart1.bar.width", scene);
    expect(val).toBe(30);
  });
});
