import { boundsOfPoints } from "@/geom/bounds";
import { FlatPath } from "@/geom/flatPath";
import type { Pt } from "@/geom/vec";
import { baseProps } from "@/model/baseProps";
import { pointsProp, vertexIndexed } from "@/model/classes/polygonObject";
import { revealWithDraw } from "@/model/effects";
import type { ObjectEnv } from "@/model/ports";
import { SceneObject } from "@/model/sceneObject";
import type { ClassDef, PathSpec, PropSpec } from "@/model/values";

function pointsOf(object: SceneObject): Pt[] {
  return (object.getState("points") as readonly Pt[]).map((point) => ({ x: point.x, y: point.y }));
}

export class PolylineObject extends SceneObject {
  constructor(id: string, def: ClassDef, env: ObjectEnv) {
    super(id, def, env, {
      points: [],
      closed: false,
      stroke: "#9c9c9c",
      strokeWidth: 2,
      drawProgress: 1,
    });
  }

  localBounds() {
    return boundsOfPoints(pointsOf(this));
  }
}

const closedProp: PropSpec = {
  kind: "boolean",
  writes: ["closed"],
  mode: "init",
  animatable: false,
  order: 0,
  get: (object) => object.getState("closed") as boolean,
  set: (object, value) => object.setState("closed", value),
};

const strokeProp: PropSpec = {
  kind: "color",
  writes: ["stroke"],
  mode: "rw",
  animatable: true,
  order: 0,
  get: (object) => object.getColor("stroke"),
  set: (object, value) => object.setState("stroke", value),
};

const strokeWidthProp: PropSpec = {
  kind: "number",
  writes: ["strokeWidth"],
  mode: "rw",
  animatable: true,
  order: 0,
  min: 0,
  get: (object) => object.getNumber("strokeWidth"),
  set: (object, value) => object.setState("strokeWidth", value as number),
};

const mainPath: PathSpec = {
  closed: "state",
  isClosed: (object: SceneObject) => object.getState("closed") as boolean,
  build: (object: SceneObject) => {
    const points = pointsOf(object);
    return new FlatPath(points, object.getState("closed") as boolean);
  },
};

export const POLYLINE_DEF: ClassDef = {
  type: "polyline",
  family: "bounded",
  creatable: true,
  props: {
    ...baseProps({ pivotValues: ["center", "pos"] }),
    points: pointsProp(2),
    closed: closedProp,
    stroke: strokeProp,
    strokeWidth: strokeWidthProp,
  },
  indexed: { vertex: vertexIndexed() },
  effects: { reveal: revealWithDraw() },
  paths: { main: mainPath },
  create: (id, env) => new PolylineObject(id, POLYLINE_DEF, env),
};
