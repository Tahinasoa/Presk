# Classe `circle` — cercle
Famille : **bounded** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/circleObject.ts` · Vue : `core/src/view/circleEllipseView.ts`
(En cas de désaccord sur un **chemin de fichier** entre cette fiche et la fiche de tâche, la **tâche prévaut**.)

- **`pos`** : **centre**.
- **Pivot** : défaut `center` ; valeurs permises : `center`, `pos`.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`radius:50 fill:0x9c9c9c stroke:0xffffff strokeWidth:0`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `radius` | number | `["radius"]` | rw | oui | 0 | ≥ 0, défaut 50 |
| `fill` | color | `["fill"]` | rw | oui | 0 | |
| `stroke` | color | `["stroke"]` | rw | oui | 0 | |
| `strokeWidth` | number | `["strokeWidth"]` | rw | oui | 0 | ≥ 0 |

## Ancres
aucune (9 points via `boundingBox`).

## Ancres indexées
aucune

## Géométrie locale / bornes
`reveal` : `default`.

## Chemin `main`
`localBounds` = `[-r,r]×[-r,r]`.

## Effets
`flattenEllipse(r, r)` ; `t=0` au point le plus à droite `(r,0)`, sens horaire ; fermé (`always`).

## Notes d'implémentation
—
