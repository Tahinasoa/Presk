# ADR-002-toolchain-and-ts-constraints
**Outillage et contraintes TypeScript** · Réf spec : —

## Contexte
Le `tsconfig` impose `strict`, `erasableSyntaxOnly`, `verbatimModuleSyntax`, `noUnusedLocals/Parameters`. Vitest 5, Vite 8, PixiJS 8, pnpm.

## Décision
- Aucune nouvelle dépendance. Dépendances autorisées : `transformation-matrix` (seulement dans `geom/matrix.ts`), `pixi.js` (seulement dans `view/` et `app/`), `nanoid` (non utilisé par le nouveau code).
- Pas d'`enum`, de `namespace`, ni de paramètre de constructeur avec modificateur.
- Tests : vitest, environnement `node`, fichiers `src/**/*.test.ts`.
- Alias `@/` = `core/src/`.

## Alternatives écartées
- Ajouter une lib de parsing (peggy, chevrotain) : surdimensionné pour une grammaire sans parenthèses.
- Jest : le projet est déjà sur vitest.

## Conséquences
Tout agent doit relire `conventions.md` avant son premier fichier de code.
