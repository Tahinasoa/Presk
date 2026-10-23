# T071-engine-compile-program
**Phase** P4 · **Dépend de** : T065-engine-compile-create, T067-engine-compile-steps, T068-engine-plan-timeline, T069-engine-analyze-effects, T070-engine-analyze-activity, T021-lang-validate-document · **Réf spec** : §12.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-compile.md (API publique)`
- `architecture/decisions/ADR-004-diagnostics-collect-then-fail.md`

## Objectif
Assembler toutes les phases : `compileProgram` et `tryCompileProgram`.

## Fichiers
- créer : `core/src/engine/compileProgram.ts`
- créer : `core/src/engine/compileProgram.test.ts`
- créer : `core/src/engine/index.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T071.1 Écris les tests (cas ci-dessous).
T071.2 `tryCompileProgram(raw, env)` : (1) `validateDocument` ; erreurs → renvoie `{diagnostics}` sans `program`. (2) `compileCreates` ; (3) `compileSteps` ; si erreurs après (2)+(3) → stop. (4) `planTimeline` ; erreurs → stop. (5) `resolveEffectVariants` ; `analyzeActivity` ; erreurs → stop. (6) `Program = {scene, init, actions, duration, warnings}`.
T071.3 Chaque phase ajoute à **un seul** `DiagnosticCollector` ; on vérifie `hasErrors` entre phases. Les phases (2) et (3) tournent toutes les deux avant de tester les erreurs (pour collecter les erreurs de création et d'actions ensemble).
T071.4 `compileProgram` : appelle `tryCompileProgram` ; s'il y a des erreurs → `throw new PreskCompileError(errors)` ; sinon renvoie le programme (les warnings dans `program.warnings`).
T071.5 `engine/index.ts` réexporte : `compileProgram`, `tryCompileProgram`, `CompileEnv`, `Program`, `Simulation` (sera ajouté en T079 : pour l'instant seulement ce qui existe).

## Cas de test (à écrire AVANT le code)
`env = { catalog: createDefaultCatalog(), objectEnv: createTestEnv() }`
| document | résultat |
|---|---|
| 1 rectangle + `animate x:100 duration 1` | `program.init.length` 1 ; `actions.length` 1 ; `duration` 1 |
| doc avec `version:"0.1"` | `tryCompile` : diagnostics contient `E_DOC_VERSION`, pas de `program` |
| `compileProgram` d'un doc invalide | lève `PreskCompileError` avec les codes |
| erreurs de création (`E_TYPE_UNKNOWN`) **et** d'action (`E_OBJECT_UNKNOWN`) dans le même doc | les deux codes présents |
| erreur de validation structurelle + objet inconnu | seule l'erreur de validation (phase 1 stoppe) |
| `stop` sans animate | `E_STOP_NOTHING` |
| doc valide : `program.warnings` | `[]` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/compileProgram.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): compileProgram orchestrator (T071)`

## Suivante
`T072-engine-sim-build-world`
