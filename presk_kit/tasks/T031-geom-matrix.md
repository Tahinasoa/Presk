# T031-geom-matrix
**Phase** P2 · **Dépend de** : T030-geom-vec · **Réf spec** : §3.1

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-geom.md (section matrix.ts)`
- `architecture/decisions/ADR-006-transform-model-pos-pivot.md`

## Objectif
Créer `geom/matrix.ts`. C'est le **seul** fichier autorisé à importer `transformation-matrix`.

## Fichiers
- créer : `core/src/geom/matrix.ts`
- créer : `core/src/geom/matrix.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T031.1 Écris les tests, puis le module. `import { compose, translate, rotate, scale, applyToPoint, inverse, applyToPoint as _a } from "transformation-matrix"` : utilise `compose`, `translate`, `rotate` (**radians**), `scale`, `applyToPoint`, `inverse`.
T031.2 `trsPivot(pos, pivot, rotationDeg, s)` = `composeMat(translateMat(pos.x,pos.y), translateMat(pivot.x,pivot.y), rotateMat(degToRad(rotationDeg)), scaleMat(s), translateMat(-pivot.x,-pivot.y))`.
T031.3 `invertMat` : si `|a·d − b·c| < 1e-12` → `throw new Error("Presk internal: singular matrix")`.
T031.4 `matRotationDeg(m) = radToDeg(Math.atan2(m.b, m.a))` ; `matScale(m) = Math.hypot(m.a, m.b)` ; `applyLinear(m, v) = {x: m.a*v.x + m.c*v.y, y: m.b*v.x + m.d*v.y}`.

## Cas de test (à écrire AVANT le code)
| appel | attendu (toBeCloseTo 6) |
|---|---|
| `applyMat(trsPivot({x:0,y:0},{x:0,y:0},90,1), {x:1,y:0})` | `{x:0,y:1}` (horaire écran) |
| `applyMat(trsPivot({x:10,y:20},{x:0,y:0},0,1), {x:1,y:1})` | `{x:11,y:21}` |
| rotation 90° autour du pivot (50,25) d'un rect 100×50 posé en (10,20) : coin `(0,0)` local | `{x:85,y:-5}` |
| `trsPivot(pos=(0,0), pivot=(10,10), 0, 2)` appliqué à (10,10) | `{x:10,y:10}` (le pivot est fixe) |
| `trsPivot(pos=(0,0), pivot=(10,10), 0, 2)` appliqué à (0,0) | `{x:-10,y:-10}` |
| `invertMat(m)` puis `applyMat` | retrouve le point d'origine |
| `invertMat({a:0,b:0,c:0,d:0,e:0,f:0})` | lève |
| `matRotationDeg(trsPivot(pos,pv,30,2))` | 30 ; `matScale(...)` | 2 |
| `applyLinear(translateMat(5,5), {x:1,y:2})` | `{x:1,y:2}` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/geom/matrix.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(geom): matrix helpers (T031)`

## Suivante
`T032-geom-bounds`
