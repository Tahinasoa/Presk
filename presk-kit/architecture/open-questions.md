# Choix de l'architecte là où la spec est silencieuse ou ambiguë

> **Pour l'humain** : ces choix sont déjà tranchés dans les ADR pour que les agents avancent. Relis-les ; pour en changer un,
> dis-le moi, je mets à jour l'ADR et les tâches concernées. Les agents n'ont **pas** à les rediscuter.

| # | Sujet | Choix retenu | Où |
|---|---|---|---|
| Q1 | Ordre d'affichage (z-order) | Ordre de création (groupes implicites en dernier) | ADR-015, ADR-017 |
| Q2 | Moment d'instanciation des groupes implicites | Après tous les `create` explicites, ordre de première apparition | ADR-015 |
| Q3 | Point littéral dans une propriété de type point | `{ "x": nombre\|expression, "y": nombre\|expression }` accepté | ADR-019 |
| Q4 | Format de `points` (polygon, polyline, curve) | tableau de `{ "x", "y" }` numériques | ADR-019 |
| Q5 | `-` unaire dans les expressions | autorisé (`"x": "-20"`, `"scene.width / -2"`) | ADR-007 |
| Q6 | `reveal` et `opacity` | `reveal` agit sur un facteur interne `presence`, pas sur `opacity` (spec §5.3 dit « opacity ») | ADR-012 |
| Q7 | `travel.speed` : quand mesurer le chemin | état après tous les `create` (la spec dit « au démarrage ») | ADR-009 |
| Q8 | Référence à un nom d'action déclaré plus bas | interdite (`E_START_UNKNOWN_NAME`) | ADR-009 |
| Q9 | Alignement dans un layout | bord de départ (gauche / haut) | ADR-015 |
| Q10 | `curve` : `spline` / `bezier` | Catmull-Rom uniforme / cubiques enchaînées `3n+1` | ADR-020 |
| Q11 | Transition de `group` (`duration`) | anime le **layout** ; le reparentage préserve l'apparence instantanément | ADR-015 |
| Q12 | `text.frame` / `margins` du code actuel | retirés de la v1.0 (extension non spec) ; pourront revenir comme classe du catalogue | gap-analysis |
| Q13 | Style de `text` | `text`, `color`, `fontSize` (32), `fontFamily` (`sans-serif`), `fontWeight` (`bold`\|`normal`, défaut `bold`) | classes/text.md |
| Q14 | `fill` sur tracés (polyline, curve, arc) | non supporté en v1.0 | classes/*.md |
| Q15 | Pastilles aux extrémités du `line` actuel | non reprises (un `segment` n'a pas de pastilles) | classes/segment.md |
| Q16 | Fréquence d'images de la simulation | 60 fps par défaut, paramètre du `Simulation` | ADR-010 |
| Q17 | Noms de couleurs reconnus | table finie de `C-geom.md` | ADR-019 |
| Q18 | Doublon d'équivalents dans une étape (`pos` et `x` ensemble) | erreur `E_PROPERTY_DUPLICATE` | ADR-011 |
| Q19 | Valeur hors bornes (`opacity` 1,5 ; `scale` ≤ 0) | erreur `E_VALUE_RANGE` (jamais de clamp silencieux) | classes/*.md |
| Q20 | Export vidéo | hors périmètre ; le moteur expose `seek(t)` déterministe | ADR-010 |
| Q21 | `travel.from: "current"` | ne tient compte que des actions déclarées plus haut dans `steps` | ADR-013 |
| Q22 | Origine du groupe | `pos` du groupe n'est **pas** renormalisé sur la boîte des enfants ; le layout commence à `(margin, margin)` dans le repère du groupe | ADR-015 |
| Q23 | `along` | `"objet"` ou `"objet.chemin"` | C-engine-compile |
| Q24 | Alpha dans la couleur (`#rgba`, `#rrggbbaa`) | accepté et interpolé ; **extension** de la spec §11.3 (qui ne parle pas d'alpha) | ADR-021 |
| Q25 | Formats `rgb()`, `hsl()` | non supportés en v1 ; ajoutables dans `parseColor` seul | ADR-021 |
| Q26 | Alpha de couleur × `opacity` d'objet | multiplication supposée ; **à confirmer visuellement** (T163) | ADR-022 |
