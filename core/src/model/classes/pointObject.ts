import { baseProps } from "@/model/baseProps";
import { REVEAL_FADE } from "@/model/effects";
import type { ObjectEnv } from "@/model/ports";
import { SceneObject } from "@/model/sceneObject";
import type { ClassDef } from "@/model/values";

export class PointObject extends SceneObject {
  constructor(id: string, def: ClassDef, env: ObjectEnv) {
    super(id, def, env, { pivot: "pos" });
  }

  localBounds() {
    return null;
  }
}

export const POINT_DEF: ClassDef = {
  type: "point",
  family: "point",
  creatable: true,
  props: baseProps({ pivotValues: ["pos"] }),
  indexed: {},
  effects: { reveal: REVEAL_FADE },
  paths: {},
  create: (id, env) => new PointObject(id, POINT_DEF, env),
};
