import { boundsOfPoints } from "@/geom/bounds";
import { applyMat, degToRad } from "@/geom/matrix";
import { flattenArc, FlatPath } from "@/geom/flatPath";
import type { Pt } from "@/geom/vec";
import { baseProps } from "@/model/baseProps";
import { rectangleStyleProps } from "@/model/classes/rectangleObject";
import { revealWithDraw } from "@/model/effects";
import type { ObjectEnv } from "@/model/ports";
import { SceneObject } from "@/model/sceneObject";
import type { ClassDef, PathSpec, PropSpec } from "@/model/values";

export class ArcObject extends SceneObject {
  constructor(id: string, def: ClassDef, env: ObjectEnv) {
    super(id, def, env, {
      radius: 50,
      startAngle: 0,
      endAngle: 90,
      stroke: 0x9c9c9c,
      strokeWidth: 2,
      drawProgress: 1,
    });
  }

  localBounds() {
    return boundsOfPoints(flattenArc(
      this.getNumber("radius"),
      this.getNumber("radius"),
      this.getNumber("startAngle"),
      this.getNumber("endAngle"),
    ));
  }
}

function numberProp(key: "radius" | "startAngle" | "endAngle", min?: number): PropSpec {
  return {
    kind: "number",
    writes: [key],
    mode: "rw",
    animatable: true,
    order: 0,
    ...(min === undefined ? {} : { min }),
    get: (object) => object.getNumber(key),
    set: (object, value) => object.setState(key, value as number),
  };
}

function endpointProp(angleKey: "startAngle" | "endAngle"): PropSpec {
  return {
    kind: "point",
    writes: [],
    mode: "ro",
    animatable: false,
    order: 0,
    get: (object) => {
      const angle = degToRad(object.getNumber(angleKey));
      const radius = object.getNumber("radius");
      const localPoint: Pt = { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
      return applyMat(object.worldMatrix(), localPoint);
    },
  };
}

const arcStyles = rectangleStyleProps();
delete arcStyles.fill;

const mainPath: PathSpec = {
  closed: "never",
  isClosed: () => false,
  build(object) {
    return new FlatPath(flattenArc(
      object.getNumber("radius"),
      object.getNumber("radius"),
      object.getNumber("startAngle"),
      object.getNumber("endAngle"),
    ), false);
  },
};

export const ARC_DEF: ClassDef = {
  type: "arc",
  family: "bounded",
  creatable: true,
  props: {
    ...baseProps({ pivotValues: ["center", "pos"] }),
    radius: numberProp("radius", 0),
    startAngle: numberProp("startAngle"),
    endAngle: numberProp("endAngle"),
    ...arcStyles,
    start: endpointProp("startAngle"),
    end: endpointProp("endAngle"),
  },
  indexed: {},
  effects: { reveal: revealWithDraw() },
  paths: { main: mainPath },
  create: (id, env) => new ArcObject(id, ARC_DEF, env),
};
