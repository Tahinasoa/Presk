import { describe, expect, it } from "vitest";
import { createTestEnv } from "@/model/ports";
import { readRef } from "@/model/refs";
import type { RefSegment } from "@/lang/expr/ast";
import { createSceneRoot, SCENE_DEF } from "@/model/classes/sceneRoot";
import type { RectangleObject } from "@/model/classes/rectangleObject";

const ref = (name: string): RefSegment => ({ name });

describe("scene root", () => {
  it("has the reserved id and scene dimensions", () => {
    const root = createSceneRoot(1920, 1080, createTestEnv());

    expect(root.id).toBe("scene");
    expect(root.readProp("width")).toBe(1920);
  });

  it("reads rectangle anchors and references in world coordinates", () => {
    const root = createSceneRoot(1920, 1080, createTestEnv());

    expect(root.readProp("center")).toEqual({ x: 960, y: 540 });
    expect(root.readProp("bottomRight")).toEqual({ x: 1920, y: 1080 });
    expect(readRef(root, [ref("center"), ref("x")])).toBe(960);
  });

  it("rejects writes to scene properties", () => {
    const root = createSceneRoot(1920, 1080, createTestEnv());

    expect(() => root.writeProp("x", 1)).toThrow();
    expect(() => root.writeProp("width", 1)).toThrow();
  });

  it("cannot be created through the class catalog factory", () => {
    expect(SCENE_DEF.creatable).toBe(false);
    expect(() => SCENE_DEF.create("a", createTestEnv())).toThrow();
  });

  it("starts fully present", () => {
    const root: RectangleObject = createSceneRoot(1920, 1080, createTestEnv());

    expect(root.effectiveAlpha()).toBe(1);
  });
});
