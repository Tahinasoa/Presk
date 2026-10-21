import { describe, expect, it } from "vitest";
import { createTestEnv } from "@/model/ports";
import { SceneObject } from "@/model/sceneObject";
import type { ClassDef } from "@/model/values";
import { baseProps } from "@/model/baseProps";

class TestObject extends SceneObject {
  localBounds() {
    return null;
  }
}

const testDef: ClassDef = {
  type: "test",
  family: "rectangle",
  creatable: true,
  props: {},
  indexed: {},
  effects: {},
  paths: {},
  create: (id, env) => new TestObject(id, testDef, env, {}),
};

describe("baseProps", () => {
  const props = baseProps({ pivotValues: ["center", "pos"] });

  it("returns property specs in contract order", () => {
    expect(Object.keys(props)).toEqual(["x", "y", "pos", "rotation", "scale", "opacity", "pivot"]);
    expect(props.pos.writes).toEqual(["x", "y"]);
    expect(props.pos.kind).toBe("point");
    expect(props.pos.order).toBe(2);
    expect(props.rotation.order).toBe(1);
    expect(props.scale.order).toBe(1);
    expect(props.opacity.order).toBe(3);
  });

  it("sets pivot as init-only and applies numeric ranges", () => {
    expect(props.pivot.mode).toBe("init");
    expect(props.pivot.animatable).toBe(false);
    expect(props.pivot.values).toEqual(["center", "pos"]);
    expect(props.scale.min).toBe(0);
    expect(props.scale.minExclusive).toBe(true);
    expect(props.opacity.min).toBe(0);
    expect(props.opacity.max).toBe(1);
  });

  it("reads and writes position and scalar state", () => {
    const object = new TestObject("test", testDef, createTestEnv(), {});
    props.pos.set?.(object, { x: 5, y: 6 });
    expect(props.pos.get(object)).toEqual({ x: 5, y: 6 });
    props.x.set?.(object, 7);
    expect(object.getState("x")).toBe(7);
  });

  it("marks every property except pivot animatable", () => {
    for (const [name, prop] of Object.entries(props)) {
      expect(prop.animatable, name).toBe(name !== "pivot");
    }
  });
});
