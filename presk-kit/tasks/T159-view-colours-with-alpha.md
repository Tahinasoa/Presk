# T159-view-colours-with-alpha
**Phase** P10 · **Dépend de** : T158-model-get-colour · **Réf spec** : §11.3 (extension : alpha, Q24)

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/decisions/ADR-022-colour-rendering-contract.md`
- `architecture/contracts/C-geom-color-v2.md`

## Objectif
Découpler les 5 vues du format de couleur. **Aucun changement visible** (l'état contient encore des nombres, alpha = 1).

## Fichiers
- modifier : `core/src/view/rectangleView.ts`
- modifier : `core/src/view/circleEllipseView.ts`
- modifier : `core/src/view/polygonView.ts`
- modifier : `core/src/view/pathViews.ts`
- modifier : `core/src/view/textView.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T159.1 Dans chaque vue, remplace chaque `this.object.getNumber("fill"|"stroke"|"color")` par `splitColor(this.object.getColor(<clé>))`, qui donne `{ rgb, alpha }`.
T159.2 `RectangleView`, `CircleView`, `EllipseView`, `PolygonView` : `g.fill({ color: fill.rgb, alpha: fill.alpha })` ; `g.stroke({ width, color: stroke.rgb, alpha: stroke.alpha })`.
T159.3 `pathViews.ts` (4 endroits de `stroke`, y compris la pointe de flèche remplie avec la couleur du trait) : même schéma `{ color: rgb, alpha }`.
T159.4 `TextView` : `style.fill = rgb` (un **nombre**) et `this.text.alpha = alpha`. Ne mets pas l'alpha dans le style de remplissage. La valeur de repli initiale `fill: 0xffffff` du constructeur reste.
T159.5 **Ne passe jamais une chaîne de couleur à Pixi** : toujours `rgb` (nombre) + `alpha` séparés (voir ADR-022).
T159.6 `splitColor` s'importe depuis `@/geom/color` (`view/` peut importer `geom/`).

## Cas de test (à écrire AVANT le code)
Aucun test unitaire (Pixi). Le comportement ne change pas. **Contrôle humain** (BACKLOG) : la démo `HELLO` s'affiche comme avant.

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
`refactor(view): read colours through getColor and splitColor (T159)`

## Suivante
`T160-model-colour-getters-and-interpolate`
