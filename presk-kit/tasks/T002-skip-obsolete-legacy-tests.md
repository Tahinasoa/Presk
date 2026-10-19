# T002-skip-obsolete-legacy-tests
**Phase** P0 · **Dépend de** : T001-baseline-report-environment · **Réf spec** : —

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-001-spec-is-truth-and-strangler-migration.md`

## Objectif
Rendre la suite de tests verte en neutralisant les 3 tests qui vérifient des comportements v0.1 supprimés par la spec v1.0.

## Fichiers
- modifier : `core/src/primitives/kobject/kobject.test.ts`
- modifier : `core/src/compiler/compiler.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T002.1 Dans `kobject.test.ts`, test `becomes visible when create is called` : remplace `it(` par `it.skip(`, **supprime** la ligne `obj.create({ duration: 1 });` (elle ne compile pas) et ajoute au-dessus le commentaire `// LEGACY-OBSOLETE (DSL v0.1): create() no longer exists on KObject.`
T002.2 Dans `compiler.test.ts`, test `resolves an expression property once for 'create'` : `it(` → `it.skip(`, commentaire au-dessus : `// LEGACY-OBSOLETE (DSL v0.1): create props are no longer forwarded this way.`
T002.3 Dans `compiler.test.ts`, test `registers follow bindings directly on create step` : `it(` → `it.skip(`, commentaire : `// LEGACY-OBSOLETE (DSL v0.1): follow on create is not in spec v1.0.`
T002.4 Ne change **rien d'autre** dans ces fichiers.

## Cas de test (à écrire AVANT le code)
Résultat attendu de `vitest run` : **184 passés, 3 ignorés (skipped), 0 échec**.

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/primitives/kobject/kobject.test.ts src/compiler/compiler.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`test(legacy): skip 3 obsolete v0.1 tests (T002)`

## Suivante
`T003-types-node-for-tsc`
