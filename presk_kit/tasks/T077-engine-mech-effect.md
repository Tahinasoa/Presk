# T077-engine-mech-effect
**Phase** P4 · **Dépend de** : T075-engine-mech-animate, T044-model-effects-reveal · **Réf spec** : §5

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-runtime.md`
- `architecture/decisions/ADR-012-effects-reveal-presence.md`
- `architecture/contracts/C-model-effects.md`

## Objectif
Implémenter `EffectMechanism` pour les entrées d'effet d'un `animate`.

## Fichiers
- créer : `core/src/engine/sim/mechanisms/effect.ts`
- créer : `core/src/engine/sim/mechanisms/effect.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T077.1 Écris les tests (cas ci-dessous).
T077.2 `EffectMechanism` : constructeur `(action: AnimateAction)` ; ne traite que les entrées `kind:"effect"`. `kind "effect"`, `end = action.end`. `activate` : `claim(target, ["@"+nom …], this)` ; `active = true`.
T077.3 `evaluate(ctx, now)` : `p = passProgress(now − start, {…}).p` ; pour chaque effet : `entry.def.apply(obj, entry.variant, entry.on ? p : 1 − p)`. `finalize` : `p` final de la même façon.
T077.4 Si un effet a perdu sa clé `@nom` (propriétaire différent, ex. `stop`) : ne plus l'écrire.

## Cas de test (à écrire AVANT le code)
Rect `a` créé sans reveal (presence 0). Action animate effet `reveal` (variant default, on true), start 1, duration 1, ease linear :
| appel | `presence` |
|---|---|
| `activate` ; `evaluate(ctx,1)` | 0 |
| `evaluate(ctx,1.5)` | 0.5 |
| `finalize` | 1 |
| même action avec `on:false` depuis `presence 1` : `evaluate(ctx,1.5)` | 0.5 ; `finalize` → 0 |
| `on:false`, variant `"draw"` sur une classe de test avec `revealWithDraw()` : `evaluate(1.5)` | `drawProgress` 0.5, `presence` 1 |
| `stop` (clé `@reveal` retirée) puis `evaluate` | n'écrit plus |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/mechanisms/effect.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): effect mechanism (T077)`

## Suivante
`T078-engine-sim-instant-actions`
