# T074-engine-sim-context-ownership
**Phase** P4 · **Dépend de** : T071-engine-compile-program · **Réf spec** : §9.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-runtime.md (types Mechanism, SimContext, Ownership)`
- `architecture/decisions/ADR-011-mechanisms-ownership-and-conflicts.md`

## Objectif
Créer `Mechanism`, `SimContext`, `Ownership`.

## Fichiers
- créer : `core/src/engine/sim/context.ts`
- créer : `core/src/engine/sim/context.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T074.1 Écris les tests (cas ci-dessous) avec une classe `FakeMechanism implements Mechanism` définie dans le test.
T074.2 `context.ts` : types `Mechanism`, `SimContext` (recopiés du contrat) et classe `Ownership` : table `Map<objectId, Map<key, Mechanism>>`.
T074.3 `claim(objectId, keys, owner)` : pour chaque clé : si un propriétaire **différent** existe : `previous.keys.delete(key)` et, si `previous.keys.size === 0`, `previous.active = false` ; puis `owner` non nul : table[objet][clé] = owner et `owner.keys.add(key)` ; `owner` nul : supprime la clé de la table.
T074.4 `release(m)` : supprime de la table toutes les clés dont `m` est propriétaire (sur son `targetId`) et vide `m.keys`. `ownerOf`, `ownersOf` (map en lecture seule, vide si inconnu), `clear()`.

## Cas de test (à écrire AVANT le code)
| situation | attendu |
|---|---|
| `claim("a",["x"],m1)` ; `ownerOf("a","x")` | m1 ; `m1.keys` contient `x` |
| puis `claim("a",["x"],m2)` | `ownerOf` = m2 ; `m1.keys` vide ; `m1.active` false |
| m1 possède `x` et `y` ; m2 prend `x` | m1 reste actif (garde `y`) |
| `claim("a",["x"],null)` | `ownerOf("a","x")` undefined |
| `release(m)` | plus aucune clé de m dans `ownersOf(m.targetId)` ; `m.keys` vide |
| objet différent, même clé | indépendants |
| `ownersOf("zzz")` | map vide |
| `clear()` | tout vide |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/context.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): ownership and simulation context (T074)`

## Suivante
`T075-engine-mech-animate`
