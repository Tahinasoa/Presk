# Classe `triangle` — triangle
Famille : **bounded** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/polygonObject.ts` · Vue : `core/src/view/polygonView.ts`
(En cas de désaccord sur un **chemin de fichier** entre cette fiche et la fiche de tâche, la **tâche prévaut**.)

- **`pos`** : origine du repère local des points.
- **Pivot** : défaut `center` ; valeurs permises : `center`, `pos`.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`points:[]` (**exactement 3**) + style comme `polygon`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `points` | pointList | `["points"]` | **init** | non | 0 | exactement 3 points |
| `fill` `stroke` `strokeWidth` | comme `circle` | | | | | |

## Ancres
aucune.

## Ancres indexées
`vertex[0..2]` comme `polygon`.

## Géométrie locale / bornes
`reveal` : `default`, `draw`.

## Chemin `main`
comme `polygon`.

## Effets
comme `polygon`.

## Notes d'implémentation
Réutilise le code de `PolygonObject` (paramètre `exactCount`).
