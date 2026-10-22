# T079-engine-simulation
**Phase** P4 · **Dépend de** : T072-engine-sim-build-world, T073-engine-sim-ticks, T075-engine-mech-animate, T076-engine-mech-bind, T077-engine-mech-effect, T078-engine-sim-instant-actions · **Réf spec** : §6.5, §6.6, §7.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-runtime.md`
- `architecture/decisions/ADR-010-simulation-ticks-and-evaluation-order.md`
- `architecture/decisions/ADR-011-mechanisms-ownership-and-conflicts.md`

## Objectif
Implémenter `Simulation` : phases F et U, activation par type d'action, `seek`, `reset`.

## Fichiers
- créer : `core/src/engine/sim/simulation.ts`
- créer : `core/src/engine/sim/simulation.test.ts`
- modifier : `core/src/engine/index.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T079.1 Écris les tests (cas ci-dessous) avec `compileProgram` + `Simulation`.
T079.2 Constructeur `(program, env: SimEnv)` : `world = buildWorld(program, env)` ; `fps = env.fps ?? 60` ; `ownership = new Ownership()` ; `mechanisms: Mechanism[] = []` ; `started: boolean[]` ; `mechByAction: Map<number, Mechanism[]>` ; `time = -1`.
T079.3 `reset()` : `world.reset()` ; vide `mechanisms`, `mechByAction`, `started`, `ownership.clear()` ; `time = -1`.
T079.4 `seek(t)` : `t = clamp(t, 0, duration)` ; si `t < time − 1e-9` → `reset()` ; `ticks = tickTimes(program, fps, time, t)` ; si le dernier tick (ou `time`) est `< t − 1e-9` → ajoute `t` ; pour chaque `τ` : `runTick(τ)` ; `time = dernier τ`.
T079.5 `runTick(τ)` : **Phase F** : pour `m` dans `mechanisms` (ordre de création) : si `m.active && m.end <= τ + 1e-9` → `m.finalize(ctx)` ; `m.active = false` ; `ownership.release(m)`. **Phase U** : pour `a` dans `program.actions` (ordre de déclaration) : si `!started[a.index] && a.start <= τ + 1e-9` → `activate(a, τ)` ; `started[a.index] = true`. Puis pour chaque mécanisme de `mechByAction.get(a.index)` encore `active` : `evaluate(ctx, τ)`. **Fin** : si `τ >= duration − 1e-9` → pour chaque mécanisme actif : `active = false`.
T079.6 `activate(a, τ)` : `set` → `activateSet` ; `stop` → `activateStop` ; `unbind` → `activateUnbind` ; `animate` → crée `AnimateMechanism` si l'action a des props, `EffectMechanism` si elle a des effets ; `bind` → `BindMechanism` ; chaque mécanisme : `activate(ctx, τ)` puis rangé dans `mechanisms` et `mechByAction`. `travel`/`group`/`ungroup` → `Error` interne (« not implemented », ajoutés en P6/P7).
T079.7 Dans la phase U, un mécanisme **activé pendant ce même tick** est évalué tout de suite après son activation (c'est la boucle ci-dessus). Un mécanisme qui devient inactif en cours de route (perte de toutes ses clés) n'est plus évalué.
T079.8 Exporte `Simulation` et `SimEnv` depuis `engine/index.ts`.

## Cas de test (à écrire AVANT le code)
(rect `a` x 0 sauf mention ; `fps` 60 ; `seek` renvoie rien, on lit `sim.world.require("a").readProp("x")`)
| document | appels | attendu |
|---|---|---|
| `animate a {x:100} duration 2 ease linear` | `seek(1)` ; `seek(2)` ; `seek(5)` | 50 ; 100 ; 100 (clamp à la durée) |
| idem | `seek(1)` puis `seek(0.25)` | 50 puis 12.5 (rejeu depuis 0) |
| idem | `seek(0)` | 0 |
| 2 animate à la suite (x→100 d1 ; y→50 d1) | `seek(0.5)` ; `seek(1.5)` | x 50, y 0 ; x 100, y 25 |
| `sim.duration` pour le doc ci-dessus | 2 |
| `seek(0.5)` deux fois de suite | résultat identique (idempotent) |
| `sim.time` après `seek(0.5)` | 0.5 |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/simulation.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): Simulation (T079)`

## Suivante
`T080-engine-golden-core`
