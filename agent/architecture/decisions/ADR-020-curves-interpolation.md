# ADR-020-curves-interpolation
**Interpolation de `curve`** · Réf spec : §11.2, §12.4

## Contexte
La spec laisse `spline` / `bezier` « à confirmer ».

## Décision
- `spline` (défaut) : Catmull-Rom **uniforme**, tension 0,5, passe par tous les points ; ouvert : points fantômes = répétition du premier/dernier ; fermé : indices modulo.
- `bezier` : `points` = `[P0, C1, C2, P1, C3, C4, P2, …]` (cubiques enchaînées) → nombre de points = `3n+1` (ouvert) ou `3n` (fermé, n ≥ 1) ; sinon `E_VALUE_RANGE`.
- Aplatissement : 48 segments par courbe cubique (spline convertie en cubiques de Bézier équivalentes).
Voir Q10 (à valider).

## Alternatives écartées
Autres splines (centripète) : plus complexes pour un gain visuel faible.

## Conséquences
Phase P9 uniquement.
