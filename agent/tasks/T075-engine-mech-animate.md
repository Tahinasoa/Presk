# T075-engine-mech-animate
**Phase** P4 · **Dépend de** : T074-engine-sim-context-ownership, T066-engine-pass-progress, T033-geom-color · **Réf spec** : §2.2, §6.3, §7.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-runtime.md`
- `architecture/decisions/ADR-010-simulation-ticks-and-evaluation-order.md`
- `architecture/decisions/ADR-011-mechanisms-ownership-and-conflicts.md`

## Objectif
Implémenter `interpolate`, `writeSpecValue` et `AnimateMechanism` (propriétés seulement ; les effets sont en T077).

## Fichiers
- créer : `core/src/engine/sim/interpolate.ts`
- créer : `core/src/engine/sim/write.ts`
- créer : `core/src/engine/sim/mechanisms/animate.ts`
- créer : `core/src/engine/sim/mechanisms/animate.test.ts`
- créer : `core/src/engine/sim/interpolate.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T075.1 Écris les tests (cas ci-dessous).
T075.2 `interpolate.ts` : `interpolate(kind: PropKind, from: StateValue, to: StateValue, p: number): StateValue` : `number` → `lerp` ; `point` → `lerpPt` ; `color` → `lerpColor` ; autre kind → `Error` interne. `p` peut dépasser [0,1] (easings élastiques) : pas de clamp (sauf couleurs, gérées par `lerpColor`).
T075.3 `write.ts` : `writeSpecValue(obj: SceneObject, spec: PropSpec, value: StateValue, ownedKeys: ReadonlySet<string>): void`. Si toutes les `spec.writes` ∈ `ownedKeys` : `spec.set!(obj, value)`. Sinon (clés partiellement perdues) : mémorise `obj.getState(k)` pour chaque clé perdue, appelle `spec.set`, puis réécrit les clés perdues avec les valeurs mémorisées. Si **aucune** clé n'est possédée : ne fait rien.
T075.4 `AnimateMechanism` (implémente `Mechanism`) : constructeur `(action: AnimateAction)` ; `kind "animate"`, `targetId = action.target`, `end = action.end`. `activate(ctx, now)` : `obj = ctx.world.require(target)` ; pour chaque entrée **prop** : `to = entry.value(ctx.world)` (cible **figée**) ; `from = entry.spec.get(obj)` ; mémorise. Clés = union des `spec.writes` ; `ctx.ownership.claim(target, clés, this)` ; `active = true`.
T075.5 `evaluate(ctx, now)` : `p = passProgress(now − action.start, {duration, repeat, mode:repeatMode, ease: easings[action.ease]}).p` ; pour chaque entrée : `writeSpecValue(obj, spec, interpolate(spec.kind, from, to, p), this.keys)`.
T075.6 `finalize(ctx)` : `p = passProgress(Infinity, …).p` pour un `repeat` fini ; même écriture. (Jamais appelé pour un infini.)

## Cas de test (à écrire AVANT le code)
`interpolate` : `(number,0,10,0.5)` → 5 ; `(point,{0,0},{10,20},0.5)` → `{5,10}` ; `(color,0x000000,0xffffff,0.5)` → `0x808080` ; `(number,0,10,1.5)` → 15 ; `(string,…)` lève.
`writeSpecValue` (rectangle) : propriété `pos` avec `ownedKeys={x,y}` → écrit x,y ; avec `ownedKeys={y}` seulement → `x` garde son ancienne valeur, `y` change ; avec `ownedKeys={}` → rien.
`AnimateMechanism` (monde à la main : `buildWorld` d'un doc avec `a` x 0, et une `AnimateAction` fabriquée : start 0, end 2, duration 2, entrée `x` → 100, ease linear) :
| appel | attendu |
|---|---|
| `activate` puis `evaluate(ctx,1)` | `a.x` = 50 |
| `evaluate(ctx,2)` ; `finalize` | `a.x` = 100 |
| cible figée : modifier `b.x` après `activate` (cible = expression `"b.x"`) | `a.x` ne change pas de cible |
| `from` capturé à l'activation (a.x = 10 avant) | `evaluate(ctx,1)` = 55 |
| un second mécanisme prend la clé `x` | le 1er : `keys` vide, `active` false ; `evaluate` n'écrit plus |
| `repeat 2 yoyo`, `finalize` | retourne à `from` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/interpolate.test.ts src/engine/sim/mechanisms/animate.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): animate mechanism (T075)`

## Suivante
`T076-engine-mech-bind`
