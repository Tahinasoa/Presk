# T043-model-world
**Phase** P3 · **Dépend de** : T041-model-scene-object · **Réf spec** : §4

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-model-core.md (section World)`
- `architecture/decisions/ADR-010-simulation-ticks-and-evaluation-order.md`

## Objectif
Créer `World` : registre des objets par identifiant, ordre de création, capture/restauration de l'état initial.

## Fichiers
- créer : `core/src/model/world.ts`
- créer : `core/src/model/world.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T043.1 Écris les tests (cas ci-dessous). Utilise `TestObject` (copie la définition de T041 dans un petit fichier d'aide `core/src/model/testing.ts`, exporté, réutilisable par les tests suivants : `makeTestObject(id, initial?)`).
T043.2 `World` : `Map<string, SceneObject>` + tableau d'ordre. `add` lève `Error` si l'id existe ou vaut `"scene"`. `require(id)` lève `PreskRuntimeError` si absent.
T043.3 `captureInitial()` : pour chaque objet (racine incluse) : `snapshot()`, id du parent (ou null), liste des ids des enfants (`children().map(c=>c.id)`).
T043.4 `reset()` : pour chaque objet : `restore(snapshot)` ; `parent = null` ; puis `setChildren(...)` selon la liste capturée (résolue par id) et `child.parent = objet` pour chaque enfant. Lève `Error` interne si `captureInitial` n'a jamais été appelé.

## Cas de test (à écrire AVANT le code)
| situation | attendu |
|---|---|
| `add(a)`, `add(b)` ; `all().map(o=>o.id)` | `["a","b"]` (la racine n'y est pas) |
| `add` du même id | lève |
| `add` d'un objet d'id `"scene"` | lève |
| `get("scene")` | la racine ; `has("scene")` vrai ; `get("zzz")` undefined |
| `require("zzz")` | lève `PreskRuntimeError` |
| `captureInitial()`, modifie `a.x`, `reset()` | `a.x` revient à la valeur initiale |
| `a.parent = b` après capture ; `reset()` | `a.parent` = null |
| `reset()` sans capture | lève |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/world.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): World registry (T043)`

## Suivante
`T044-model-effects-reveal`
