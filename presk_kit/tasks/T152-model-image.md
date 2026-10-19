# T152-model-image
**Phase** P9 · **Dépend de** : T151-model-curve, T095-app-presk-facade · **Réf spec** : §11.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/classes/image.md`
- `architecture/decisions/ADR-014-ports-text-measurer-and-images.md`
- `architecture/contracts/C-model-core.md`

## Objectif
Implémenter `image` (dimensions via `ImageInfoProvider`) et son préchargement dans la façade.

## Fichiers
- créer : `core/src/model/classes/imageObject.ts`
- créer : `core/src/model/classes/imageObject.test.ts`
- créer : `core/src/view/imageView.ts`
- créer : `core/src/view/pixiImageInfo.ts`
- modifier : `core/src/model/defaultCatalog.ts`
- modifier : `core/src/model/catalog.test.ts`
- modifier : `core/src/view/index.ts`
- modifier : `core/src/app/presk.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T152.1 Écris les tests (cas ci-dessous) pour `ImageObject` (modèle uniquement).
T152.2 `ImageObject extends RectangleObject` ; `IMAGE_DEF` : props `url` (string, `required:true`, mode `init`, order 0), `width`, `height` (number, rw, animables, order 0, **non obligatoires**) + 9 ancres. Calcul des dimensions fait dans `afterGeometry` : `size = env.images.sizeOf(url)` ; absent → `PreskRuntimeError("image size unknown: <url>")` ; `width` et `height` non fournis par le document → taille naturelle ; un seul fourni → l'autre conserve le ratio. (Pour savoir ce qui a été fourni : `ImageObject` mémorise dans son état `hasW`/`hasH` (booléens) mis à vrai par les `set` de `width`/`height` pendant `create`.)
T152.3 `pixiImageInfo.ts` : `class PixiImageInfo implements ImageInfoProvider` avec `preload(urls: string[]): Promise<void>` (`Assets.load(url)` puis mémorise `{width, height}` de la texture) et `sizeOf(url)`.
T152.4 `imageView.ts` : `Sprite` créé depuis `Texture.from(url)`, dimensions `width`/`height` de l'état ; enregistre `image` dans le registre de vues.
T152.5 `Presk.load` : avant `compileProgram`, collecte les `url` de tous les `create` de type `image` (lecture directe du JSON brut, sans validation : seulement les chaînes) et appelle `pixiImageInfo.preload`. Le `objectEnv.images` de `Presk` est ce `PixiImageInfo`.

## Cas de test (à écrire AVANT le code)
(modèle, avec `FakeImageInfo({"a.png":{width:400,height:200}})`)
| création | `width`, `height` |
|---|---|
| `{url:"a.png"}` | 400, 200 |
| `{url:"a.png",width:100}` | 100, 50 |
| `{url:"a.png",height:100}` | 200, 100 |
| `{url:"a.png",width:100,height:100}` | 100, 100 (pas de ratio) |
| `{url:"zzz.png"}` | `PreskRuntimeError` à la construction du monde |
| compile `create image {}` | `E_FIELD_REQUIRED` |
| ancre `bottomRight` de `{x:10,y:20,url:"a.png"}` | (410,220) |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/model/classes/imageObject.test.ts src/model/catalog.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(model,view): image class and preloading (T152)`

## Suivante
`T153-view-curve`
