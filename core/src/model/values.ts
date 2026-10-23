import type { Pt } from "@/geom/vec";
import type { FlatPath } from "@/geom/flatPath";
import type { DiagnosticCode } from "@/lang/diagnostics";
import type { RefSegment } from "@/lang/expr/ast";
import type { EffectDef } from "./effects";
import type { ObjectEnv } from "./ports";
import type { SceneObject } from "./sceneObject";

export type { Pt };

export interface ViewTarget {
  cx: number;
  cy: number;
  zoom: number;
}

export type StateValue = number | string | boolean | Pt | readonly Pt[] | ViewTarget;

export type RefDescription =
  | { ok: true; type: "scalar" | "point" }
  | { ok: false; code: DiagnosticCode; message: string };

export type PropKind =
  | "number"
  | "point"
  | "color"
  | "string"
  | "boolean"
  | "enum"
  | "pointList"
  | "objectRef"
  | "objectRefList"
  | "region"
  | "view";

export type PropMode = "rw" | "ro" | "init";

export interface PropSpec {
  kind: PropKind;
  writes: readonly string[];
  mode: PropMode;
  animatable: boolean;
  order: 0 | 1 | 2 | 3;
  values?: readonly string[];
  min?: number;
  max?: number;
  minExclusive?: boolean;
  required?: boolean;
  minItems?: number;
  maxItems?: number;
  customKind?: string;
  get(o: SceneObject): StateValue;
  set?(o: SceneObject, v: StateValue): void;
}

export interface IndexedPropSpec {
  count(o: SceneObject): number;
  get(o: SceneObject, i: number): Pt;
  set?(o: SceneObject, i: number, worldPt: Pt): void;
  writeKey(i: number): string;
}

export interface PathSpec {
  closed: "always" | "never" | "state";
  isClosed(o: SceneObject): boolean;
  build(o: SceneObject): FlatPath;
}

export type Family = "rectangle" | "bounded" | "unbounded" | "point";

export interface ClassDef {
  type: string;
  family: Family;
  creatable: boolean;
  props: Readonly<Record<string, PropSpec>>;
  indexed: Readonly<Record<string, IndexedPropSpec>>;
  effects: Readonly<Record<string, EffectDef>>;
  paths: Readonly<Record<string, PathSpec>>;
  create(id: string, env: ObjectEnv): SceneObject;
  refExtension?: {
    describe(path: RefSegment[]): RefDescription | undefined;
    read(o: SceneObject, path: RefSegment[]): number | Pt;
  };
  afterGeometry?(o: SceneObject): void;
}
