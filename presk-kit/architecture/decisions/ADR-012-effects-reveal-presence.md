# ADR-012-effects-reveal-presence
**Effets et `reveal` via un facteur interne `presence`** · Réf spec : §5

## Contexte
§5.3 dit que `reveal` ne modifie que `opacity`, et §4.1 que l'invisibilité initiale n'est pas une valeur lisible. Si `reveal` écrivait `opacity`, il entrerait en conflit avec `animate opacity` et avec une `opacity` donnée à `create`.

## Décision
- Chaque objet a un état interne `presence` ∈ [0,1] (**non** une propriété DSL : non lisible, non liable). Alpha effectif = `opacity × presence × alpha effectif du parent` (§10.4).
- Après `create` : `presence = 0` (invisible), sauf si `reveal` est donné dans `properties` (résultat final appliqué, sans animation). Un groupe est créé avec `presence = 1`.
- Un **effet** (`EffectDef`) expose `variants`, `defaultDuration`, `defaultEase`, `apply(obj, variant, p)` où `p ∈ [0,1]` : `p=0` état « off », `p=1` état « on ». Valeurs DSL : `true` (variante `"default"`), `false` (**inverse** de la dernière variante jouée : `p` va de 1 à 0), chaîne (variante nommée).
- La « dernière variante jouée » est résolue **à la compilation** (`engine/analyze/effects.ts`), dans l'ordre de la timeline, par couple (objet, effet). Initialement `"default"`.
- `reveal` par défaut : `presence = p`. Variante `"draw"` (polygon, triangle, polyline, curve, segment, arrow, arc) : `presence = p > 0 ? 1 : 0` et `drawProgress = p` (le dessin n'affiche que la fraction `drawProgress` du chemin).
- `set` sur un effet : applique `p = 1` (valeur vraie/variante) ou `p = 0` (faux, avec la dernière variante). `stop` fige l'effet à son `p` courant. Un effet ne peut être ni lu dans une expression, ni lié par `bind`.
- **`reveal` ne se propage pas aux enfants d'un groupe** (§10.4).

## Alternatives écartées
`reveal` écrit `opacity` : conflits et état initial ambigus (voir Q6, à valider par l'humain).

## Conséquences
Effet visuel identique à la spec dans tous ses exemples. Si l'humain préfère la lecture littérale, seul `presence` est à remplacer par `opacity` dans `model/` et `view/`.
