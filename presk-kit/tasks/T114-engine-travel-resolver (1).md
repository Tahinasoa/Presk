# T114-engine-travel-resolver
**Phase** P6 · **Dépend de** : T113-engine-compile-travel, T068-engine-plan-timeline, T070-engine-analyze-activity, T072-engine-sim-build-world · **Réf spec** : §8.4, §9

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-013-paths-and-travel.md (dont l'addendum)`
- `architecture/contracts/C-engine-compile.md (PlanHooks)`
- `architecture/decisions/ADR-011-mechanisms-ownership-and-conflicts.md`
- `architecture/contracts/C-lang-diagnostics.md`

## Objectif
Fournir le résolveur de `travel` au planificateur, brancher la compilation, et étendre l'analyse d'activité.

## Fichiers
- créer : `core/src/engine/analyze/travelPlan.ts`
- créer : `core/src/engine/analyze/travelPlan.test.ts`
- modifier : `core/src/engine/compileProgram.ts`
- modifier : `core/src/engine/analyze/activity.ts`
- modifier : `core/src/engine/analyze/activity.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T114.1 Écris les tests (cas ci-dessous) en passant par `tryCompileProgram`.
T114.2 `travelPlan.ts` : `createTravelHooks(probe: World, catalog: Catalog, d: DiagnosticCollector): PlanHooks`. **Sonde** : monde post-`create` construit par `compileProgram` avec `buildWorld({scene,init,actions:[],duration:0,warnings:[]}, env)` (voir étape suivante).
T114.3 `resolveTravel(draft, start)` : `obj = probe.require(along.object)` ; `pathSpec = def.paths[along.path]` ; `closed = pathSpec.isClosed(obj)`. `fromT` : nombre → lui-même ; `"current"` → `tracker.lastParam(target, along, start)` (null → `E_TRAVEL_FROM_CURRENT`, renvoie `null`). `toT = toSpec ?? (closed ? fromT + 1 : 1)`. Chemin ouvert : `fromT`,`toT` hors [0,1] (tolérance 1e-9) → `E_TRAVEL_RANGE` ; `from:"current"` avec `fromT > toT` → `E_TRAVEL_RANGE`.
T114.4 Durée : `explicitDuration`, sinon `speed` : `length = pathSpec.build(obj).length × matScale(obj.worldMatrix()) × |toT − fromT|` ; `duration = length / speed` ; `duration <= 0` → `E_TRAVEL_DURATION`.
T114.5 `tracker` : liste ordonnée `records` de travels `{target, along, fromT, toT, start, end, duration, ease, repeat, repeatMode, stoppedAt?}` alimentée par `onPlanned(a)` (pour `a.action === "travel"`). Pour `a.action === "stop"` avec `keys === null` ou contenant `"pos"`, `"x"` ou `"y"` : marque `stoppedAt = a.start` sur le dernier record de la même cible **s'il n'est pas déjà fini à cet instant**.
T114.6 `lastParam(target, along, start)` : dernier record (ordre des steps) de même `target` et même `along` ; aucun → `null`. `tEval = min(start, stoppedAt ?? Infinity, record.end)` ; `p = passProgress(tEval − record.start, {duration, repeat, mode, ease: easings[ease]}).p` ; renvoie `fromT + (toT − fromT) × p`.
T114.7 Dans `compileProgram.ts` : après `compileCreates`, construis la sonde et passe `createTravelHooks(...)` à `planTimeline`. Dans `analyzeActivity` : une action `travel` pose un propriétaire `travel` sur `x`,`y` (+ `rotation` si `orient`), `end = action.end` ; `stop` : si un `travel` détient `x`,`y` et que les clés nommées ne couvrent pas **à la fois** `x` et `y` → `E_STOP_PARTIAL_TRAVEL`.
T114.8 Dans `planTimeline` (T068) : remplace l'erreur interne « resolveTravel missing » : si le brouillon est un travel et que `hooks.resolveTravel` existe, l'appelle ; `null` → saute l'action ; sinon écrit `fromT`,`toT`,`duration` dans l'action planifiée.

## Cas de test (à écrire AVANT le code)
Monde : rect `track` (0,0,100,100) (périmètre 400) ; cercle `dot`.
| steps (après les creates) | attendu |
|---|---|
| `travel dot along track speed 100` | action : `duration` 4, `end` 4 |
| `track` avec `scale 2` ; même travel | `duration` 8 |
| `travel dot along track from:"current" duration 1` (aucun travel avant) | `E_TRAVEL_FROM_CURRENT` |
| T1 (d4) ; `stop dot ["pos"]` start 1 ; T2 `from:"current" to:1 duration 3 start 2` | T2 : `fromT` 0.25, `toT` 1 |
| T1 `from 0 to 0.5 duration 2` (fini) ; T2 `from:"current" duration 1` start 2 | T2 : `fromT` 0.5, `toT` 1.5 (fermé : `from+1`) |
| T1 (d4) ; T2 `from:"current" duration 1` à start 1 (T1 en cours) | T2 : `fromT` 0.25 |
| `to` omis sur chemin fermé, `from:0.3` | `toT` 1.3 |
| T1 (d4, orient) ; `stop dot ["x"]` à **start 1** | `E_STOP_PARTIAL_TRAVEL` |
| T1 (d4) ; `stop dot ["pos"]` à **start 1** | aucun |
| T1 (d4) ; `animate dot {x:0} duration 1` à **start 1** | aucun (prend la clé `x`) |
| T1 `speed 0` | refusé par la validation (`E_TRAVEL_DURATION`) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/analyze/travelPlan.test.ts src/engine/analyze/activity.test.ts src/engine/plan/timeline.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): travel resolver and activity (T114)`

## Suivante
`T115-engine-mech-travel`
