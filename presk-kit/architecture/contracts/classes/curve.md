# Classe `curve` — courbe
Famille : **bounded** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/curveObject.ts` · Vue : `core/src/view/pathViews.ts` (enregistrement en T153)
(En cas de désaccord sur un **chemin de fichier** entre cette fiche et la fiche de tâche, la **tâche prévaut**.)

- **`pos`** : origine du repère local des points.
- **Pivot** : défaut `center` ; valeurs permises : `center`, `pos`.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`points:[]` (≥ 2) `closed:false interpolation:"spline" stroke:0x9c9c9c strokeWidth:2`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `points` | pointList | `["points"]` | **init** | non | 0 | ADR-020 |
| `closed` | boolean | `["closed"]` | **init** | non | 0 | |
| `interpolation` | enum | `["interpolation"]` | **init** | non | 0 | `spline`\|`bezier` |
| `stroke` `strokeWidth` | comme `segment` | | | | | |

## Ancres
`start`, `end` : point, **ro**, = premier / dernier point du chemin (monde).

## Ancres indexées
`vertex[i]` comme `polygon`.

## Géométrie locale / bornes
`reveal` : `default`, `draw`.

## Chemin `main`
`boundsOfPoints` du chemin aplati.

## Effets
`FlatPath` de la courbe aplatie (ADR-020). `closed: "state"`.

## Notes d'implémentation
Phase P9 (T150–T151).
