import { ANCHOR_NAMES, anchorOfBounds } from "@/geom/bounds";
import type { Bounds } from "@/geom/bounds";
import { applyLinear, applyMat, invertMat } from "@/geom/matrix";
import type { Pt } from "@/geom/vec";
import { FlatPath } from "@/geom/flatPath";
import { baseProps } from "@/model/baseProps";
import { REVEAL_FADE } from "@/model/effects";
import type { ObjectEnv } from "@/model/ports";
import { SceneObject } from "@/model/sceneObject";
import type { ClassDef, PathSpec, PropSpec, StateValue } from "@/model/values";

export class RectangleObject extends SceneObject {
  constructor(id: string, def: ClassDef, env: ObjectEnv, extraInitial: Record<string, StateValue> = {}) {
    super(id, def, env, {
      width: 100,
      height: 100,
      fill: "#9c9c9c",
      stroke: "#ffffff",
      strokeWidth: 0,
      ...extraInitial,
    });
  }

  localBounds(): Bounds | null {
    return { minX: 0, minY: 0, maxX: this.getNumber("width"), maxY: this.getNumber("height") };
  }
}

export function rectangleSizeProps(): Record<string, PropSpec> {
  const makeSize = (key: "width" | "height"): PropSpec => ({
    kind: "number",
    writes: [key],
    mode: "rw",
    animatable: true,
    order: 0,
    min: 0,
    get: (object) => object.getNumber(key),
    set: (object, value) => object.setState(key, value as number),
  });
  return { width: makeSize("width"), height: makeSize("height") };
}

export function rectangleStyleProps(): Record<string, PropSpec> {
  const makeStyle = (key: "fill" | "stroke" | "strokeWidth", kind: "color" | "number"): PropSpec => ({
    kind,
    writes: [key],
    mode: "rw",
    animatable: true,
    order: 0,
    ...(key === "strokeWidth" ? { min: 0 } : {}),
    get: (object) => (kind === "color" ? object.getColor(key) : object.getNumber(key)),
    set: (object, value) => object.setState(key, value),
  });
  return {
    fill: makeStyle("fill", "color"),
    stroke: makeStyle("stroke", "color"),
    strokeWidth: makeStyle("strokeWidth", "number"),
  };
}

export function rectangleAnchorProps(): Record<string, PropSpec> {
  const props: Record<string, PropSpec> = {};
  for (const name of ANCHOR_NAMES) {
    props[name] = {
      kind: "point",
      writes: ["x", "y"],
      mode: "rw",
      animatable: true,
      order: 2,
      get: (object) => {
        const bounds = object.localBounds();
        if (!bounds) throw new Error(`Presk internal: rectangle '${object.id}' has no local bounds`);
        return applyMat(object.worldMatrix(), anchorOfBounds(bounds, name));
      },
      set: (object, value) => {
        const worldPoint = value as Pt;
        const bounds = object.localBounds();
        if (!bounds) throw new Error(`Presk internal: rectangle '${object.id}' has no local bounds`);
        const current = applyMat(object.worldMatrix(), anchorOfBounds(bounds, name));
        const delta = { x: worldPoint.x - current.x, y: worldPoint.y - current.y };
        const parentDelta = applyLinear(invertMat(object.parentMatrix()), delta);
        object.setState("x", object.getNumber("x") + parentDelta.x);
        object.setState("y", object.getNumber("y") + parentDelta.y);
      },
    };
  }
  return props;
}

export const RECT_PATH: PathSpec = {
  closed: "always",
  isClosed: () => true,
  build(object) {
    const bounds = object.localBounds();
    if (!bounds) throw new Error(`Presk internal: rectangle '${object.id}' has no local bounds`);
    const { maxX: width, maxY: height } = bounds;
    return new FlatPath(
      [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }],
      true,
    );
  },
};

export const RECTANGLE_DEF: ClassDef = {
  type: "rectangle",
  family: "rectangle",
  creatable: true,
  props: {
    ...baseProps({ pivotValues: ANCHOR_NAMES }),
    ...rectangleSizeProps(),
    ...rectangleStyleProps(),
    ...rectangleAnchorProps(),
  },
  indexed: {},
  effects: { ["reveal"]: REVEAL_FADE },
  paths: { ["main"]: RECT_PATH },
  create: (id, env) => new RectangleObject(id, RECTANGLE_DEF, env),
};
