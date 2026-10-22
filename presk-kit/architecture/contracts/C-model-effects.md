# C-model-effects — `core/src/model/effects.ts`

```ts
export interface EffectDef {
  variants: readonly string[];            // contient toujours "default"
  defaultDuration: number;                // secondes
  defaultEase: string;                    // nom d'easing valide
  touches: readonly string[];             // clés d'état écrites (documentation + analyse)
  apply(o: SceneObject, variant: string, p: number): void;   // p ∈ [0,1] ; p=0 « off », p=1 « on » ; pure vis-à-vis de p
}
export const EFFECT_DEFAULT_VARIANT = "default";
export const REVEAL_FADE: EffectDef;        // variants ["default"], 0.5 s, "cubicOut", touches ["presence"], apply: presence = p
export function revealWithDraw(): EffectDef; // variants ["default","draw"], 0.5 s, "cubicOut", touches ["presence","drawProgress"]
                                             // "draw" : presence = p > 0 ? 1 : 0 ; drawProgress = p
```
- Classe avec `draw` : l'état initial contient `drawProgress: 1`. Les autres classes n'ont pas cette clé.
- `apply` ne lit pas l'état précédent. `p` hors [0,1] est clampé.
- Valeur DSL d'un effet : `true` | `false` | chaîne (variante). Une variante inconnue → `E_EFFECT_VALUE`.
- `false` = jouer l'**inverse de la dernière variante jouée** : `p` va de 1 à 0 avec cette variante (ADR-012). Résolu en T069.
- `set` d'un effet : `true`/variante → `apply(o, variant, 1)` ; `false` → `apply(o, lastVariant, 0)`.
