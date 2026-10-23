# T098-delete-legacy-primitives-timer
**Phase** P5 · **Dépend de** : T097-delete-legacy-top-layers · **Réf spec** : —

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-001-spec-is-truth-and-strangler-migration.md`

## Objectif
Cette tâche est **déjà réalisée par T097**. Elle ne sert qu'à vérifier l'état final.

## Fichiers
- lire : `core/src (arborescence)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T098.1 Vérifie que `core/src` ne contient que `__arch__ app engine geom lang model view timer/easing style.css` et que `core/src/timer/` ne contient que `easing/`.
T098.2 Lance `tsc --noEmit` et `vitest run`. Si tout est vert : `DONE` (utilise le commit de T097). Si un reste de legacy existe : supprime-le (`git rm`) en respectant la règle de T097 et committe avec le message ci-dessous.

## Cas de test (à écrire AVANT le code)
Aucun fichier à créer ou modifier si T097 a été exécutée.

## Ne pas toucher
`core/src/timer/easing/**`.

## Validation
```
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`chore(legacy): remove leftover legacy files (T098)`

## Suivante
`T099-mark-stale-docs`
