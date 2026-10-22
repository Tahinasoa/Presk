# T118-model-polygon-triangle
**Phase** P6 · **Dépend de** : T117-model-segment-arrow · **Réf spec** : §11.2, §3.4

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/classes/polygon.md`
- `architecture/contracts/classes/triangle.md`
- `architecture/contracts/C-model-core.md`
- `architecture/decisions/ADR-008-class-catalog-and-prop-specs.md`

## Objectif
Implémenter `polygon` et `triangle` avec ancres indexées `vertex[i]`.

## Fichiers
- créer : `core/src/model/classes/polygonObject.ts`
- créer : `core/src/model/classes/polygonObject.test.ts`
- modifier : `core/src/model/defaultCatalog.ts`
- modifier : `core/src/model/catalog.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T118.1 Écris les tests (cas ci-dessous).
T118.2 `PolygonObject extends SceneObject` : état `points:[]` (tableau de `Pt`), style `rectangleStyleProps()`. `localBounds` = `boundsOfPoints(points)` (`null` si vide). `props.points` : `kind pointList`, `mode init`, `required:true`, `order 0`, `minItems` (3 polygon, 3 et `maxItems:3` triangle), `get`/`set` copient le tableau.
T118.3 `indexed.vertex` : `count` = `points.length` ; `get(o,i)` = `applyMat(worldMatrix, points[i])` (hors bornes → `PreskRuntimeError` contenant `E_ANCHOR_INDEX`) ; `set(o,i,w)` : calcule `inv = invertMat(worldMatrix())`, copie `points`, remplace l'élément `i` par `applyMat(inv,w)`, réécrit ; `writeKey(i)` = `"points."+i`.
T118.4 `paths.main` : `closed:"always"`, `build` = `new FlatPath(points, true)`. Effets : `revealWithDraw()` + état `drawProgress:1`. `POLYGON_DEF`, `TRIANGLE_DEF` (même classe, `maxItems 3`), enregistrés dans `defaultCatalog.ts` ; mets à jour `catalog.test.ts`.

## Cas de test (à écrire AVANT le code)
Polygone `x:10 y:20 points:[(0,0),(100,0),(100,100),(0,100)]` :
| situation | attendu |
|---|---|
| `[boundingBox,topLeft]` ; `[boundingBox,width]` | (10,20) ; 100 |
| `[vertex[2]]` ; `[vertex[2],x]` | (110,120) ; 110 |
| `writeProp`-équivalent : `set` indexé vertex 2 vers (200,200) | `points[2]` = (190,180) |
| `readRef [vertex[9]]` | `PreskRuntimeError` (`E_ANCHOR_INDEX`) |
| `paths.main.build(o).length` ; `closed` | 400 ; `true` |
| compile `create polygon {}` | `E_FIELD_REQUIRED` |
| compile `create polygon {points:[(0,0),(1,1)]}` | `E_VALUE_RANGE` |
| compile `create triangle {points:` 4 points `}` | `E_VALUE_RANGE` |
| `set poly {"vertex[1]":"a.center"}` (a rectangle) puis lecture | `vertex[1]` = centre de a |
| `bind` de `"vertex[1]"` : `writes` | `["points.1"]` |
| `POLYGON_DEF.effects.reveal.variants` | `["default","draw"]` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/polygonObject.test.ts src/model/catalog.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): polygon and triangle classes (T118)`

## Suivante
`T119-model-polyline`
