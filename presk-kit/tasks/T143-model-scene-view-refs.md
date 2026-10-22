# T143-model-scene-view-refs
**Phase** P8 · **Dépend de** : T142-engine-scene-view-runtime · **Réf spec** : §3.5 règle 5

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-016-scene-view-viewport.md`
- `architecture/contracts/C-model-core.md (refExtension)`
- `language/Presk — Spécification v1.0.md §3.5 (relis-la : c'est la référence)`

## Objectif
Ajouter `refExtension` à `SCENE_DEF` : `scene.view.<ancre>`, `.width`, `.height`.

## Fichiers
- modifier : `core/src/model/classes/sceneRoot.ts`
- modifier : `core/src/model/refs.ts`
- modifier : `core/src/model/refs.test.ts`
- modifier : `core/src/engine/golden/sceneView.golden.test.ts (test d'intégration uniquement : `model/` ne peut pas importer `engine/`)`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T143.1 Dans `refs.ts` : `describeRef` et `readRef` consultent `def.refExtension` **avant** les règles générales : si `describe(path)` renvoie autre chose que `undefined`, ce résultat prévaut (pareil pour `read`).
T143.2 Dans `sceneRoot.ts` : `refExtension.describe(path)` : si `path[0].name !== "view"` → `undefined`. `[view]` seul → `E_EXPR_BOUNDINGBOX_ALONE`. `[view, anchor]` → point ; `[view, anchor, x|y]` → scalar ; `[view, width|height]` → scalar ; autre → `E_EXPR_SEGMENT_UNKNOWN`. `read` : région `viewRegion(o)` → `Bounds` → `anchorOfBounds` / largeur / hauteur.
T143.3 Test d'intégration (dans `engine/golden/sceneView.golden.test.ts`, **jamais** dans `model/`) : ajoute le cas **W9** : steps `create circle d {radius:1}` ; `set scene {zoom:2}` ; `bind d {pos:"scene.view.topRight"} start:"<"` ; scène 1600×900 ; à t = 0 : `d.pos` = **(1200, 225)** (région visible x 400..1200, y 225..675).

## Cas de test (à écrire AVANT le code)
Scène 1600×900, vue `{cx:400,cy:300,zoom:2}` (région x0,y75,w800,h450) :
| chemin | résultat |
|---|---|
| `[view,center]` ; `[view,center,x]` | point (400,300) ; scalar 400 |
| `[view,topLeft]` ; `[view,bottomRight]` | (0,75) ; (800,525) |
| `[view,width]` ; `[view,height]` | 800 ; 450 |
| `[view]` | `E_EXPR_BOUNDINGBOX_ALONE` |
| `[view,left]` | `E_EXPR_SEGMENT_UNKNOWN` |
| `[center]` (scene, hors view) | (800,450) : toujours la scène entière |
| *(test d'intégration `bind`)* | voir l'étape T143.3 : il est écrit dans `engine/golden/sceneView.golden.test.ts`, **pas** dans `refs.test.ts` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/refs.test.ts src/engine/golden/sceneView.golden.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): scene.view references (T143)`

## Suivante
`T144-view-viewport`
