# T154-engine-warning-speed-path
**Phase** P9 · **Dépend de** : T153-view-curve, T114-engine-travel-resolver · **Réf spec** : §8.4 (Q7)

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-009-timeline-planning.md`
- `architecture/decisions/ADR-013-paths-and-travel.md`
- `architecture/contracts/C-lang-diagnostics.md`

## Objectif
Avertir quand la durée d'un `travel` à `speed` est mesurée sur un chemin qui change avant le `travel`.

## Fichiers
- modifier : `core/src/engine/analyze/travelPlan.ts`
- modifier : `core/src/engine/analyze/travelPlan.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T154.1 Après le calcul de durée par `speed` : parcours les actions **déjà planifiées** (via `onPlanned`) ; si l'une d'elles (`set`, `animate`, `bind`, `travel`) a pour cible l'objet du chemin (ou un ancêtre statique) et écrit une clé parmi `scale`, `width`, `height`, `radius`, `points`, `p0`, `p1`, `startAngle`, `endAngle`, `closed` **et** que son `start` est `<` au `start` du travel → `d.warning("W_SPEED_PATH_MAY_CHANGE", …, {stepIndex})`.
T154.2 Ces avertissements finissent dans `Program.warnings` (déjà câblé par `compileProgram`).

## Cas de test (à écrire AVANT le code)
Rectangle `track` ; `travel dot along track speed 100` :
| situation | attendu |
|---|---|
| aucune action sur `track` | aucun avertissement |
| `animate track {scale:2} duration 1` avant le travel | `W_SPEED_PATH_MAY_CHANGE` (et `Program` toujours produit) |
| `animate track {x:100} duration 1` avant | aucun (une translation ne change pas la longueur) |
| `animate track {width:200}` **après** (start plus grand) | aucun |
| travel avec `duration` explicite | aucun |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/analyze/travelPlan.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): speed path warning (T154)`

## Suivante
`T155-move-easing-to-lang`
