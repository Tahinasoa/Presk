# T132-engine-group-reparent
**Phase** P7 · **Dépend de** : T130-model-group-object · **Réf spec** : §10

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-015-groups-hierarchy-layout.md`
- `architecture/decisions/ADR-006-transform-model-pos-pivot.md`
- `architecture/contracts/C-geom.md (matrix)`

## Objectif
Fonction pure `reparentPreserving` et `detachPreserving`.

## Fichiers
- créer : `core/src/engine/sim/reparent.ts`
- créer : `core/src/engine/sim/reparent.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T132.1 Écris les tests (cas ci-dessous).
T132.2 `reparentPreserving(child: SceneObject, newParent: GroupObject | null): void` : `W = child.worldMatrix()` ; détache de l'ancien parent (si `GroupObject` : `removeChild`) ; `pm = newParent ? newParent.worldMatrix() : IDENTITY` ; `L = composeMat(invertMat(pm), W)` ; `rot = matRotationDeg(L)` ; `s = matScale(L)` ; `pv = child.pivotLocal()` ; `A = applyLinear(trsPivot({0,0},{0,0},rot,s), pv)` ; `pos' = {x: L.e − pv.x + A.x, y: L.f − pv.y + A.y}` ; écrit `x,y,rotation,scale` ; puis `newParent?.addChild(child)` (ou `child.parent = null`). **Important** : `pm` est calculée **avant** l'ajout (limite assumée, ADR-015 addendum).
T132.3 `detachPreserving(child)` = `reparentPreserving(child, null)`.

## Cas de test (à écrire AVANT le code)
Rectangle `a` à (10,20) 100×50 ; groupe `g` :
| situation | attendu |
|---|---|
| `g` x=100,y=0, sans enfant (donc bornes nulles, pivot (0,0)) ; `reparentPreserving(a,g)` | `a.x` = −90, `a.y` = 20 ; `a` ancre `topLeft` (monde) toujours (10,20) |
| `g` avec `x:50,y:50`, `scale:1`, `rotation:0` ; `a.rotation = 30` | après reparentage : `a.rotation` 30 ; `a.topLeft` (monde) inchangé (±1e-6) |
| `detachPreserving(a)` ensuite | `a.x` = 10, `a.y` = 20 ; `a.parent` null ; `a.topLeft` inchangé |
| `a` déjà dans `g`, reparenté vers `h` | `g.children()` sans `a` ; `h.children()` avec `a` ; apparence conservée |
| groupe `g` avec **enfant `c` couvrant les bornes** (50,50)-(150,150), `g.scale 2` (pivot `center`) puis `reparentPreserving(a, g)` avec `a` dans ces bornes (60,60) | `a.topLeft` (monde) inchangé (±1e-6) ; `a.scale` = 0.5 |
| `reparentPreserving(a, null)` sur un objet sans parent | no-op sur l'apparence |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/reparent.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): appearance-preserving reparenting (T132)`

## Suivante
`T133-engine-group-layout`
