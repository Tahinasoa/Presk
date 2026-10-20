import { flattenEllipse, FlatPath } from "@/geom/flatPath";
import { baseProps } from "@/model/baseProps";
import { REVEAL_FADE } from "@/model/effects";
import type { ObjectEnv } from "@/model/ports";
import { SceneObject } from "@/model/sceneObject";
import { rectangleStyleProps } from "@/model/classes/rectangleObject";
import type { ClassDef, PathSpec, PropSpec } from "@/model/values";

export class CircleObject extends SceneObject {
  constructor(id: string, def: ClassDef, env: ObjectEnv) {
    super(id, def, env, {
      radius: 50,
      fill: 0x9c9c9c,
      stroke: 0xffffff,
      strokeWidth: 0,
    });
  }

  localBounds() {
    const radius = this.getNumber("radius");
    return { minX: -radius, minY: -radius, maxX: radius, maxY: radius };
  }
}

const radiusProp: PropSpec = {
  kind: "number",
  writes: ["radius"],
  mode: "rw",
  animatable: true,
  order: 0,
  min: 0,
  get: (object) => object.getNumber("radius"),
  set: (object, value) => object.setState("radius", value as number),
};

const CIRCLE_PATH: PathSpec = {
  closed: "always",
  isClosed: () => true,
  build(object) {
    const radius = object.getNumber("radius");
    return new FlatPath(flattenEllipse(radius, radius), true);
  },
};

export const CIRCLE_DEF: ClassDef = {
  type: "circle",
  family: "bounded",
  creatable: true,
  props: {
    ...baseProps({ pivotValues: ["center", "pos"] }),
    radius: radiusProp,
    ...rectangleStyleProps(),
  },
  indexed: {},
  effects: { reveal: REVEAL_FADE },
  paths: { main: CIRCLE_PATH },
  create: (id, env) => new CircleObject(id, CIRCLE_DEF, env),
};
