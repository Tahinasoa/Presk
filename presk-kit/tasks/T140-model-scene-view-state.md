# T140-model-scene-view-state
**Phase** P8 · **Dépend de** : T135-engine-golden-groups · **Réf spec** : §3.5

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-016-scene-view-viewport.md`
- `architecture/contracts/C-model-core.md`
- `architecture/contracts/classes/scene.md`

## Objectif
Ajouter à `scene` l'état de vue (`viewCx`, `viewCy`, `viewZoom`) et les propriétés `focusOn`, `view`, `zoom` (kind `view`).

## Fichiers
- modifier : `core/src/model/classes/sceneRoot.ts`
- modifier : `core/src/model/classes/sceneRoot.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T140.1 Vérifie que `values.ts` contient déjà `ViewTarget`, le kind `"view"` et `PropSpec.customKind` (ils ont été ajoutés au contrat) ; **s'ils manquent dans le code**, ajoute-les (seule modification de `values.ts` autorisée ici).
T140.2 `createSceneRoot` : état initial supplémentaire `viewCx: width/2`, `viewCy: height/2`, `viewZoom: 1`.
T140.3 Dans `SCENE_DEF.props`, **après** `makeReadOnly(...)` (les propriétés de vue ne sont pas en lecture seule) ajoute `focusOn`, `view`, `zoom` : `kind:"view"`, `writes:["viewCx","viewCy","viewZoom"]`, `mode:"rw"`, `animatable:true`, `order:0`, `customKind:"scene.focusOn" | "scene.view" | "scene.zoom"`. `get(o)` → `{cx: viewCx, cy: viewCy, zoom: viewZoom}` ; `set(o,v)` écrit les 3 clés depuis un `ViewTarget`.
T140.4 Exporte `viewRegion(o: SceneObject): {x:number;y:number;width:number;height:number}` : `width = sceneWidth/zoom`, `height = sceneHeight/zoom`, `x = cx − width/2`, `y = cy − height/2`.
T140.5 Exporte `fitRegionToScene(region, sceneWidth, sceneHeight): ViewTarget` : ratio `r = sceneWidth/sceneHeight` ; si `region.width/region.height > r` → `h' = region.width / r` sinon `w' = region.height × r` ; centre inchangé ; `zoom = sceneWidth / width'`. Largeur ou hauteur ≤ 0 → `PreskRuntimeError("E_VIEW_RANGE")`.

## Cas de test (à écrire AVANT le code)
language/Presk — Spécification v1.0.md §3.5 (relis-la : c'est la référence)
Scène 1600×900 :
| situation | attendu |
|---|---|
| racine : `readProp("zoom")` (via `SCENE_DEF.props.zoom.get`) | `{cx:800, cy:450, zoom:1}` |
| `viewRegion(root)` | `{x:0,y:0,width:1600,height:900}` |
| `set` du ViewTarget `{cx:400,cy:300,zoom:2}` puis `viewRegion` | `{x:0,y:75,width:800,height:450}` |
| `fitRegionToScene({x:0,y:0,width:800,height:450},1600,900)` | `{cx:400,cy:225,zoom:2}` |
| région plus large que le ratio : `{x:0,y:0,width:800,height:200}` | hauteur portée à 450 : `{cx:400,cy:100,zoom:2}` |
| région plus haute : `{x:0,y:0,width:100,height:450}` | largeur portée à 800 : `{cx:50,cy:225,zoom:2}` |
| `fitRegionToScene({…,width:0,…})` | `PreskRuntimeError` |
| `SCENE_DEF.props.x.mode` | toujours `"ro"` ; `props.zoom.mode` `"rw"` |
| snapshot/restore de la racine | les 3 clés de vue restaurées |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/sceneRoot.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): scene view state (T140)`

## Suivante
`T141-engine-compile-scene-view`
