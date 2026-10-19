# T062-engine-compile-expr
**Phase** P4 · **Dépend de** : T061-engine-analyze-expr · **Réf spec** : §7.2, §7.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-007-expression-pipeline-parse-analyze-evaluate.md`
- `architecture/contracts/C-model-core.md (readRef)`

## Objectif
Transformer un `Expr` analysé en closure `(world) => number | Pt`.

## Fichiers
- créer : `core/src/engine/compile/exprEval.ts`
- créer : `core/src/engine/compile/exprEval.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T062.1 Écris les tests (cas ci-dessous).
T062.2 `compileExpr(expr: Expr): (world: World) => number | Pt` : récursif ; `num` → constante ; `neg` → `-v` ; `bin` → opération (les deux côtés sont des nombres, l'analyse l'a garanti ; sinon `Error` interne) ; `ref` → `readRef(world.require(object), path)`.
T062.3 Division par zéro (résultat non fini) → `throw new PreskRuntimeError("division by zero")`.
T062.4 `pathFn` → `throw new Error("Presk internal: pathFn not supported yet")` (T112).

## Cas de test (à écrire AVANT le code)
World : `scene` 800×600 ; rectangle `a` à (10,20) taille 100×50 ; `b` rectangle x 4.
| expression | résultat |
|---|---|
| `"20"` | 20 |
| `"1 + 2 * 3"` | 7 |
| `"8 / 2 / 2"` | 2 |
| `"-a.width"` | −100 |
| `"a.topRight.x + 20"` | 130 |
| `"scene.width / 2"` | 400 |
| `"a.bottomLeft"` | `{x:10,y:70}` |
| `"a.boundingBox.center.y - 100"` | −55 |
| `"a.width / b.y"` avec `b.y = 0` | lève `PreskRuntimeError` (division par zéro) |
| l'objet modifié entre deux appels de la **même** closure | la closure relit l'état (pas de cache) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/compile/exprEval.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): expression evaluation closures (T062)`

## Suivante
`T063-engine-compile-value`
