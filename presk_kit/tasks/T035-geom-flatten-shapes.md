# T035-geom-flatten-shapes
**Phase** P2 · **Dépend de** : T034-geom-flat-path · **Réf spec** : §8.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-geom.md (section flatPath.ts)`
- `architecture/decisions/ADR-013-paths-and-travel.md`

## Objectif
Ajouter `flattenEllipse`, `flattenArc`, `flattenCubic` dans `flatPath.ts`.

## Fichiers
- modifier : `core/src/geom/flatPath.ts`
- modifier : `core/src/geom/flatPath.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T035.1 Ajoute les tests, puis les 3 fonctions.
T035.2 `flattenEllipse(rx, ry, segments = 720)` : points `i = 0..segments-1`, `θ = 2π·i/segments`, `(rx·cosθ, ry·sinθ)` (départ `(rx,0)`, sens horaire écran car y vers le bas). Ne répète pas le premier point.
T035.3 `flattenArc(rx, ry, startDeg, endDeg)` : `sweep = endDeg − startDeg` ramené dans `[0,360]` (si `sweep < 0` → `+= 360` ; si `endDeg−startDeg` vaut exactement 360 → 360 ; si 0 → 0). `n = max(8, ceil(sweep))`. Renvoie `n+1` points de `θ=start` à `θ=start+sweep`.
T035.4 `flattenCubic(p0,c1,c2,p1,segments = 48)` : Bézier cubique, `segments+1` points (inclut `p0` et `p1`).

## Cas de test (à écrire AVANT le code)
| appel | attendu |
|---|---|
| `flattenEllipse(10,10).length` | 720 |
| `flattenEllipse(10,10)[0]` | (10,0) |
| point d'indice 180 de `flattenEllipse(10,10)` | ≈ (0,10)  (bas de l'écran = quart de tour horaire) |
| `new FlatPath(flattenEllipse(10,10),true).length` | ≈ 62.83 (précision 0.01) |
| `new FlatPath(flattenEllipse(10,10),true).pointAt(0.25)` | ≈ (0,10) (précision 0.05) |
| `flattenArc(10,10,0,90)` premier / dernier | (10,0) / ≈ (0,10) ; **91 points** |
| `flattenArc(10,10,350,10)` | balayage 20° : premier (≈9.85,−1.74) |
| `flattenArc(10,10,0,0)` | 8+1 points tous = (10,0) |
| `flattenCubic({0,0},{0,10},{10,10},{10,0})` | 49 points ; milieu ≈ (5, 7.5) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/geom/flatPath.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(geom): flatten ellipse, arc and cubic (T035)`

## Suivante
`T040-model-values-ports-effect-types`
