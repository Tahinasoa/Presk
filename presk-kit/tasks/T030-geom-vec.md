# T030-geom-vec
**Phase** P2 · **Dépend de** : T004-arch-lint-layers · **Réf spec** : §3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-geom.md (section vec.ts)`

## Objectif
Créer `geom/vec.ts`.

## Fichiers
- créer : `core/src/geom/vec.ts`
- créer : `core/src/geom/vec.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T030.1 Écris les tests, puis les fonctions exactes de `C-geom.md § vec.ts`.

## Cas de test (à écrire AVANT le code)
| appel | attendu |
|---|---|
| `addPt({x:1,y:2},{x:3,y:4})` | `{x:4,y:6}` |
| `subPt({x:5,y:5},{x:1,y:2})` | `{x:4,y:3}` |
| `scalePt({x:1,y:2},3)` | `{x:3,y:6}` |
| `lerp(10,20,0.25)` | 12.5 |
| `lerpPt({x:0,y:0},{x:10,y:20},0.5)` | `{x:5,y:10}` |
| `distPt({x:0,y:0},{x:3,y:4})` | 5 |
| `clamp(5,0,3)` / `clamp(-1,0,3)` / `clamp(2,0,3)` | 3 / 0 / 2 |
| `nearlyEqual(1,1+1e-12)` / `nearlyEqual(1,1.001)` / `nearlyEqual(1,1.001,0.01)` | vrai / faux / vrai |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/geom/vec.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(geom): vec utilities (T030)`

## Suivante
`T031-geom-matrix`
