# T048-model-scene-root
**Phase** P3 · **Dépend de** : T045-model-rectangle-object · **Réf spec** : §3.3, §3.5

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/classes/scene.md`
- `architecture/contracts/C-model-core.md`

## Objectif
Créer l'objet racine `scene` : rectangle de la taille de la scène, entièrement en lecture seule (la vue viendra en P8).

## Fichiers
- créer : `core/src/model/classes/sceneRoot.ts`
- créer : `core/src/model/classes/sceneRoot.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T048.1 Écris les tests (cas ci-dessous).
T048.2 Dans `sceneRoot.ts` : fonction utilitaire exportée `makeReadOnly(props: Record<string,PropSpec>): Record<string,PropSpec>` (chaque spec devient `{...spec, mode:"ro", writes:[], animatable:false, set: undefined}`).
T048.3 `SCENE_DEF: ClassDef` : `type:"scene"`, `family:"rectangle"`, `creatable:false`, `props = makeReadOnly({...baseProps({pivotValues: ANCHOR_NAMES}), ...rectangleSizeProps(), ...rectangleAnchorProps()})`, `effects:{reveal: REVEAL_FADE}`, `paths:{main: RECT_PATH}`, `create` : lève (« scene is created by createSceneRoot »).
T048.4 `createSceneRoot(width, height, env): RectangleObject` : `new RectangleObject("scene", SCENE_DEF, env, {width, height, presence: 1})`.

## Cas de test (à écrire AVANT le code)
`createSceneRoot(1920,1080,env)` :
| situation | attendu |
|---|---|
| `id` ; `readProp("width")` | `"scene"` ; 1920 |
| ancre `center` ; `bottomRight` | (960,540) ; (1920,1080) |
| `readRef(root,[{name:"center"},{name:"x"}])` | 960 |
| `writeProp("x",1)` / `writeProp("width",1)` | lèvent |
| `SCENE_DEF.creatable` | false ; `SCENE_DEF.create("a",env)` lève |
| `effectiveAlpha()` | 1 |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/sceneRoot.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): scene root object (T048)`

## Suivante
`T049-model-catalog`
