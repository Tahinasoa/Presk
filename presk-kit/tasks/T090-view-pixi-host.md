# T090-view-pixi-host
**Phase** P5 · **Dépend de** : T080-engine-golden-core · **Réf spec** : §3.5

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-view-app.md`
- `architecture/decisions/ADR-017-view-layer-contract.md`
- `core/src/renderer/krenderer.ts (code legacy EXISTANT : source d'inspiration pour l'API PixiJS 8 qui fonctionne ; ses commentaires ne sont pas fiables)`

## Objectif
Créer `PixiHost` : application Pixi, canvas dans l'élément racine, conteneur monde.

## Fichiers
- créer : `core/src/view/pixiHost.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T090.1 `class PixiHost` : `constructor(rootSelector: string)` ; trouve l'élément (`document.querySelector`), lève `Error` s'il est absent.
T090.2 `async init(width: number, height: number, background?: string): Promise<void>` : `this.app = new Application()` ; `await app.init({width, height, background: background ?? "#000000", antialias: true, resolution: window.devicePixelRatio || 1, autoDensity: true})` ; ajoute `app.canvas` à la racine ; `this.world = new Container()` ; `app.stage.addChild(this.world)`.
T090.3 `resize(width, height, background?)` : `app.renderer.resize(width,height)` ; `app.renderer.background.color = background ?? "#000000"`.
T090.4 `add(c: Container)` / `remove(c: Container)` : sur `this.world`. `setViewport(cx: number, cy: number, zoom: number, sceneWidth: number, sceneHeight: number)` : `world.scale.set(zoom)` ; `world.position.set(sceneWidth/2 - cx*zoom, sceneHeight/2 - cy*zoom)` (zoom 1 et centre = centre de scène → identité).
T090.5 `destroy()` : `app.destroy(true, {children:true})`. `get app(): Application` (lève si non initialisé).
T090.6 Aucun accès au modèle dans cette classe.

## Cas de test (à écrire AVANT le code)
Pas de test unitaire (PixiJS a besoin d'un canvas). Validation = `tsc` + test d'architecture.

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(view): PixiHost (T090)`

## Suivante
`T091-view-object-view-registry`
