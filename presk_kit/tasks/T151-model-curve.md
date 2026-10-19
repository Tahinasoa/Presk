# T151-model-curve
**Phase** P9 · **Dépend de** : T150-geom-curve-flatten, T119-model-polyline · **Réf spec** : §11.2, §12.4

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/classes/curve.md`
- `architecture/decisions/ADR-020-curves-interpolation.md`
- `architecture/contracts/C-model-core.md`

## Objectif
Implémenter `curve`.

## Fichiers
- créer : `core/src/model/classes/curveObject.ts`
- créer : `core/src/model/classes/curveObject.test.ts`
- modifier : `core/src/model/defaultCatalog.ts`
- modifier : `core/src/model/catalog.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T151.1 Écris les tests (cas ci-dessous). Réutilise les fabriques de points/vertex de T119.
T151.2 `CURVE_DEF` : `points` (minItems 2), `closed` (boolean, init), `interpolation` (enum `spline|bezier`, init, défaut `spline`), `stroke`, `strokeWidth` (défaut 2) ; `start`/`end` en **ro** : premier/dernier point du chemin aplati, en monde. Chemin `main` : `closed:"state"`, `build` = `new FlatPath(interpolation === "spline" ? flattenSpline(points, closed) : flattenBezierChain(points, closed), closed)`.
T151.3 `localBounds` = `boundsOfPoints(` points **aplatis** `)`. Effets : `revealWithDraw()`.
T151.4 Nombre de points pour `bezier` : géré par un contrôle dans `afterGeometry`… **non** : la compilation ne connaît que `minItems`. Ajoute donc dans `compileProperties` (mode `create`) un contrôle spécifique : si `def.type === "curve"` et `interpolation === "bezier"` (valeur brute), le nombre de points doit être `3n+1` (ouvert, `closed` faux/absent) ou `3n` (fermé) sinon `E_VALUE_RANGE` (field `properties.points`). Ajoute un cas de test dans `properties.test.ts`.

## Cas de test (à écrire AVANT le code)
Courbe spline `points:[(0,0),(100,0),(200,0)]` :
| situation | attendu |
|---|---|
| `paths.main.build(o).length` (±0.5) ; `closed` | 200 ; `false` |
| `readRef [start]` ; `[end]` | (0,0) ; (200,0) |
| `[boundingBox,width]` | 200 |
| `vertex[1]` | (100,0) (point de contrôle d'origine, pas le point aplati) |
| bézier ouvert 4 points, compile | ok ; avec 5 points → `E_VALUE_RANGE` |
| bézier fermé 6 points ; 5 points | ok ; `E_VALUE_RANGE` |
| `writeProp("start",…)` | lève (ro) |
| `travel dot along c` (courbe ouverte) avec `to:1.5` | `E_TRAVEL_RANGE` (si `closed` est faux : vérifié **à l'exécution** car `closed:"state"` → `PreskRuntimeError`) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/curveObject.test.ts src/engine/compile/properties.test.ts src/model/catalog.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): curve class (T151)`

## Suivante
`T152-model-image`
