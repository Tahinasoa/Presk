# T019-lang-validate-timing-values
**Phase** P1 · **Dépend de** : T018-lang-validate-step-fields, T012-lang-ease-names, T013-lang-start-parse · **Réf spec** : §6, §8.4, §12.1

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-lang-diagnostics.md`
- `architecture/contracts/C-lang-start.md`

## Objectif
Valider les valeurs de `start`, `name`, `duration`, `ease`, `repeat`, `repeatMode`, et des champs propres à `travel`.

## Fichiers
- créer : `core/src/lang/validate/timing.ts`
- créer : `core/src/lang/validate/timing.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T019.1 Écris les tests (cas ci-dessous).
T019.2 Crée `validateTimingValues(step: Step, index: number, d: DiagnosticCollector): void` (ne renvoie rien, ajoute des diagnostics).
T019.3 Règles : `start` → `parseStart(step.start) !== null` sinon `E_START_INVALID` ; `name` → format identifiant sinon `E_NAME_INVALID` ; `duration` → nombre fini **> 0** sinon `E_DURATION_INVALID` ; `ease` → `isEaseName` sinon `E_EASE_UNKNOWN` ; `repeat` → entier ≥ 1 ou la chaîne exacte `"infinite"` sinon `E_REPEAT_INVALID` ; `repeatMode` → `"restart"` ou `"yoyo"` sinon `E_REPEAT_MODE_INVALID`.
T019.4 Pour `travel` uniquement : `speed` nombre fini > 0 sinon `E_TRAVEL_DURATION` ; `duration` ET `speed` ensemble, ou aucun des deux → `E_TRAVEL_DURATION` ; `from` : nombre fini ou `"current"` sinon `E_FIELD_TYPE` ; `to` : nombre fini sinon `E_FIELD_TYPE` ; `from:"current"` accepté ; `orient` : `true`, `false` ou `{offset:nombre}` sinon `E_TRAVEL_OPTION`.
T019.5 Les diagnostics portent `stepIndex: index` et `field` = nom du champ.

## Cas de test (à écrire AVANT le code)
| étape (champs pertinents) | diagnostics |
|---|---|
| `animate` `{start:"<",duration:0.5,ease:"cubicOut",repeat:3,repeatMode:"yoyo"}` | aucun |
| `{repeat:"infinite"}` | aucun |
| `{repeat:0}` / `{repeat:-1}` / `{repeat:1.5}` / `{repeat:"Infinite"}` / `{repeat:"inf"}` | `E_REPEAT_INVALID` |
| `{repeatMode:"alternate"}` / `"reverse"` | `E_REPEAT_MODE_INVALID` |
| `{duration:0}` / `{duration:-1}` / `{duration:"1"}` | `E_DURATION_INVALID` |
| `{ease:"cubic"}` | `E_EASE_UNKNOWN` |
| `{start:"+=1"}` | `E_START_INVALID` |
| `{name:"1a"}` | `E_NAME_INVALID` |
| `travel {along:"o"}` | `E_TRAVEL_DURATION` |
| `travel {along:"o",duration:1,speed:2}` | `E_TRAVEL_DURATION` |
| `travel {along:"o",speed:100}` | aucun |
| `travel {along:"o",duration:1,from:"current"}` | aucun |
| `travel {along:"o",duration:1,from:"x"}` | `E_FIELD_TYPE` |
| `travel {along:"o",duration:1,orient:{offset:90}}` / `orient:true` | aucun |
| `travel {along:"o",duration:1,orient:"yes"}` | `E_TRAVEL_OPTION` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/lang/validate/timing.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(lang): timing values validation (T019)`

## Suivante
`T020-lang-validate-properties-shape`
