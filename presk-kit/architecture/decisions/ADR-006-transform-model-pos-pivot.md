# ADR-006-transform-model-pos-pivot
**Modèle de transformation : pos, pivot, rotation, échelle** · Réf spec : §3.1, §3.2, §8.2

## Contexte
Le code place l'objet par son centre et tourne autour de l'origine. La spec : `pos` = origine locale (coin haut-gauche pour la famille rectangle, centre pour cercle/ellipse/arc, `start` pour segment), rotation/échelle autour d'un **pivot** (centre de la boîte locale par défaut), angles en **degrés**, sens horaire à l'écran (y vers le bas).

## Décision
État commun à tous les objets : `x`, `y` (translation, repère **du parent**), `rotation` (deg), `scale` (> 0, uniforme), `opacity` ([0,1]), `presence` (interne, ADR-012), `pivot` (nom d'ancre, défaut selon la famille).

- Chaque classe définit sa **géométrie locale** (`localBounds()`), avec l'origine locale (0,0) = `pos` : rectangle `[0,w]×[0,h]`, cercle centré sur (0,0), etc.
- `pivotLocal()` = point de `localBounds()` désigné par `pivot` (`"center"` par défaut ; `"pos"` → (0,0)). Pour `ray`, `line`, `point` : `"pos"`.
- **Matrice locale** (objet → parent) : `M = T(pos) · T(pv) · R(rotation°) · S(scale) · T(−pv)` où `pv = pivotLocal()`. Fonction `trsPivot` (T031).
- **Matrice monde** : `W = W_parent · M`.
- Ancres et `boundingBox.*` sont lues en **repère de la scène** (monde). `x`, `y`, `pos` sont lus/écrits dans le repère du **parent** (= monde pour un objet hors groupe).
- Assigner une ancre (`topLeft`, `start`, `vertex[i]`…) : on calcule le delta monde, on le convertit dans le repère du parent (partie linéaire de `inverse(W_parent)`), et on l'applique à `x`,`y` (ancres de famille rectangle) ou au point local (ancres de sommet).
- Reparentage dans un groupe qui **préserve l'apparence** : voir ADR-015.
- `rotation` s'exprime en degrés dans le DSL **et** dans l'état ; la conversion en radians n'a lieu que dans `geom/matrix.ts`.

## Alternatives écartées
Garder `anchorX/anchorY` : ne correspond pas à la spec (pivot ≠ origine).

## Conséquences
`KRectangle`/`KObject` ne sont pas réutilisables tels quels (transform différent) : réécriture dans `model/`.
