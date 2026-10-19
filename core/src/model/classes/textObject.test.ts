import { describe, expect, it } from "vitest";
import { createTestEnv } from "@/model/ports";
import { TEXT_DEF } from "@/model/classes/textObject";
import type { SceneObject } from "@/model/sceneObject";
import type { StateValue } from "@/model/values";
import type { Pt } from "@/geom/vec";

function makeText(id: string, state: Record<string, StateValue> = {}): SceneObject {
  const object = TEXT_DEF.create(id, createTestEnv());
  for (const [key, value] of Object.entries(state)) object.setState(key, value);
  return object;
}

describe("TextObject", () => {
  it("measures initial and updated text dimensions", () => {
    const object = makeText("text");
    expect(object.readProp("width")).toBe(0);
    expect(object.readProp("height")).toBeCloseTo(38.4, 6);
    object.writeProp("text", "Hello");
    expect(object.readProp("width")).toBe(96);
    expect(object.readProp("height")).toBeCloseTo(38.4, 6);
    object.writeProp("fontSize", 10);
    expect(object.readProp("width")).toBe(30);
    expect(object.readProp("height")).toBe(12);
  });

  it("keeps measured dimensions read-only and hides rectangle styling", () => {
    const object = makeText("text");
    expect(() => object.writeProp("width", 5)).toThrow("Presk internal:");
    expect(() => object.writeProp("fill", 1)).toThrow("Presk internal:");
    expect(TEXT_DEF.props.width.mode).toBe("ro");
    expect(TEXT_DEF.props.text.animatable).toBe(false);
    expect(TEXT_DEF.props.color.animatable).toBe(true);
    expect(TEXT_DEF.props.fill).toBeUndefined();
  });

  it("uses measured bounds for world anchors", () => {
    const object = makeText("text", { x: 10, y: 0 });
    object.writeProp("text", "Hello");
    object.writeProp("fontSize", 10);
    expect(object.readProp("bottomRight")).toEqual({ x: 40, y: 12 } satisfies Pt);
  });
});
