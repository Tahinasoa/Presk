# ADR-022
**Rendu des couleurs : `splitColor`, jamais de chaîne vers Pixi** · Réf spec : §11.3 · Complète ADR-017

## Contexte
PixiJS 8 accepte des chaînes avec alpha (`'#ff0000ff'`, `rgba(...)`), des objets et des tableaux ; un entier est un `0xRRGGBB` **opaque** (documentation PixiJS `Color`). Le moteur pourrait donc lui passer ses chaînes. La migration d'essai a pourtant fait un autre choix, avec une justification erronée (« Pixi ne sait pas lire `#rrggbbaa` ») : **c'est faux**. La vraie raison est ci-dessous.

## Décision
1. Toute vue obtient une couleur par `splitColor(object.getColor(clé))` → `{ rgb: number, alpha: number }` et passe à Pixi **`color: rgb` (nombre) et `alpha` (0..1) séparés** : `g.fill({ color: rgb, alpha })`, `g.stroke({ width, color: rgb, alpha })`.
2. **Raisons** : (a) un seul chemin de conversion, testable hors navigateur (`splitColor` est dans `geom/`) ; (b) pas de dépendance au comportement d'analyse de chaîne de Pixi, qui varie selon la version ; (c) pas d'ambiguïté entre l'alpha de la couleur et le champ `alpha` du style.
3. **Texte** : `style.fill = rgb` (nombre) et `text.alpha = alpha`. L'alpha n'est pas mis dans le style de remplissage.
4. **Combinaison avec l'opacité d'objet** : l'alpha effectif visible = alpha de la couleur × `container.alpha` (= `effectiveAlpha()` de l'objet). Pixi multiplie les alphas parent/enfant ; la multiplication avec l'alpha d'un remplissage reste **à confirmer visuellement** (Q26) : un `fill:"#ff000080"` avec `opacity:0.5` doit apparaître à environ 25 %.
5. Les vues ne lisent **jamais** `getNumber` pour une couleur et n'écrivent jamais dans le modèle.

## Alternatives écartées
- Passer la chaîne telle quelle à Pixi : dépend de l'analyseur de Pixi et rend le rendu non testable.
- Passer un objet `{r,g,b,a}` : équivalent, mais exige plus de conversions.

## Conséquences
La valeur de repli `fill: 0xffffff` du constructeur de `TextView` reste un nombre (style Pixi initial, pas de l'état).
