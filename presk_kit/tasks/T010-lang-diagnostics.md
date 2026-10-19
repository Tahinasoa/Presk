# T010-lang-diagnostics
**Phase** P1 · **Dépend de** : T004-arch-lint-layers · **Réf spec** : §12.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/conventions.md`
- `architecture/decisions/ADR-004-diagnostics-collect-then-fail.md`
- `architecture/contracts/C-lang-diagnostics.md`

## Objectif
Créer le module des diagnostics : liste fermée des codes, collecteur, `PreskCompileError`, `PreskRuntimeError`.

## Fichiers
- créer : `core/src/lang/diagnostics.ts`
- créer : `core/src/lang/diagnostics.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T010.1 Écris `diagnostics.test.ts` avec les cas ci-dessous.
T010.2 Crée `diagnostics.ts` : recopie la liste des codes **dans l'ordre exact** du tableau de `C-lang-diagnostics.md` dans `DIAGNOSTIC_CODES` (`as const`), puis les types et classes de la section « API exacte ».
T010.3 `DiagnosticCollector.error()` lève `new Error("Presk internal: ...")` si le code commence par `W_` ; `warning()` si le code commence par `E_`.
T010.4 `PreskCompileError.message` = `Presk compile failed: N error(s): CODE1, CODE2` (codes séparés par `, `, sans doublon, dans l'ordre d'apparition).

## Cas de test (à écrire AVANT le code)
| cas | attendu |
|---|---|
| tous les codes de `DIAGNOSTIC_CODES` commencent par `E_` ou `W_` | vrai ; aucun doublon |
| `DIAGNOSTIC_CODES.length` | **69** (nombre de lignes de code du tableau du contrat) |
| `d.error("E_DOC_VERSION","m",{stepIndex:2})` puis `d.items` | `[{severity:"error",code:"E_DOC_VERSION",message:"m",stepIndex:2}]` |
| `d.error("W_SPEED_PATH_MAY_CHANGE","m")` | lève une `Error` |
| `d.warning("E_DOC_VERSION","m")` | lève une `Error` |
| collecteur avec 1 erreur + 1 warning | `hasErrors` vrai ; `errors.length` 1 ; `warnings.length` 1 |
| `new PreskCompileError([e1,e2])` avec codes `E_A`,`E_A` | `message` contient le code une seule fois ; `.diagnostics` = les 2 |
| `new PreskRuntimeError("x") instanceof Error` | vrai ; `.name === "PreskRuntimeError"` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/lang/diagnostics.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(lang): diagnostics and error classes (T010)`

## Suivante
`T011-lang-dsl-types`
