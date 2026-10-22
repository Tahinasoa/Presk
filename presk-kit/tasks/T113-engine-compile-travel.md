# T113-engine-compile-travel
**Phase** P6 · **Dépend de** : T112-engine-expr-pathfn, T067-engine-compile-steps · **Réf spec** : §8

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-013-paths-and-travel.md`
- `architecture/contracts/C-engine-compile.md (Travel : valeurs provisoires)`
- `architecture/contracts/C-lang-diagnostics.md`

## Objectif
Compiler `travel` en brouillon : chemin, ancre, orientation, validations statiques.

## Fichiers
- modifier : `core/src/engine/program.ts`
- modifier : `core/src/engine/compile/steps.ts`
- modifier : `core/src/engine/compile/steps.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T113.1 Ajoute à `program.ts` : `export type TravelDraft = DraftOf<TravelAction> & { startSpec: StartSpec; explicitDuration?: number; speed?: number; fromSpec: number | "current"; toSpec?: number }` et inclus-le dans `DraftAction` (si ce n'est pas déjà le cas via `DraftOf<PlannedAction>`).
T113.2 Dans `compileSteps`, remplace l'erreur « not implemented » pour `travel` : `along` : sépare au premier `.` (`"obj"` → chemin `main`, `"obj.nom"` → chemin `nom`) ; objet inconnu ou chemin absent de `def.paths` → `E_TRAVEL_ALONG` ; si `def.family === "unbounded"` → `E_TRAVEL_INFINITE_PATH` (testé **avant** le chemin).
T113.3 `anchor` (défaut `"pos"`) : valide si `"pos"` ou si `targetDef.props[anchor]` existe avec `kind:"point"`, `mode:"rw"` et `writes` égal à `["x","y"]` ; sinon `E_TRAVEL_OPTION`. `orient` : `true` → `{offset:0}` ; `{offset:n}` → tel quel ; `false`/absent → `null`.
T113.4 `fromSpec = step.from ?? 0` ; `toSpec = step.to` ; `speed = step.speed`. Valeurs provisoires `fromT:0, toT:1`. Si `def.paths[path].closed === "never"` : `from` numérique et `to` doivent être dans [0,1] sinon `E_TRAVEL_RANGE`.
T113.5 `ease` défaut `"linear"` ; `repeat` défaut 1 ; `repeatMode` défaut `restart` ; `explicitDuration = step.duration`.

## Cas de test (à écrire AVANT le code)
Monde : cercle `orbit`, cercle `dot`, rectangle `r`, rayon `ray1` (ajouté en T121 : teste ce cas à ce moment-là, ou avec une classe de test `unbounded`).
| étape | résultat |
|---|---|
| `travel dot along:"orbit" duration 4` | brouillon travel : `along={object:"orbit",path:"main"}`, `anchor:"pos"`, `orient:null`, `ease:"linear"`, `repeat:1` |
| `along:"orbit.main"` | idem |
| `along:"zzz"` / `along:"orbit.foo"` | `E_TRAVEL_ALONG` |
| `along` = objet de famille unbounded (classe de test) | `E_TRAVEL_INFINITE_PATH` |
| `anchor:"center"` sur un rectangle ; `anchor:"topLeft"` | ok |
| `anchor:"width"` / `anchor:"bogus"` / `anchor:"center"` sur un cercle (pas d'ancre) | `E_TRAVEL_OPTION` |
| `orient:true` / `{offset:90}` / absent | `{offset:0}` / `{offset:90}` / `null` |
| classe de test avec `paths.main.closed:"never"` : `to:1.5` ; `from:-0.1` | `E_TRAVEL_RANGE` |
| `from:5` sur chemin fermé | ok |
| `speed:100` | `speed` conservé, `explicitDuration` undefined |

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
`feat(engine): travel compilation (T113)`

## Suivante
`T114-engine-travel-resolver`
