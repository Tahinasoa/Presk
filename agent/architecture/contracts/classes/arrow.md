# Classe `arrow` — flèche (segment avec pointe)
Famille : **bounded** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/arrowObject.ts` · Vue : `core/src/view/arrowView.ts`

- **`pos`** : idem `segment`.
- **Pivot** : défaut `center` ; valeurs permises : `center`, `pos`.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
comme `segment` + `head:"end"`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `start` `end` `stroke` `strokeWidth` | comme `segment` | | | | | |
| `head` | enum | `["head"]` | **init** | non | 0 | `end`\|`start`\|`both`\|`none`, défaut `end` |

## Ancres
comme `segment`.

## Ancres indexées
aucune

## Géométrie locale / bornes
`reveal` : `default`, `draw`.

## Chemin `main`
comme `segment` (la pointe n'agrandit pas `localBounds`).

## Effets
comme `segment`.

## Notes d'implémentation
Pointe : triangle plein de longueur `max(10, 4×strokeWidth)` dessiné par la vue, rien dans le modèle.
