# T017-lang-validate-shell
**Phase** P1 · **Dépend de** : T010-lang-diagnostics, T011-lang-dsl-types · **Réf spec** : §2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-lang-types.md`
- `architecture/contracts/C-lang-diagnostics.md`
- `architecture/decisions/ADR-004-diagnostics-collect-then-fail.md`

## Objectif
Valider `version`, `scene`, `steps` (forme du document, pas les étapes).

## Fichiers
- créer : `core/src/lang/validate/shell.ts`
- créer : `core/src/lang/validate/shell.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T017.1 Écris les tests (cas ci-dessous), puis crée `validateShell(raw: unknown, d: DiagnosticCollector): { scene: SceneConfig; steps: unknown[] } | null`.
T017.2 Retourne `null` (après avoir ajouté **toutes** les erreurs détectées) si une erreur existe, sinon `{scene, steps}`. `steps` est renvoyé tel quel (non validé).

## Cas de test (à écrire AVANT le code)
| entrée | diagnostics |
|---|---|
| `{version:"1.0",scene:{width:1920,height:1080},steps:[]}` | aucun ; renvoie scene+steps |
| `{version:"1.0",scene:{width:1,height:1,background:"#101014"},steps:[]}` | aucun |
| `null`, `[]`, `"x"`, `3` | `E_DOC_NOT_OBJECT` |
| version absente / `"0.1"` / `1` | `E_DOC_VERSION` |
| `scene` absent ; `width:0` ; `height:"a"` ; `background:3` | `E_SCENE_INVALID` (une par défaut) |
| `steps` absent ou objet | `E_STEPS_NOT_ARRAY` |
| version `"0.1"` ET steps absent | `E_DOC_VERSION` **et** `E_STEPS_NOT_ARRAY` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/lang/validate/shell.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(lang): document shell validation (T017)`

## Suivante
`T018-lang-validate-step-fields`
