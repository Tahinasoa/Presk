# Classe `group` — groupe
Famille : **rectangle** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/groupObject.ts` · Vue : aucune vue (les enfants se dessinent eux-mêmes)
(En cas de désaccord sur un **chemin de fichier** entre cette fiche et la fiche de tâche, la **tâche prévaut**.)

- **`pos`** : coin haut-gauche de la boîte englobante des enfants (+ marge). Sans enfant : la valeur de `x`,`y`.
- **Pivot** : défaut `center` ; valeurs permises : les 9 ancres.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`layout:"none" gap:0 margin:0` ; `presence:1` dès la création ; liste d'enfants ordonnée

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `layout` | enum | `["layout"]` | rw | non | 0 | `vertical`\|`horizontal`\|`none` |
| `gap` | number | `["gap"]` | rw | non | 0 | ≥ 0 |
| `margin` | number | `["margin"]` | rw | non | 0 | ≥ 0 (nombre uniquement en v1.0) |

## Ancres
les 9 ancres = boîte englobante monde des enfants. En lecture seule tant que la classe n'a pas d'enfants ; sinon assignables (translation du groupe).

## Ancres indexées
aucune

## Géométrie locale / bornes
`reveal` : `default` ; **ne se propage pas** aux enfants (ADR-012).

## Chemin `main`
`localBounds` : union des `localBounds` des enfants exprimées dans le repère local du groupe, élargie de `margin`.

## Effets
contour fermé de la boîte (comme `rectangle`).

## Notes d'implémentation
Détails dans ADR-015. `children` n'est **pas** une propriété d'état : c'est la structure (`GroupObject.addChild/removeChild`).
