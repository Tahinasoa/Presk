# T046-model-refs
**Phase** P3 · **Dépend de** : T045-model-rectangle-object · **Réf spec** : §3.3, §7.1, §7.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-model-core.md (section Lecture de références)`
- `architecture/decisions/ADR-007-expression-pipeline-parse-analyze-evaluate.md`
- `architecture/contracts/C-lang-expr.md`

## Objectif
Implémenter `describeRef` (statique) et `readRef` (dynamique) selon les 6 règles du contrat.

## Fichiers
- créer : `core/src/model/refs.ts`
- créer : `core/src/model/refs.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T046.1 Écris les tests (cas ci-dessous). Utilise `RECTANGLE_DEF` ; pour la famille `point`/`unbounded`, construis un `ClassDef` de test.
T046.2 `describeRef(def, path)` : suis les règles 1 à 5 du contrat, dans l'ordre. Pour la règle 3, `boundingBox` accepte aussi `width`/`height`. Les codes sont ceux de `C-lang-diagnostics.md`.
T046.3 `readRef(o, path)` : suit les mêmes règles ; suppose que `describeRef` est déjà ok (sinon `throw new Error("Presk internal: invalid ref")`). `boundingBox.*` lit `o.worldBounds()` (`anchorOfBounds`, `boundsWidth`, `boundsHeight`). Indexée : `def.indexed[name].get(o, index)` ; hors bornes (`index >= count`) → `throw new PreskRuntimeError("E_ANCHOR_INDEX: ...")`.

## Cas de test (à écrire AVANT le code)
`describeRef(RECTANGLE_DEF, path)` :
| path | résultat |
|---|---|
| `[width]` | scalar |
| `[topRight]` | point |
| `[topRight,x]` | scalar |
| `[pos]` / `[pos,y]` | point / scalar |
| `[boundingBox,center]` / `[boundingBox,center,y]` / `[boundingBox,width]` | point / scalar / scalar |
| `[boundingBox]` | `E_EXPR_BOUNDINGBOX_ALONE` |
| `[left]`, `[top]` | `E_EXPR_SEGMENT_UNKNOWN` |
| `[fill]`, `[pivot]` | `E_EXPR_SEGMENT_UNKNOWN` |
| `[topRight,z]`, `[width,x]`, `[boundingBox,foo]` | `E_EXPR_SEGMENT_UNKNOWN` |
| famille `point`/`unbounded` : `[boundingBox,center]` | `E_EXPR_INFINITE_REF` |
`readRef` sur rectangle `x10 y20 w100 h50` :
| `[width]` | 100 |
| `[topRight,x]` | 110 |
| `[bottomLeft]` | `{x:10,y:70}` |
| `[boundingBox,center,y]` | 45 |
| rotation 90 : `[boundingBox,width]` ; `[boundingBox,height]` | 50 ; 100 |
| classe de test avec `indexed.vertex` (3 sommets) : `[{name:"vertex",index:5}]` | lève `PreskRuntimeError` contenant `E_ANCHOR_INDEX` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/refs.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): reference description and reading (T046)`

## Suivante
`T047-model-text-object`
