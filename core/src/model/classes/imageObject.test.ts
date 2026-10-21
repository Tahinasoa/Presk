import { describe, expect, it } from "vitest";
import type { RefSegment } from "@/lang/expr/ast";
import { PreskRuntimeError } from "@/lang/diagnostics";
import type { Pt } from "@/geom/vec";
import { IMAGE_DEF } from "@/model/classes/imageObject";
import { FakeImageInfo, createTestEnv } from "@/model/ports";
import { readRef } from "@/model/refs";
import type { SceneObject } from "@/model/sceneObject";

const env = {
  ...createTestEnv(),
  images: new FakeImageInfo({ "a.png": { width: 400, height: 200 } }),
};
const ref = (name: string): RefSegment => ({ name });

// Reproduit buildWorld : propriétés d'ordre 0, puis afterGeometry, puis le reste.
function makeImage(properties: Record<string, string | number>): SceneObject {
  const image = IMAGE_DEF.create("img", env);
  for (const key of ["url", "width", "height"]) {
    if (Object.hasOwn(properties, key)) image.writeProp(key, properties[key]!);
  }
  IMAGE_DEF.afterGeometry!(image);
  for (const key of ["x", "y"]) {
    if (Object.hasOwn(properties, key)) image.writeProp(key, properties[key]!);
  }
  return image;
}

function size(image: SceneObject): [unknown, unknown] {
  return [image.readProp("width"), image.readProp("height")];
}

describe("ImageObject", () => {
  it("uses the natural size when neither width nor height is given", () => {
    expect(size(makeImage({ url: "a.png" }))).toEqual([400, 200]);
  });

  it("keeps the ratio when only width is given", () => {
    expect(size(makeImage({ url: "a.png", width: 100 }))).toEqual([100, 50]);
  });

  it("keeps the ratio when only height is given", () => {
    expect(size(makeImage({ url: "a.png", height: 100 }))).toEqual([200, 100]);
  });

  it("does not keep the ratio when both width and height are given", () => {
    expect(size(makeImage({ url: "a.png", width: 100, height: 100 }))).toEqual([100, 100]);
  });

  it("throws a runtime error when the image size is unknown", () => {
    expect(() => makeImage({ url: "zzz.png" })).toThrow(PreskRuntimeError);
    expect(() => makeImage({ url: "zzz.png" })).toThrow("image size unknown: zzz.png");
  });

  it("requires the url property, as an init string", () => {
    const url = IMAGE_DEF.props.url;

    expect(url.required).toBe(true);
    expect(url.kind).toBe("string");
    expect(url.mode).toBe("init");
    expect(IMAGE_DEF.props.width.required).toBeFalsy();
    expect(IMAGE_DEF.props.height.required).toBeFalsy();
  });

  it("reads the bottomRight anchor in world coordinates", () => {
    const image = makeImage({ url: "a.png", x: 10, y: 20 });
    const point = readRef(image, [ref("bottomRight")]) as Pt;

    expect(point.x).toBeCloseTo(410, 6);
    expect(point.y).toBeCloseTo(220, 6);
  });

  it("is a rectangle-family class with the nine anchors and a default reveal", () => {
    expect(IMAGE_DEF.type).toBe("image");
    expect(IMAGE_DEF.family).toBe("rectangle");
    expect(IMAGE_DEF.creatable).toBe(true);
    for (const name of ["topLeft", "center", "bottomRight"]) expect(IMAGE_DEF.props[name]).toBeDefined();
    expect(IMAGE_DEF.effects.reveal?.variants).toEqual(["default"]);
  });
});
