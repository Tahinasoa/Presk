# T120-model-arc
**Phase** P6 · **Dépend de** : T119-model-polyline · **Réf spec** : §11.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/classes/arc.md`
- `architecture/contracts/C-model-core.md`
- `architecture/contracts/C-geom.md (flattenArc)`

## Objectif
Implémenter `arc` (centre = pos, chemin ouvert).

## Fichiers
- créer : `core/src/model/classes/arcObject.ts`
- créer : `core/src/model/classes/arcObject.test.ts`
- modifier : `core/src/model/defaultCatalog.ts`
- modifier : `core/src/model/catalog.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T120.1 Écris `arcObject.test.ts` (cas ci-dessous), puis la classe `ArcObject` et `ARC_DEF` en suivant **exactement** la fiche de classe (état initial, propriétés, ancres, bornes, chemin, effets).
T120.2 Réutilise `baseProps`, `rectangleStyleProps` (T045) et `REVEAL_FADE`/`revealWithDraw` (T044) ; ne duplique pas leur code.
T120.3 Ajoute **une ligne** `register(...)` dans `core/src/model/defaultCatalog.ts`.
T120.4 `localBounds` = `boundsOfPoints(flattenArc(r,r,startAngle,endAngle))`. `start`/`end` : props `kind point`, `mode ro`, `writes []`, `get` = point monde de l'arc à `startAngle`/`endAngle` : `applyMat(worldMatrix, (r·cos θ, r·sin θ))` (θ en radians).

## Cas de test (à écrire AVANT le code)
Arc `x:100 y:100 radius:50 startAngle:0 endAngle:90` :
| situation | attendu |
|---|---|
| `readRef [start]` ; `[end]` | (150,100) ; ≈ (100,150) |
| `[boundingBox,width]` ; `[boundingBox,height]` | 50 ; 50 |
| `paths.main.build(o).length` (±0.1) ; `closed` | 78.54 ; `false` |
| `pointAt(0)` (local) | (50,0) |
| `writeProp("start",…)` | lève (ro) |
| compile `animate arc {endAngle:180} duration 1` | ok (animable) |
| `describeRef(ARC_DEF,[start])` | point |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/arcObject.test.ts src/model/catalog.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): arc class (T120)`

## Suivante
`T121-model-point-ray-line`
