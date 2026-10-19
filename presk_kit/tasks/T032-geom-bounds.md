# T032-geom-bounds
**Phase** P2 · **Dépend de** : T031-geom-matrix · **Réf spec** : §3.2, §3.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-geom.md (section bounds.ts)`

## Objectif
Créer `geom/bounds.ts`.

## Fichiers
- créer : `core/src/geom/bounds.ts`
- créer : `core/src/geom/bounds.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T032.1 Écris les tests, puis le module (signatures exactes de `C-geom.md`). `ANCHOR_NAMES` dans l'ordre du contrat.

## Cas de test (à écrire AVANT le code)
| appel | attendu |
|---|---|
| `boundsOfPoints([])` | `null` |
| `boundsOfPoints([{x:1,y:5},{x:-2,y:3},{x:4,y:0}])` | `{minX:-2,minY:0,maxX:4,maxY:5}` |
| `unionBounds(null,b)` / `unionBounds(a,null)` / `unionBounds(null,null)` | `b` / `a` / `null` |
| `unionBounds({0,0,1,1},{2,2,3,3})` | `{minX:0,minY:0,maxX:3,maxY:3}` |
| `transformBounds({0,0,100,50}, rotation 90° pivot centre (50,25))` | largeur 50, hauteur 100, centre (50,25) |
| `anchorOfBounds({0,0,100,50},"topLeft"/"center"/"bottomRight"/"centerRight"/"topCenter")` | (0,0) / (50,25) / (100,50) / (100,25) / (50,0) |
| `isAnchorName("center")` / `("left")` | vrai / faux |
| `ANCHOR_NAMES.length` | 9 |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/geom/bounds.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(geom): bounds and anchors (T032)`

## Suivante
`T033-geom-color`
