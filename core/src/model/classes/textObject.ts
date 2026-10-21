import { ANCHOR_NAMES } from "@/geom/bounds";
import { baseProps } from "@/model/baseProps";
import { REVEAL_FADE } from "@/model/effects";
import type { ObjectEnv } from "@/model/ports";
import type { SceneObject } from "@/model/sceneObject";
import { RectangleObject, rectangleAnchorProps, RECT_PATH } from "@/model/classes/rectangleObject";
import type { ClassDef, PropSpec, StateValue } from "@/model/values";

export class TextObject extends RectangleObject {
  constructor(id: string, def: ClassDef, env: ObjectEnv) {
    super(id, def, env, {
      text: "",
      color: 0xffffff,
      fontSize: 32,
      fontFamily: "sans-serif",
      fontWeight: "bold",
    });
    this.remeasure();
  }

  remeasure(): void {
    const dimensions = this.env.measurer.measure(this.getString("text"), {
      fontSize: this.getNumber("fontSize"),
      fontFamily: this.getString("fontFamily"),
      fontWeight: this.getString("fontWeight") as "normal" | "bold",
    });
    this.setState("width", dimensions.width);
    this.setState("height", dimensions.height);
  }
}

function setAndRemeasure(key: "text" | "fontSize" | "fontFamily" | "fontWeight", value: StateValue, object: SceneObject): void {
  object.setState(key, value);
  (object as TextObject).remeasure();
}

const textProps: Record<string, PropSpec> = {
  width: {
    kind: "number",
    writes: [],
    mode: "ro",
    animatable: false,
    order: 0,
    get: (object) => object.getNumber("width"),
  },
  height: {
    kind: "number",
    writes: [],
    mode: "ro",
    animatable: false,
    order: 0,
    get: (object) => object.getNumber("height"),
  },
  text: {
    kind: "string",
    writes: ["text"],
    mode: "rw",
    animatable: false,
    order: 0,
    get: (object) => object.getString("text"),
    set: (object, value) => setAndRemeasure("text", value, object),
  },
  color: {
    kind: "color",
    writes: ["color"],
    mode: "rw",
    animatable: true,
    order: 0,
    get: (object) => object.getNumber("color"),
    set: (object, value) => object.setState("color", value as number),
  },
  fontSize: {
    kind: "number",
    writes: ["fontSize"],
    mode: "rw",
    animatable: true,
    order: 0,
    min: 0,
    minExclusive: true,
    get: (object) => object.getNumber("fontSize"),
    set: (object, value) => setAndRemeasure("fontSize", value, object),
  },
  fontFamily: {
    kind: "string",
    writes: ["fontFamily"],
    mode: "rw",
    animatable: false,
    order: 0,
    get: (object) => object.getString("fontFamily"),
    set: (object, value) => setAndRemeasure("fontFamily", value, object),
  },
  fontWeight: {
    kind: "enum",
    writes: ["fontWeight"],
    mode: "rw",
    animatable: false,
    order: 0,
    values: ["normal", "bold"],
    get: (object) => object.getString("fontWeight"),
    set: (object, value) => setAndRemeasure("fontWeight", value, object),
  },
};

export const TEXT_DEF: ClassDef = {
  type: "text",
  family: "rectangle",
  creatable: true,
  props: {
    ...baseProps({ pivotValues: ANCHOR_NAMES }),
    ...rectangleAnchorProps(),
    ...textProps,
  },
  indexed: {},
  effects: { reveal: REVEAL_FADE },
  paths: { main: RECT_PATH },
  create: (id, env) => new TextObject(id, TEXT_DEF, env),
};
