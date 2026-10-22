# T097-delete-legacy-top-layers
**Phase** P5 · **Dépend de** : T096-app-main-and-examples · **Réf spec** : —

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-001-spec-is-truth-and-strangler-migration.md`
- `architecture/00-overview.md (§4 carte legacy → nouveau)`

## Objectif
Supprimer d'un seul coup tout le legacy : un test de `primitives/` importe encore `binding/`, donc les deux doivent disparaître ensemble.

## Fichiers
- supprimer : `core/src/main.ts`
- supprimer : `core/src/presk.ts`
- supprimer : `core/src/registry/ (dossier)`
- supprimer : `core/src/renderer/ (dossier)`
- supprimer : `core/src/compiler/ (dossier)`
- supprimer : `core/src/binding/ (dossier)`
- supprimer : `core/src/primitives/ (dossier)`
- supprimer : `core/src/timer/ : tout SAUF le dossier easing/ (ktimer.ts, ktimer.live.ts, ktimer.test.ts, tween/, README éventuel)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T097.1 Vérifie qu'**aucun fichier hors de ces dossiers** n'importe l'un d'eux : `grep -rn "@/registry\|@/renderer\|@/compiler\|@/binding\|@/primitives\|@/presk\|@/timer/" core/src --include=*.ts`, en ignorant les fichiers qui vont être supprimés et les imports `@/timer/easing/easing`. Si un fichier à conserver apparaît : `BLOCKED`.
T097.2 `git rm -r` de tous les éléments de la liste. Conserve **impérativement** `core/src/timer/easing/` (contient `easing.ts`, `LICENSE`, `README.md`, `easing/`) : vérifie avec `git status` qu'aucun fichier de `timer/easing/` n'apparaît comme supprimé.
T097.3 Lance `tsc --noEmit` : aucune erreur attendue. Puis `vitest run` : le nombre de tests baisse (les tests legacy disparaissent) ; **aucun échec**. Note le nouveau total dans BACKLOG › Journal.
T097.4 Dans BACKLOG, marque **T097 et T098 en `DONE`** avec le même commit (T098 n'a plus rien à faire).

## Cas de test (à écrire AVANT le code)
Attendu : il ne reste dans `core/src` que `__arch__ app engine geom lang model view timer/easing style.css`.

## Ne pas toucher
`core/src/timer/easing/**` et tout le nouveau code (`app model engine lang geom view __arch__`).

## Validation
```
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`chore(legacy): remove all legacy code except timer/easing (T097)`

## Suivante
`T098-delete-legacy-primitives-timer`
