# Presk — Documentation du Comportement des Primitives

Ce document détaille le comportement, les propriétés, les ancres, les boîtes englobantes et les effets de chaque classe de primitive du noyau Presk, basé strictement sur la spécification officielle (`language/Presk-language-specification.md`) et le code source (`core/src/model/classes/`).

---

## 1. Propriétés Communes et Fondations

Tous les objets instensaciables partagent un ensemble de propriétés de base (`baseProps`) définies dans le noyau :
- **`x`, `y`** : Position de l'origine locale de l'objet dans le repère parent.
- **`pos`** : Position sous forme de point (`{x, y}`), équivalente à la combinaison de `x` et `y`.
- **`rotation`** : Rotation en degrés, dans le sens horaire, autour du pivot.
- **`scale`** : Échelle uniforme (nombre unique) autour du pivot.
- **`opacity`** : Opacité de l'objet, de 0 à 1.
- **`pivot`** : Point autour duquel s'appliquent la rotation et l'échelle. Par défaut `"center"` pour les formes bornées, ou `"pos"` pour les points, lignes et rayons.
- **`reveal`** : Effet universel de révélation (`"fade"` ou `"draw"` selon la classe de l'objet).

---

## 2. Référence des Primitives du Noyau

### 2.1 Rectangle (`rectangle`)
- **Famille** : `rectangle`
- **Créable** : Oui (`creatable: true`)
- **Propriétés** :
  - `width`, `height` (nombres $\ge 0$, animables, modifiables)
  - `fill`, `stroke` (couleurs, animables)
  - `strokeWidth` (nombre $\ge 0$, animable)
  - Pivot par défaut : `"center"` (supporte les 9 ancres standard).
- **Ancres (9 ancres standard)** : `topLeft`, `topCenter`, `topRight`, `centerLeft`, `center`, `centerRight`, `bottomLeft`, `bottomCenter`, `bottomRight` (lecture/écriture, suivent la rotation).
- **Effets** : `reveal` (`REVEAL_FADE`, effet `"fade"`).
- **Chemin (`main`)** : Polygone fermé aux 4 coins du rectangle.

### 2.2 Cercle (`circle`)
- **Famille** : `bounded`
- **Créable** : Oui
- **Propriétés** :
  - `radius` (nombre $\ge 0$, animable)
  - `fill`, `stroke` (couleurs, animables)
  - `strokeWidth` (nombre $\ge 0$, animable)
  - Pivot par défaut : `"center"` (valeurs autorisées : `"center"`, `"pos"`).
- **Ancres** : 9 ancres standard disponibles via `boundingBox`.
- **Effets** : `reveal` (`REVEAL_FADE`, effet `"fade"`).
- **Chemin (`main`)** : Polygone aplati représentant la circonférence du cercle.

### 2.3 Ellipse (`ellipse`)
- **Famille** : `bounded`
- **Créable** : Oui
- **Propriétés** :
  - `width`, `height` (nombres $\ge 0$, animables)
  - `fill`, `stroke` (couleurs, animables)
  - `strokeWidth` (nombre $\ge 0$, animable)
  - Pivot par défaut : `"center"` (valeurs autorisées : `"center"`, `"pos"`).
- **Ancres** : 9 ancres standard via `boundingBox`.
- **Effets** : `reveal` (`REVEAL_FADE`, effet `"fade"`).
- **Chemin (`main`)** : Polygone aplati représentant l'ellipse.

### 2.4 Arc (`arc`)
- **Famille** : `bounded`
- **Créable** : Oui
- **Propriétés** :
  - `radius` (nombre $\ge 0$, animable)
  - `startAngle`, `endAngle` (nombres en degrés, animables)
  - `stroke` (couleur, animable), `strokeWidth` (nombre $\ge 0$, animable) (pas de remplissage `fill`).
  - `start`, `end` (points en lecture seule correspondant aux extrémités de l'arc).
  - Pivot par défaut : `"center"`.
- **Ancres** : `start`, `end` (lecture seule, basées sur les angles et le rayon).
- **Effets** : `reveal` (`draw`, supporte l'effet de tracé progressif `"draw"` via `drawProgress`).
- **Chemin (`main`)** : Tracé de l'arc géométrique.

### 2.5 Polygone & Triangle (`polygon`, `triangle`)
- **Famille** : `bounded`
- **Créable** : Oui
- **Propriétés** :
  - `points` (liste de points, requis à l'initialisation : $\ge 3$ pour `polygon`, exactement 3 pour `triangle`).
  - `fill`, `stroke` (couleurs, animables), `strokeWidth` (nombre $\ge 0$).
  - `drawProgress` (progression du tracé pour l'effet reveal).
  - Pivot par défaut : `"center"`.
- **Ancres indexées** : `vertex[i]` (lecture/écriture, permet de déplacer ou lire chaque sommet par son indice).
- **Effets** : `reveal` (`draw`, supporte l'effet de tracé progressif `"draw"` via `drawProgress`).
- **Chemin (`main`)** : Polygone fermé reliant les sommets.

### 2.6 Ligne Brisée (`polyline`)
- **Famille** : `bounded`
- **Créable** : Oui
- **Propriétés** :
  - `points` (liste de points $\ge 2$, requis à l'init).
  - `closed` (booléen, non animable, indique si la polyline est fermée).
  - `stroke`, `strokeWidth`, `drawProgress`.
- **Ancres indexées** : `vertex[i]` (lecture/écriture).
- **Effets** : `reveal` (`draw`, supporte l'effet de tracé progressif `"draw"` via `drawProgress`).
- **Chemin (`main`)** : Tracé ouvert ou fermé selon `closed`.

### 2.7 Courbe (`curve`)
- **Famille** : `bounded`
- **Créable** : Oui
- **Propriétés** :
  - `points` (liste de points $\ge 2$).
  - `closed` (booléen).
  - `interpolation` (énumération : `"spline"` ou `"bezier"`).
  - `stroke`, `strokeWidth`, `drawProgress`.
  - `start`, `end` (points d'extrémité en lecture seule).
- **Ancres indexées** : `vertex[i]` (lecture/écriture).
- **Effets** : `reveal` (`draw`, supporte l'effet de tracé progressif `"draw"` via `drawProgress`).
- **Chemin (`main`)** : Tracé aplati calculé par interpolation spline ou chaîne de Bézier.

### 2.8 Point (`point`)
- **Famille** : `point`
- **Créable** : Oui
- **Propriétés** : Uniquement les propriétés de base (`x`, `y`, `pos`,). Pivot fixé à `"pos"`.
- **Ancres** : Aucune ancre propre (pas de géométrie surfacique).
- **Effets** : `reveal` (`REVEAL_FADE`, effet `"fade"`), qui ne sert à rien
- **Chemin** : Aucun.

### 2.9 Segment & Flèche (`segment`, `arrow`)
- **Famille** : `bounded`
- **Créable** : Oui
- **Propriétés** :
  - `start` (alias `p0`), `end` (alias `p1`) (points de début et de fin, lecture/écriture, animables).
  - `stroke`, `strokeWidth`, `drawProgress`.
  - `head` (`arrow` uniquement : `"end"`, `"start"`, `"both"`, `"none"`).
  - Après géométrie, l'origine `p0` est normalisée à `{0, 0}` et `x`/`y` portent la position de départ.
- **Ancres** : `start`, `end`.
- **Effets** : `reveal` (`draw`, supporte l'effet de tracé progressif `"draw"` via `drawProgress`).
- **Chemin (`main`)** : Segment de droite entre `start` et `end`.

### 2.10 Rayon & Ligne Infinie (`ray`, `line`)
- **Famille** : `unbounded`
- **Créable** : Oui
- **Propriétés** :
  - `ray` expose `origin` et `through` (points de départ et point traversé).
  - `line` expose `p1` et `p2` (deux points définissant la droite).
  - `stroke`, `strokeWidth`.
  - `localBounds()` retourne `null` (objets non bornés).
- **Ancres** : `origin`/`through` ou `p1`/`p2`.
- **Effets** : `reveal` (`REVEAL_FADE`, effet `"fade"`).

### 2.11 Texte (`text`)
- **Famille** : `rectangle` (hérite de `RectangleObject`)
- **Créable** : Oui
- **Propriétés** :
  - `text` (chaîne de caractères).
  - `color` (couleur du texte, animable).
  - `fontSize` (taille de police $> 0$).
  - `fontFamily` (police, ex: `"sans-serif"`).
  - `fontWeight` (`"normal"` ou `"bold"`).
  - `width`, `height` (en lecture seule, calculés automatiquement via le mesureur de texte).
- **Ancres** : 9 ancres standard (`topLeft` à `bottomRight`).
- **Effets** : `reveal` (`REVEAL_FADE`, effet `"fade"`).

### 2.12 Image (`image`)
- **Famille** : `rectangle` (hérite de `RectangleObject`)
- **Créable** : Oui
- **Propriétés** :
  - `url` (chemin/URL de l'image, requis à l'init).
  - `width`, `height` (dimensions modifiables ; si l'une est fournie, l'autre s'ajuste automatiquement selon le ratio naturel de l'image).
- **Ancres** : 9 ancres standard.
- **Effets** : `reveal` (`REVEAL_FADE`, effet `"fade"`).

### 2.13 Groupe (`group`)
- **Famille** : `rectangle` (hérite de `RectangleObject`)
- **Créable** : Oui (ou implicitement par les actions `group`)
- **Propriétés** :
  - `layout` (`"none"`, `"horizontal"`, `"vertical"`).
  - `gap`, `margin` (nombres $\ge 0$).
  - `presence` (visibilité/présence).
  - `localBounds()` : union des boîtes englobantes de tous les enfants, augmentée de la marge.
- **Ancres** : 9 ancres standard calculées à partir de la boîte englobante globale des enfants.
- **Effets** : `reveal` (`REVEAL_FADE`, effet `"fade"`).

### 2.14 Scène (`scene` / `SceneRoot`)
- **Famille** : `rectangle`
- **Créable** : Non (racine de la scène, créée par le moteur).
- **Propriétés (en lecture seule)** :
  - `width`, `height` (dimensions de la scène).
  - Les 9 ancres standard de la scène entière.
  - `focusOn` (objet ou tableau d'objets à cadrer).
  - `view` (région personnalisée `{ x, y, width, height }`).
  - `zoom` (facteur de zoom $> 0$).
- **Rôle** : Pilote le viewport et le cadrage de la vidéo affichée.
