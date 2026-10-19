# T134-engine-sim-group-actions
**Phase** P7 · **Dépend de** : T131-engine-compile-group, T132-engine-group-reparent, T133-engine-group-layout, T079-engine-simulation · **Réf spec** : §10

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-015-groups-hierarchy-layout.md`
- `architecture/contracts/C-engine-runtime.md`
- `architecture/decisions/ADR-011-mechanisms-ownership-and-conflicts.md`

## Objectif
Exécuter `group`/`ungroup` dans la simulation, avec transition de layout optionnelle.

## Fichiers
- créer : `core/src/engine/sim/groupActions.ts`
- créer : `core/src/engine/sim/mechanisms/layoutTransition.ts`
- créer : `core/src/engine/sim/groupActions.test.ts`
- modifier : `core/src/engine/sim/simulation.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T134.1 Écris les tests (cas ci-dessous).
T134.2 `activateGroup(ctx, a: GroupAction, catalog)` : `g = world.require(target) as GroupObject` ; (1) applique `a.props` (entrées de `set` : `layout`,`gap`,`margin`) ; (2) pour chaque id de `a.children` dans l'ordre : `reparentPreserving(enfant, g)` ; (3) `from` = positions locales `{x,y}` de tous les enfants bornés **après** reparentage ; (4) `to = computeLayout(g)` ; (5) si `a.duration === 0` (ou layout `none`) : écrit `to` dans l'état des enfants ; sinon crée un `LayoutTransitionMechanism(a, from, to)` qui interpole `x`,`y` de chaque enfant (`lerp`, easing `a.ease`, progression `passProgress(now − start, {duration, repeat:1, mode:"restart", ease})`), `claim(target, ["@layout"], this)`, `end = a.end`.
T134.3 `activateUngroup(ctx, a: UngroupAction)` : `children = a.children ?? ids actuels de g.children()` ; `detachPreserving` de chacun.
T134.4 `Simulation.activate` : `group` → `activateGroup` (+ ajoute le mécanisme éventuel à `mechanisms`/`mechByAction`) ; `ungroup` → `activateUngroup`. Plus aucune erreur « not implemented ».

## Cas de test (à écrire AVANT le code)
Monde : rectangles `a` (0,0,100×50), `b` (500,300,60×40), groupe implicite `menu` à (0,0) :
| steps | instant | attendu |
|---|---|---|
| `group menu {children:["a","b"]}` | 0 | `a.parent` = menu ; topLeft de `a` et `b` (monde) inchangés |
| `group menu {children:["a","b"],layout:"vertical",gap:10}` | 0 | `a.topLeft` (0,0) ; `b.topLeft` (0,60) |
| idem avec `duration 1 ease linear` | 0 ; 0.5 ; 1 | `b.topLeft.y` : 300 ; 180 ; 60 |
| layout + `margin 5` | 0 | `a.topLeft` (5,5) ; `menu` ancre `topLeft` = (0,0) |
| `menu.x = 100` avant le group, `layout vertical` | 0 | `a.topLeft` = (100,0) |
| `ungroup menu` à start 2 | 2 | `a.parent` null ; `a.topLeft` inchangé |
| `ungroup menu {children:["a"]}` | 2 | `b.parent` toujours `menu` |
| `group` à `start:1`, `ungroup` à `start:2` ; `seek(2)` puis `seek(0)` | 0 | hiérarchie initiale restaurée (`a.parent` null) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/groupActions.test.ts src/engine/sim/simulation.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): group and ungroup activation (T134)`

## Suivante
`T135-engine-golden-groups`
