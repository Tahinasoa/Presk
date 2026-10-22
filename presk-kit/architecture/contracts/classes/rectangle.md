# Classe `rectangle` — rectangle
Famille : **rectangle** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/rectangleObject.ts` · Vue : `core/src/view/rectangleView.ts`
(En cas de désaccord sur un **chemin de fichier** entre cette fiche et la fiche de tâche, la **tâche prévaut**.)

- **`pos`** : coin haut-gauche.
- **Pivot** : défaut `center` ; valeurs permises : les 9 ancres.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`width:100 height:100 fill:0x9c9c9c stroke:0xffffff strokeWidth:0`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `width` | number | `["width"]` | rw | oui | 0 | ≥ 0, défaut 100 |
| `height` | number | `["height"]` | rw | oui | 0 | ≥ 0, défaut 100 |
| `fill` | color | `["fill"]` | rw | oui | 0 | |
| `stroke` | color | `["stroke"]` | rw | oui | 0 | |
| `strokeWidth` | number | `["strokeWidth"]` | rw | oui | 0 | ≥ 0 |

## Ancres
`topLeft topCenter topRight centerLeft center centerRight bottomLeft bottomCenter bottomRight` : point, writes `[x,y]`, mode rw, animatable, order 2. Lecture en repère **monde** (suivent la rotation). Assignation : translation de l'objet pour que l'ancre atteigne la valeur (ADR-006).

## Ancres indexées
aucune

## Géométrie locale / bornes
`reveal` : `default` seulement.

## Chemin `main`
`localBounds` = `[0,width]×[0,height]`.

## Effets
contour fermé, `t=0` = coin haut-gauche, sens horaire : points `(0,0) (w,0) (w,h) (0,h)`. `PathSpec.closed = "always"`.

## Notes d'implémentation
Classe de base de la famille : `TextObject`, `ImageObject`, `GroupObject`, `SceneRoot` en héritent. Écrire d'abord une fonction utilitaire `rectangleProps()` réutilisée par les descendants (T045).
