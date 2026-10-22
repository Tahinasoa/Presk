# Classe `arc` — arc de cercle
Famille : **bounded** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/arcObject.ts` · Vue : `core/src/view/pathViews.ts`
(En cas de désaccord sur un **chemin de fichier** entre cette fiche et la fiche de tâche, la **tâche prévaut**.)

- **`pos`** : **centre** du cercle porteur.
- **Pivot** : défaut `center` ; valeurs permises : `center`, `pos`.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`radius:50 startAngle:0 endAngle:90 stroke:0x9c9c9c strokeWidth:2`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `radius` | number | `["radius"]` | rw | oui | 0 | ≥ 0 |
| `startAngle` | number | `["startAngle"]` | rw | oui | 0 | degrés, horaire |
| `endAngle` | number | `["endAngle"]` | rw | oui | 0 | |
| `stroke` `strokeWidth` | comme `segment` | | | | | |

## Ancres
`start`, `end` : point, **ro** (points de l'arc en monde : angle `startAngle`/`endAngle`).

## Ancres indexées
aucune

## Géométrie locale / bornes
`reveal` : `default`, `draw`.

## Chemin `main`
`boundsOfPoints(flattenArc(...))`.

## Effets
`flattenArc(r, r, startAngle, endAngle)`, ouvert, `t=0` = `startAngle`, vers `endAngle`.

## Notes d'implémentation
`endAngle < startAngle` : l'arc va dans le sens horaire de `startAngle` à `endAngle` modulo 360.
