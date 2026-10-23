# T065-engine-compile-create
**Phase** P4 · **Dépend de** : T064-engine-compile-properties, T049-model-catalog · **Réf spec** : §4.1, §12.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-compile.md`
- `architecture/decisions/ADR-015-groups-hierarchy-layout.md (juste la ligne sur les groupes implicites : NON implémentés ici)`
- `architecture/contracts/C-lang-diagnostics.md`

## Objectif
Compiler les étapes `create` en `InitStep[]` : unicité, classe connue, références futures interdites.

## Fichiers
- créer : `core/src/engine/compile/create.ts`
- créer : `core/src/engine/compile/create.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T065.1 Écris les tests (cas ci-dessous).
T065.2 Signature : `compileCreates(steps: readonly Step[], catalog: Catalog, d: DiagnosticCollector): { init: InitStep[]; types: Map<string,string> }`.
T065.3 Pré-calcule `allCreateIds` (ids de tous les `create`). Parcours les `create` dans l'ordre (en gardant l'index d'origine dans `steps` pour `stepIndex`). Pour chacun : id déjà déclaré → `E_OBJECT_DUPLICATE` ; `catalog.get(type)` absent ou `!creatable` → `E_TYPE_UNKNOWN` ; sinon `compileProperties(props ?? {}, "create", def, {scope, d, stepIndex})` avec `scope = createScope(catalog, typesDéclarésJusqueLà, allCreateIds moins déclarés)`.
T065.4 Une fois les propriétés compilées : ajoute `{id, type, entries}` à `init`, et `types.set(id, type)`. Un `create` en erreur n'ajoute pas d'`InitStep` mais **déclare quand même son type** (pour limiter les erreurs en cascade).
T065.5 Les groupes implicites ne sont pas gérés ici (T131).

## Cas de test (à écrire AVANT le code)
| steps | résultat |
|---|---|
| 2 `create` valides (rectangle `a`, text `t`) | `init.map(i=>i.id)` = `["a","t"]` ; `types` contient les 2 |
| `create b {x:"a.width"}` après `create a` | ok |
| `create b {x:"a.width"}` **avant** `create a` | `E_FORWARD_REFERENCE` |
| `create a {x:"a.width"}` | `E_FORWARD_REFERENCE` |
| `create b {x:"zzz.width"}` (zzz jamais créé) | `E_OBJECT_UNKNOWN` |
| 2 `create` du même id | `E_OBJECT_DUPLICATE` (stepIndex de la 2ᵉ) |
| `create a type:"hexagon"` | `E_TYPE_UNKNOWN` |
| `create a type:"scene"` | `E_TYPE_UNKNOWN` (non créable) |
| steps contenant aussi des `set` | ignorés |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/compile/create.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): create compilation (T065)`

## Suivante
`T066-engine-pass-progress`
