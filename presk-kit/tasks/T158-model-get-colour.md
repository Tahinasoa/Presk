# T158-model-get-colour
**Phase** P10 · **Dépend de** : T157-geom-colour-canonical-helpers · **Réf spec** : §11.3 (extension : alpha, Q24)

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-021-colours-canonical-strings-with-alpha.md`
- `architecture/contracts/C-geom-color-v2.md`
- `architecture/contracts/C-model-core.md (SceneObject)`

## Objectif
Ajouter l'accesseur **vérifié** des couleurs. `getNumber` est un simple cast : une chaîne dans l'état ne fait pas échouer `tsc`. `getColor` rend l'erreur visible à l'exécution.

## Fichiers
- modifier : `core/src/model/sceneObject.ts`
- modifier : `core/src/model/sceneObject.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T158.1 Écris les tests (cas ci-dessous) à la suite de ceux de `sceneObject.test.ts`.
T158.2 Ajoute `getColor(key: string): string` : `v = this.getState(key)` (qui lève si la clé est inconnue). Si `v` est un **nombre** → `parseColorCanonical(v)` ; `null` → erreur. Si `v` est une **chaîne** → doit vérifier `COLOR_STRING_RE` (donc canonique) sinon erreur. Tout autre type → erreur. Message : `Presk internal: not a colour '<key>' on '<id>'`.
T158.3 Importe `parseColorCanonical` et `COLOR_STRING_RE` depuis `@/geom/color` (la couche `model/` peut importer `geom/`).

## Cas de test (à écrire AVANT le code)
(objet de test dont l'état contient les clés ci-dessous)
| état | `getColor` |
|---|---|
| `fill: 0x9c9c9c` | `"#9c9c9c"` (un nombre est converti) |
| `fill: "#ff000080"` | `"#ff000080"` |
| `fill: "#FF0000"` (majuscules) | lève (non canonique) |
| `fill: "red"` | lève (non canonique : seuls `parseColor` et le compilateur normalisent) |
| `fill: true` ; `fill: {x:1,y:2}` ; `fill: 1.5` ; `fill: -1` | lèvent |
| clé inexistante | lève |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/sceneObject.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): SceneObject.getColor (T158)`

## Suivante
`T159-view-colours-with-alpha`
