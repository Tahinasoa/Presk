# T078-engine-sim-instant-actions
**Phase** P4 · **Dépend de** : T074-engine-sim-context-ownership, T075-engine-mech-animate · **Réf spec** : §2.2, §9

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-runtime.md`
- `architecture/decisions/ADR-011-mechanisms-ownership-and-conflicts.md`

## Objectif
Implémenter `activateSet`, `activateStop`, `activateUnbind`.

## Fichiers
- créer : `core/src/engine/sim/instant.ts`
- créer : `core/src/engine/sim/instant.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T078.1 Écris les tests (cas ci-dessous).
T078.2 `activateSet(ctx: SimContext, a: SetAction, catalog: Catalog): void` : pour chaque entrée dans l'ordre : prop → `ownership.claim(target, spec.writes, null)` puis `spec.set!(obj, entry.value(world))` ; effet → `ownership.claim(target,["@"+nom],null)` puis `def.apply(obj, variant, on ? 1 : 0)`.
T078.3 `activateStop(ctx, a: StopAction, catalog)` : clés visées = `keysOfNames(def, a.keys)` (exporte-la depuis `engine/analyze/activity.ts` si ce n'est pas déjà fait en T070) ou, si `a.keys === null`, toutes les clés de `ownersOf(target)` détenues par un mécanisme de `kind` `animate`/`travel`/`effect`. Pour chaque clé dont le propriétaire n'est **pas** un `bind` : `ownership.claim(target,[clé],null)` (le propriétaire perd la clé ; vide → inactif ; la valeur reste figée).
T078.4 `activateUnbind(ctx, a: UnbindAction, catalog)` : idem avec les propriétaires de `kind "bind"` uniquement.
T078.5 Aucune de ces fonctions ne lève d'erreur si rien n'est actif (la compilation a déjà validé).

## Cas de test (à écrire AVANT le code)
Monde : rect `a` x 0.
| situation | attendu |
|---|---|
| `activateSet` x=5 | `a.x` 5 ; si un mécanisme possédait `x` : il perd la clé |
| `activateSet` `{pos:{x:1,y:2}}` | x 1, y 2 ; un mécanisme possédant seulement `x` perd `x` |
| `activateSet` reveal true / false (variant default) | presence 1 / 0 |
| `activateStop` keys `["x"]` avec un `AnimateMechanism` possédant `x` | mécanisme inactif ; `a.x` inchangé ; `ownerOf` undefined |
| `activateStop` keys `null` avec animate (x) et bind (y) | animate stoppé ; bind intact |
| `activateUnbind` keys `["y"]` avec bind sur y | bind inactif |
| `activateUnbind` keys `null` | tous les binds de la cible relâchés |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/instant.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): instant actions set/stop/unbind (T078)`

## Suivante
`T079-engine-simulation`
