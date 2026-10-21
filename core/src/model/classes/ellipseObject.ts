import { FlatPath, flattenEllipse } from "@/geom/flatPath";
import { baseProps } from "@/model/baseProps";
import { REVEAL_FADE } from "@/model/effects";
import type { ObjectEnv } from "@/model/ports";
import { SceneObject } from "@/model/sceneObject";
import { rectangleStyleProps } from "@/model/classes/rectangleObject";
import type { ClassDef, PathSpec, PropSpec } from "@/model/values";

export class EllipseObject extends SceneObject {
  constructor(id: string, def: ClassDef, env: ObjectEnv) {
    super(id, def, env, {
      width: 100,
      height: 60,
      fill: 0x9c9c9c,
      stroke: 0xffffff,
      strokeWidth: 0,
    });
  }

  localBounds() {
    const halfWidth = this.getNumber("width") / 2;
    const halfHeight = this.getNumber("height") / 2;
    return { minX: -halfWidth, minY: -halfHeight, maxX: halfWidth, maxY: halfHeight };
  }
}

function ellipseDimensionProp(key: "width" | "height"): PropSpec {
  return {
    kind: "number",
    writes: [key],
    mode: "rw",
    animatable: true,
    order: 0,
    min: 0,
    get: (object) => object.getNumber(key),
    set: (object, value) => object.setState(key, value as number),
  };
}

const ELLIPSE_PATH: PathSpec = {
  closed: "always",
  isClosed: () => true,
  build(object) {
    return new FlatPath(
      flattenEllipse(object.getNumber("width") / 2, object.getNumber("height") / 2),
      true,
    );
  },
};

export const ELLIPSE_DEF: ClassDef = {
  type: "ellipse",
  family: "bounded",
  creatable: true,
  props: {
    ...baseProps({ pivotValues: ["center", "pos"] }),
    width: ellipseDimensionProp("width"),
    height: ellipseDimensionProp("height"),
    ...rectangleStyleProps(),
  },
  indexed: {},
  effects: { reveal: REVEAL_FADE },
  paths: { main: ELLIPSE_PATH },
  create: (id, env) => new EllipseObject(id, ELLIPSE_DEF, env),
};
