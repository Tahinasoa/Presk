import type { Diagnostic } from "@/lang/diagnostics";
import type { StartSpec } from "@/lang/start";
import type { RepeatMode, SceneConfig } from "@/lang/types";
import type { EffectDef } from "@/model/effects";
import type { PropSpec, StateValue } from "@/model/values";
import type { World } from "@/model/world";

export type Evaluator = (world: World) => StateValue;
export interface CompiledProp { kind: "prop"; name: string; spec: PropSpec; value: Evaluator; reads: readonly string[] }
export interface CompiledEffect { kind: "effect"; name: string; def: EffectDef; variant: string; on: boolean }
export type CompiledEntry = CompiledProp | CompiledEffect;
export interface InitStep { id: string; type: string; entries: CompiledEntry[] }
export interface ActionBase { index: number; target: string; name?: string; start: number; end: number; duration: number }
export interface SetAction extends ActionBase { action: "set"; entries: CompiledEntry[] }
export interface AnimateAction extends ActionBase { action: "animate"; entries: CompiledEntry[]; ease: string; repeat: number | "infinite"; repeatMode: RepeatMode }
export interface BindAction extends ActionBase { action: "bind"; entries: CompiledProp[] }
export interface UnbindAction extends ActionBase { action: "unbind"; keys: string[] | null }
export interface StopAction extends ActionBase { action: "stop"; keys: string[] | null }
export interface TravelAction extends ActionBase {
  action: "travel";
  along: { object: string; path: string };
  fromT: number;
  toT: number;
  ease: string;
  repeat: number | "infinite";
  repeatMode: RepeatMode;
  orient: { offset: number } | null;
  anchor: string;
}
export interface GroupAction extends ActionBase { action: "group"; props: CompiledEntry[]; children: string[]; ease: string }
export interface UngroupAction extends ActionBase { action: "ungroup"; children: string[] | null }
export type PlannedAction = SetAction | AnimateAction | BindAction | UnbindAction | StopAction | TravelAction | GroupAction | UngroupAction;
export interface Program { scene: SceneConfig; init: InitStep[]; actions: PlannedAction[]; duration: number; warnings: Diagnostic[] }

export type DraftOf<T> = T extends ActionBase ? Omit<T, "start" | "end" | "duration"> : never;

export type TravelDraft = DraftOf<TravelAction> & {
  startSpec: StartSpec;
  explicitDuration?: number;
  speed?: number;
  fromSpec: number | "current";
  toSpec?: number;
};

export type DraftAction =
  | (DraftOf<Exclude<PlannedAction, TravelAction>> & {
      startSpec: StartSpec;
      explicitDuration?: number;
      effectDefaultDuration?: number;
    })
  | (TravelDraft & { effectDefaultDuration?: number });

export interface PlanHooks {
  resolveTravel?(
    draft: TravelDraft,
    start: number,
  ): { fromT: number; toT: number; duration: number } | null;
  onPlanned?(action: PlannedAction): void;
}
