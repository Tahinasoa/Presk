# T155-move-easing-to-lang
**Phase** P9 · **Dépend de** : T154-engine-warning-speed-path · **Réf spec** : —

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-001-spec-is-truth-and-strangler-migration.md`
- `architecture/00-overview.md`

## Objectif
Ranger le module d'easing dans sa couche définitive. Seule tâche autorisée à toucher `timer/easing`.

## Fichiers
- déplacer : `core/src/timer/easing/ → core/src/lang/easing/`
- modifier : `core/src/lang/ease.ts, core/src/lang/ease.test.ts, imports de `@/timer/easing/easing` dans engine/ et lang/`
- modifier : `core/src/__arch__/rules.ts, rules.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T155.1 `git mv core/src/timer/easing core/src/lang/easing` (le dossier `timer/` doit disparaître s'il est vide).
T155.2 Remplace **tous** les imports `@/timer/easing/easing` par `@/lang/easing/easing` (`grep -rn "timer/easing" core/src`).
T155.3 Dans `__arch__/rules.ts` : supprime la constante `EASING_MODULE` et son cas particulier (les imports vers `lang/` sont désormais autorisés pour `engine/` par les règles générales). Mets à jour `rules.test.ts` : le test « accepts allowed imports » doit utiliser `@/lang/easing/easing` ; supprime la ligne qui référençait `@/timer/easing/easing`.
T155.4 Mets à jour `ADR-003` n'est **pas** ton rôle : signale-le dans « Questions pour l'architecte » (note : « ADR-003 mentionne encore `@/timer/easing/easing` »).

## Cas de test (à écrire AVANT le code)
`vitest run` : tout passe ; `grep -rn "timer" core/src` ne renvoie plus rien.

## Ne pas toucher
Le contenu des fichiers d'easing (aucune modification de code d'easing, LICENSE incluse).

## Validation
```
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`refactor: move easing module to lang/easing (T155)`

## Suivante
`T156-final-audit`
