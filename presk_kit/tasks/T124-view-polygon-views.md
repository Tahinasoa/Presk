# T124-view-polygon-views
**Phase** P6 · **Dépend de** : T123-view-path-views · **Réf spec** : §11.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-view-app.md`
- `architecture/decisions/ADR-017-view-layer-contract.md`

## Objectif
Dessiner polygon et triangle, avec la variante `draw`.

## Fichiers
- créer : `core/src/view/polygonView.ts`
- modifier : `core/src/view/index.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T124.1 `PolygonView` : si `drawProgress >= 1` : `g.poly(points.flatMap(p=>[p.x,p.y]))` puis `fill`, et `stroke` si `strokeWidth > 0`. Si `drawProgress < 1` : pas de remplissage ; trace le contour partiel `path.sub(0, dp)` avec une largeur `max(strokeWidth, 2)` et la couleur `stroke`.
T124.2 Enregistre `polygon` et `triangle`.

## Cas de test (à écrire AVANT le code)
Aucun test unitaire. Validation = `tsc` + test d'architecture.

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
`feat(view): polygon and triangle views (T124)`

## Suivante
`T125-engine-golden-shapes`
