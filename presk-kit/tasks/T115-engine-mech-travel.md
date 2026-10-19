# T115-engine-mech-travel
**Phase** P6 · **Dépend de** : T114-engine-travel-resolver, T079-engine-simulation · **Réf spec** : §8

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-013-paths-and-travel.md`
- `architecture/contracts/C-engine-runtime.md`
- `architecture/decisions/ADR-011-mechanisms-ownership-and-conflicts.md`

## Objectif
Implémenter `TravelMechanism` et l'activer dans `Simulation`.

## Fichiers
- créer : `core/src/engine/sim/mechanisms/travel.ts`
- créer : `core/src/engine/sim/mechanisms/travel.test.ts`
- modifier : `core/src/engine/sim/simulation.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T115.1 Écris les tests (cas ci-dessous).
T115.2 `TravelMechanism(action: TravelAction)` : `kind "travel"`, `end = action.end`. `activate` : clés `["x","y"]` + `"rotation"` si `orient` ; `claim(target, clés, this)`.
T115.3 `evaluate(ctx, now)` : `p = passProgress(now − start, {…}).p` ; `t = fromT + (toT − fromT) × p` ; `pathObj = world.require(along.object)` ; `flat = def.paths[along.path].build(pathObj)` ; `W = pathObj.worldMatrix()` ; `worldPt = applyMat(W, flat.pointAt(t))`. **Si `orient`** : `angle = flat.angleAt(t) + matRotationDeg(W) + orient.offset` ; `rot = angle − matRotationDeg(target.parentMatrix())` ; `writeSpecValue(target, def.props.rotation, rot, this.keys)`. **Puis** position : si `anchor === "pos"` : `v = applyMat(invertMat(target.parentMatrix()), worldPt)` et `writeSpecValue(target, def.props.pos, v, this.keys)` ; sinon `writeSpecValue(target, def.props[anchor], worldPt, this.keys)` (les ancres reçoivent un point monde).
T115.4 `finalize(ctx)` : même écriture avec le `p` final (`passProgress(Infinity,…)`).
T115.5 Dans `Simulation.activate` : `travel` → `new TravelMechanism(a)` (remplace l'erreur « not implemented »).

## Cas de test (à écrire AVANT le code)
Cercle `orbit` (x 200, y 200, radius 100) ; cercle `p` (radius 10) ; `travel p along orbit duration 4 ease linear`, évalué par `Simulation` via `compileProgram` :
| t | `p.pos` |
|---|---|
| 0 | (300,200) |
| 1 | (200,300) |
| 2 | (100,200) |
| 3 | (200,100) |
| 4 | (300,200) |
Rectangle `track` (0,0,100,100), cercle `dot`, `travel … duration 4 linear` :
| 1 ; 2 ; 3 | (100,0) ; (100,100) ; (0,100) |
| `repeat 2`, t = 5 | (100,0) |
| `repeat 2 yoyo`, t = 5 ; t = 8 | (0,100) (passage retour : `u=0.25`, `p=0.75`) ; (0,0) (fini, nombre pair → départ) |
| `orient:true` à t = 1.5 (rectangle `arrow` w20 h10, `anchor:"center"`) | `rotation` = 90 |
| `orient:{offset:90}` à t = 1.5 | `rotation` = 180 |
| `animate dot {x:500} duration 0.1` à start 1 pendant le travel | `x` gelé à 500 ; `y` continue de suivre le chemin |
| `stop dot ["pos"]` à start 1 | `dot.pos` reste (100,0) jusqu'à la fin |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/mechanisms/travel.test.ts src/engine/sim/simulation.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): travel mechanism (T115)`

## Suivante
`T116-engine-golden-travel`
