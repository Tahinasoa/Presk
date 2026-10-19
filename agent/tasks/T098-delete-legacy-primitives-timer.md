# T098-delete-legacy-primitives-timer
**Phase** P5 · **Dépend de** : T097-delete-legacy-top-layers · **Réf spec** : —

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-001-spec-is-truth-and-strangler-migration.md`

## Objectif
Supprimer `primitives/` et tout `timer/` **sauf** `timer/easing/`.

## Fichiers
- supprimer : `core/src/primitives/ (dossier)`
- supprimer : `core/src/timer/ktimer.ts, ktimer.live.ts, ktimer.test.ts, tween/, README éventuel de timer/ (tout sauf easing/)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T098.1 Liste `core/src/timer/` ; supprime tout **sauf** le dossier `easing/` (qui contient `easing.ts`, `LICENSE`, `README.md`, `easing/`). Vérifie avec `git status` que `timer/easing/**` n'est pas touché.
T098.2 Même vérification d'imports qu'en T097 (`@/primitives`, `@/timer/` autre que `@/timer/easing/easing`).
T098.3 `tsc --noEmit` et `vitest run` : tout doit passer.

## Cas de test (à écrire AVANT le code)
Attendu : il ne reste dans `core/src` que `__arch__ app engine geom lang model view timer/easing style.css`.

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
`chore(legacy): remove old primitives and timer (T098)`

## Suivante
`T099-mark-stale-docs`
