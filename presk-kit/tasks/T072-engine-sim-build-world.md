# T072-engine-sim-build-world
**Phase** P4 · **Dépend de** : T071-engine-compile-program · **Réf spec** : §4.1

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-runtime.md`
- `architecture/decisions/ADR-012-effects-reveal-presence.md`
- `architecture/contracts/C-model-core.md`

## Objectif
`buildWorld` : instancier les objets de `program.init`, appliquer les propriétés dans l'ordre, capturer l'état initial.

## Fichiers
- créer : `core/src/engine/sim/buildWorld.ts`
- créer : `core/src/engine/sim/buildWorld.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T072.1 Écris les tests (cas ci-dessous).
T072.2 `buildWorld(program: Program, env: { catalog: Catalog; objectEnv: ObjectEnv }): World` : `root = createSceneRoot(program.scene.width, program.scene.height, objectEnv)` ; `world = new World(root)`.
T072.3 Pour chaque `InitStep` : `def = catalog.get(type)!` ; `obj = def.create(id, objectEnv)` ; applique d'abord les entrées dont `spec.order === 0` (props) ; puis `def.afterGeometry?.(obj)` ; puis les entrées de props d'ordre ≥ 1 ; puis les effets. Pour une prop : `value = entry.value(world)` ; `entry.spec.set!(obj, value)`. Pour un effet : `entry.def.apply(obj, entry.variant, entry.on ? 1 : 0)`. Enfin `world.add(obj)`.
T072.4 À la fin : `world.captureInitial()` ; renvoie `world`.

## Cas de test (à écrire AVANT le code)
(les documents passent par `compileProgram` avec `createTestEnv()` ; text `fontSize 10`)
| document | état attendu |
|---|---|
| rect `a` `{x:10,y:20,width:50}` | `readProp("x")` 10 ; `width` 50 ; `presence` 0 |
| rect `a` avec `reveal:true` | `presence` 1 |
| text `t` `{text:"Hello",fontSize:10,x:100,y:100}` puis rect `r` `{topLeft:"t.bottomLeft"}` | `r` : x 100, y 112 |
| `create` sans `reveal` : `effectiveAlpha()` | 0 |
| classe de test avec `afterGeometry` qui note l'ordre d'appel dans un tableau : props d'ordre 0, hook, puis props d'ordre ≥ 1 | ordre vérifié |
| `world.reset()` après modification | état initial restauré |
| `world.get("scene")` | racine 800×600 (selon `program.scene`) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/buildWorld.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): buildWorld (T072)`

## Suivante
`T073-engine-sim-ticks`
