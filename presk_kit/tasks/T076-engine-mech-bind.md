# T076-engine-mech-bind
**Phase** P4 · **Dépend de** : T075-engine-mech-animate · **Réf spec** : §2.2, §7.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-runtime.md`
- `architecture/decisions/ADR-010-simulation-ticks-and-evaluation-order.md`

## Objectif
Implémenter `BindMechanism` : réévalue ses expressions à chaque tick tant qu'il possède ses clés.

## Fichiers
- créer : `core/src/engine/sim/mechanisms/bind.ts`
- créer : `core/src/engine/sim/mechanisms/bind.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T076.1 Écris les tests (cas ci-dessous).
T076.2 `BindMechanism` : constructeur `(action: BindAction)` ; `kind "bind"` ; `end = Infinity`. `activate` : `claim(target, union des writes, this)` ; `active = true`.
T076.3 `evaluate(ctx, now)` : pour chaque entrée dans l'ordre : `writeSpecValue(obj, entry.spec, entry.value(ctx.world), this.keys)` (la valeur **n'est pas figée** : relue à chaque appel). `finalize` : ne fait rien.

## Cas de test (à écrire AVANT le code)
Monde : `a` x 0 ; `b` x 200 (`buildWorld`). Action bind : `a.x = "b.x - 50"`.
| appel | attendu |
|---|---|
| `activate` ; `evaluate` | `a.x` = 150 |
| `b.x = 300` ; `evaluate` | `a.x` = 250 |
| autre mécanisme prend `x` de `a` | `BindMechanism` inactif ; `evaluate` n'écrit rien |
| bind de `pos` avec expression point `"b.topLeft"`, puis un mécanisme prend `x` | `y` suit toujours, `x` figé |
| cycle : `a.x = "b.x + 1"` et `b.x = "a.x + 1"` (2 mécanismes évalués dans l'ordre) | chaque tick avance d'un cran, aucun blocage ni exception |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/mechanisms/bind.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): bind mechanism (T076)`

## Suivante
`T077-engine-mech-effect`
