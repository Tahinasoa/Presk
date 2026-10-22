# T123-view-path-views
**Phase** P6 · **Dépend de** : T122-view-circle-ellipse · **Réf spec** : §11.3

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-view-app.md`
- `architecture/decisions/ADR-017-view-layer-contract.md`
- `architecture/contracts/C-geom.md (FlatPath.sub)`

## Objectif
Dessiner les objets-tracés. La variante `draw` (drawProgress) est gérée ici dès maintenant.

## Fichiers
- créer : `core/src/view/pathViews.ts`
- modifier : `core/src/view/index.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T123.1 `PathStrokeView extends ObjectView` (segment, arrow, polyline, arc) : `path = object.def.paths.main.build(object)` ; `dp = object.hasState("drawProgress") ? object.getNumber("drawProgress") : 1` ; points = `dp >= 1 ? path.points (+ fermeture si path.closed) : path.sub(0, dp)` ; `g.moveTo/lineTo` ; `g.stroke({width: strokeWidth, color: stroke})`.
T123.2 `ArrowView` : comme `PathStrokeView` + pointe(s) selon `head` quand `dp >= 1` : triangle plein de longueur `max(10, 4×strokeWidth)` orienté selon le dernier (ou premier) segment du chemin, rempli de `stroke`.
T123.3 `RayView` : de `p0` vers `p0 + dir × 10000` (`dir` = `p1 − p0` normalisé, coordonnées locales). `LineView` : de `p0 − dir×10000` à `p0 + dir×10000`. Si `p0 == p1` : ne rien dessiner.
T123.4 Enregistre : `segment`, `arrow`, `polyline`, `arc`, `ray`, `line` dans `createDefaultViewRegistry`.

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
`feat(view): path-like object views (T123)`

## Suivante
`T124-view-polygon-views`
