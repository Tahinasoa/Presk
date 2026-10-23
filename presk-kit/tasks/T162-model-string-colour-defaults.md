# T162-model-string-colour-defaults
**Phase** P10 · **Dépend de** : T161-engine-parse-colour-canonical · **Réf spec** : §11.3 (extension : alpha, Q24)

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-021-colours-canonical-strings-with-alpha.md`
- `architecture/contracts/classes/ (une fiche par classe : couleurs par défaut)`

## Objectif
Convertir l'état initial des couleurs des classes en chaînes canoniques et verrouiller par un test générique sur tout le catalogue.

## Fichiers
- créer : `core/src/model/colorDefaults.test.ts`
- modifier : `core/src/model/classes/arcObject.ts, circleObject.ts, curveObject.ts, ellipseObject.ts, polygonObject.ts, polylineObject.ts, rayLineObject.ts, rectangleObject.ts, segmentObject.ts, textObject.ts (état initial uniquement)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T162.1 Écris `colorDefaults.test.ts` : pour **chaque** type de `createDefaultCatalog().types()` dont `creatable` est vrai : `o = def.create("x", createTestEnv())` ; pour chaque propriété `p` de `def.props` dont `kind === "color"` : `typeof o.getState(p) === "string"` **et** `COLOR_STRING_RE.test(o.getState(p))`. Ce test échoue d'abord.
T162.2 Dans l'état initial de chacune des 10 classes : `0x9c9c9c` → `"#9c9c9c"`, `0xffffff` → `"#ffffff"`. Repère-les avec `Get-ChildItem core/src/model/classes -Filter *.ts | Select-String '0x9c9c9c|0xffffff'` (ou `grep`).
T162.3 Ne modifie **que** les valeurs initiales de couleur. Ne touche ni aux tests existants ni à d'autres propriétés.

## Cas de test (à écrire AVANT le code)
| situation | attendu |
|---|---|
| rectangle : `getState("fill")` ; `("stroke")` | `"#9c9c9c"` ; `"#ffffff"` |
| segment : `getState("stroke")` | `"#9c9c9c"` |
| text : `getState("color")` | `"#ffffff"` |
| test générique : toute propriété de kind `color` de toute classe créable | chaîne canonique |
| `animate a {fill:"#ff0000"} …` (golden C1 de T161) | résultats **identiques** (le défaut était déjà converti à la lecture) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/colorDefaults.test.ts src/engine/golden/colors.golden.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`refactor(model): string colour defaults (T162)`

## Suivante
`T163-colour-migration-audit`
