# T061-engine-analyze-expr
**Phase** P4 · **Dépend de** : T060-engine-program-types, T046-model-refs, T016-lang-expr-parser-references · **Réf spec** : §7.2, §7.5

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-compile.md (section AnalyzeScope)`
- `architecture/decisions/ADR-007-expression-pipeline-parse-analyze-evaluate.md`
- `architecture/contracts/C-lang-diagnostics.md`

## Objectif
Implémenter `analyzeExpr` : type (`scalar`/`point`), objets lus, erreurs sémantiques. (`pathFn` est refusé ici, il sera ajouté en T112.)

## Fichiers
- créer : `core/src/engine/analyze/expr.ts`
- créer : `core/src/engine/analyze/expr.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T061.1 Écris les tests (cas ci-dessous). Pour obtenir un `Expr` utilise `parseExpression` (helper de test : `p(src)` qui lève si `ok:false`).
T061.2 `analyzeExpr(expr, scope, d, where): Analyzed | null` : récursif. `num` → scalar. `neg` → opérande scalar sinon `E_EXPR_POINT_IN_ARITHMETIC`. `bin` → les deux scalar sinon `E_EXPR_POINT_IN_ARITHMETIC` ; résultat scalar.
T061.3 `ref` : `typeOf(object)` indéfini → `E_FORWARD_REFERENCE` si `scope.isForward?.(object)` sinon `E_OBJECT_UNKNOWN`. Si le 1er segment est un nom d'effet de la classe (`def.effects`) → `E_EFFECT_IN_EXPRESSION`. Sinon `describeRef(def, path)` ; erreur → `d.error(code, message, where)` et renvoie `null`.
T061.4 `pathFn` → `d.error("E_EXPR_PATH", "path functions not supported yet", where)`, renvoie `null`.
T061.5 Si un sous-arbre renvoie `null`, renvoie `null` (l'erreur est déjà signalée). `reads` : objets lus, sans doublon, ordre d'apparition.

## Cas de test (à écrire AVANT le code)
Catalogue par défaut ; objets `a` (rectangle), `t` (text) :
| expression | résultat |
|---|---|
| `"20"` | scalar, reads [] |
| `"a.width / 2"` | scalar, reads [a] |
| `"a.topRight"` | point |
| `"a.topRight.x + t.width"` | scalar, reads [a,t] |
| `"scene.center.y"` | scalar, reads [scene] |
| `"a.topRight + 1"` / `"-a.center"` / `"a.center * 2"` | `E_EXPR_POINT_IN_ARITHMETIC` |
| `"a.boundingBox"` | `E_EXPR_BOUNDINGBOX_ALONE` |
| `"a.left"` | `E_EXPR_SEGMENT_UNKNOWN` |
| `"zzz.x"` | `E_OBJECT_UNKNOWN` ; avec `isForward("zzz")` vrai : `E_FORWARD_REFERENCE` |
| `"a.reveal"` | `E_EFFECT_IN_EXPRESSION` |
| `"a.pathX(main, 0)"` | `E_EXPR_PATH` (pour l'instant) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/analyze/expr.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): expression analysis (T061)`

## Suivante
`T062-engine-compile-expr`
