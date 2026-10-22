# Classe `point` — point (ancre invisible)
Famille : **point** · Réf spec : §11.2, §11.3 · Fichier modèle : `core/src/model/classes/pointObject.ts` · Vue : aucune vue
(En cas de désaccord sur un **chemin de fichier** entre cette fiche et la fiche de tâche, la **tâche prévaut**.)

- **`pos`** : le point lui-même.
- **Pivot** : défaut `pos` ; valeurs permises : `center`, `pos`.
- **Propriétés communes** : `x y pos rotation scale opacity pivot` (voir C-model-core § baseProps)

## État initial (clés → défaut)
(état commun seulement) ; `pivot:"pos"`

## Propriétés propres
| nom | kind | writes | mode | anim. | order | contraintes / défaut |
|---|---|---|---|---|---|---|
| *(aucune propre)* | | | | | | |

## Ancres
`pos` est l'ancre (point, déjà dans les propriétés communes).

## Ancres indexées
aucune

## Géométrie locale / bornes
`reveal` présent, sans effet visible.

## Chemin `main`
`localBounds` = `null`. `family: "point"` : pas de `boundingBox` (`E_EXPR_INFINITE_REF`).

## Effets
aucun (`paths = {}`).

## Notes d'implémentation
Aucun rendu : pas de `PointView` (le registre de vues renvoie `null`).
