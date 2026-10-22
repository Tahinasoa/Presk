# Classe `segment` — segment
Famille : **bounded** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/segmentObject.ts` · Vue : `core/src/view/pathViews.ts`
(En cas de désaccord sur un **chemin de fichier** entre cette fiche et la fiche de tâche, la **tâche prévaut**.)

- **`pos`** : translation de l'objet. À la création, `start` est ramené à l'origine locale par `afterGeometry` : `pos` vaut alors la position de `start` (ADR-006).
- **Pivot** : défaut `center` ; valeurs permises : `center`, `pos`.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
`p0:{0,0} p1:{100,0} stroke:0x9c9c9c strokeWidth:2` (points **locaux**)

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| `start` | point | `["p0"]` | rw | oui | **0** | ancre : voir ci-dessous |
| `end` | point | `["p1"]` | rw | oui | **0** | |
| `stroke` | color | `["stroke"]` | rw | oui | 0 | |
| `strokeWidth` | number | `["strokeWidth"]` | rw | oui | 0 | ≥ 0, défaut 2 |

## Ancres
`start` = `worldMatrix · p0`, `end` = `worldMatrix · p1` (lecture monde). Assigner `start` : `p0 = inverse(worldMatrix)(valeur)` ; idem `end` avec `p1` (ADR-006 : pivot évalué avant). Indépendants l'un de l'autre.

## Ancres indexées
aucune

## Géométrie locale / bornes
`reveal` : `default`, `draw` (trace de `start` vers `end`).

## Chemin `main`
`localBounds` = `boundsOfPoints([p0,p1])`. Hook `afterGeometry(o)` (C-model-core) : `x += p0.x ; y += p0.y ; p1 -= p0 ; p0 = (0,0)` (transformation encore identité à ce stade).

## Effets
ouvert, 2 points `[p0, p1]`, `t=0` = `start`. `closed: "never"`.

## Notes d'implémentation
Remplace le `line` du code actuel (`startX/startY/endX/endY`, `thickness` → `strokeWidth`, pas de pastilles : Q15).
