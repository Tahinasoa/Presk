import { describe, expect, it } from "vitest";
import { createTestEnv } from "@/model/ports";
import { PreskRuntimeError } from "@/lang/diagnostics";
import { readRef } from "@/model/refs";
import type { RefSegment } from "@/lang/expr/ast";
import { createSceneRoot, fitRegionToScene, SCENE_DEF, viewRegion } from "@/model/classes/sceneRoot";
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

  it("starts with a scene-centered view target", () => {
    const root = createSceneRoot(1600, 900, createTestEnv());

    expect(SCENE_DEF.props.zoom.get(root)).toEqual({ cx: 800, cy: 450, zoom: 1 });
  });

  it("returns the full-scene view region by default", () => {
    const root = createSceneRoot(1600, 900, createTestEnv());

    expect(viewRegion(root)).toEqual({ x: 0, y: 0, width: 1600, height: 900 });
  });

  it("derives the visible region after setting a view target", () => {
    const root = createSceneRoot(1600, 900, createTestEnv());
    root.writeProp("view", { cx: 400, cy: 300, zoom: 2 });

    expect(viewRegion(root)).toEqual({ x: 0, y: 75, width: 800, height: 450 });
  });

  it("fits a view region with the scene aspect ratio", () => {
    expect(fitRegionToScene({ x: 0, y: 0, width: 800, height: 450 }, 1600, 900))
      .toEqual({ cx: 400, cy: 225, zoom: 2 });
  });

  it("expands the height of a wider region to preserve aspect ratio", () => {
    expect(fitRegionToScene({ x: 0, y: 0, width: 800, height: 200 }, 1600, 900))
      .toEqual({ cx: 400, cy: 100, zoom: 2 });
  });

  it("expands the width of a taller region to preserve aspect ratio", () => {
    expect(fitRegionToScene({ x: 0, y: 0, width: 100, height: 450 }, 1600, 900))
      .toEqual({ cx: 50, cy: 225, zoom: 2 });
  });

  it("rejects a view region with a non-positive dimension", () => {
    expect(() => fitRegionToScene({ x: 0, y: 0, width: 0, height: 450 }, 1600, 900))
      .toThrow(PreskRuntimeError);
  });

  it("keeps scene geometry read-only and exposes view properties as writable", () => {
    expect(SCENE_DEF.props.x.mode).toBe("ro");
    expect(SCENE_DEF.props.zoom.mode).toBe("rw");
  });

  it("restores the scene view state from a snapshot", () => {
    const root = createSceneRoot(1600, 900, createTestEnv());
    const snapshot = root.snapshot();
    root.writeProp("zoom", { cx: 400, cy: 300, zoom: 2 });

    root.restore(snapshot);

    expect(SCENE_DEF.props.zoom.get(root)).toEqual({ cx: 800, cy: 450, zoom: 1 });
  });
});
