# T041-model-scene-object
**Phase** P3 · **Dépend de** : T040-model-values-ports-effect-types, T031-geom-matrix, T032-geom-bounds · **Réf spec** : §3.1

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/conventions.md`
- `architecture/contracts/C-model-core.md (section SceneObject)`
- `architecture/decisions/ADR-005-state-bag-and-values.md`
- `architecture/decisions/ADR-006-transform-model-pos-pivot.md`

## Objectif
Implémenter la classe abstraite `SceneObject`.

## Fichiers
- modifier : `core/src/model/sceneObject.ts`
- créer : `core/src/model/sceneObject.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T041.1 Écris `sceneObject.test.ts` : définis dans le test une classe `TestObject extends SceneObject` dont `localBounds()` renvoie `{minX:0,minY:0,maxX:100,maxY:50}` et un `ClassDef` minimal de test (`props:{}`, `indexed:{}`, `effects:{}`, `paths:{}`, `family:"rectangle"`, `creatable:true`, `create` qui construit un `TestObject`).
T041.2 Remplace le squelette par la classe complète (signatures de `C-model-core.md`).
T041.3 Constructeur : état initial = valeurs communes `{x:0,y:0,rotation:0,scale:1,opacity:1,presence:0,pivot:"center"}` **puis** `initial` par-dessus (copie profonde des `Pt` et tableaux).
T041.4 `getState` lève `Error("Presk internal: unknown state key 'k' on 'id'")` si la clé est absente ; `setState` aussi (on ne crée jamais de clé après construction).
T041.5 `snapshot()` : copie profonde (objets plats comme `Pt` et `ViewTarget`, et tableaux d'objets plats, sont recopiés ; nombres/chaînes/booléens copiés par valeur). `restore(s)` : réécrit **toutes** les clés présentes dans `s` (copie profonde).
T041.6 `pivotLocal()` : lit l'état `pivot` ; si `"pos"` → `{x:0,y:0}` ; sinon `anchorOfBounds(localBounds(), pivot)` ; si `localBounds()` est `null` → `{x:0,y:0}`.
T041.7 `localMatrix()` = `trsPivot({x,y}, pivotLocal(), rotation, scale)`. `parentMatrix()` = parent ? `parent.worldMatrix()` : `IDENTITY`. `worldMatrix()` = `composeMat(parentMatrix(), localMatrix())`.
T041.8 `worldBounds()` = `localBounds()` null ? null : `transformBounds(localBounds(), worldMatrix())`.
T041.9 `effectiveAlpha()` = `opacity × presence × (parent ? parent.effectiveAlpha() : 1)`.
T041.10 `children()` renvoie `[]` ; `setChildren()` ne fait rien (no-op) ; `readProp(name)` / `writeProp(name,v)` passent par `this.def.props[name]` : inconnu ou sans `set` → `Error("Presk internal: ...")`.

## Cas de test (à écrire AVANT le code)
TestObject de bornes 100×50, état initial `x:10,y:20` :
| situation | attendu |
|---|---|
| `getState("x")` | 10 ; `getState("presence")` = 0 ; `getState("pivot")` = `"center"` |
| `getState("nope")` / `setState("nope",1)` | lèvent |
| `snapshot()` puis `setState("x",99)` puis `restore(snap)` | `x` = 10 |
| snapshot contenant un `Pt` : modifier le `Pt` du snapshot | n'altère pas l'objet |
| `pivotLocal()` | `{x:50,y:25}` ; avec `pivot:"pos"` → `{x:0,y:0}` ; avec `pivot:"topLeft"` → `{x:0,y:0}` ; `"bottomRight"` → `{x:100,y:50}` |
| rotation 90 : `applyMat(worldMatrix(), {x:0,y:0})` | `{x:85,y:-5}` |
| scale 2, pivot `"topLeft"` : `worldBounds()` | `{minX:10,minY:20,maxX:210,maxY:120}` |
| parent `P` (même classe) avec `x:100` : `applyMat(child.worldMatrix(), {x:0,y:0})` | `{x:110,y:20}` |
| alpha : `opacity .5`, `presence 1`, parent `opacity .5 presence 1` | 0.25 ; parent `presence 0` → 0 |
| `localBounds()` null (sous-classe de test) : `worldBounds()` | `null` ; `pivotLocal()` `{0,0}` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/sceneObject.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): SceneObject base class (T041)`

## Suivante
`T042-model-base-props`
