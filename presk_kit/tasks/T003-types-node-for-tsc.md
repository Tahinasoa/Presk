# T003-types-node-for-tsc
**Phase** P0 · **Dépend de** : T002-skip-obsolete-legacy-tests · **Réf spec** : —

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/conventions.md`
- `architecture/decisions/ADR-002-toolchain-and-ts-constraints.md`

## Objectif
`tsc` échoue sur `process` (ktimer.live.ts). Les futurs tests d'architecture utilisent `node:fs`. Ajouter les types Node.

## Fichiers
- modifier : `core/package.json (devDependency)`
- modifier : `core/tsconfig.json`
- modifier : `pnpm-lock.yaml ou package-lock.json (généré)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T003.1 `cd core && pnpm add -D @types/node` (ou `npm i -D @types/node`).
T003.2 Dans `core/tsconfig.json`, remplace `"types": ["vite/client"]` par `"types": ["vite/client", "node"]`.
T003.3 Lance `pnpm exec tsc --noEmit` : **0 erreur** attendue.

## Cas de test (à écrire AVANT le code)
`tsc --noEmit` ne sort aucune ligne. `vitest run` : 184 passés, 3 ignorés.

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`chore(core): add @types/node so tsc is clean (T003)`

## Suivante
`T004-arch-lint-layers`
