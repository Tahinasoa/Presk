# T121-model-point-ray-line
**Phase** P6 · **Dépend de** : T120-model-arc · **Réf spec** : §11.2, §3.4

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/classes/point.md`
- `architecture/contracts/classes/ray.md`
- `architecture/contracts/classes/line.md`
- `architecture/contracts/C-model-core.md`

## Objectif
Implémenter les classes non bornées/ponctuelles.

## Fichiers
- créer : `core/src/model/classes/pointObject.ts`
- créer : `core/src/model/classes/rayLineObject.ts`
- créer : `core/src/model/classes/pointRayLine.test.ts`
- modifier : `core/src/model/defaultCatalog.ts`
- modifier : `core/src/model/catalog.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T121.1 Écris les tests (cas ci-dessous).
T121.2 `pointObject.ts` : `PointObject extends SceneObject`, `localBounds()` → `null`, `family:"point"`, props = `baseProps({pivotValues:["pos"]})`, `pivot` par défaut `"pos"`, `effects:{reveal: REVEAL_FADE}`, `paths:{}`.
T121.3 `rayLineObject.ts` : une classe `RayLineObject extends SceneObject` (état `p0,p1,stroke,strokeWidth`, `pivot:"pos"`, `localBounds()` → `null`), deux défs `RAY_DEF` (props `origin`,`through`) et `LINE_DEF` (props `p1`,`p2`), `family:"unbounded"`, props `start`-like **comme T117** (writes `["p0"]`/`["p1"]`, order 0, get/set monde) ; `afterGeometry: normalizeSegmentOrigin` importé de `segmentObject.ts` ; `paths:{}` ; `effects:{reveal: REVEAL_FADE}`.
T121.4 Enregistre `POINT_DEF`, `RAY_DEF`, `LINE_DEF` ; mets à jour `catalog.test.ts`. Ajoute aussi, dans `steps.test.ts` (T113), le cas `travel along` un `ray` → `E_TRAVEL_INFINITE_PATH`.

## Cas de test (à écrire AVANT le code)
| situation | attendu |
|---|---|
| point `x:5 y:6` : `readRef [pos]` ; `[pos,x]` | (5,6) ; 5 |
| point : `describeRef(POINT_DEF,[boundingBox,center])` | `E_EXPR_INFINITE_REF` ; `worldBounds()` = `null` |
| ray `{origin:{x:10,y:20}, through:{x:110,y:20}}` via compile+build : `readRef [origin]` ; `[through]` ; `[pos]` | (10,20) ; (110,20) ; (10,20) |
| ray : `describeRef(RAY_DEF,[boundingBox,center])` | `E_EXPR_INFINITE_REF` |
| line `{p1:{x:0,y:0},p2:{x:10,y:10}}` : `readRef [p2]` ; `readProp("pos")` | (10,10) ; (0,0) |
| `RAY_DEF.props.pivot` défaut (état) ; `LINE_DEF.family` | `"pos"` ; `"unbounded"` |
| compile `travel dot along ray1` | `E_TRAVEL_INFINITE_PATH` |
| compile `animate scene …`-like : `focusOn` d'un ray (P8) | (testé en T141) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/pointRayLine.test.ts src/model/catalog.test.ts src/engine/compile/steps.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): point, ray and line classes (T121)`

## Suivante
`T122-view-circle-ellipse`
