# ADR-013-paths-and-travel
**Chemins, longueur d'arc, `travel`** · Réf spec : §7.4, §8

## Contexte
Il faut des chemins paramétrés par longueur d'arc, valables pour contours fermés et tracés ouverts, déplaçables avec l'objet.

## Décision
- Tout chemin est converti en **`FlatPath`** (polyligne dense, `geom/flatPath.ts`) en **repère local** ; la table des longueurs cumulées donne `pointAt(t)` / `angleAt(t)` à vitesse constante. Rectangle, polygone, polyligne : sommets exacts. Cercle/ellipse : 720 segments. Arc : 1° max par segment (min 8). Bézier : 48 segments par courbe cubique.
- `t=0`, sens et fermeture : tableau §8.3, repris dans chaque `contracts/classes/<type>.md`.
- Chemin monde = `FlatPath` local transformé par `worldMatrix()` **à chaque requête** (seuls les 2 points du segment utile sont transformés). La longueur monde = longueur locale × échelle monde.
- Fermé : `t` modulo 1 (toute valeur réelle). Ouvert : `t` hors [0,1] = erreur de compilation si détectable (`PathSpec.closed` = `"never"`), sinon erreur d'exécution.
- `travel` pilote `x`,`y` (et `rotation` si `orient`) comme un tout ; un seul paramètre `t` : `t = from + (to − from) × p`, où `p` vient de `passProgress` (ADR-010 / T065).
- `anchor` : le point de l'objet posé sur le chemin (`pos` ou une des 9 ancres) ; on assigne via le `set` de la `PropSpec` correspondante, après avoir assigné `rotation`.
- `from: "current"` : résolu à la compilation (`engine/analyze/travelPlan.ts`).
- `pathAngle` : degrés, sens horaire écran, 0 vers +x : `atan2(dy, dx)` en repère y-bas. Sur un sommet : segment sortant (pas de lissage).

## Alternatives écartées
Évaluation analytique par type de forme : plus de code, plus de bugs, vitesse non constante sur ellipse.

## Conséquences
Précision suffisante pour de la vidéo. Les formes futures n'ont qu'à produire des points.

## Addendum : `from: "current"` et ordre des steps
Le suivi de la « dernière position atteinte sur ce chemin » ne considère que les actions **déclarées plus haut dans `steps`** (le planning est séquentiel, ADR-009). Une action `stop` déclarée plus bas que le `travel` concerné est ignorée pour ce calcul. Les documents doivent donc déclarer leurs actions dans l'ordre chronologique quand ils utilisent `from: "current"` (Q21).
