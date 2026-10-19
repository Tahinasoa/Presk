# Classe `ellipse` — ellipse
Famille : **bounded** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/ellipseObject.ts` · Vue : `core/src/view/ellipseView.ts`

- **`pos`** : **centre**.
- **Pivot** : défaut `center` ; valeurs permises : `center`, `pos`.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`width:100 height:60 fill:0x9c9c9c stroke:0xffffff strokeWidth:0`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `width` | number | `["width"]` | rw | oui | 0 | ≥ 0 |
| `height` | number | `["height"]` | rw | oui | 0 | ≥ 0 |
| `fill` `stroke` `strokeWidth` | comme `circle` | | | | | |

## Ancres
aucune (via `boundingBox`).

## Ancres indexées
aucune

## Géométrie locale / bornes
`reveal` : `default`.

## Chemin `main`
`localBounds` = `[-w/2,w/2]×[-h/2,h/2]`.

## Effets
`flattenEllipse(width/2, height/2)` ; départ `(w/2,0)`, horaire ; fermé.

## Notes d'implémentation
—
