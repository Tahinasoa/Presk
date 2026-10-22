# Conventions de code (obligatoires)

## Langue
- Identifiants, commentaires de code, messages de diagnostic : **anglais**. Documents du kit : français.
- Aucun README dans `core/src`. Au plus **3 lignes** de commentaire en tête de fichier (ce qu'il contient, pas comment).
  Rappel : les commentaires existants dans le legacy peuvent être faux ; ne t'y fie jamais.

## Contraintes TypeScript (tsconfig du projet : `strict`, `erasableSyntaxOnly`, `verbatimModuleSyntax`, `noUnusedLocals/Parameters`)
- **Interdit** : `enum`, `namespace`, propriétés de paramètre de constructeur (`constructor(private x: number)`), `any` non justifié.
  Utiliser : unions de littéraux, `const` objets, champs déclarés explicitement.
- Imports de types : `import type { X } from "..."`. Imports internes : alias `@/` (= `core/src/`). Pas de `../..`.
- Export : **exports nommés** pour les fonctions, types et classes. Pas d'`export default` dans le nouveau code.
- Pas d'effet de bord à l'import. Pas de `Date.now()`, `Math.random()`, `performance.now()` dans `lang/ geom/ model/ engine/` (déterminisme).
- Une classe ou un concept principal par fichier. Taille cible d'un fichier : < 250 lignes.

## Nommage
- Fichiers : `camelCase.ts` (ex. `sceneObject.ts`). Tests : `<fichier>.test.ts` à côté du fichier testé.
- Types/classes : `PascalCase`. Fonctions/variables : `camelCase`. Constantes : `UPPER_SNAKE_CASE`.
- Clés d'état et noms de propriétés DSL : exactement ceux de la spec (`topLeft`, `strokeWidth`…).
- Codes de diagnostic : voir `contracts/C-lang-diagnostics.md` (liste fermée).

## Erreurs
- Erreur de l'**auteur du document** → on ajoute un `Diagnostic` (jamais de `throw` dans `lang/` ni dans la compilation, sauf `PreskCompileError` final). ADR-004.
- Erreur de **programmation** (état impossible) → `throw new Error("Presk internal: ...")`.
- Erreur à l'**exécution** (ex. `vertex[9]` inexistant) → `throw new PreskRuntimeError(message)` (défini en T010).

## Tests (vitest, `import { describe, it, expect } from "vitest"`, pas de globals)
- Chaque tâche qui crée du code crée son fichier de test **d'abord** (les cas listés dans la tâche), puis le code.
- Nombres flottants : `toBeCloseTo(valeur, 6)` sauf indication. Jamais de snapshot Pixi.
- Aucun test ne doit dépendre de `document`, `window`, Pixi ou du réseau, sauf `view/` (non testé unitairement).

## Commandes (depuis `core/`, gestionnaire `pnpm`)
- Un fichier de test : `pnpm exec vitest run src/<chemin>.test.ts`
- Tous les tests : `pnpm exec vitest run`
- Types : `pnpm exec tsc --noEmit`
- Garde-fou architecture : `pnpm exec vitest run src/__arch__`
Si `pnpm` est absent : `npx vitest run ...` et `npx tsc --noEmit` (mêmes arguments).

## Git
- Un commit par tâche, message donné par la tâche, format `type(scope): résumé (Txxx)`.
- Avant de commit : validation de la tâche **et** `tsc --noEmit` **et** `vitest run src/__arch__` (si présent) doivent passer.
- Commit WIP autorisé en cours de tâche : `wip(Txxx): étape Txxx.k`.
