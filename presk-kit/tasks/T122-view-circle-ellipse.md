# T122-view-circle-ellipse
**Phase** P6 · **Dépend de** : T121-model-point-ray-line, T094-view-sync · **Réf spec** : §11.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-view-app.md`
- `architecture/decisions/ADR-017-view-layer-contract.md`

## Objectif
Dessiner `circle` et `ellipse`.

## Fichiers
- créer : `core/src/view/circleEllipseView.ts`
- modifier : `core/src/view/index.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T122.1 `CircleView` : `g.circle(0,0,radius)` ; `EllipseView` : `g.ellipse(0,0,width/2,height/2)` ; puis `fill({color: fill})` et `stroke({width, color})` si `strokeWidth > 0` (comme `RectangleView`, T092).
T122.2 Exporte `registerCircleView`, `registerEllipseView` et ajoute leurs appels dans `createDefaultViewRegistry`.

## Cas de test (à écrire AVANT le code)
Aucun test unitaire (Pixi). Validation = `tsc` + test d'architecture.

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
`feat(view): circle and ellipse views (T122)`

## Suivante
`T123-view-path-views`
