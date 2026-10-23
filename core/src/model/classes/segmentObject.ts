import { boundsOfPoints } from "@/geom/bounds";
import { applyMat, invertMat } from "@/geom/matrix";
import type { Pt } from "@/geom/vec";
import { FlatPath } from "@/geom/flatPath";
import { baseProps } from "@/model/baseProps";
import { revealWithDraw } from "@/model/effects";
import type { ObjectEnv } from "@/model/ports";
import { SceneObject } from "@/model/sceneObject";
import type { ClassDef, PathSpec, PropSpec, StateValue } from "@/model/values";

export class SegmentObject extends SceneObject {
  constructor(
    id: string,
    def: ClassDef,
    env: ObjectEnv,
    extraInitial: Record<string, StateValue> = {},
  ) {
    super(id, def, env, {
      p0: { x: 0, y: 0 },
      p1: { x: 100, y: 0 },
      stroke: "#9c9c9c",
      strokeWidth: 2,
      drawProgress: 1,
      ...extraInitial,
    });
  }

  localBounds() {
    return boundsOfPoints([this.getPoint("p0"), this.getPoint("p1")]);
  }
}

export function normalizeSegmentOrigin(object: SceneObject): void {
  const p0 = object.getPoint("p0");
  const p1 = object.getPoint("p1");
  object.setState("x", object.getNumber("x") + p0.x);
  object.setState("y", object.getNumber("y") + p0.y);
  object.setState("p1", { x: p1.x - p0.x, y: p1.y - p0.y });
  object.setState("p0", { x: 0, y: 0 });
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

const headProp: PropSpec = {
  kind: "enum",
  writes: ["head"],
  mode: "init",
  animatable: false,
  order: 0,
  values: ["end", "start", "both", "none"],
  get: (object) => object.getString("head"),
  set: (object, value) => object.setState("head", value as string),
};

function segmentProps(): Record<string, PropSpec> {
  return {
    ...baseProps({ pivotValues: ["center", "pos"] }),
    start: endpointProp("p0"),
    end: endpointProp("p1"),
    stroke: strokeProp,
    strokeWidth: strokeWidthProp,
  };
}

const mainPath: PathSpec = {
  closed: "never",
  isClosed: () => false,
  build(object) {
    return new FlatPath([object.getPoint("p0"), object.getPoint("p1")], false);
  },
};

const effects = { reveal: revealWithDraw() };

export const SEGMENT_DEF: ClassDef = {
  type: "segment",
  family: "bounded",
  creatable: true,
  props: segmentProps(),
  indexed: {},
  effects,
  paths: { main: mainPath },
  create: (id, env) => new SegmentObject(id, SEGMENT_DEF, env),
  afterGeometry: normalizeSegmentOrigin,
};

export const ARROW_DEF: ClassDef = {
  type: "arrow",
  family: "bounded",
  creatable: true,
  props: { ...segmentProps(), head: headProp },
  indexed: {},
  effects,
  paths: { main: mainPath },
  create: (id, env) => new SegmentObject(id, ARROW_DEF, env, { head: "end" }),
  afterGeometry: normalizeSegmentOrigin,
};
