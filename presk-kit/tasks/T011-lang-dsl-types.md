# T011-lang-dsl-types
**Phase** P1 · **Dépend de** : T010-lang-diagnostics · **Réf spec** : §2, §12.1

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/conventions.md`
- `architecture/contracts/C-lang-types.md`

## Objectif
Créer les types TypeScript d'un document Presk v1.0.

## Fichiers
- créer : `core/src/lang/types.ts`
- créer : `core/src/lang/types.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T011.1 Crée `types.ts` en recopiant **exactement** les types de `C-lang-types.md` (y compris `ACTION_NAMES` en `as const` typé `readonly ActionName[]`).
T011.2 Écris `types.test.ts` : un test qui construit 9 objets `Step` typés (un par action, avec `satisfies Step`) et vérifie `ACTION_NAMES` = `["create","set","animate","travel","bind","unbind","stop","group","ungroup"]`.

## Cas de test (à écrire AVANT le code)
Le test compile (`tsc`) : un champ interdit (ex. `properties` dans `TravelStep`) doit être une erreur de type ; vérifie-le avec un `// @ts-expect-error` dans le test.

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/lang/types.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(lang): DSL document types (T011)`

## Suivante
`T012-lang-ease-names`
