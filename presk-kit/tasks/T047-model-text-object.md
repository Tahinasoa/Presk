# T047-model-text-object
**Phase** P3 · **Dépend de** : T045-model-rectangle-object · **Réf spec** : §11.2, §4.1

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/classes/text.md`
- `architecture/decisions/ADR-014-ports-text-measurer-and-images.md`
- `architecture/contracts/C-model-core.md`

## Objectif
Implémenter la classe `text` avec dimensions mesurées par le `TextMeasurer` injecté.

## Fichiers
- créer : `core/src/model/classes/textObject.ts`
- créer : `core/src/model/classes/textObject.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T047.1 Écris les tests (cas ci-dessous).
T047.2 `class TextObject extends RectangleObject` : état initial supplémentaire `text:"", color:0xffffff, fontSize:32, fontFamily:"sans-serif", fontWeight:"bold"`. Méthode `remeasure()` : appelle `this.env.measurer.measure(text,{fontSize,fontFamily,fontWeight})` et écrit `width`,`height` dans l'état. Appelée par le constructeur.
T047.3 `TEXT_DEF` : `props = {...baseProps({pivotValues: ANCHOR_NAMES}), ...rectangleAnchorProps(), ...textProps}` où `width`/`height` sont **ro** (`mode:"ro", writes:[], animatable:false`, pas de `set`), pas de `fill/stroke/strokeWidth`. `text`(string, rw, non animable), `color`(color, rw, animable), `fontSize`(number, rw, animable, `min:0, minExclusive:true`), `fontFamily`(string), `fontWeight`(enum `normal|bold`). Les `set` de `text`, `fontSize`, `fontFamily`, `fontWeight` appellent `remeasure()` après écriture. Tous `order:0`.
T047.4 `effects:{reveal: REVEAL_FADE}`, `paths:{main: RECT_PATH}` (réutilisé), `create:(id,env)=>new TextObject(id, TEXT_DEF, env)`.
T047.5 Attention : `RectangleObject` écrit `fill/stroke/strokeWidth` dans son état par défaut ; c'est sans effet pour `text` (non exposés par `TEXT_DEF.props`).

## Cas de test (à écrire AVANT le code)
Avec `createTestEnv()` (largeur = 0,6 × fontSize × nb caractères ; hauteur = 1,2 × fontSize) :
| situation | attendu |
|---|---|
| `TEXT_DEF.create("t",env)` : `readProp("width")` ; `("height")` | 0 ; 38.4 (texte vide, fontSize 32) |
| `writeProp("text","Hello")` | width 96, height 38.4 |
| puis `writeProp("fontSize",10)` | width 30, height 12 |
| `writeProp("width",5)` / `writeProp("fill",1)` | lèvent (ro / inconnu) |
| `x:10,y:0`, texte `"Hello"` fontSize 10 : ancre `bottomRight` | (40,12) |
| `TEXT_DEF.props.width.mode` | `"ro"` ; `props.text.animatable` faux ; `props.color.animatable` vrai |
| `TEXT_DEF.props.fill` | `undefined` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/textObject.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model): TextObject (T047)`

## Suivante
`T048-model-scene-root`
