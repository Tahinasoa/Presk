import { ANCHOR_NAMES } from "@/geom/bounds";
import { baseProps } from "@/model/baseProps";
import { REVEAL_FADE } from "@/model/effects";
import { RectangleObject, RECT_PATH, rectangleAnchorProps, rectangleSizeProps } from "@/model/classes/rectangleObject";
import { PreskRuntimeError } from "@/lang/diagnostics";
import type { ObjectEnv } from "@/model/ports";
import type { ClassDef, PropSpec, ViewTarget } from "@/model/values";
import type { SceneObject } from "@/model/sceneObject";

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

function viewProp(customKind: string): PropSpec {
  return {
    kind: "view",
    writes: ["viewCx", "viewCy", "viewZoom"],
    mode: "rw",
    animatable: true,
    order: 0,
    customKind,
    get: (object) => ({
      cx: object.getNumber("viewCx"),
      cy: object.getNumber("viewCy"),
      zoom: object.getNumber("viewZoom"),
    }),
    set: (object, value) => {
      const target = value as ViewTarget;
      object.setState("viewCx", target.cx);
      object.setState("viewCy", target.cy);
      object.setState("viewZoom", target.zoom);
    },
  };
}

export const SCENE_DEF: ClassDef = {
  type: "scene",
  family: "rectangle",
  creatable: false,
  props: {
    ...makeReadOnly({
      ...baseProps({ pivotValues: ANCHOR_NAMES }),
      ...rectangleSizeProps(),
      ...rectangleAnchorProps(),
    }),
    focusOn: viewProp("scene.focusOn"),
    view: viewProp("scene.view"),
    zoom: viewProp("scene.zoom"),
  },
  indexed: {},
  effects: { reveal: REVEAL_FADE },
  paths: { main: RECT_PATH },
  create: () => {
    throw new Error("scene is created by createSceneRoot");
  },
};

export function createSceneRoot(width: number, height: number, env: ObjectEnv): RectangleObject {
  return new RectangleObject("scene", SCENE_DEF, env, {
    width,
    height,
    presence: 1,
    viewCx: width / 2,
    viewCy: height / 2,
    viewZoom: 1,
  });
}

export function viewRegion(o: SceneObject): { x: number; y: number; width: number; height: number } {
  const width = o.getNumber("width") / o.getNumber("viewZoom");
  const height = o.getNumber("height") / o.getNumber("viewZoom");
  const cx = o.getNumber("viewCx");
  const cy = o.getNumber("viewCy");
  return { x: cx - width / 2, y: cy - height / 2, width, height };
}

export function fitRegionToScene(
  region: { x: number; y: number; width: number; height: number },
  sceneWidth: number,
  sceneHeight: number,
): ViewTarget {
  if (region.width <= 0 || region.height <= 0) {
    throw new PreskRuntimeError("E_VIEW_RANGE");
  }

  const sceneRatio = sceneWidth / sceneHeight;
  let zoom: number;
  if (region.width / region.height > sceneRatio) {
    const height = region.width / sceneRatio;
    zoom = sceneHeight / height;
  } else {
    const width = region.height * sceneRatio;
    zoom = sceneWidth / width;
  }

  return {
    cx: region.x + region.width / 2,
    cy: region.y + region.height / 2,
    zoom,
  };
}
