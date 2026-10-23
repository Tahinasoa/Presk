import { boundsOfPoints } from "@/geom/bounds";
import { flattenBezierChain, flattenSpline } from "@/geom/curve";
import { FlatPath } from "@/geom/flatPath";
import { applyMat } from "@/geom/matrix";
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

function flattenedPoints(object: SceneObject): Pt[] {
  const points = pointsOf(object);
  if (points.length === 0) return [];
  const closed = object.getState("closed") as boolean;
  return object.getString("interpolation") === "bezier"
    ? flattenBezierChain(points, closed)
    : flattenSpline(points, closed);
}

export class CurveObject extends SceneObject {
  constructor(id: string, def: ClassDef, env: ObjectEnv) {
    super(id, def, env, {
      points: [],
      closed: false,
      interpolation: "spline",
      stroke: "#9c9c9c",
      strokeWidth: 2,
      drawProgress: 1,
    });
  }

  localBounds() {
    return boundsOfPoints(flattenedPoints(this));
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

const interpolationProp: PropSpec = {
  kind: "enum",
  writes: ["interpolation"],
  mode: "init",
  animatable: false,
  order: 0,
  values: ["spline", "bezier"],
  get: (object) => object.getString("interpolation"),
  set: (object, value) => object.setState("interpolation", value as string),
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

function endpointProp(which: "first" | "last"): PropSpec {
  return {
    kind: "point",
    writes: [],
    mode: "ro",
    animatable: false,
    order: 0,
    get: (object) => {
      const flat = flattenedPoints(object);
      const local = (which === "first" ? flat[0] : flat[flat.length - 1]) ?? { x: 0, y: 0 };
      return applyMat(object.worldMatrix(), local);
    },
  };
}

const mainPath: PathSpec = {
  closed: "state",
  isClosed: (object: SceneObject) => object.getState("closed") as boolean,
  build: (object: SceneObject) => new FlatPath(flattenedPoints(object), object.getState("closed") as boolean),
};

export const CURVE_DEF: ClassDef = {
  type: "curve",
  family: "bounded",
  creatable: true,
  props: {
    ...baseProps({ pivotValues: ["center", "pos"] }),
    points: pointsProp(2),
    closed: closedProp,
    interpolation: interpolationProp,
    stroke: strokeProp,
    strokeWidth: strokeWidthProp,
    start: endpointProp("first"),
    end: endpointProp("last"),
  },
  indexed: { vertex: vertexIndexed() },
  effects: { reveal: revealWithDraw() },
  paths: { main: mainPath },
  create: (id, env) => new CurveObject(id, CURVE_DEF, env),
};
