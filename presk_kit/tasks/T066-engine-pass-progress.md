# T066-engine-pass-progress
**Phase** P4 · **Dépend de** : T012-lang-ease-names, T010-lang-diagnostics · **Réf spec** : §6.3, §6.4

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-compile.md (section passProgress)`
- `architecture/decisions/ADR-010-simulation-ticks-and-evaluation-order.md`

## Objectif
Fonction pure `passProgress` : position eased `p` d'une action à un instant donné.

## Fichiers
- créer : `core/src/engine/plan/passProgress.ts`
- créer : `core/src/engine/plan/passProgress.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T066.1 Écris les tests (cas ci-dessous), puis la fonction avec les règles exactes de `C-engine-compile.md § passProgress`.

## Cas de test (à écrire AVANT le code)
`lin = (x)=>x`, `quad = (x)=>x*x`. `duration = 1` sauf mention.
| spec, elapsed | `{p, finished}` |
|---|---|
| dur 2, repeat 1, restart, elapsed 1 | `{0.5,false}` |
| dur 2, repeat 1, elapsed 2 / 5 | `{1,true}` / `{1,true}` |
| dur 2, repeat 1, elapsed −1 | `{0,false}` |
| dur 2, repeat 1, `quad`, elapsed 1 | `{0.25,false}` |
| repeat 2 restart, elapsed 1.5 | `{0.5,false}` |
| repeat 2 restart, elapsed 2 | `{1,true}` |
| repeat 2 yoyo, elapsed 0.5 / 1.5 / 1.25 | 0.5 / 0.5 / 0.75 (non finis) |
| repeat 2 yoyo, elapsed 2 | `{0,true}` (nombre pair → retour au départ) |
| repeat 3 yoyo, elapsed 3 | `{1,true}` |
| repeat "infinite" yoyo, elapsed 5.25 / 6.25 | 0.75 / 0.25, `finished` faux |
| repeat "infinite" restart, elapsed 7.5 | 0.5, `finished` faux |
| duration 0, elapsed 0 | `{1,true}` |
| repeat 2 yoyo, `quad`, elapsed 1.5 | `quad(1−0.5)` = 0.25 |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/plan/passProgress.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): passProgress (T066)`

## Suivante
`T067-engine-compile-steps`
