# Classe `polygon` — polygone
Famille : **bounded** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/polygonObject.ts` · Vue : `core/src/view/polygonView.ts`
(En cas de désaccord sur un **chemin de fichier** entre cette fiche et la fiche de tâche, la **tâche prévaut**.)

- **`pos`** : origine du repère local des points.
- **Pivot** : défaut `center` ; valeurs permises : `center`, `pos`.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`points:[]` (≥ 3 sommets, `{x,y}` locaux) `fill:0x9c9c9c stroke:0xffffff strokeWidth:0`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `points` | pointList | `["points"]` | **init** | non | 0 | ≥ 3 points, sinon `E_VALUE_RANGE` |
| `fill` `stroke` `strokeWidth` | comme `circle` | | | | | |

## Ancres
aucune (via `boundingBox`).

## Ancres indexées
`vertex[i]` : `get` = `worldMatrix · points[i]` ; `set(worldPt)` : `points[i] = inverse(worldMatrix)(worldPt)` ; `count` = nombre de points ; `writeKey(i)` = `"points."+i`.

## Géométrie locale / bornes
`reveal` : `default`, `draw`.

## Chemin `main`
`localBounds` = `boundsOfPoints(points)`.

## Effets
sommets dans l'ordre, fermé (`always`), `t=0` = `vertex[0]`.

## Notes d'implémentation
Si `points` est absent à `create` : `E_FIELD_REQUIRED` détecté par la compilation (propriété `required`, T064).
