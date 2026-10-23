import { ANCHOR_NAMES } from "@/geom/bounds";
import { PreskRuntimeError } from "@/lang/diagnostics";
import { baseProps } from "@/model/baseProps";
import { REVEAL_FADE } from "@/model/effects";
import type { ObjectEnv } from "@/model/ports";
import { RECT_PATH, RectangleObject, rectangleAnchorProps } from "@/model/classes/rectangleObject";
import type { SceneObject } from "@/model/sceneObject";
import type { ClassDef, PropSpec } from "@/model/values";

export class ImageObject extends RectangleObject {
  constructor(id: string, def: ClassDef, env: ObjectEnv) {
    super(id, def, env, { url: "", hasW: false, hasH: false });
  }

  applyNaturalSize(): void {
    const url = this.getString("url");
    const size = this.env.images.sizeOf(url);
    if (!size) throw new PreskRuntimeError(`image size unknown: ${url}`);

    const hasW = this.getState("hasW") as boolean;
    const hasH = this.getState("hasH") as boolean;
    if (hasW && hasH) return;
    if (hasW) {
      this.setState("height", size.width === 0 ? 0 : (this.getNumber("width") * size.height) / size.width);
    } else if (hasH) {
      this.setState("width", size.height === 0 ? 0 : (this.getNumber("height") * size.width) / size.height);
    } else {
      this.setState("width", size.width);
      this.setState("height", size.height);
    }
  }
}

const urlProp: PropSpec = {
  kind: "string",
  writes: ["url"],
  mode: "init",
  animatable: false,
  order: 0,
  required: true,
  get: (object) => object.getString("url"),
  set: (object, value) => object.setState("url", value as string),
};

function sizeProp(key: "width" | "height"): PropSpec {
  const provided = key === "width" ? "hasW" : "hasH";
  return {
    kind: "number",
    writes: [key],
    mode: "rw",
    animatable: true,
    order: 0,
    min: 0,
    get: (object) => object.getNumber(key),
    set: (object, value) => {
      object.setState(key, value as number);
      object.setState(provided, true);
    },
  };
}

export const IMAGE_DEF: ClassDef = {
  type: "image",
  family: "rectangle",
  creatable: true,
  props: {
    ...baseProps({ pivotValues: ANCHOR_NAMES }),
    url: urlProp,
    width: sizeProp("width"),
    height: sizeProp("height"),
    ...rectangleAnchorProps(),
  },
  indexed: {},
  effects: { reveal: REVEAL_FADE },
  paths: { main: RECT_PATH },
  afterGeometry: (object: SceneObject) => (object as ImageObject).applyNaturalSize(),
  create: (id, env) => new ImageObject(id, IMAGE_DEF, env),
};
