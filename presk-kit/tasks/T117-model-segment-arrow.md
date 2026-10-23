# T117-model-segment-arrow
**Phase** P6 · **Dépend de** : T116-engine-golden-travel · **Réf spec** : §11.2, §3.4

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/classes/segment.md`
- `architecture/contracts/classes/arrow.md`
- `architecture/contracts/C-model-core.md`
- `architecture/decisions/ADR-008-class-catalog-and-prop-specs.md`
- `architecture/decisions/ADR-006-transform-model-pos-pivot.md`

## Objectif
Implémenter `segment` et `arrow`, avec le hook `afterGeometry` (réutilisé par `ray` et `line`).

## Fichiers
- créer : `core/src/model/classes/segmentObject.ts`
- créer : `core/src/model/classes/segmentObject.test.ts`
- modifier : `core/src/model/defaultCatalog.ts`
- modifier : `core/src/model/catalog.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T117.1 Écris les tests (cas ci-dessous).
T117.2 `SegmentObject extends SceneObject` : état `p0:{0,0}`, `p1:{100,0}`, `stroke:0x9c9c9c`, `strokeWidth:2` (+ `head:"end"` pour `arrow`). `localBounds` = `boundsOfPoints([p0,p1])`.
T117.3 Exporte `normalizeSegmentOrigin(o: SceneObject): void` : `p0=getPoint("p0")` ; `x += p0.x` ; `y += p0.y` ; `p1 = p1 − p0` ; `p0 = (0,0)`. C'est le `afterGeometry` de la classe (réutilisé par ray/line).
T117.4 Props `start`/`end` : `kind point`, `writes ["p0"]`/`["p1"]`, `mode rw`, animable, **`order 0`**. `get` = `applyMat(o.worldMatrix(), p0|p1)`. `set(o,w)` : calcule d'abord `inv = invertMat(o.worldMatrix())` **puis** écrit `p0|p1 = applyMat(inv, w)`.
T117.5 Props : `baseProps({pivotValues:["center","pos"]})`, `start`, `end`, `stroke` (color), `strokeWidth` (number ≥ 0), et `head` (enum `end|start|both|none`, mode `init`) pour `arrow`. `paths.main` : `closed:"never"`, `build` = `new FlatPath([p0,p1], false)`. `effects:{reveal: revealWithDraw()}` ; l'état initial contient alors `drawProgress: 1`.
T117.6 `SEGMENT_DEF`, `ARROW_DEF` (type `"arrow"`, même classe `SegmentObject`) ; enregistre les deux dans `defaultCatalog.ts` et corrige l'attendu de `catalog.test.ts` (ajout de `arrow`, `segment`).

## Cas de test (à écrire AVANT le code)
Création via `compileProgram` + `buildWorld` (`create segment {start:{x:10,y:20}, end:{x:110,y:20}}`) :
| situation | attendu |
|---|---|
| `x`, `y` ; `readProp("pos")` | 10, 20 ; (10,20) |
| `readRef [start]` ; `[end]` | (10,20) ; (110,20) |
| `readRef [boundingBox,width]` ; `[boundingBox,height]` | 100 ; 0 |
| `writeProp("pos",{x:0,y:0})` | start (0,0), end (100,0) |
| `writeProp("end",{x:50,y:50})` | end (50,50) ; start inchangé |
| `create segment {start:{x:0,y:0}, end:{x:100,y:0}, rotation:90}` | start ≈ (50,−50), end ≈ (50,50) (rotation autour du centre (50,0)) |
| `SEGMENT_DEF.props.start.writes` / `.end.writes` / `.pos.writes` | `["p0"]` / `["p1"]` / `["x","y"]` |
| `paths.main.build(o).length` ; `closed` | 100 ; `false` |
| `bind seg {start:"a.center", end:"b.center"}` (a, b rectangles) | start et end suivent a et b indépendamment |
| `ARROW_DEF.props.head.values` ; défaut | `["end","start","both","none"]` ; `"end"` |
| `describeRef(SEGMENT_DEF,[boundingBox,center])` | scalar/point ok (borné) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/segmentObject.test.ts src/model/catalog.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): segment and arrow classes (T117)`

## Suivante
`T118-model-polygon-triangle`
