# T110-model-circle
**Phase** P6 · **Dépend de** : T049-model-catalog · **Réf spec** : §11.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/classes/circle.md`
- `architecture/contracts/C-model-core.md`
- `architecture/decisions/ADR-008-class-catalog-and-prop-specs.md`

## Objectif
Implémenter la classe `circle` (famille bounded).

## Fichiers
- créer : `core/src/model/classes/circleObject.ts`
- créer : `core/src/model/classes/circleObject.test.ts`
- modifier : `core/src/model/defaultCatalog.ts`
- modifier : `core/src/model/catalog.test.ts (l'attendu de `types()` doit contenir `circle`)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T110.1 Écris les tests (cas ci-dessous), puis `CircleObject extends SceneObject` et `CIRCLE_DEF` selon `circle.md`. `localBounds` = `[-r,r]²`. Props : `baseProps({pivotValues:["center","pos"]})` + `radius` (number, rw, animable, order 0, `min:0`) + `fill/stroke/strokeWidth` (`rectangleStyleProps()`). `paths.main` : `closed:"always"`, `build` = `new FlatPath(flattenEllipse(r,r), true)`.
T110.2 Ajoute **une ligne** `register(CIRCLE_DEF)` dans `defaultCatalog.ts`.
T110.3 Mets à jour `catalog.test.ts` : l'attendu de `createDefaultCatalog().types()` devient `["circle","rectangle","scene","text"]` (c'est la seule modification autorisée de ce test).

## Cas de test (à écrire AVANT le code)
Cercle `x:100 y:100 radius:50` :
| situation | attendu |
|---|---|
| `readRef [boundingBox,topLeft]` ; `[boundingBox,center]` ; `[boundingBox,width]` | (50,50) ; (100,100) ; 100 |
| `readProp("pos")` ; `readRef [radius]` | (100,100) ; 50 |
| `describeRef(CIRCLE_DEF,[topLeft])` | `E_EXPR_SEGMENT_UNKNOWN` (pas d'ancres directes) |
| `scale 2` : `[boundingBox,width]` | 200 (pivot au centre = pos) |
| `paths.main.build(o)` : `length` (±0.1) ; `pointAt(0)` ; `pointAt(0.25)` (±0.05) | 314.159 ; (50,0) ; (0,50) |
| `CIRCLE_DEF.props.pivot.values` | `["center","pos"]` |
| `createDefaultCatalog().types()` | contient `"circle"` |
| compile `create circle {radius:-1}` | `E_VALUE_RANGE` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/circleObject.test.ts src/model/catalog.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): circle class (T110)`

## Suivante
`T111-model-ellipse`
