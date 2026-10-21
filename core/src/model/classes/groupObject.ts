import { ANCHOR_NAMES, anchorOfBounds, transformBounds, unionBounds } from "@/geom/bounds";
import type { Bounds } from "@/geom/bounds";
import { applyLinear, invertMat } from "@/geom/matrix";
import type { Pt } from "@/geom/vec";
import { PreskRuntimeError } from "@/lang/diagnostics";
import { baseProps } from "@/model/baseProps";
import { REVEAL_FADE } from "@/model/effects";
import type { ObjectEnv } from "@/model/ports";
import { RectangleObject, rectangleAnchorProps, RECT_PATH } from "@/model/classes/rectangleObject";
import { SceneObject } from "@/model/sceneObject";
import type { ClassDef, PropSpec } from "@/model/values";

export class GroupObject extends RectangleObject {
  private kids: SceneObject[] = [];

  constructor(id: string, def: ClassDef, env: ObjectEnv) {
    super(id, def, env, { layout: "none", gap: 0, margin: 0, presence: 1 });
  }

  children(): readonly SceneObject[] {
    return this.kids;
  }

  setChildren(children: readonly SceneObject[]): void {
    this.kids = [...children];
  }

  addChild(child: SceneObject): void {
    if (child.parent instanceof GroupObject) {
      child.parent.removeChild(child);
    } else if (this.kids.includes(child)) {
      this.removeChild(child);
    }
    this.kids.push(child);
    child.parent = this;
  }

  removeChild(child: SceneObject): void {
    const index = this.kids.indexOf(child);
    if (index < 0) return;
    this.kids.splice(index, 1);
    if (child.parent === this) child.parent = null;
  }

  localBounds(): Bounds | null {
    let bounds: Bounds | null = null;
    for (const child of this.kids) {
      const childBounds = child.localBounds();
      if (childBounds === null) continue;
      bounds = unionBounds(bounds, transformBounds(childBounds, child.localMatrix()));
    }
    if (bounds === null) return null;

    const margin = this.getNumber("margin");
    return {
      minX: bounds.minX - margin,
      minY: bounds.minY - margin,
      maxX: bounds.maxX + margin,
      maxY: bounds.maxY + margin,
    };
  }
}

const layoutProp: PropSpec = {
  kind: "enum",
  writes: ["layout"],
  mode: "rw",
  animatable: false,
  order: 0,
  values: ["vertical", "horizontal", "none"],
  get: (object) => object.getString("layout"),
  set: (object, value) => object.setState("layout", value as string),
};

function nonNegativeNumberProp(key: "gap" | "margin"): PropSpec {
  return {
    kind: "number",
    writes: [key],
    mode: "rw",
    animatable: false,
    order: 0,
    min: 0,
    get: (object) => object.getNumber(key),
    set: (object, value) => object.setState(key, value as number),
  };
}

function groupAnchorProps(): Record<string, PropSpec> {
  const props = rectangleAnchorProps();
  for (const name of ANCHOR_NAMES) {
    const anchor = props[name];
    props[name] = {
      ...anchor,
      get(object) {
        const bounds = object.worldBounds();
        if (bounds === null) {
          throw new PreskRuntimeError(`Group '${object.id}' has no anchors without children`);
        }
        return anchorOfBounds(bounds, name);
      },
      set(object, value) {
        const bounds = object.worldBounds();
        if (bounds === null) {
          throw new PreskRuntimeError(`Group '${object.id}' has no anchors without children`);
        }
        const current = anchorOfBounds(bounds, name);
        const target = value as Pt;
        const parentDelta = applyLinear(invertMat(object.parentMatrix()), {
          x: target.x - current.x,
          y: target.y - current.y,
        });
        object.setState("x", object.getNumber("x") + parentDelta.x);
        object.setState("y", object.getNumber("y") + parentDelta.y);
      },
    };
  }
  return props;
}

export const GROUP_DEF: ClassDef = {
  type: "group",
  family: "rectangle",
  creatable: true,
  props: {
    ...baseProps({ pivotValues: ANCHOR_NAMES }),
    ...groupAnchorProps(),
    layout: layoutProp,
    gap: nonNegativeNumberProp("gap"),
    margin: nonNegativeNumberProp("margin"),
  },
  indexed: {},
  effects: { reveal: REVEAL_FADE },
  paths: { main: RECT_PATH },
  create: (id, env) => new GroupObject(id, GROUP_DEF, env),
};
