# Classe `ray` — demi-droite
Famille : **unbounded** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/rayObject.ts` · Vue : `core/src/view/rayView.ts`

- **`pos`** : `origin`.
- **Pivot** : défaut `pos` ; valeurs permises : `center`, `pos`.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`p0:{0,0}` (origin) `p1:{100,0}` (through), `stroke:0x9c9c9c strokeWidth:2`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `origin` | point | `["p0"]` | rw | oui | **0** | |
| `through` | point | `["p1"]` | rw | oui | **0** | |
| `stroke` `strokeWidth` | comme `segment` | | | | | |

## Ancres
`origin`, `through` comme `start`/`end` du segment.

## Ancres indexées
aucune

## Géométrie locale / bornes
`reveal` : `default`.

## Chemin `main`
`localBounds` = `null` ; `afterGeometry` identique à `segment`. Seul `origin`/`through` est lisible (props) ; `boundingBox` → `E_EXPR_INFINITE_REF`.

## Effets
aucun.

## Notes d'implémentation
La vue trace de `origin` jusqu'au bord du cadre dans la direction `through`.
