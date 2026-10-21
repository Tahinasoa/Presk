import type { Pt } from "@/geom/vec";
import type { PropSpec, StateValue } from "@/model/values";
import type { SceneObject } from "@/model/sceneObject";

function writeNumber(o: SceneObject, key: string, value: StateValue): void {
  o.setState(key, value as number);
}

export function baseProps(opts: { pivotValues: readonly string[] }): Record<string, PropSpec> {
  return {
    x: {
      kind: "number",
      writes: ["x"],
      mode: "rw",
      animatable: true,
      order: 2,
      get: (o) => o.getNumber("x"),
      set: (o, value) => writeNumber(o, "x", value),
    },
    y: {
      kind: "number",
      writes: ["y"],
      mode: "rw",
      animatable: true,
      order: 2,
      get: (o) => o.getNumber("y"),
      set: (o, value) => writeNumber(o, "y", value),
    },
    pos: {
      kind: "point",
      writes: ["x", "y"],
      mode: "rw",
      animatable: true,
      order: 2,
      get: (o) => ({ x: o.getNumber("x"), y: o.getNumber("y") }),
      set: (o, value) => {
        const point = value as Pt;
        o.setState("x", point.x);
        o.setState("y", point.y);
      },
    },
    rotation: {
      kind: "number",
      writes: ["rotation"],
      mode: "rw",
      animatable: true,
      order: 1,
      get: (o) => o.getNumber("rotation"),
      set: (o, value) => writeNumber(o, "rotation", value),
    },
    scale: {
      kind: "number",
      writes: ["scale"],
      mode: "rw",
      animatable: true,
      order: 1,
      min: 0,
      minExclusive: true,
      get: (o) => o.getNumber("scale"),
      set: (o, value) => writeNumber(o, "scale", value),
    },
    opacity: {
      kind: "number",
      writes: ["opacity"],
      mode: "rw",
      animatable: true,
      order: 3,
      min: 0,
      max: 1,
      get: (o) => o.getNumber("opacity"),
      set: (o, value) => writeNumber(o, "opacity", value),
    },
    pivot: {
      kind: "enum",
      writes: ["pivot"],
      mode: "init",
      animatable: false,
      order: 1,
      values: opts.pivotValues,
      get: (o) => o.getString("pivot"),
      set: (o, value) => o.setState("pivot", value as string),
    },
  };
}
