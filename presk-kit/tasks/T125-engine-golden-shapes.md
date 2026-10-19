# T125-engine-golden-shapes
**Phase** P6 · **Dépend de** : T124-view-polygon-views, T116-engine-golden-travel · **Réf spec** : §3.4, §5.3, §11

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-018-testing-strategy.md`

## Objectif
Verrouiller le comportement des primitives de P6 de bout en bout.

## Fichiers
- créer : `core/src/engine/golden/shapes.golden.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T125.1 Même helper `run` que les autres fichiers dorés ; un `it` par ligne.

## Cas de test (à écrire AVANT le code)
| # | steps | instant | attendu |
|---|---|---|---|
| S1 | `rectangle a {width:10,height:10}` ; `rectangle b {x:100,y:50,width:10,height:10}` ; `segment s {start:{x:0,y:0},end:{x:1,y:1}}` ; `bind s {start:"a.center", end:"b.center"} start 0` | 0 | `s.start` (5,5) ; `s.end` (105,55) |
| S2 | `triangle tri {x:10,y:10,points:[(0,0),(100,0),(50,80)]}` ; `circle d {radius:5, x:"tri.vertex[1].x", y:"tri.vertex[1].y"}` | 0 | `d.pos` (110,10) |
| S3 | `segment seg {…}` ; `animate seg {reveal:"draw"} duration 1 ease linear` ; `animate seg {reveal:false} start 3 duration 1 ease linear` | 0 ; 0.5 ; 1 ; 3.5 ; 4 | `(presence,drawProgress)` : (0,0) ; (1,0.5) ; (1,1) ; (1,0.5) ; (0,0) — le « faux » rejoue **draw** à l'envers |
| S4 | `segment s {start:{x:0,y:0},end:{x:100,y:0}}` ; `circle dot {radius:5}` ; `travel dot along s duration 2 linear` | 1 | `dot.pos` (50,0) |
| S5 | `travel dot along s from:0 to:1.5 duration 1` (segment = chemin ouvert) | compilation | `E_TRAVEL_RANGE` |
| S6 | `polygon p {}` | compilation | `E_FIELD_REQUIRED` |
| S7 | `ray r {origin:{x:0,y:0}, through:{x:1,y:0}}` ; `rectangle a {x:"r.boundingBox.center.x"}` | compilation | `E_EXPR_INFINITE_REF` |
| S8 | `arc a {x:100,y:100,radius:50,startAngle:0,endAngle:90}` ; `circle d {radius:3, pos:"a.end"}` | 0 | `d.pos` ≈ (100,150) |
| S9 | `rectangle a {rotation:90, width:100, height:50}` ; `circle d {radius:1, pos:"a.topLeft"}` | 0 | `d.pos` = (75,−25) (coin (0,0) tourné de 90° autour du centre (50,25)) |
| S10 | `circle c {x:100,y:100,radius:50}` ; `rectangle r {topLeft:"c.boundingBox.topLeft"}` | 0 | `r.x` 50, `r.y` 50 |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/golden/shapes.golden.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`test(engine): shapes golden tests (T125)`

## Suivante
`T130-model-group-object`
