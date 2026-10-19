# T092-view-rectangle-view
**Phase** P5 · **Dépend de** : T091-view-object-view-registry · **Réf spec** : §11.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-view-app.md`
- `architecture/decisions/ADR-017-view-layer-contract.md`
- `architecture/contracts/classes/rectangle.md`

## Objectif
Dessiner un `rectangle` à partir de son état.

## Fichiers
- créer : `core/src/view/rectangleView.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T092.1 `class RectangleView extends ObjectView` : crée un `Graphics`, l'ajoute à `container` ; `host.add(container)` dans le constructeur.
T092.2 `draw()` : lit `width,height,fill,stroke,strokeWidth` via `object.getNumber(...)`. `g.clear()` ; `g.rect(0, 0, w, h)` ; `g.fill({ color: fill })` ; si `strokeWidth > 0` : `g.stroke({ width: strokeWidth, color: stroke })`.
T092.3 Ne modifie jamais `object`.
T092.4 Exporte `registerRectangleView(reg: ViewRegistry)` qui enregistre `"rectangle"` → `(o, host) => new RectangleView(o, host)`.

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
`feat(view): RectangleView (T092)`

## Suivante
`T093-view-text-view-and-measurer`
