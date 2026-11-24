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

  it("adds uniform, axis, and side margins to measured bounds", () => {
    const object = TEXT_DEF.create("text", createTestEnv());
    object.writeProp("text", "Hello");
    object.writeProp("fontSize", 10);
    object.writeProp("margin", 2);
    expect(object.readProp("width")).toBe(34);
    expect(object.readProp("height")).toBe(16);
    expect(object.readProp("marginHorizontal")).toBe(2);
    expect(object.readProp("marginVertical")).toBe(2);

    object.writeProp("marginHorizontal", 4);
    object.writeProp("marginVertical", 6);
    object.writeProp("marginTop", 1);
    object.writeProp("marginRight", 2);
    expect(object.readProp("width")).toBe(36);
    expect(object.readProp("height")).toBe(19);
    expect(object.readProp("marginLeft")).toBe(4);
    expect(object.readProp("marginRight")).toBe(2);
    expect(object.readProp("marginTop")).toBe(1);
    expect(object.readProp("marginBottom")).toBe(6);
    expect(object.localBounds()).toEqual({ minX: 0, minY: 0, maxX: 36, maxY: 19 });
    expect(() => object.readProp("margin")).toThrow("not uniform");
    expect(() => object.readProp("marginHorizontal")).toThrow("not uniform");

    object.writeProp("text", "Hi");
    expect(object.readProp("width")).toBe(18);
    expect(object.readProp("height")).toBe(19);
    expect(() => object.writeProp("marginLeft", -1)).toThrow("non-negative");
  });

  it("reads the default colour as a canonical string", () => {
    expect(makeText("text").readProp("color")).toBe("#ffffff");
  });

  it("normalizes frame and highlight styles and accepts none", () => {
    const object = TEXT_DEF.create("text", createTestEnv());
    expect(object.readProp("frame")).toBe("none");
    expect(object.readProp("highlight")).toBe("none");

    object.writeProp("frame", "Blue 2px");
    object.writeProp("highlight", "#f008");
    expect(object.readProp("frame")).toBe("#0000ff 2px");
    expect(object.readProp("highlight")).toBe("#ff000088");

    object.writeProp("frame", "none");
    object.writeProp("highlight", "none");
    expect(object.readProp("frame")).toBe("none");
    expect(object.readProp("highlight")).toBe("none");
    expect(() => object.writeProp("frame", "red 0px")).toThrow("Presk internal:");

    object.writeProp("frame", "#F00");
    object.writeProp("highlight", "orange");
    expect(object.readProp("frame")).toBe("#ff0000 1px");
    expect(object.readProp("highlight")).toBe("#ffa500");

    object.writeProp("highlight", "#ff000080");
    expect(object.readProp("highlight")).toBe("#ff000080");
  });

  it("keeps measured dimensions read-only and hides rectangle styling", () => {
    const object = makeText("text");
    expect(() => object.writeProp("width", 5)).toThrow("Presk internal:");
    expect(() => object.writeProp("fill", 1)).toThrow("Presk internal:");
    expect(TEXT_DEF.props.width.mode).toBe("ro");
    expect(TEXT_DEF.props.text.animatable).toBe(false);
    expect(TEXT_DEF.props.color.animatable).toBe(true);
    expect(TEXT_DEF.props.frame.animatable).toBe(false);
    expect(TEXT_DEF.props.highlight.animatable).toBe(false);
    expect(TEXT_DEF.props.fill).toBeUndefined();
  });

  it("uses measured bounds for world anchors", () => {
    const object = makeText("text", { x: 10, y: 0 });
    object.writeProp("text", "Hello");
    object.writeProp("fontSize", 10);
    expect(object.readProp("bottomRight")).toEqual({ x: 40, y: 12 } satisfies Pt);
  });
});
