# T150-geom-curve-flatten
**Phase** P9 · **Dépend de** : T144-view-viewport · **Réf spec** : §11.2, §12.4

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-020-curves-interpolation.md`
- `architecture/contracts/C-geom.md`

## Objectif
Ajouter dans `geom/` les fonctions qui transforment une liste de points en polyligne dense pour `curve`.

## Fichiers
- créer : `core/src/geom/curve.ts`
- créer : `core/src/geom/curve.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T150.1 Écris les tests (cas ci-dessous).
T150.2 `flattenSpline(points: readonly Pt[], closed: boolean): Pt[]` : Catmull-Rom uniforme (tension 0,5). Pour chaque segment `Pi → Pi+1` : `P0'=Pi−1`, `P3'=Pi+2` (ouvert : points fantômes = répétition du 1er/dernier ; fermé : indices modulo `n`), convertis en cubique de Bézier : `c1 = Pi + (Pi+1 − Pi−1)/6`, `c2 = Pi+1 − (Pi+2 − Pi)/6`, puis `flattenCubic(Pi, c1, c2, Pi+1, 48)`. Concatène sans dupliquer les points de jonction. Fermé : `n` segments, ne répète pas le 1er point à la fin.
T150.3 `flattenBezierChain(points: readonly Pt[], closed: boolean): Pt[]` : `points = [P0,C1,C2,P1,C3,C4,P2…]`. Ouvert : `(n−1) % 3 === 0` sinon `Error` interne (la validation a déjà refusé) ; fermé : `n % 3 === 0`, le dernier segment revient à `P0`. Chaque cubique : `flattenCubic(…,48)` ; concatène sans doublons.

## Cas de test (à écrire AVANT le code)
| appel | attendu |
|---|---|
| `flattenSpline([(0,0),(10,0),(20,0)], false)` | tous les points sur y = 0 ; premier (0,0), dernier (20,0) ; 97 points (2 segments × 48 + 1) |
| spline passe par les points : le point d'indice 48 | ≈ (10,0) |
| `flattenSpline([(0,0),(10,10),(20,0)], false)` : milieu (indice 48) | (10,10) |
| `flattenSpline(4 points d'un carré, true)` | 4×48 = 192 points ; ne répète pas le 1er point ; passe par chacun des 4 points |
| `flattenBezierChain([(0,0),(0,10),(10,10),(10,0)], false)` | 49 points ; milieu ≈ (5,7.5) |
| bézier fermé à 6 points `[P0,C1,C2,P1,C3,C4]` | 2×48 = 96 points |
| bézier ouvert avec 5 points | lève |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/geom/curve.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(geom): spline and bezier flattening (T150)`

## Suivante
`T151-model-curve`
