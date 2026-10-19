# T045-model-rectangle-object
**Phase** P3 · **Dépend de** : T042-model-base-props, T044-model-effects-reveal, T043-model-world · **Réf spec** : §3.1, §3.2, §11.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/classes/rectangle.md`
- `architecture/contracts/C-model-core.md`
- `architecture/decisions/ADR-006-transform-model-pos-pivot.md`

## Objectif
Implémenter `RectangleObject` (classe de base de la famille rectangle), ses `PropSpec` réutilisables et `RECTANGLE_DEF`.

## Fichiers
- créer : `core/src/model/classes/rectangleObject.ts`
- créer : `core/src/model/classes/rectangleObject.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T045.1 Écris les tests (cas ci-dessous).
T045.2 Exporte `class RectangleObject extends SceneObject` : constructeur `(id, def, env, extraInitial = {})` ; état initial `{width:100,height:100,fill:0x9c9c9c,stroke:0xffffff,strokeWidth:0}` + `extraInitial`. `localBounds()` = `{minX:0,minY:0,maxX:width,maxY:height}`.
T045.3 Exporte les fabriques de `PropSpec` réutilisées par `text`, `image`, `group`, `scene` : `rectangleSizeProps()` (width, height : number, rw, animatable, order 0, min 0), `rectangleStyleProps()` (fill, stroke : color ; strokeWidth : number min 0 ; tous rw, animatable, order 0), `rectangleAnchorProps()` (les 9 ancres de `ANCHOR_NAMES`).
T045.4 Ancre `name` : `kind:"point", writes:["x","y"], mode:"rw", animatable:true, order:2`. `get(o)` = `applyMat(o.worldMatrix(), anchorOfBounds(o.localBounds()!, name))`. `set(o, worldPt)` : `delta = worldPt − get(o)` ; `d2 = applyLinear(invertMat(o.parentMatrix()), delta)` ; `x += d2.x`, `y += d2.y`.
T045.5 Exporte `RECT_PATH: PathSpec` (`closed:"always"`, `isClosed:()=>true`, `build(o)` = `new FlatPath([(0,0),(w,0),(w,h),(0,h)], true)` d'après `localBounds()`).
T045.6 Exporte `RECTANGLE_DEF: ClassDef` : `type:"rectangle"`, `family:"rectangle"`, `creatable:true`, `props = {...baseProps({pivotValues: ANCHOR_NAMES}), ...rectangleSizeProps(), ...rectangleStyleProps(), ...rectangleAnchorProps()}`, `indexed:{}`, `effects:{reveal: REVEAL_FADE}`, `paths:{main: RECT_PATH}`, `create:(id,env)=>new RectangleObject(id, RECTANGLE_DEF, env)`.

## Cas de test (à écrire AVANT le code)
Rectangle `x:10 y:20 width:100 height:50` (créé via `RECTANGLE_DEF.create` puis `setState`) :
| situation | attendu |
|---|---|
| ancres `topLeft` / `bottomRight` / `center` / `centerRight` | (10,20) / (110,70) / (60,45) / (110,45) |
| `readProp("pos")` | `{x:10,y:20}` |
| `rotation 90` : `topLeft` ; `center` | ≈ (85,−5) ; (60,45) |
| `rotation 90`, `writeProp("topLeft",{x:0,y:0})` | `x` = −75, `y` = 25 |
| parent `P` (RectangleObject) avec `x:100` ; ancre `topLeft` du enfant | (110,20) |
| même parent ; `writeProp("topLeft",{x:0,y:0})` | `x` = −100, `y` = 0 |
| `scale 2`, `pivot "topLeft"` : `worldBounds()` | `{minX:10,minY:20,maxX:210,maxY:120}` |
| `RECT_PATH.build(o)` : `length` ; `pointAt(0.5)` | 300 ; (100,50) |
| `RECTANGLE_DEF.props.topLeft.writes` | `["x","y"]` ; `props.width.animatable` vrai ; `props.pivot.values.length` 9 |
| `RECTANGLE_DEF.effects` clés ; `paths` clés | `["reveal"]` ; `["main"]` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/rectangleObject.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): RectangleObject and rectangle class def (T045)`

## Suivante
`T046-model-refs`
