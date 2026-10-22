# T130-model-group-object
**Phase** P7 · **Dépend de** : T125-engine-golden-shapes · **Réf spec** : §10, §11.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/classes/group.md`
- `architecture/decisions/ADR-015-groups-hierarchy-layout.md`
- `architecture/contracts/C-model-core.md`

## Objectif
Implémenter `GroupObject` : liste d'enfants, bornes dérivées, `layout/gap/margin`.

## Fichiers
- créer : `core/src/model/classes/groupObject.ts`
- créer : `core/src/model/classes/groupObject.test.ts`
- modifier : `core/src/model/classes/rectangleObject.ts (annotation du type de retour de localBounds uniquement)`
- modifier : `core/src/model/defaultCatalog.ts`
- modifier : `core/src/model/catalog.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T130.1 **Préalable** (évite l'erreur TS2416) : dans `rectangleObject.ts`, annote explicitement `localBounds(): Bounds | null` (le corps ne change pas : il renvoie toujours une boîte). Corrige les erreurs de compilation qui en résultent dans `rectangleObject.ts`, `textObject.ts`, `sceneRoot.ts`, `imageObject.ts` éventuel, **uniquement** en ajoutant `!` là où la boîte est garantie non nulle (rectangle, texte, scène, image). Ne change aucun autre comportement ; les tests existants doivent rester verts.
T130.2 Écris les tests (cas ci-dessous).
T130.3 `GroupObject extends RectangleObject` : état `layout:"none"`, `gap:0`, `margin:0`, `presence:1` dès la création. Liste privée `kids: SceneObject[]`. `children()` renvoie `kids` ; `setChildren(list)` remplace `kids` (sans toucher aux `parent`). `addChild(c)` : l'ajoute (retire d'abord de son ancien parent via `removeChild` si `c.parent` est un `GroupObject`), `c.parent = this`. `removeChild(c)` : retire de `kids`, `c.parent = null`.
T130.4 `localBounds()` : `null` si aucun enfant ; sinon union des `transformBounds(child.localBounds(), child.localMatrix())` (enfants non bornés ignorés), élargie de `margin` de chaque côté ; toujours `null` si l'union est vide.
T130.5 `GROUP_DEF` : props = `baseProps({pivotValues: ANCHOR_NAMES})` + `rectangleAnchorProps()` + `layout` (enum `vertical|horizontal|none`), `gap` (number ≥ 0), `margin` (number ≥ 0), tous `mode rw`, non animables, `order 0`. **Pas** de `width`/`height`/style. Les 9 ancres lisent `worldBounds()` ; sans enfant (`null`) : `PreskRuntimeError`. `effects:{reveal: REVEAL_FADE}`, `paths:{main: RECT_PATH}` (utilise `localBounds`). `creatable:true`, `create` → `new GroupObject(id, GROUP_DEF, env)`.
T130.6 Enregistre `GROUP_DEF` ; mets à jour `catalog.test.ts`.

## Cas de test (à écrire AVANT le code)
Rectangles `a` (x0,y0,100×50) et `b` (x200,y100,50×50), groupe `g` (x 0, y 0) :
| situation | attendu |
|---|---|
| `g.children()` vide : `localBounds()` | `null` |
| `addChild(a)`, `addChild(b)` : `a.parent` ; `children().map(id)` | `g` ; `["a","b"]` |
| `worldBounds()` | `{minX:0,minY:0,maxX:250,maxY:150}` |
| `margin 10` : `worldBounds()` | `{-10,-10,260,160}` |
| `g.x = 100` : `a` ancre `topLeft` (monde) | (100,0) |
| `g.scale 2` (pivot du groupe par défaut `center`) : `a.worldMatrix` change en conséquence | `effectiveAlpha` de `a` = `a.opacity × a.presence × g.opacity × g.presence` |
| `removeChild(a)` | `a.parent` null |
| un second groupe `h` : `h.addChild(a)` alors que `a` est dans `g` | `g.children()` ne contient plus `a` |
| `GROUP_DEF.props.layout.values` | `["vertical","horizontal","none"]` |
| état initial : `presence` | 1 |
| `world.reset()` après `addChild` (capture avant) | hiérarchie initiale restaurée |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/groupObject.test.ts src/model/catalog.test.ts src/model/world.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): group class (T130)`

## Suivante
`T131-engine-compile-group`
