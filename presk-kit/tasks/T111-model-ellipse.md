# T111-model-ellipse
**Phase** P6 · **Dépend de** : T110-model-circle · **Réf spec** : §11.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/classes/ellipse.md`
- `architecture/contracts/C-model-core.md`

## Objectif
Implémenter la classe `ellipse`.

## Fichiers
- créer : `core/src/model/classes/ellipseObject.ts`
- créer : `core/src/model/classes/ellipseObject.test.ts`
- modifier : `core/src/model/defaultCatalog.ts`
- modifier : `core/src/model/catalog.test.ts (l'attendu de `types()` doit contenir `ellipse`)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T111.1 Écris `ellipseObject.test.ts` (cas ci-dessous), puis la classe `EllipseObject` et `ELLIPSE_DEF` en suivant **exactement** la fiche de classe (état initial, propriétés, ancres, bornes, chemin, effets).
T111.2 Réutilise `baseProps`, `rectangleStyleProps` (T045) et `REVEAL_FADE`/`revealWithDraw` (T044) ; ne duplique pas leur code.
T111.3 Ajoute **une ligne** `register(...)` dans `core/src/model/defaultCatalog.ts`.
T111.4 Mets à jour le test du catalogue (`catalog.test.ts`) : la liste de `types()` doit contenir `"ellipse"` ; modifie l'attendu en conséquence (c'est la seule modification autorisée d'un test existant).

## Cas de test (à écrire AVANT le code)
Ellipse `x:200 y:100 width:100 height:60` :
| situation | attendu |
|---|---|
| `[boundingBox,topLeft]` ; `[boundingBox,center]` ; `[boundingBox,height]` | (150,70) ; (200,100) ; 60 |
| `paths.main.build(o)` : `pointAt(0)` ; `pointAt(0.25)` (±0.05) | (50,0) ; (0,30) |
| `ellipse.width` modifiée à 200 : `[boundingBox,width]` | 200 |
| `describeRef(ELLIPSE_DEF,[topLeft])` | `E_EXPR_SEGMENT_UNKNOWN` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/ellipseObject.test.ts src/model/catalog.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): ellipse class (T111)`

## Suivante
`T112-engine-expr-pathfn`
