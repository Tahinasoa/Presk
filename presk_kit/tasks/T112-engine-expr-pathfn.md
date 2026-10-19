# T112-engine-expr-pathfn
**Phase** P6 · **Dépend de** : T110-model-circle, T062-engine-compile-expr, T061-engine-analyze-expr · **Réf spec** : §7.4

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-013-paths-and-travel.md`
- `architecture/contracts/C-lang-expr.md`
- `architecture/decisions/ADR-007-expression-pipeline-parse-analyze-evaluate.md`
- `architecture/contracts/C-model-core.md (PathSpec)`

## Objectif
Autoriser `pathX`, `pathY`, `pathAngle` dans l'analyse et l'évaluation.

## Fichiers
- modifier : `core/src/engine/analyze/expr.ts`
- modifier : `core/src/engine/analyze/expr.test.ts`
- modifier : `core/src/engine/compile/exprEval.ts`
- modifier : `core/src/engine/compile/exprEval.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T112.1 Ajoute les cas ci-dessous aux deux fichiers de test (supprime/adapte le test « `pathX` → `E_EXPR_PATH` pour l'instant » de T061).
T112.2 **Analyse** (`pathFn`) : l'objet doit exister (`E_OBJECT_UNKNOWN`/`E_FORWARD_REFERENCE`) ; `def.paths[pathName]` absent → `E_EXPR_PATH` ; si `PathSpec.closed === "never"` et `t < 0 || t > 1` → `E_EXPR_PATH` ; résultat `scalar`, `reads:[object]`.
T112.3 **Évaluation** : `o = world.require(object)` ; `flat = def.paths[name].build(o)` ; `w = o.worldMatrix()` ; `pathX` = `applyMat(w, flat.pointAt(t)).x` ; `pathY` = `.y` ; `pathAngle` = `flat.angleAt(t) + matRotationDeg(w)`. Chemin ouvert et `t` hors [0,1] à l'exécution → `PreskRuntimeError`.
T112.4 Retire le `throw` « pathFn not supported yet » de `exprEval.ts`.

## Cas de test (à écrire AVANT le code)
Rectangle `a` à (10,20), 100×50 (périmètre 300) :
| expression | résultat |
|---|---|
| `a.pathX(main, 0)` ; `a.pathY(main, 0)` | 10 ; 20 |
| `a.pathX(main, 0.5)` ; `a.pathY(main, 0.5)` | 110 ; 70 |
| `a.pathX(main, -0.25)` (fermé : modulo) | 35 |
| `a.pathAngle(main, 0.4)` | 90 |
| même rect avec `rotation 90` : `a.pathAngle(main, 0.4)` | 180 |
| `a.pathX(main, 0) + 5` | 15 (type scalar) |
| analyse : `a.pathX(foo, 0)` | `E_EXPR_PATH` |
| analyse : objet de classe `point` (aucun chemin) | `E_EXPR_PATH` |
| analyse : classe de test avec `paths.main.closed:"never"`, `t = 1.5` | `E_EXPR_PATH` |
| analyse : `zzz.pathX(main,0)` | `E_OBJECT_UNKNOWN` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/analyze/expr.test.ts src/engine/compile/exprEval.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): path functions in expressions (T112)`

## Suivante
`T113-engine-compile-travel`
