import type { SceneObject } from "@/model/sceneObject";

export interface EffectDef {
  variants: readonly string[];
  defaultDuration: number;
  defaultEase: string;
  touches: readonly string[];
  apply(o: SceneObject, variant: string, p: number): void;
}

export const EFFECT_DEFAULT_VARIANT = "default";
