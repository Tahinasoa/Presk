# T070-engine-analyze-activity
**Phase** P4 · **Dépend de** : T068-engine-plan-timeline, T069-engine-analyze-effects · **Réf spec** : §9

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-011-mechanisms-ownership-and-conflicts.md`
- `architecture/contracts/C-lang-diagnostics.md`
- `architecture/contracts/C-engine-compile.md`

## Objectif
Vérifier statiquement `stop`/`unbind` d'après le planning (qui possède quelle clé, quand).

## Fichiers
- créer : `core/src/engine/analyze/activity.ts`
- créer : `core/src/engine/analyze/activity.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T070.1 Écris les tests (cas ci-dessous) avec `planForTest`.
T070.2 `analyzeActivity(actions: readonly PlannedAction[], typeOf: (id:string)=>string|undefined, catalog: Catalog, d: DiagnosticCollector): void`.
T070.3 Fonction `keysOfNames(def, names): string[]` : un nom de propriété → `def.props[nom].writes` ; un effet → `"@"+nom`.
T070.4 Trie les actions par `(start, index)`. État : `owners: Map<objet, Map<clé, {kind:"animate"|"travel"|"bind", end:number}>>`. Avant de traiter une action de start `s` : retire les propriétaires dont `end <= s + 1e-9` (animate/travel finis).
T070.5 `set` : retire les propriétaires des clés écrites. `animate` : propriétaire `animate` sur les clés des entrées (propriétés et effets) avec `end = action.end`. `bind` : propriétaire `bind`, `end = Infinity`.
T070.6 `stop` : clés visées = `keysOfNames(def, keys)` ou, si `keys === null`, toutes les clés actuellement détenues par `animate`/`travel` sur la cible. Pour chaque nom/clé : propriétaire `bind` → `E_STOP_ON_BIND` ; aucun propriétaire → `E_STOP_NOTHING` ; `animate`/`travel` → le retire. (`keys === null` sans aucun `animate`/`travel` : `E_STOP_ON_BIND` s'il y a un `bind` sur la cible, sinon `E_STOP_NOTHING`.)
T070.7 `unbind` : symétrique : propriétaire `animate`/`travel` → `E_UNBIND_ON_ANIMATE` ; aucun → `E_UNBIND_NOTHING` ; `bind` → le retire. `keys === null` : retire tous les `bind` de la cible ; aucun → `E_UNBIND_ON_ANIMATE` si un `animate`/`travel` existe, sinon `E_UNBIND_NOTHING`.
T070.8 Les actions `travel` n'existent pas encore : le cas `E_STOP_PARTIAL_TRAVEL` et la prise de propriété par `travel` sont ajoutés en T114.

## Cas de test (à écrire AVANT le code)
| séquence | diagnostics |
|---|---|
| `animate a {x:100} d4` ; `stop a ["x"]` à start 1 | aucun |
| `animate a {x:100} d1` ; `stop a ["x"]` à start 2 (déjà fini) | `E_STOP_NOTHING` |
| `stop a ["x"]` sans rien | `E_STOP_NOTHING` |
| `bind a {x:"b.x"}` ; `stop a ["x"]` | `E_STOP_ON_BIND` |
| `bind a {x:"b.x"}` ; `unbind a ["x"]` | aucun |
| `animate a {x:100} d4` ; `unbind a ["x"]` à start 1 | `E_UNBIND_ON_ANIMATE` |
| `unbind a` sans rien | `E_UNBIND_NOTHING` |
| `animate a {pos:"b.center"} d4` ; `stop a ["x"]` | aucun (le nom `x` possède la clé `x` ; `pos` lui est équivalent) |
| `animate a {x:100} d4` ; `set a {x:0}` à 1 ; `stop a ["x"]` à 2 | `E_STOP_NOTHING` (le `set` a pris la clé) |
| `animate a {x:100} d4` ; `animate a {x:0} d4` start 1 ; `stop a ["x"]` start 2 | aucun (2ᵉ animate propriétaire) |
| `animate a {reveal:true}` (0.5 s) ; `stop a ["reveal"]` à start 0.2 | aucun |
| `bind a {x:"b.x"}` ; `stop a` (sans liste) | `E_STOP_ON_BIND` |
| `animate a {x:100} d4` ; `stop a` (sans liste) | aucun |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/analyze/activity.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): static activity analysis (T070)`

## Suivante
`T071-engine-compile-program`
