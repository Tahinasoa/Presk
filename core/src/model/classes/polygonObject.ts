import { boundsOfPoints } from "@/geom/bounds";
import { applyMat, invertMat } from "@/geom/matrix";
import type { Pt } from "@/geom/vec";
import { FlatPath } from "@/geom/flatPath";
import { PreskRuntimeError } from "@/lang/diagnostics";
import { baseProps } from "@/model/baseProps";
import { rectangleStyleProps } from "@/model/classes/rectangleObject";
import { revealWithDraw } from "@/model/effects";
import type { ObjectEnv } from "@/model/ports";
import { SceneObject } from "@/model/sceneObject";
import type { ClassDef, IndexedPropSpec, PathSpec, PropSpec } from "@/model/values";

function copyPoints(points: readonly Pt[]): Pt[] {
  return points.map((point) => ({ x: point.x, y: point.y }));
}

function pointsOf(object: SceneObject): Pt[] {
  return copyPoints(object.getState("points") as readonly Pt[]);
}

export class PolygonObject extends SceneObject {
  constructor(id: string, def: ClassDef, env: ObjectEnv) {
    super(id, def, env, {
      points: [],
      fill: "#9c9c9c",
      stroke: "#ffffff",
      strokeWidth: 0,
      drawProgress: 1,
    });
  }

  localBounds() {
    return boundsOfPoints(pointsOf(this));
  }
}

export function pointsProp(minItems: number, maxItems?: number): PropSpec {
  return {
    kind: "pointList",
    writes: ["points"],
    mode: "init",
    animatable: false,
    order: 0,
    required: true,
    minItems,
    ...(maxItems === undefined ? {} : { maxItems }),
    get: (object) => pointsOf(object),
    set: (object, value) => object.setState("points", copyPoints(value as readonly Pt[])),
  };
}

function indexError(object: SceneObject, index: number): PreskRuntimeError {
  return new PreskRuntimeError(`E_ANCHOR_INDEX: index ${index} is out of range for 'vertex' on '${object.id}'`);
}

function assertVertexIndex(object: SceneObject, index: number): void {
  const count = pointsOf(object).length;
  if (!Number.isInteger(index) || index < 0 || index >= count) throw indexError(object, index);
}

export function vertexIndexed(): IndexedPropSpec {
  return {
    count: (object) => pointsOf(object).length,
    get(object, index) {
      assertVertexIndex(object, index);
      return applyMat(object.worldMatrix(), pointsOf(object)[index]);
    },
    set(object, index, worldPoint) {
      assertVertexIndex(object, index);
      const inverse = invertMat(object.worldMatrix());
      const points = pointsOf(object);
      points[index] = applyMat(inverse, worldPoint);
      object.setState("points", points);
    },
    writeKey: (index) => `points.${index}`,
  };
}

const mainPath: PathSpec = {
  closed: "always",
  isClosed: () => true,
  build: (object) => new FlatPath(pointsOf(object), true),
};

const effects = { reveal: revealWithDraw() };

function polygonProps(points: PropSpec): Record<string, PropSpec> {
  return {
    ...baseProps({ pivotValues: ["center", "pos"] }),
    points,
    ...rectangleStyleProps(),
  };
}

export const POLYGON_DEF: ClassDef = {
  type: "polygon",
  family: "bounded",
  creatable: true,
  props: polygonProps(pointsProp(3)),
  indexed: { vertex: vertexIndexed() },
  effects,
  paths: { main: mainPath },
  create: (id, env) => new PolygonObject(id, POLYGON_DEF, env),
};

export const TRIANGLE_DEF: ClassDef = {
  type: "triangle",
  family: "bounded",
  creatable: true,
  props: polygonProps(pointsProp(3, 3)),
  indexed: { vertex: vertexIndexed() },
  effects,
  paths: { main: mainPath },
  create: (id, env) => new PolygonObject(id, TRIANGLE_DEF, env),
};
