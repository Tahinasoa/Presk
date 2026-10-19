# Classe `text` — texte
Famille : **rectangle** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/textObject.ts` · Vue : `core/src/view/textView.ts`

- **`pos`** : coin haut-gauche de la boîte de texte (dimensions calculées par le mesureur, ADR-014).
- **Pivot** : défaut `center` ; valeurs permises : les 9 ancres.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`text:"" color:0xffffff fontSize:32 fontFamily:"sans-serif" fontWeight:"bold" width/height : mesurés`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `text` | string | `["text"]` | rw | non | 0 | remesure à l'écriture |
| `color` | color | `["color"]` | rw | oui | 0 | défaut 0xffffff |
| `fontSize` | number | `["fontSize"]` | rw | oui | 0 | > 0, défaut 32, remesure |
| `fontFamily` | string | `["fontFamily"]` | rw | non | 0 | défaut `sans-serif`, remesure |
| `fontWeight` | enum | `["fontWeight"]` | rw | non | 0 | `normal`\|`bold`, défaut `bold`, remesure |
| `width` | number | `[]` | **ro** | non | 0 | = largeur mesurée |
| `height` | number | `[]` | **ro** | non | 0 | = hauteur mesurée |

## Ancres
`topLeft topCenter topRight centerLeft center centerRight bottomLeft bottomCenter bottomRight` : point, writes `[x,y]`, mode rw, animatable, order 2. Lecture en repère **monde** (suivent la rotation). Assignation : translation de l'objet pour que l'ancre atteigne la valeur (ADR-006).

## Ancres indexées
aucune

## Géométrie locale / bornes
`reveal` : `default`.

## Chemin `main`
`localBounds` = `[0,width]×[0,height]` (mesurées). Dimensions recalculées par `measurer.measure(text, {fontSize, fontFamily, fontWeight})` à la création et à chaque écriture de `text`, `fontSize`, `fontFamily`, `fontWeight` (via `afterWrite` interne).

## Effets
identique à `rectangle` (contour de la boîte).

## Notes d'implémentation
Pas de `fill`/`stroke`/`strokeWidth` sur `text` (Q13, Q12 : pas de `frame`). Un `animate fontSize` remesure à chaque tick.
