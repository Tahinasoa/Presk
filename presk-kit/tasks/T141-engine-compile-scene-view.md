# T141-engine-compile-scene-view
**Phase** P8 · **Dépend de** : T140-model-scene-view-state, T064-engine-compile-properties, T063-engine-compile-value · **Réf spec** : §3.5

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-016-scene-view-viewport.md`
- `architecture/contracts/C-engine-compile.md`
- `architecture/contracts/C-lang-diagnostics.md`
- `language/Presk — Spécification v1.0.md §3.5 (relis-la : c'est la référence)`

## Objectif
Compilateurs dédiés (`CUSTOM_COMPILERS`) et règle `focusMargin`.

## Fichiers
- créer : `core/src/engine/compile/sceneView.ts`
- créer : `core/src/engine/compile/sceneView.test.ts`
- modifier : `core/src/engine/compile/value.ts`
- modifier : `core/src/engine/compile/properties.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T141.1 Écris les tests (cas ci-dessous).
T141.2 `sceneView.ts` : enregistre dans `CUSTOM_COMPILERS` (T063) les clés `scene.zoom`, `scene.view`, `scene.focusOn`. Chaque évaluateur renvoie un `ViewTarget` (calculé **au moment de l'évaluation**, depuis l'état courant de la racine pour les champs omis).
T141.3 `scene.zoom` : valeur = nombre ou expression scalaire ; constante ≤ 0 → `E_VIEW_RANGE` ; évaluation : `{cx: viewCx courant, cy: viewCy courant, zoom}` (ré-évalué si ≤ 0 → `PreskRuntimeError`).
T141.4 `scene.view` : objet `{x?,y?,width?,height?}` (chaque champ nombre ou expression scalaire) ; clé inconnue ou valeur de mauvais type → `E_VALUE_TYPE` ; constante `width/height ≤ 0` → `E_VIEW_RANGE`. Évaluation : région courante (`viewRegion`) dont on remplace les champs fournis ; si **seule** `width` : `height = width × H/W` ; si seule `height` : `width = height × W/H` ; puis `fitRegionToScene`.
T141.5 `scene.focusOn` : chaîne (id) ou tableau non vide de chaînes ; `"scene"` autorisé ; id inconnu → `E_OBJECT_UNKNOWN` ; objet de famille `unbounded` ou `point` → `E_VIEW_FOCUS_UNBOUNDED`. Évaluation : union des `worldBounds()` des objets (la racine : `[0,W]×[0,H]`), **élargie de `margin` de chaque côté**, puis `fitRegionToScene`. `margin` vient du `focusMargin` du même bloc (étape suivante).
T141.6 Dans `compileProperties` (`properties.ts`), cas `def.type === "scene"` : si `focusMargin` est présent sans `focusOn` → `E_VIEW_MARGIN_WITHOUT_FOCUS` ; sinon retire `focusMargin` du bloc (nombre fini requis, sinon `E_VALUE_TYPE`) et fournis-le au compilateur de `focusOn` (paramètre supplémentaire de contexte). `focusMargin` n'est **pas** une entrée compilée. Toute autre clé inconnue de `scene` → `E_SCENE_PROPERTY` (déjà en place).

## Cas de test (à écrire AVANT le code)
Scène 1600×900 ; rectangle `earth` à (700,400) 200×100 :
| propriétés (mode) | évaluation (état courant : vue par défaut) |
|---|---|
| set `{zoom:2}` | `{cx:800,cy:450,zoom:2}` |
| set `{zoom:0}` / `{zoom:-1}` | `E_VIEW_RANGE` |
| set `{view:{x:400,y:200,width:800,height:450}}` | `{cx:800,cy:425,zoom:2}` |
| set `{view:{width:800}}` | hauteur 450 (ratio) ; centre inchangé : `{cx:800,cy:450,zoom:2}` |
| set `{view:{width:0}}` | `E_VIEW_RANGE` ; `{view:{foo:1}}` → `E_VALUE_TYPE` |
| set `{focusOn:"earth"}` | région (700,400,200,100), ratio 2 > 16/9 : la largeur domine → `{cx:800, cy:450, zoom:8}` |
| set `{focusOn:"earth",focusMargin:80}` | région (620,320,360,260), ratio 1,385 < 16/9 : la hauteur domine, largeur portée à 462,22 → `{cx:800, cy:450, zoom:3.4615}` (±1e-3) |
| set `{focusOn:"scene"}` | `{cx:800,cy:450,zoom:1}` |
| set `{focusOn:["earth","scene"]}` | union = scène entière |
| `{focusOn:"zzz"}` | `E_OBJECT_UNKNOWN` |
| `{focusOn:"r"}` avec `r` un `ray` | `E_VIEW_FOCUS_UNBOUNDED` |
| `{focusMargin:10}` seul | `E_VIEW_MARGIN_WITHOUT_FOCUS` |
| `{x:1}` / `{opacity:1}` sur scene | `E_SCENE_PROPERTY` |
| bind `{focusOn:"earth"}` | accepté (kind view, rw) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/compile/sceneView.test.ts src/engine/compile/properties.test.ts src/engine/compile/value.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): scene view compilation (T141)`

## Suivante
`T142-engine-scene-view-runtime`
