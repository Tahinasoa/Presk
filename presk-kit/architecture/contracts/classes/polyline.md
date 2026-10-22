# Classe `polyline` — polyligne
Famille : **bounded** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/polylineObject.ts` · Vue : `core/src/view/pathViews.ts`
(En cas de désaccord sur un **chemin de fichier** entre cette fiche et la fiche de tâche, la **tâche prévaut**.)

- **`pos`** : origine du repère local des points.
- **Pivot** : défaut `center` ; valeurs permises : `center`, `pos`.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`points:[]` (≥ 2) `closed:false stroke:0x9c9c9c strokeWidth:2`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `points` | pointList | `["points"]` | **init** | non | 0 | ≥ 2 points |
| `closed` | boolean | `["closed"]` | **init** | non | 0 | défaut false |
| `stroke` `strokeWidth` | comme `segment` | | | | | |

## Ancres
aucune.

## Ancres indexées
`vertex[i]` comme `polygon`.

## Géométrie locale / bornes
`reveal` : `default`, `draw`.

## Chemin `main`
`boundsOfPoints(points)`.

## Effets
sommets dans l'ordre ; fermé si `closed` (`closed: "state"`) ; un `polyline` fermé se comporte comme un `polygon` pour `travel`.

## Notes d'implémentation
Pas de `fill` (Q14).
