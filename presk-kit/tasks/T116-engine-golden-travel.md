# T116-engine-golden-travel
**Phase** P6 · **Dépend de** : T115-engine-mech-travel · **Réf spec** : §8

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-018-testing-strategy.md`
- `architecture/decisions/ADR-013-paths-and-travel.md`

## Objectif
Verrouiller `travel` de bout en bout.

## Fichiers
- créer : `core/src/engine/golden/travel.golden.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T116.1 Réutilise le helper `run(doc, t)` (copie-le depuis `core.golden.test.ts`) et écris **un `it` par ligne**. Les attendus numériques viennent de la spec ; ne les change pas.

## Cas de test (à écrire AVANT le code)
| # | steps | instant | attendu |
|---|---|---|---|
| V1 | `circle orbit {x:200,y:200,radius:100}` ; `circle p {radius:10}` ; `travel p along orbit duration 4 linear` | 0,1,2,3,4 | (300,200) (200,300) (100,200) (200,100) (300,200) |
| V2 | `rectangle track {width:100,height:100}` ; `circle dot {radius:5}` ; `travel dot along track speed 100 linear` | `sim.duration` | 4 |
| V3 | idem V2 puis `travel dot along track from:"current" to:1 duration 3 start:2` précédé de `stop dot ["pos"] start:1` | 3.5 | (50,100) |
| V4 | `circle m {radius:5, x:"track.pathX(main,0.5)", y:"track.pathY(main,0.5)"}` après `track` | 0 | `m.pos` (100,100) |
| V5 | `travel dot along track duration 4` ; `stop dot ["x"] start 1` | compilation | `E_STOP_PARTIAL_TRAVEL` |
| V6 | `travel dot along zzz duration 1` | compilation | `E_TRAVEL_ALONG` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/golden/travel.golden.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`test(engine): travel golden tests (T116)`

## Suivante
`T117-model-segment-arrow`
