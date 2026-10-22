# T001-baseline-report-environment
**Phase** P0 · **Dépend de** : — · **Réf spec** : —

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/conventions.md`

## Objectif
Vérifier que l'environnement fonctionne et noter la base de départ. Aucune modification de code.

## Fichiers
- lire : `language/Presk — Spécification v1.0.md (juste vérifier qu'il existe)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T001.1 Dans le dépôt : `git status` doit être propre. Crée la branche de travail : `git switch -c presk-v1` (si elle existe déjà : `git switch presk-v1`).
T001.2 `cd core && pnpm install` (si `pnpm` est absent, utilise `npm install`).
T001.3 Lance `pnpm exec vitest run` puis `pnpm exec tsc --noEmit`. Recopie les résultats bruts (nombre de tests passés/échoués, erreurs tsc) dans BACKLOG › « Journal ».
T001.4 Compare avec la base attendue : **184 tests passent, 3 échouent** (`compiler.test.ts` ×2, `kobject.test.ts` ×1) et **2 erreurs tsc** (`kobject.test.ts` : `create` ; `ktimer.live.ts` : `process`). Si ton résultat est différent : ne corrige rien, note l'écart dans « Questions pour l'architecte » et passe la tâche en `BLOCKED`.
T001.5 Passe T001 en `DONE` (pas de commit : rien n'a changé).

## Ne pas toucher
Tout : cette tâche ne modifie aucun fichier du projet.

## Validation
```
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`(pas de commit)`

## Suivante
`T002-skip-obsolete-legacy-tests`
