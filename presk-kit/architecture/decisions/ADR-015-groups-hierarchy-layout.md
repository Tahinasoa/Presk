# ADR-015-groups-hierarchy-layout
**Groupes, reparentage, layout** · Réf spec : §10

## Contexte
Un groupe est un objet rectangle ; ses transformations s'appliquent récursivement ; reparenter ne doit pas faire sauter l'enfant ; le layout place les enfants par boîte englobante.

## Décision
- `GroupObject` (famille rectangle) : `children` ordonnés, `layout` (`vertical|horizontal|none`), `gap`, `margin`. Ses 9 ancres = boîte englobante (monde) de ses enfants (+ marge) ; sans enfant : boîte vide en `pos`.
- Groupes **implicites** (cible d'un `group` sans `create`) : déduits à la compilation, instanciés **après** tous les `create` explicites, dans l'ordre de première apparition, avec `presence = 1` (Q2).
- `group` : à `start`, reparente chaque enfant en **préservant son apparence monde** : on calcule la matrice monde cible `W`, puis le nouvel état local `(x, y, rotation, scale)` tel que `W_groupe⁻¹ · W` soit reproduit (rotation' = rot − rot_groupe, scale' = scale / scale_groupe, `pos'` par résolution de la translation avec le pivot). Un enfant déjà dans un autre groupe est reparenté.
- Layout : à l'activation du `group` (et à chaque `group` ultérieur sur ce groupe), les enfants sont placés **à la suite** le long de l'axe, alignés au bord de départ (gauche en vertical, haut en horizontal — Q9), séparés de `gap`, dans une boîte décalée de `margin`. Si `duration` est donnée, la transition des positions est animée (interpolation depuis les positions courantes, `ease` appliqué).
- `ungroup` : détache en préservant l'apparence monde ; sans `children` : tous.
- Erreurs : enfant inconnu, cycle, `line`/`ray` dans un groupe avec layout, `ungroup` d'un non-membre, `group` sur un objet existant qui n'est pas un groupe.
- Aucune propagation de `reveal` (ADR-012).

## Alternatives écartées
Conteneur Pixi imbriqué comme source de vérité : la logique doit rester dans le modèle.

## Conséquences
La vue reste **plate** (une vue par objet, matrice monde). L'ordre d'affichage est l'ordre de création, groupes inclus (Q1).

## Addendum (précisions d'implémentation)
- `localBounds` du groupe (repère du groupe) = union des boîtes des enfants `transformBounds(enfant.localBounds(), enfant.localMatrix())`, élargie de `margin` de chaque côté ; sans enfant : `null`.
- Layout `vertical` : curseur `cy = margin` ; pour chaque enfant (ordre de la liste) : boîte `B` de l'enfant dans le repère du groupe ; `dx = margin − B.minX`, `dy = cy − B.minY` ; `enfant.x += dx`, `enfant.y += dy` ; `cy += hauteur(B) + gap`. `horizontal` : symétrique (curseur sur x, alignement `dy = margin − B.minY`).
- Le reparentage résout la matrice avec la matrice du groupe **avant** ajout de l'enfant : exact si le groupe n'a ni rotation ni échelle, ou si l'enfant tient dans les bornes existantes (limite assumée).
- La transition (`duration` > 0) interpole `x`,`y` des enfants de leur position post-reparentage vers leur position de layout. Le mécanisme réclame la pseudo-clé `@layout` du groupe (pas les clés des enfants : limite assumée).
- Aucune renormalisation de `pos` du groupe (Q22).
