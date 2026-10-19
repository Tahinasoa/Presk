import type { SceneObject } from "@/model/sceneObject";

export interface EffectDef {
  variants: readonly string[];
  defaultDuration: number;
  defaultEase: string;
  touches: readonly string[];
  apply(o: SceneObject, variant: string, p: number): void;
}

export const EFFECT_DEFAULT_VARIANT = "default";

function clampProgress(p: number): number {
  return Math.max(0, Math.min(1, p));
}

function unknownVariant(effect: string, variant: string): never {
  throw new Error(`Presk internal: unknown variant '${variant}' for effect '${effect}'`);
}

export const REVEAL_FADE: EffectDef = {
  variants: [EFFECT_DEFAULT_VARIANT],
  defaultDuration: 0.5,
  defaultEase: "cubicOut",
  touches: ["presence"],
  apply(o, variant, p) {
    if (variant !== EFFECT_DEFAULT_VARIANT) unknownVariant("reveal", variant);
    o.setState("presence", clampProgress(p));
  },
};

export function revealWithDraw(): EffectDef {
  return {
    variants: [EFFECT_DEFAULT_VARIANT, "draw"],
    defaultDuration: 0.5,
    defaultEase: "cubicOut",
    touches: ["presence", "drawProgress"],
    apply(o, variant, p) {
      const progress = clampProgress(p);
      if (variant === EFFECT_DEFAULT_VARIANT) {
        o.setState("presence", progress);
        return;
      }
      if (variant === "draw") {
        o.setState("presence", progress > 0 ? 1 : 0);
        o.setState("drawProgress", progress);
        return;
      }
      unknownVariant("reveal", variant);
    },
  };
}
