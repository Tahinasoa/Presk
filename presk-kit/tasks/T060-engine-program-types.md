# T060-engine-program-types
**Phase** P4 · **Dépend de** : T049-model-catalog, T021-lang-validate-document · **Réf spec** : §2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-compile.md (sections Types et Brouillons d'actions)`
- `architecture/decisions/ADR-009-timeline-planning.md`

## Objectif
Créer les types de sortie de la compilation (`Program`, entrées compilées, actions planifiées, brouillons).

## Fichiers
- créer : `core/src/engine/program.ts`
- créer : `core/src/engine/analyze/scope.ts`
- créer : `core/src/engine/program.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T060.1 Crée `program.ts` : recopie **exactement** les types de `C-engine-compile.md § Types` et `§ Brouillons d'actions` (`Evaluator`, `CompiledProp`, `CompiledEffect`, `CompiledEntry`, `InitStep`, `ActionBase`, les 8 actions, `PlannedAction`, `Program`, `DraftOf`, `DraftAction`, `PlanHooks`). Tout en `import type`.
T060.2 Crée `analyze/scope.ts` : `AnalyzeScope`, `ExprType`, `Analyzed` (voir contrat) et une fonction `createScope(catalog: Catalog, types: ReadonlyMap<string,string>, forward?: ReadonlySet<string>): AnalyzeScope` : `typeOf(id)` = `"scene"` pour `"scene"`, sinon `types.get(id)` ; `isForward(id)` = `forward?.has(id) ?? false`.
T060.3 `program.test.ts` : teste seulement `createScope` (cas ci-dessous) et vérifie par un objet typé `satisfies Program` qu'un `Program` minimal compile.

## Cas de test (à écrire AVANT le code)
| appel | attendu |
|---|---|
| `createScope(cat, new Map([["a","rectangle"]])).typeOf("a")` | `"rectangle"` |
| `.typeOf("scene")` | `"scene"` ; `.typeOf("zzz")` undefined |
| `createScope(cat, new Map(), new Set(["b"])).isForward!("b")` | true ; `("c")` false |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/program.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): program types and analysis scope (T060)`

## Suivante
`T061-engine-analyze-expr`
