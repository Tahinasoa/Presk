# T020-lang-validate-properties-shape
**Phase** P1 · **Dépend de** : T018-lang-validate-step-fields · **Réf spec** : §9.2, §10

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-lang-types.md`
- `architecture/contracts/C-lang-diagnostics.md`

## Objectif
Valider la forme des `properties` indépendamment des classes : clés non vides, listes de noms, `children`.

## Fichiers
- créer : `core/src/lang/validate/properties.ts`
- créer : `core/src/lang/validate/properties.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T020.1 Écris les tests (cas ci-dessous).
T020.2 Crée `validatePropertiesShape(step: Step, index: number, d: DiagnosticCollector): void`.
T020.3 Règles : pour `unbind`/`stop` avec `properties` (tableau) : chaque élément = chaîne non vide, sans doublon, sinon `E_FIELD_TYPE`. Pour `set/animate/bind` : objet **non vide** sinon `E_FIELD_REQUIRED` ; chaque valeur ≠ `undefined` (JSON : non applicable, ignore). Pour `group` : `properties.children` doit exister (`E_FIELD_REQUIRED`) et être une chaîne identifiant ou un tableau non vide de chaînes identifiants (`E_FIELD_TYPE` sinon). Pour `ungroup` : si `properties` présent, seule clé permise `children` (chaîne ou tableau de chaînes), toute autre clé → `E_FIELD_FORBIDDEN` field `properties.<clé>`.

## Cas de test (à écrire AVANT le code)
| étape | diagnostics |
|---|---|
| `stop` `properties:["x","y"]` | aucun |
| `stop` `properties:["x","x"]` / `[""]` / `[1]` | `E_FIELD_TYPE` |
| `unbind` sans `properties` | aucun |
| `set` `properties:{}` | `E_FIELD_REQUIRED` |
| `group` `properties:{children:["a","b"],layout:"vertical"}` | aucun |
| `group` `properties:{children:"a"}` | aucun |
| `group` `properties:{layout:"vertical"}` | `E_FIELD_REQUIRED` (`children`) |
| `group` `properties:{children:[]}` | `E_FIELD_TYPE` |
| `ungroup` sans `properties` | aucun |
| `ungroup` `properties:{children:["a"]}` | aucun |
| `ungroup` `properties:{gap:1}` | `E_FIELD_FORBIDDEN` field `properties.gap` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/lang/validate/properties.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(lang): properties shape validation (T020)`

## Suivante
`T021-lang-validate-document`
