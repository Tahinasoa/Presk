# T067-engine-compile-steps
**Phase** P4 · **Dépend de** : T065-engine-compile-create, T013-lang-start-parse, T066-engine-pass-progress · **Réf spec** : §2.2, §5.4, §9

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-compile.md (Brouillons d'actions, ease par défaut)`
- `architecture/decisions/ADR-011-mechanisms-ownership-and-conflicts.md`
- `architecture/contracts/C-lang-diagnostics.md`

## Objectif
Transformer les étapes non-`create` en `DraftAction[]` (sans temps absolus).

## Fichiers
- créer : `core/src/engine/compile/steps.ts`
- créer : `core/src/engine/compile/steps.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T067.1 Écris les tests (cas ci-dessous).
T067.2 Signature : `compileSteps(steps: readonly Step[], types: ReadonlyMap<string,string>, catalog: Catalog, d: DiagnosticCollector): DraftAction[]`. Parcours dans l'ordre ; `index` = index dans `steps` ; ignore les `create`. `scope = createScope(catalog, types)`.
T067.3 Cible : `types.get(target)` (ou `"scene"`) ; absente → `E_OBJECT_UNKNOWN`, on passe à l'étape suivante. `def = catalog.get(type)`.
T067.4 `startSpec = parseStart(step.start) ?? DEFAULT_START` (la validité a déjà été vérifiée par `validateDocument`).
T067.5 `set` → entries = `compileProperties(props,"set",…)`. `animate` → entries (mode animate) ; `hasInterp = entries.some(e=>e.kind==="prop")` ; si `hasInterp` et `duration` absent → `E_DURATION_MISSING` ; si aucune propriété interpolée : `effectDefaultDuration = max(def.defaultDuration des effets)`. `ease` : `step.ease` sinon `"linear"` sinon (animate d'effets seulement) `defaultEase` du premier effet. `repeat` défaut 1, `repeatMode` défaut `"restart"`.
T067.6 `bind` → entries (mode bind, ne contient que des `CompiledProp`). `unbind`/`stop` → `keys = step.properties ?? null` ; chaque nom doit exister dans `def.props` ou `def.effects` sinon `E_PROPERTY_UNKNOWN`.
T067.7 `travel`, `group`, `ungroup` → `d.error("E_ACTION_UNKNOWN", "action not implemented yet", ...)` (remplacé par T113 et T131).
T067.8 `name` recopié tel quel. Une étape dont la compilation produit une erreur n'ajoute pas de brouillon.

## Cas de test (à écrire AVANT le code)
| étape | résultat |
|---|---|
| `animate a {x:100} duration 1` | draft animate, `ease:"linear"`, `repeat:1`, `repeatMode:"restart"`, `explicitDuration:1` |
| `animate a {x:100}` (sans duration) | `E_DURATION_MISSING` |
| `animate a {reveal:true}` | ok ; `effectDefaultDuration` 0.5 ; `ease:"cubicOut"` |
| `animate a {x:100,reveal:true} duration 2` | ok ; `ease:"linear"` |
| `set zzz {x:1}` | `E_OBJECT_UNKNOWN` |
| `bind a {x:"b.x"}` | draft bind avec 1 entrée |
| `stop a properties:["x"]` | draft stop `keys:["x"]` ; sans `properties` → `keys:null` |
| `stop a properties:["nope"]` | `E_PROPERTY_UNKNOWN` |
| `start:"<2"` | `startSpec = {kind:"prevStart",offset:2}` ; sans start → `DEFAULT_START` |
| `travel …` | `E_ACTION_UNKNOWN` (temporaire) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/compile/steps.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): steps compilation (T067)`

## Suivante
`T068-engine-plan-timeline`
