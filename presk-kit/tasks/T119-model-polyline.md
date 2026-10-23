# T119-model-polyline
**Phase** P6 · **Dépend de** : T118-model-polygon-triangle · **Réf spec** : §11.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/classes/polyline.md`
- `architecture/contracts/C-model-core.md`

## Objectif
Implémenter `polyline` (ouverte ou fermée).

## Fichiers
- créer : `core/src/model/classes/polylineObject.ts`
- créer : `core/src/model/classes/polylineObject.test.ts`
- modifier : `core/src/model/defaultCatalog.ts`
- modifier : `core/src/model/catalog.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T119.1 Écris les tests (cas ci-dessous). **Réutilise** le code de points/vertex de `polygonObject.ts` (exporte-en des fabriques `pointsProp(min,max?)` et `vertexIndexed()` depuis ce fichier si elles n'existent pas déjà ; c'est une modification autorisée de `polygonObject.ts`, sans changer son comportement).
T119.2 `POLYLINE_DEF` : `points` (`minItems 2`), `closed` (boolean, mode `init`, défaut `false`), `stroke`, `strokeWidth` (défaut 2). `paths.main` : `closed:"state"`, `isClosed = o.getState("closed")`, `build` = `new FlatPath(points, closed)`. Pas de `fill`. `revealWithDraw()`. Enregistre et mets à jour `catalog.test.ts`.

## Cas de test (à écrire AVANT le code)
Polyline `points:[(0,0),(100,0),(100,100)]` :
| situation | attendu |
|---|---|
| `paths.main.build(o).length` ; `.closed` | 200 ; `false` |
| avec `closed:true` : length ; `.closed` | 341.42 (±0.01) ; `true` |
| `[boundingBox,width]` | 100 |
| analyse de `p.pathX(main, 1.5)` avec `closed:false` | l'analyse **accepte** (`closed:"state"` n'est pas connu statiquement) ; l'évaluation lève `PreskRuntimeError` |
| compile `create polyline {points:[(0,0)]}` | `E_VALUE_RANGE` |
| `POLYLINE_DEF.props.fill` | `undefined` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/polylineObject.test.ts src/model/catalog.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): polyline class (T119)`

## Suivante
`T120-model-arc`
