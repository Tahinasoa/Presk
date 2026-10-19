# Classe `image` — image
Famille : **rectangle** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/imageObject.ts` · Vue : `core/src/view/imageView.ts`

- **`pos`** : coin haut-gauche.
- **Pivot** : défaut `center` ; valeurs permises : les 9 ancres.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`url:""` ; `width`, `height` issus de `images.sizeOf(url)` (ratio conservé si un seul est donné)

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `url` | string | `["url"]` | **init** | non | 0 | requise (`E_FIELD_REQUIRED`) |
| `width` | number | `["width"]` | rw | oui | 0 | |
| `height` | number | `["height"]` | rw | oui | 0 | |

## Ancres
`topLeft topCenter topRight centerLeft center centerRight bottomLeft bottomCenter bottomRight` : point, writes `[x,y]`, mode rw, animatable, order 2. Lecture en repère **monde** (suivent la rotation). Assignation : translation de l'objet pour que l'ancre atteigne la valeur (ADR-006).

## Ancres indexées
aucune

## Géométrie locale / bornes
`reveal` : `default`.

## Chemin `main`
`[0,width]×[0,height]`.

## Effets
contour fermé comme `rectangle`.

## Notes d'implémentation
Phase P9 (T151). Dimensions : si seul `width` donné → `height = width × h0/w0` ; seul `height` → symétrique ; aucun → taille naturelle.
