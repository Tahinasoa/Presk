# Classe `line` — droite infinie
Famille : **unbounded** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/lineObject.ts` · Vue : `core/src/view/lineView.ts`

- **`pos`** : `p1`.
- **Pivot** : défaut `pos` ; valeurs permises : `center`, `pos`.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`p0:{0,0}` (p1) `p1:{100,0}` (p2), `stroke:0x9c9c9c strokeWidth:2`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `p1` | point | `["p0"]` | rw | oui | **0** | |
| `p2` | point | `["p1"]` | rw | oui | **0** | |
| `stroke` `strokeWidth` | comme `segment` | | | | | |

## Ancres
`p1`, `p2` (propriétés point).

## Ancres indexées
aucune

## Géométrie locale / bornes
`reveal` : `default`.

## Chemin `main`
`localBounds` = `null` ; `afterGeometry` comme `segment`.

## Effets
aucun.

## Notes d'implémentation
La vue trace la droite sur tout le cadre. Le **`line` du code actuel est un segment** : ne pas confondre.
