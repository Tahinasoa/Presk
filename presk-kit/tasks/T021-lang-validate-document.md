# T021-lang-validate-document
**Phase** P1 · **Dépend de** : T017-lang-validate-shell, T018-lang-validate-step-fields, T019-lang-validate-timing-values, T020-lang-validate-properties-shape · **Réf spec** : §2, §4, §12

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-lang-diagnostics.md`
- `architecture/decisions/ADR-004-diagnostics-collect-then-fail.md`

## Objectif
Assembler la validation structurelle : `validateDocument`.

## Fichiers
- créer : `core/src/lang/validate/document.ts`
- créer : `core/src/lang/validate/document.test.ts`
- créer : `core/src/lang/index.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T021.1 Écris les tests (cas ci-dessous).
T021.2 Crée `validateDocument(raw: unknown): { document?: DslDocument; diagnostics: Diagnostic[] }`. Ordre : `validateShell` → pour chaque étape (index i) : `validateStepFields` ; si l'étape est valide : `validateTimingValues`, `validatePropertiesShape`.
T021.3 Contrôles entre étapes : `name` dupliqué → `E_NAME_DUPLICATE` (sur la 2ᵉ occurrence). `target === "scene"` : avec `create` → `E_OBJECT_RESERVED` ; avec `travel`/`group`/`ungroup` → `E_SCENE_ACTION`.
T021.4 `document` n'est renvoyé que s'il n'y a **aucune erreur** (les avertissements n'existent pas à ce stade). `diagnostics` contient tout.
T021.5 Crée `core/src/lang/index.ts` qui réexporte : `validateDocument`, les types de `types.ts`, `DiagnosticCollector`, `PreskCompileError`, `PreskRuntimeError`, `parseStart`, `parseExpression`.

## Cas de test (à écrire AVANT le code)
| document | résultat |
|---|---|
| doc minimal avec 1 `create` + 1 `animate` valides | `document` défini, `diagnostics = []` |
| 2 actions avec `name:"n"` | `E_NAME_DUPLICATE` (stepIndex 1) |
| `{action:"create",target:"scene",type:"rectangle"}` | `E_OBJECT_RESERVED` |
| `{action:"travel",target:"scene",along:"o",duration:1}` | `E_SCENE_ACTION` |
| `{action:"set",target:"scene",properties:{zoom:2}}` | aucun (la sémantique de `scene` est vérifiée plus tard) |
| doc avec 3 étapes invalides | les diagnostics des 3 étapes sont **tous** présents ; `document` absent |
| version `"0.1"` | `E_DOC_VERSION`, et les étapes sont quand même examinées |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/lang/validate/document.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(lang): validateDocument (T021)`

## Suivante
`T030-geom-vec`
