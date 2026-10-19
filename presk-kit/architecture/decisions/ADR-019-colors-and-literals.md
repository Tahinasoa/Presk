# ADR-019-colors-and-literals
**Couleurs et littéraux** · Réf spec : §11.3

## Contexte
La spec cite `fill`, `stroke`, `color`, avec des valeurs comme `"blue"` ou `"#888"`.

## Décision
- Représentation interne : nombre `0xRRGGBB`. Pas de canal alpha (l'opacité passe par `opacity`).
- Entrées acceptées (`parseColor`) : `#rgb`, `#rrggbb` (casse indifférente) ; noms de la table de `C-geom.md` ; un nombre entier JSON 0..0xFFFFFF.
- `animate` interpole en RGB linéaire par canal.
- Points littéraux : `{ "x": <nombre|expression>, "y": <nombre|expression> }` (Q3). Listes de points (`points`) : tableau de `{ "x": nombre, "y": nombre }` (Q4), sans expressions.
- Défauts : `fill` `0x9c9c9c`, `stroke` `0xffffff`, `strokeWidth` 0 pour les formes pleines ; 2 pour les tracés (segment, arrow, ray, line, polyline, curve, arc), `stroke` `0x9c9c9c`.

## Alternatives écartées
Accepter toute chaîne CSS : indécidable pour des agents sans parseur de couleur.

## Conséquences
Un nom de couleur inconnu = `E_COLOR_INVALID`.
