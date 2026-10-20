import { applyMat, invertMat } from "@/geom/matrix";
import type { Pt } from "@/geom/vec";
import { baseProps } from "@/model/baseProps";
import { rectangleStyleProps } from "@/model/classes/rectangleObject";
import { normalizeSegmentOrigin } from "@/model/classes/segmentObject";
import { REVEAL_FADE } from "@/model/effects";
import type { ObjectEnv } from "@/model/ports";
import { SceneObject } from "@/model/sceneObject";
import type { ClassDef, PropSpec } from "@/model/values";

export class RayLineObject extends SceneObject {
  constructor(id: string, def: ClassDef, env: ObjectEnv) {
    super(id, def, env, {
      p0: { x: 0, y: 0 },
      p1: { x: 100, y: 0 },
      stroke: 0x9c9c9c,
      strokeWidth: 2,
      pivot: "pos",
    });
  }

  localBounds() {
    return null;
  }
}

function endpointProp(key: "p0" | "p1"): PropSpec {
  return {
    kind: "point",
    writes: [key],
    mode: "rw",
    animatable: true,
    order: 0,
    get: (object) => applyMat(object.worldMatrix(), object.getPoint(key)),
    set: (object, value) => {
      const inverse = invertMat(object.worldMatrix());
      object.setState(key, applyMat(inverse, value as Pt));
    },
  };
}

const styles = rectangleStyleProps();
delete styles.fill;

function rayLineProps(first: string, second: string): Record<string, PropSpec> {
  return {
    ...baseProps({ pivotValues: ["pos"] }),
    [first]: endpointProp("p0"),
    [second]: endpointProp("p1"),
    ...styles,
  };
}

export const RAY_DEF: ClassDef = {
  type: "ray",
  family: "unbounded",
  creatable: true,
  props: rayLineProps("origin", "through"),
  indexed: {},
  effects: { reveal: REVEAL_FADE },
  paths: {},
  create: (id, env) => new RayLineObject(id, RAY_DEF, env),
  afterGeometry: normalizeSegmentOrigin,
};

export const LINE_DEF: ClassDef = {
  type: "line",
  family: "unbounded",
  creatable: true,
  props: rayLineProps("p1", "p2"),
  indexed: {},
  effects: { reveal: REVEAL_FADE },
  paths: {},
  create: (id, env) => new RayLineObject(id, LINE_DEF, env),
  afterGeometry: normalizeSegmentOrigin,
};
