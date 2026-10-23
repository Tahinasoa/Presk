# T160-model-colour-getters-and-interpolate
**Phase** P10 · **Dépend de** : T159-view-colours-with-alpha · **Réf spec** : §11.3 (extension : alpha, Q24)

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-021-colours-canonical-strings-with-alpha.md`
- `architecture/contracts/C-geom-color-v2.md`
- `architecture/contracts/C-engine-runtime.md (interpolate)`

## Objectif
Faire lire et interpoler les couleurs en chaînes côté modèle et moteur, tout en acceptant encore des nombres venant de l'état. Les tests concernés changent d'attendu (nombre → chaîne).

## Fichiers
- modifier : `core/src/model/classes/ (getters des classes qui lisent fill/stroke/color)`
- modifier : `core/src/engine/sim/interpolate.ts`
- modifier : `core/src/engine/sim/interpolate.test.ts`
- modifier : `les tests de classes qui comparent une couleur : arcObject.test.ts, curveObject.test.ts, polygonObject.test.ts, polylineObject.test.ts, segmentObject.test.ts, textObject.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T160.1 Repère les endroits avec : `Get-ChildItem core/src/model -Recurse -Filter *.ts | Select-String 'getNumber\("(fill|stroke|color)"\)'` (PowerShell) ou `grep -rn 'getNumber("\(fill\|stroke\|color\)")' core/src/model`. Dans chaque `PropSpec.get` trouvé (fill, stroke, color), remplace par `object.getColor(<clé>)`. Les valeurs par défaut des classes **ne changent pas** dans cette tâche (T162).
T160.2 Dans `interpolate.ts`, branche `kind === "color"` : `lerpColorCanonical(c(from), c(to), p)` où `c(v)` = `parseColorCanonical(v)` ; `null` → `Error("Presk internal: invalid colour in interpolate")`. Supprime tout cast `as number` sur les couleurs. Le résultat est donc **une chaîne**, même si `from` ou `to` sont des nombres.
T160.3 Mets à jour les attendus : `readProp("stroke")`, `readProp("fill")`, `readProp("color")` renvoient désormais des **chaînes** (`0x9c9c9c` → `"#9c9c9c"`, `0xffffff` → `"#ffffff"`). Dans `interpolate.test.ts` : `interpolate("color", 0x000000, 0xffffff, 0.5)` → `"#808080"` ; ajoute les cas ci-dessous.
T160.4 Ne modifie **aucun autre attendu**. Si un test échoue pour une autre raison : `BLOCKED`.

## Cas de test (à écrire AVANT le code)
| appel | attendu |
|---|---|
| `interpolate("color", 0x000000, 0xffffff, 0.5)` | `"#808080"` |
| `interpolate("color", "#ff0000", "#0000ff", 0.5)` | `"#800080"` |
| `interpolate("color", 0x9c9c9c, "#ff0000", 0.5)` (état nombre, cible chaîne) | `"#ce4e4e"` |
| `interpolate("color", "#ff000000", "#ff0000ff", 0.5)` | `"#ff000080"` |
| `interpolate("color", "#000000", "#ffffff", 1.5)` | `"#ffffff"` |
| `interpolate("color", "nope", "#ff0000", 0.5)` | lève |
| rectangle par défaut : `readProp("fill")` ; `readProp("stroke")` | `"#9c9c9c"` ; `"#ffffff"` |
| segment par défaut : `readProp("stroke")` | `"#9c9c9c"` |
| text par défaut : `readProp("color")` | `"#ffffff"` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/interpolate.test.ts src/model/classes
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`refactor: read and interpolate colours as strings (T160)`

## Suivante
`T161-engine-parse-colour-canonical`
