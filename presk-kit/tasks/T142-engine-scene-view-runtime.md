# T142-engine-scene-view-runtime
**Phase** P8 · **Dépend de** : T141-engine-compile-scene-view, T079-engine-simulation · **Réf spec** : §3.5 règles 1, 4

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-016-scene-view-viewport.md`
- `architecture/contracts/C-engine-runtime.md`
- `language/Presk — Spécification v1.0.md §3.5 (relis-la : c'est la référence)`

## Objectif
Faire fonctionner `set`, `animate`, `bind`, `stop`, `unbind` sur `scene`.

## Fichiers
- modifier : `core/src/engine/sim/interpolate.ts`
- modifier : `core/src/engine/sim/interpolate.test.ts`
- créer : `core/src/engine/golden/sceneView.golden.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T142.1 Dans `interpolate` : pour `kind:"view"` : `cx`,`cy` linéaires ; `zoom = z0 × (z1/z0)^p` (si `z0 ≤ 0` ou `z1 ≤ 0` → `Error` interne). Renvoie un `ViewTarget`.
T142.2 Aucune autre modification de mécanisme : `AnimateMechanism` capture `from = spec.get(scene)` et `to = evaluator` figée ; `BindMechanism` réévalue à chaque tick ; `activateSet` écrit via `spec.set` ; les conflits passent par les `writes` (les trois clés).
T142.3 Écris les tests dorés (cas ci-dessous) avec `run(doc,t)`.

## Cas de test (à écrire AVANT le code)
Scène 1600×900, `earth` rectangle (700,400,200,100) :
| # | steps | instant | attendu (`viewCx, viewCy, viewZoom` de la racine) |
|---|---|---|---|
| W1 | `set scene {zoom:2}` | 0 | (800,450,2) |
| W2 | `animate scene {zoom:4} duration 2 linear` | 1 | zoom = 2 (géométrique : 1×4^0.5), centre (800,450) |
| W3 | `animate scene {view:{x:0,y:0,width:800,height:450}} duration 1 linear` | 1 | (400,225,2) |
| W4 | `animate scene {focusOn:"earth"} duration 1 linear` puis `animate earth {x:0} duration 1` (start "<") | 1 | la cible est **figée au démarrage** : zoom final 8 sur l'ancienne position (cx 800) |
| W5 | `animate earth {x:0} duration 2 linear` ; `bind scene {focusOn:"earth"} start:"<"` (le bind est déclaré **après** l'animate : ordre d'évaluation) | 2 | la vue suit : `viewCx` = 100, `viewCy` = 450, `viewZoom` = 8 |
| W6 | `animate scene {zoom:4} duration 4 linear` ; `stop scene ["zoom"] start 1` | 1 ; 4 | zoom figé à 4^(0.25) ≈ 1.4142 |
| W7 | `animate scene {zoom:2} duration 1` ; `set scene {focusOn:"scene"} start 0.5` | 0.5 ; 1 | `focusOn` prend la main (mêmes clés) : (800,450,1) aux deux instants |
| W8 | `set scene {zoom:2}` | compilation | ok ; `create scene …` → `E_OBJECT_RESERVED` ; `travel scene …` → `E_SCENE_ACTION` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/sim/interpolate.test.ts src/engine/golden/sceneView.golden.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): scene view runtime (T142)`

## Suivante
`T143-model-scene-view-refs`
