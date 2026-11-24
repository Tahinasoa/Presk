import { ANCHOR_NAMES } from "@/geom/bounds";
import { baseProps } from "@/model/baseProps";
import { REVEAL_FADE } from "@/model/effects";
import { parseTextFrame, parseTextHighlight, serializeTextFrame, serializeTextHighlight } from "@/model/textDecorations";
import type { ObjectEnv } from "@/model/ports";
import type { SceneObject } from "@/model/sceneObject";
import { RectangleObject, rectangleAnchorProps, RECT_PATH } from "@/model/classes/rectangleObject";
import type { ClassDef, PropSpec, StateValue } from "@/model/values";

export class TextObject extends RectangleObject {
  constructor(id: string, def: ClassDef, env: ObjectEnv) {
    super(id, def, env, {
      text: "",
      color: "#ffffff",
      fontSize: 32,
      fontFamily: "sans-serif",
      fontWeight: "bold",
      frame: "none",
      highlight: "none",
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    });
    this.remeasure();
  }

  remeasure(): void {
    const dimensions = this.env.measurer.measure(this.getString("text"), {
      fontSize: this.getNumber("fontSize"),
      fontFamily: this.getString("fontFamily"),
      fontWeight: this.getString("fontWeight") as "normal" | "bold",
    });
    this.setState("width", dimensions.width + this.getNumber("marginLeft") + this.getNumber("marginRight"));
    this.setState("height", dimensions.height + this.getNumber("marginTop") + this.getNumber("marginBottom"));
  }
}

function setAndRemeasure(key: "text" | "fontSize" | "fontFamily" | "fontWeight", value: StateValue, object: SceneObject): void {
  object.setState(key, value);
  (object as TextObject).remeasure();
}

type MarginSide = "marginTop" | "marginBottom" | "marginLeft" | "marginRight";

const marginSides: Record<string, readonly MarginSide[]> = {
  margin: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
  marginHorizontal: ["marginLeft", "marginRight"],
  marginVertical: ["marginTop", "marginBottom"],
  marginTop: ["marginTop"],
  marginBottom: ["marginBottom"],
  marginLeft: ["marginLeft"],
  marginRight: ["marginRight"],
};

function getUniformMargin(object: SceneObject, name: string, sides: readonly MarginSide[]): number {
  const first = sides[0];
  if (!first) throw new Error(`Presk internal: margin '${name}' has no sides`);
  const value = object.getNumber(first);
  if (sides.some((side) => object.getNumber(side) !== value)) {
    throw new Error(`Presk internal: margin '${name}' is not uniform; read its individual sides instead`);
  }
  return value;
}

function setMargin(sides: readonly MarginSide[], value: StateValue, object: SceneObject): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error("Presk internal: text margins must be finite non-negative numbers");
  }
  for (const side of sides) object.setState(side, value);
  (object as TextObject).remeasure();
}

const marginProps: Record<string, PropSpec> = Object.fromEntries(
  Object.entries(marginSides).map(([name, sides]) => [name, {
    kind: "number",
    writes: sides,
    mode: "rw",
    animatable: false,
    order: 0,
    min: 0,
    get: (object: SceneObject) => getUniformMargin(object, name, sides),
    set: (object: SceneObject, value: StateValue) => setMargin(sides, value, object),
  } satisfies PropSpec]),
);

const textProps: Record<string, PropSpec> = {
  ...marginProps,
  frame: {
    kind: "string",
    customKind: "text.frame",
    writes: ["frame"],
    mode: "rw",
    animatable: false,
    order: 0,
    get: (object) => object.getString("frame"),
    set: (object, value) => {
      const parsed = parseTextFrame(value);
      if (!parsed.ok) throw new Error("Presk internal: invalid text frame");
      object.setState("frame", serializeTextFrame(parsed.value));
    },
  },
  highlight: {
    kind: "string",
    customKind: "text.highlight",
    writes: ["highlight"],
    mode: "rw",
    animatable: false,
    order: 0,
    get: (object) => object.getString("highlight"),
    set: (object, value) => {
      const parsed = parseTextHighlight(value);
      if (!parsed.ok) throw new Error("Presk internal: invalid text highlight");
      object.setState("highlight", serializeTextHighlight(parsed.value));
    },
  },
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
    get: (object) => object.getColor("color"),
    set: (object, value) => object.setState("color", value),
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
