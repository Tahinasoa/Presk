import { ANCHOR_NAMES } from "@/geom/bounds";
import { baseProps } from "@/model/baseProps";
import { REVEAL_FADE } from "@/model/effects";
import { RectangleObject, RECT_PATH, rectangleAnchorProps, rectangleSizeProps } from "@/model/classes/rectangleObject";
import type { ObjectEnv } from "@/model/ports";
import type { ClassDef, PropSpec } from "@/model/values";

export function makeReadOnly(props: Record<string, PropSpec>): Record<string, PropSpec> {
  return Object.fromEntries(
    Object.entries(props).map(([name, spec]) => [name, {
      ...spec,
      mode: "ro",
      writes: [],
      animatable: false,
      set: undefined,
    }]),
  );
}

export const SCENE_DEF: ClassDef = {
  type: "scene",
  family: "rectangle",
  creatable: false,
  props: makeReadOnly({
    ...baseProps({ pivotValues: ANCHOR_NAMES }),
    ...rectangleSizeProps(),
    ...rectangleAnchorProps(),
  }),
  indexed: {},
  effects: { reveal: REVEAL_FADE },
  paths: { main: RECT_PATH },
  create: () => {
    throw new Error("scene is created by createSceneRoot");
  },
};

export function createSceneRoot(width: number, height: number, env: ObjectEnv): RectangleObject {
  return new RectangleObject("scene", SCENE_DEF, env, { width, height, presence: 1 });
}
