# T073-engine-sim-ticks
**Phase** P4 · **Dépend de** : T071-engine-compile-program · **Réf spec** : §6.5, §7.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-runtime.md (section Ticks)`
- `architecture/decisions/ADR-010-simulation-ticks-and-evaluation-order.md`

## Objectif
`tickTimes` : instants d'évaluation (grille ∪ débuts ∪ fins finies).

## Fichiers
- créer : `core/src/engine/sim/ticks.ts`
- créer : `core/src/engine/sim/ticks.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T073.1 Écris les tests (cas ci-dessous ; programmes factices : `{actions:[{start,end}], duration}` casté en `Program`).
T073.2 `tickTimes(program: Program, fps: number, after: number, upTo: number): number[]`. Renvoie les `τ` tels que `after < τ ≤ upTo` (tolérance 1e-9 : `τ > after + 1e-9` et `τ ≤ upTo + 1e-9`), triés croissants, **sans doublon à 1e-9 près**, parmi `k/fps` (k entier ≥ 0), chaque `action.start`, chaque `action.end` fini. Arrondis chaque `τ` à 1e-9.

## Cas de test (à écrire AVANT le code)
| appel | attendu |
|---|---|
| actions vides, fps 2, `after −1`, `upTo 1` | `[0,0.5,1]` |
| même, `after 0`, `upTo 1` | `[0.5,1]` |
| action start 0.25, end 0.75 ; fps 2 ; `after −1`, `upTo 1` | `[0,0.25,0.5,0.75,1]` |
| end `Infinity` | pas d'instant infini |
| start 1.0000000001 (doublon avec grille 1) fps 1 | un seul 1 |
| fps 60, `after −1`, `upTo 1` | 61 valeurs, la dernière = 1 |
| `upTo` < `after` | `[]` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/ticks.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): tick times (T073)`

## Suivante
`T074-engine-sim-context-ownership`
