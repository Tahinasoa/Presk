# Presk — Primitives v1.0

Document compagnon de **`Presk — Spécification v1.0.md`**. La spec décrit le langage ; ce document décrit **chaque primitive** : à quoi elle sert, ses propriétés, ses ancres, son chemin, ses effets, et un exemple complet. La spec (§11.1) renvoie elle-même ce détail « classe par classe » à des documents distincts : c'est celui-ci.

> **Comment lire ce document**
> - **La spec prévaut** en cas de désaccord.
> - **†** : valeur ou comportement **choisi par le moteur**, que la spec ne fixe pas (valeurs par défaut, polices, etc.).
> - **‡** : **écart** avec la spec, à connaître (voir §6).
> - Chaque exemple est un **document complet** : vous pouvez le coller tel quel. Les exemples sont aussi fournis en fichiers `.json`.
> - Les couleurs : voir §2.6.

---

## 1. Quelle primitive choisir ?

| Je veux… | Utiliser |
|---|---|
| Un bloc, un bouton, un fond, une barre | `rectangle` |
| Du texte | `text` |
| Une photo, un logo | `image` |
| Un disque, un point visible, une planète | `circle` |
| Un ovale | `ellipse` |
| Un anneau, une jauge, une portion de cercle | `arc` |
| Une forme pleine à plusieurs côtés | `polygon` (3 côtés : `triangle`) |
| Une ligne brisée, un circuit, un schéma | `polyline` |
| Une courbe lisse | `curve` |
| Relier deux objets | `segment` (avec pointe : `arrow`) |
| Une droite de construction, un rayon | `line`, `ray` |
| Un centre mobile invisible | `point` |
| Ranger plusieurs objets ensemble | `group` |
| Zoomer, cadrer | la cible spéciale `scene` (§4) |

## 2. Concepts communs

### 2.1 Vie d'un objet
`create` instancie l'objet **invisible**. Il apparaît par son effet `reveal` (§2.8), soit plus tard par `animate`, soit immédiatement en l'écrivant dans `create` : `"reveal": true`. Un `group` est la seule exception : il est créé visible. L'objet existe et se positionne même invisible : ses ancres sont lisibles dès la création.

### 2.2 Propriétés communes
Toutes les primitives (sauf `scene`, en lecture seule) ont :

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `x` | nombre | 0 | — | oui | Position horizontale de l'origine locale (`pos`). |
| `y` | nombre | 0 | — | oui | Position verticale de l'origine locale (`pos`). |
| `pos` | point | (0, 0) | — | oui | Origine locale sous forme de point. Équivaut à `x` + `y`. |
| `rotation` | nombre | 0 | degrés, sens horaire | oui | Rotation autour du pivot. |
| `scale` | nombre | 1 | > 0 | oui | Échelle uniforme autour du pivot. |
| `opacity` | nombre | 1 | de 0 à 1 | oui | Opacité de l'objet (et, par multiplication, de ses enfants). |
| `pivot` | énumération | `center` | selon la famille | non | Point fixe de la rotation et de l'échelle (`create`/`set` seulement). |

`pos` est l'**origine locale** : le coin haut-gauche pour la famille rectangle, le centre pour `circle`, `ellipse` et `arc`, `start` pour `segment` et `arrow`, etc. (voir « En bref » de chaque fiche). Elle ne bouge pas quand l'objet tourne.
`pos` et `x`/`y` sont **équivalents** : en donner deux dans la même étape est une erreur (`E_PROPERTY_DUPLICATE`), de même qu'une ancre avec `x` ou `y`.

### 2.3 Pivot
La rotation et l'échelle se font autour du **pivot**. Famille rectangle : l'une des 9 ancres (`center` par défaut). Autres primitives bornées : `center` (centre de la boîte, par défaut) ou `pos`. `ray`, `line`, `point` : `pos`. Le pivot se donne à `create` ou `set` ; il ne s'anime pas.

### 2.4 Ancres et lecture des positions
- **Famille rectangle** (`rectangle`, `text`, `image`, `group`) : 9 ancres, `topLeft` `topCenter` `topRight` `centerLeft` `center` `centerRight` `bottomLeft` `bottomCenter` `bottomRight`. Elles **suivent la rotation** ; on peut les lire **et les affecter** : `"topLeft": "title.bottomLeft"` pose l'objet.
- **Primitives bornées** : leurs 9 points se lisent par `objet.boundingBox.<ancre>`, avec `.x`/`.y` ou `.width`/`.height`. La `boundingBox` reste **alignée sur les axes** (elle ne suit pas la rotation) et est en lecture seule.
- **Points propres** : `start`/`end`, `origin`/`through`, `p1`/`p2`, `vertex[i]`… selon la primitive.
- Une affectation d'ancre s'applique à l'objet modifié ; la valeur lue vient d'un autre (ou du même) objet : `"topCenter": "sun.boundingBox.bottomCenter"`.
- `top`, `left`, `right`, `bottom` **n'existent pas** : utilisez `topLeft.y`, `topLeft.x`, `bottomRight.x`, `bottomRight.y`.

### 2.5 Expressions (mémo)
Une valeur est une **expression** quand la propriété est un nombre ou un point et que vous donnez une chaîne.
- Références : `objet.propriété`, `objet.ancre.x`, `objet.boundingBox.center.y`, `objet.vertex[2].x`, `scene.center`, `scene.width`, `scene.view.topLeft`.
- Arithmétique `+ - * /` **sur des nombres seulement** (pas de parenthèses) ; `-` unaire accepté†.
- **Un point ne s'additionne pas** : `a.center + 1` est une erreur ; écrivez `a.center.x + 1`.
- `objet.pathX(main, t)`, `pathY`, `pathAngle` : position et angle sur le chemin (§2.7).
- Dans un `create`, on ne peut référencer qu'un objet **créé plus haut**.
- Lire un **effet** (`a.reveal`) ou une propriété non numérique (`a.fill`) est une erreur.
- Un point littéral s'écrit `{ "x": 100, "y": 50 }`† ; chaque coordonnée peut être une expression.

### 2.6 Style et couleurs
- `fill` (remplissage), `stroke` (contour/trait), `strokeWidth` (épaisseur), `color` (texte).
- **Formats acceptés** : `#rgb`, `#rrggbb` ; les 26 noms **black silver gray white maroon red purple fuchsia green lime olive yellow navy blue teal aqua orange pink brown cyan magenta gold violet indigo lightgray darkgray** ; ou un entier (ex. `65280`). Rien d'autre : `rgb()`, `hsl()` et les noms CSS hors de cette liste donnent `E_COLOR_INVALID`.
- **Transparence** : `opacity` règle l'objet entier. Avec l'extension couleurs (**P10**), `#rgba` et `#rrggbbaa` portent aussi un alpha propre à la couleur, et `animate` l'interpole.
- **Pas de « sans remplissage »** : `circle`, `ellipse`, `polygon`, `triangle` ont toujours un remplissage ; voir §6, point 1. `arc`, `polyline`, `curve`, `segment`, `arrow`, `ray`, `line` n'en ont pas.
- `strokeWidth` vaut **0 par défaut†** pour les formes pleines (donc pas de contour), **2†** pour les tracés.

### 2.7 Chemins, `travel` et `pathX`
Un **chemin** est paramétré par `t` de 0 à 1 **à vitesse constante** (proportionnel à la distance parcourue). Il suit l'objet (position, rotation, échelle).

| Primitive | Chemin `main` | `t = 0` | Sens | Fermé ? |
|---|---|---|---|---|
| `rectangle`, `text`, `image`, `group` | contour de la boîte | coin haut-gauche | horaire | oui |
| `circle`, `ellipse` | contour | point le plus à droite | horaire | oui |
| `arc` | l'arc | `startAngle` | vers `endAngle` | non |
| `polygon`, `triangle` | contour | `vertex[0]` | ordre des sommets | oui |
| `polyline`, `curve` | le tracé | premier point | ordre des points | selon `closed` |
| `segment`, `arrow` | le trait | `start` | vers `end` | non |
| `ray`, `line`, `point` | **aucun** | — | — | — |

- Fermé : `t` peut sortir de [0, 1] (modulo 1). Ouvert : hors de [0, 1] est une erreur.
- `travel` (spec §8) : `target` (l'objet déplacé), `along` (`"objet"` ou `"objet.chemin"`), `from`/`to`, `duration` **ou** `speed`, `orient`, `anchor`. `from: "current"` reprend où l'objet s'était arrêté.
- `anchor` : le point de l'objet posé sur le chemin (`pos` par défaut, ou une des 9 ancres d'un rectangle).

### 2.8 Effets : `reveal`
`reveal` fait apparaître ou disparaître. Valeurs : `true` (variante `default`), `false` (rejoue **à l'envers** la dernière variante jouée), ou le nom d'une variante.

| Primitive | Variantes |
|---|---|
| `rectangle`, `text`, `image`, `group`, `circle`, `ellipse`, `ray`, `line`, `point` | `default` (fondu) |
| `arc`, `polygon`, `triangle`, `polyline`, `curve`, `segment`, `arrow` | `default` (fondu) et `draw` (tracé progressif) |

`animate` d'un seul effet n'exige pas de `duration` (0,5 s par défaut†, `cubicOut`†). Un effet ne se lit pas dans une expression et ne se lie pas (`bind`). `reveal` n'agit pas sur `opacity` : les deux sont indépendants.

### 2.9 Ce qui s'anime, ce qui se lie
- `animate` interpole les **nombres**, les **points** (y compris les ancres) et les **couleurs**. Pas les chaînes, énumérations, booléens, ni les listes de points : ceux-là se changent par `set`.
- `bind` accepte les **nombres** et les **points**. Pas les couleurs, pas les effets.
- Les propriétés en **lecture seule** (`width`/`height` d'un `text`, `start`/`end` d'un `arc` ou d'une `curve`) se lisent seulement.
- Un `bind` relit ses sources à chaque image **dans l'ordre de déclaration** : déclarez l'`animate` de la source **avant** le `bind` pour éviter un retard d'une image.

---

## 3. Les primitives

### `rectangle`

Rectangle plein, avec contour optionnel. Classe de base de `text`, `image` et `group`.

**En bref**

| | |
|---|---|
| Famille | rectangle (9 ancres standard) |
| `pos` = | coin haut-gauche |
| Pivot | les 9 ancres, défaut `center` |
| Chemin (`travel`, `pathX`…) | contour, **fermé** ; `t=0` au coin haut-gauche, sens horaire |
| `reveal` | `default` (fondu) |
| Ancres lisibles | 9 ancres standard, `boundingBox` |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `width` | nombre | 100† | ≥ 0 | oui | Largeur locale, avant rotation. |
| `height` | nombre | 100† | ≥ 0 | oui | Hauteur locale, avant rotation. |
| `fill` | couleur | `#9c9c9c`† | — | oui | Couleur de remplissage. |
| `stroke` | couleur | `#ffffff`† | — | oui | Couleur du contour (visible seulement si `strokeWidth` > 0). |
| `strokeWidth` | nombre | 0† | ≥ 0 | oui | Épaisseur du contour. **0 = pas de contour.** |

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "box", "type": "rectangle", "properties": {"width": 200, "height": 80, "fill": "#3b82f6", "stroke": "white", "strokeWidth": 3, "pos": {"x": 100, "y": 100}}},
    {"action": "animate", "target": "box", "properties": {"reveal": true}},
    {"action": "animate", "target": "box", "properties": {"width": 400, "fill": "orange"}, "duration": 1.5, "ease": "cubicInOut"},
    {"action": "animate", "target": "box", "properties": {"rotation": 15}, "duration": 1, "start": "<"}
  ] }
```

*Ce que l'on voit* : Un rectangle bleu à contour blanc apparaît en fondu, puis s'élargit de 200 à 400 en virant à l'orange, tout en pivotant de 15°. Durée : 2 s.

**À savoir**

- **`strokeWidth` vaut 0 par défaut†** : `stroke` seul ne dessine rien, il faut donner une épaisseur.
- `width` et `height` s'appliquent **avant** la rotation : un rectangle tourné de 90° a toujours `width` large dans son propre repère. Les ancres standard suivent la rotation ; `boundingBox` reste aligné sur les axes.
- `scale` agrandit tout (contour compris) ; `width`/`height` ne changent que la forme.

### `text`

Texte sur une ligne. Les dimensions sont **calculées** par le moteur (mesure réelle de la police) dès la création.

**En bref**

| | |
|---|---|
| Famille | rectangle (9 ancres standard) |
| `pos` = | coin haut-gauche de la boîte du texte |
| Pivot | les 9 ancres, défaut `center` |
| Chemin (`travel`, `pathX`…) | contour de la boîte, **fermé** |
| `reveal` | `default` (fondu) |
| Ancres lisibles | 9 ancres standard, `boundingBox` |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `text` | chaîne | `""` | — | non | Contenu. Se change avec `set` (pas animable). |
| `color` | couleur | `#ffffff`† | — | oui | Couleur du texte. |
| `fontSize` | nombre | 32† | > 0 | oui | Taille en unités de scène (la boîte est remesurée). |
| `fontFamily` | chaîne | `sans-serif`† | — | non | Famille de police. |
| `fontWeight` | énumération | `bold`† | `normal` · `bold` | non | Graisse. |
| `width` | nombre | mesurée | lecture seule | lecture seule | Largeur mesurée. |
| `height` | nombre | mesurée | lecture seule | lecture seule | Hauteur mesurée. |

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "title", "type": "text", "properties": {"text": "Presk", "fontSize": 64, "color": "white", "pos": {"x": 100, "y": 100}}},
    {"action": "create", "target": "subtitle", "type": "text", "properties": {"text": "un langage d'animation", "fontSize": 28, "color": "silver", "topLeft": "title.bottomLeft"}},
    {"action": "animate", "target": "title", "properties": {"reveal": true}},
    {"action": "animate", "target": "subtitle", "properties": {"reveal": true}},
    {"action": "set", "target": "subtitle", "properties": {"text": "v1.0"}, "start": 2},
    {"action": "animate", "target": "title", "properties": {"fontSize": 96}, "duration": 1, "start": 2}
  ] }
```

*Ce que l'on voit* : Le titre puis le sous-titre apparaissent ; le sous-titre est posé sous le titre grâce à `title.bottomLeft`. À 2 s le sous-titre devient « v1.0 » et le titre grossit. Durée : 3 s.

**À savoir**

- Le texte se change par **`set`** : `animate text` est refusé (`E_PROPERTY_NOT_ANIMATABLE`).
- `width` et `height` sont en **lecture seule** : on ne dimensionne pas un texte, on change `fontSize`.
- `animate fontSize` remesure la boîte à chaque image : toute ancre ou `bind` qui s'appuie sur ce texte suit.
- Une seule ligne : pas de retour à la ligne géré par le moteur†.
- Pas de `fill`, `stroke` ni `strokeWidth` sur `text` (choix du moteur †).
- Une ancre de texte peut être lue dès la création : `"topLeft": "title.bottomLeft"` fonctionne parce que la taille est connue tout de suite.

### `image`

Image bitmap chargée depuis une URL.

**En bref**

| | |
|---|---|
| Famille | rectangle (9 ancres standard) |
| `pos` = | coin haut-gauche |
| Pivot | les 9 ancres, défaut `center` |
| Chemin (`travel`, `pathX`…) | contour, **fermé** |
| `reveal` | `default` (fondu) |
| Ancres lisibles | 9 ancres standard, `boundingBox` |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `url` | chaîne | requis | non vide | non | Adresse de l'image (relative à la page ou absolue). |
| `width` | nombre | taille naturelle | ≥ 0 | oui | Si seule `width` est donnée, la hauteur suit le ratio. |
| `height` | nombre | taille naturelle | ≥ 0 | oui | Si seule `height` est donnée, la largeur suit le ratio. |

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "logo", "type": "image", "properties": {"url": "logo.png", "width": 240, "pos": {"x": 100, "y": 100}, "reveal": true}},
    {"action": "animate", "target": "logo", "properties": {"x": 500}, "duration": 2, "ease": "sineInOut"}
  ] }
```

*Ce que l'on voit* : Le logo est visible dès le début (`reveal` dans `create`) et glisse vers la droite en 2 s.

**À savoir**

- `url` est obligatoire (`E_FIELD_REQUIRED`).
- Donner `width` **et** `height` déforme l'image ; n'en donner qu'un conserve le ratio.
- L'image est préchargée avant la compilation : si l'URL est inaccessible, le chargement du document échoue.
- L'image est préchargée avant la compilation : une URL introuvable fait échouer le chargement du document.

### `group`

Conteneur d'objets. Créé **visible**. Se crée presque toujours implicitement par l'action `group`.

**En bref**

| | |
|---|---|
| Famille | rectangle (9 ancres standard) |
| `pos` = | coin haut-gauche de la boîte des enfants (+ marge) |
| Pivot | les 9 ancres, défaut `center` |
| Chemin (`travel`, `pathX`…) | contour de la boîte, **fermé** |
| `reveal` | `default` (fondu) |
| Ancres lisibles | 9 ancres standard, `boundingBox` |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `layout` | énumération | `none` | `vertical` · `horizontal` · `none` | non | Placement automatique des enfants. |
| `gap` | nombre | 0 | ≥ 0 | non | Espace entre deux enfants successifs. |
| `margin` | nombre | 0 | ≥ 0 (nombre seulement ‡) | non | Marge intérieure autour des enfants. |

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "b1", "type": "rectangle", "properties": {"width": 160, "height": 48, "fill": "#334155", "pos": {"x": 100, "y": 100}, "reveal": true}},
    {"action": "create", "target": "b2", "type": "rectangle", "properties": {"width": 220, "height": 48, "fill": "#475569", "pos": {"x": 100, "y": 100}, "reveal": true}},
    {"action": "create", "target": "b3", "type": "rectangle", "properties": {"width": 180, "height": 48, "fill": "#64748b", "pos": {"x": 100, "y": 100}, "reveal": true}},
    {"action": "group", "target": "menu", "properties": {"children": ["b1", "b2", "b3"], "layout": "vertical", "gap": 20, "margin": 15}, "duration": 0.6, "ease": "cubicInOut"},
    {"action": "animate", "target": "menu", "properties": {"x": 600}, "duration": 1.5, "ease": "cubicOut"}
  ] }
```

*Ce que l'on voit* : Trois boutons s'empilent verticalement (écart 20, marge 15) pendant 0,6 s, puis le groupe entier glisse de 600 vers la droite. Durée : 2,1 s.

**À savoir**

- On ne donne **pas** `children` dans `create` : les enfants se rattachent par l'action `group` (`properties.children`), qui crée le groupe s'il n'existe pas (**groupe implicite**).
- Un groupe est créé **visible**. Son `reveal` ne se propage **pas** aux enfants : un enfant non révélé reste invisible.
- Les transformations du groupe (`x`, `y`, `rotation`, `scale`) s'appliquent à tous les enfants ; son `opacity` **multiplie** la leur.
- `layout` place les enfants à la suite, alignés sur le bord de départ (gauche en `vertical`, haut en `horizontal`)†, séparés de `gap`, à `margin` du bord. `duration` sur l'action `group` anime ce placement. `line` et `ray` sont interdites dans un groupe à `layout`.
- **`margin` n'accepte qu'un nombre‡** : la forme `{ top, right, bottom, left }` de la spec §10.2 n'est pas implémentée.
- Rattacher un objet **ne le fait pas sauter** : son apparence (position, rotation, échelle) est conservée. `ungroup` fait de même.
- `repeat` et `repeatMode` sont interdits sur `group`.
- Le `pos` du groupe n'est **pas** recalé sur la boîte de ses enfants† ; ses ancres, elles, suivent la boîte des enfants.

### `circle`

Disque.

**En bref**

| | |
|---|---|
| Famille | bornée (via `boundingBox`) |
| `pos` = | **centre** |
| Pivot | `center` (défaut) ou `pos` |
| Chemin (`travel`, `pathX`…) | cercle, **fermé** ; `t=0` au point le plus à droite, sens horaire |
| `reveal` | `default` (fondu) |
| Ancres lisibles | `boundingBox` |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `radius` | nombre | 50† | ≥ 0 | oui | Rayon. |
| `fill` | couleur | `#9c9c9c`† | — | oui | Couleur de remplissage. |
| `stroke` | couleur | `#ffffff`† | — | oui | Couleur du contour (visible seulement si `strokeWidth` > 0). |
| `strokeWidth` | nombre | 0† | ≥ 0 | oui | Épaisseur du contour. **0 = pas de contour.** |

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "sun", "type": "circle", "properties": {"radius": 60, "fill": "gold", "pos": "scene.center"}},
    {"action": "create", "target": "label", "type": "text", "properties": {"text": "Soleil", "fontSize": 24, "topCenter": "sun.boundingBox.bottomCenter"}},
    {"action": "animate", "target": "sun", "properties": {"reveal": true}},
    {"action": "animate", "target": "label", "properties": {"reveal": true}, "start": "<0.2"},
    {"action": "animate", "target": "sun", "properties": {"radius": 90}, "duration": 1.5, "ease": "bounceOut"}
  ] }
```

*Ce que l'on voit* : Un disque doré au centre de la scène, son étiquette juste dessous ; le disque grossit de 60 à 90 en rebondissant. Durée : 2,2 s.

**À savoir**

- **Un cercle est plein par défaut†** (gris, sans contour). Pour un **anneau** (orbite, cible…), utilisez un `arc` de 0° à 360° : voir `arc` et l'exemple `point`.
- `pos` est le **centre** : `"pos": "scene.center"` centre le cercle, alors que le même `pos` sur un rectangle place son coin.
- Pas d'ancres directes (`topLeft`…) : utilisez `boundingBox.topLeft` etc.

### `ellipse`

Ellipse alignée sur les axes (avant rotation).

**En bref**

| | |
|---|---|
| Famille | bornée (via `boundingBox`) |
| `pos` = | **centre** |
| Pivot | `center` (défaut) ou `pos` |
| Chemin (`travel`, `pathX`…) | ellipse, **fermé** ; `t=0` au point le plus à droite, sens horaire |
| `reveal` | `default` (fondu) |
| Ancres lisibles | `boundingBox` |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `width` | nombre | 100† | ≥ 0 | oui | Largeur totale. |
| `height` | nombre | 60† | ≥ 0 | oui | Hauteur totale. |
| `fill` | couleur | `#9c9c9c`† | — | oui | Couleur de remplissage. |
| `stroke` | couleur | `#ffffff`† | — | oui | Couleur du contour (visible seulement si `strokeWidth` > 0). |
| `strokeWidth` | nombre | 0† | ≥ 0 | oui | Épaisseur du contour. **0 = pas de contour.** |

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "e", "type": "ellipse", "properties": {"width": 300, "height": 120, "fill": "#a855f7", "pos": "scene.center"}},
    {"action": "animate", "target": "e", "properties": {"reveal": true}},
    {"action": "animate", "target": "e", "properties": {"width": 120, "height": 300}, "duration": 2, "ease": "backInOut"}
  ] }
```

*Ce que l'on voit* : Une ellipse violette large (300×120) devient haute (120×300), avec un léger recul avant l'arrivée. Durée : 2,5 s.

**À savoir**

- Mêmes remarques que `circle` : pleine par défaut†, `pos` au centre, pas d'ancres directes.
- L'exemple d'orbite de la spec (§8.8) ne donne que `stroke` : avec les défauts du moteur†, cette ellipse s'affiche en **disque gris sans contour** (voir §6, point 1).

### `arc`

Portion de cercle (trait seul, sans remplissage).

**En bref**

| | |
|---|---|
| Famille | bornée (via `boundingBox`) |
| `pos` = | **centre** du cercle porteur |
| Pivot | `center` (défaut) ou `pos` |
| Chemin (`travel`, `pathX`…) | tracé, **ouvert** ; `t=0` à `startAngle`, vers `endAngle` |
| `reveal` | `default` (fondu) ou `draw` (tracé progressif) |
| Ancres lisibles | `boundingBox` |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `radius` | nombre | 50† | ≥ 0 | oui | Rayon du cercle porteur. |
| `startAngle` | nombre | 0† | degrés | oui | Angle de départ (0 = à droite, sens horaire). |
| `endAngle` | nombre | 90† | degrés | oui | Angle d'arrivée. |
| `start` | point | — | lecture seule | lecture seule | Point de l'arc à `startAngle` (repère de la scène). |
| `end` | point | — | lecture seule | lecture seule | Point de l'arc à `endAngle`. |
| `stroke` | couleur | `#9c9c9c`† | — | oui | Couleur du trait. |
| `strokeWidth` | nombre | 2† | ≥ 0 | oui | Épaisseur du trait. |

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "gauge", "type": "arc", "properties": {"radius": 100, "startAngle": -90, "endAngle": -90, "stroke": "gold", "strokeWidth": 10, "pos": "scene.center"}},
    {"action": "create", "target": "dot", "type": "circle", "properties": {"radius": 8, "fill": "white", "pos": "gauge.end"}},
    {"action": "animate", "target": "gauge", "properties": {"reveal": true}, "duration": 0.3},
    {"action": "animate", "target": "gauge", "properties": {"endAngle": 180}, "duration": 2, "ease": "cubicOut"},
    {"action": "animate", "target": "dot", "properties": {"reveal": true}, "duration": 0.3, "start": "<"},
    {"action": "bind", "target": "dot", "properties": {"pos": "gauge.end"}, "start": "<"}
  ] }
```

*Ce que l'on voit* : Un arc doré part du haut et se referme dans le sens horaire sur 270° ; un point blanc suit sa pointe (`gauge.end`). Durée : 2,3 s.

**À savoir**

- C'est un **trait seul** : pas de `fill`. Pour un anneau complet : `startAngle: 0`, `endAngle: 360`.
- Les angles sont en degrés, **sens horaire**, 0° = à droite (3 heures), donc −90° = en haut. Les valeurs négatives sont acceptées.
- `start` et `end` sont en **lecture seule** : on les lit (`gauge.end`) mais on ne les affecte pas. Pour déplacer la pointe, animez `endAngle`.
- Un arc est un chemin **ouvert** : `travel` y va de `startAngle` à `endAngle` ; un anneau 0→360 revient à son point de départ, ce qui permet une boucle continue avec `repeat`.

### `polygon`

Polygone plein défini par ses sommets (repère local).

**En bref**

| | |
|---|---|
| Famille | bornée (via `boundingBox`) |
| `pos` = | origine du repère des points |
| Pivot | `center` (défaut) ou `pos` |
| Chemin (`travel`, `pathX`…) | contour, **fermé** ; `t=0` à `vertex[0]` |
| `reveal` | `default` (fondu) ou `draw` (tracé progressif) |
| Ancres lisibles | `boundingBox`, `vertex[i]` |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `points` | liste de points | requis | ≥ 3 sommets `{x,y}` | non | Sommets dans le repère local de l'objet. |
| `fill` | couleur | `#9c9c9c`† | — | oui | Couleur de remplissage. |
| `stroke` | couleur | `#ffffff`† | — | oui | Couleur du contour (visible seulement si `strokeWidth` > 0). |
| `strokeWidth` | nombre | 0† | ≥ 0 | oui | Épaisseur du contour. **0 = pas de contour.** |

**Sommets** : `vertex[i]` (i = 0, 1, …) donne le sommet n° i **en coordonnées de la scène**. Il se lit dans une expression (`"pent.vertex[2]"`, `"pent.vertex[2].x"`) et s'affecte comme une propriété (`"vertex[0]": {"x":260,"y":120}`), ce qui le rend animable et liable. Un indice hors bornes est une erreur d'exécution (`E_ANCHOR_INDEX`).

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "pent", "type": "polygon", "properties": {"points": [{"x": 50, "y": 0}, {"x": 100, "y": 38}, {"x": 81, "y": 97}, {"x": 19, "y": 97}, {"x": 0, "y": 38}], "fill": "#22c55e", "stroke": "white", "strokeWidth": 2, "pos": {"x": 300, "y": 200}}},
    {"action": "create", "target": "marker", "type": "circle", "properties": {"radius": 6, "fill": "red", "pos": "pent.vertex[2]"}},
    {"action": "animate", "target": "pent", "properties": {"reveal": "draw"}, "duration": 1.5},
    {"action": "animate", "target": "marker", "properties": {"reveal": true}},
    {"action": "animate", "target": "pent", "properties": {"vertex[0]": {"x": 260, "y": 120}}, "duration": 1}
  ] }
```

*Ce que l'on voit* : Un pentagone se trace, un repère rouge apparaît sur son sommet n° 2, puis le sommet n° 0 est déplacé vers (260, 120). Durée : 3 s.

**À savoir**

- `points` est obligatoire, **au moins 3** sommets, et ne s'anime pas. Pour déformer, affectez `vertex[i]`.
- Les sommets de `points` sont dans le **repère local** de l'objet (l'origine est `pos`) ; `vertex[i]` se lit et s'affecte en **coordonnées de la scène** (rotation et échelle comprises).
- `pos` est l'origine du repère des points, **pas** le centre de la forme.
- `fill` et `stroke` suivent les mêmes règles que pour `rectangle` (`strokeWidth` 0 = pas de contour).

### `triangle`

Polygone à exactement 3 sommets.

**En bref**

| | |
|---|---|
| Famille | bornée (via `boundingBox`) |
| `pos` = | origine du repère des points |
| Pivot | `center` (défaut) ou `pos` |
| Chemin (`travel`, `pathX`…) | contour, **fermé** ; `t=0` à `vertex[0]` |
| `reveal` | `default` (fondu) ou `draw` (tracé progressif) |
| Ancres lisibles | `boundingBox`, `vertex[i]` |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `points` | liste de points | requis | exactement 3 sommets | non | Les trois sommets, repère local. |
| `fill` | couleur | `#9c9c9c`† | — | oui | Couleur de remplissage. |
| `stroke` | couleur | `#ffffff`† | — | oui | Couleur du contour (visible seulement si `strokeWidth` > 0). |
| `strokeWidth` | nombre | 0† | ≥ 0 | oui | Épaisseur du contour. **0 = pas de contour.** |

**Sommets** : `vertex[i]` (i = 0, 1, …) donne le sommet n° i **en coordonnées de la scène**. Il se lit dans une expression (`"pent.vertex[2]"`, `"pent.vertex[2].x"`) et s'affecte comme une propriété (`"vertex[0]": {"x":260,"y":120}`), ce qui le rend animable et liable. Un indice hors bornes est une erreur d'exécution (`E_ANCHOR_INDEX`).

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "tri", "type": "triangle", "properties": {"points": [{"x": 0, "y": 0}, {"x": 120, "y": 0}, {"x": 60, "y": 100}], "fill": "#f97316", "pos": {"x": 300, "y": 200}}},
    {"action": "animate", "target": "tri", "properties": {"reveal": "draw"}, "duration": 1},
    {"action": "animate", "target": "tri", "properties": {"scale": 1.5}, "duration": 1, "ease": "backOut"}
  ] }
```

*Ce que l'on voit* : Le triangle se trace, puis grossit de 50 % avec un léger dépassement. Durée : 2 s.

**À savoir**

- Exactement **3** sommets (`E_VALUE_RANGE` sinon). Pour le reste, voir `polygon`.
- `reveal: "draw"` trace d'abord le contour, puis le remplissage apparaît à la fin du tracé.

### `polyline`

Ligne brisée, ouverte ou fermée (trait seul, sans remplissage).

**En bref**

| | |
|---|---|
| Famille | bornée (via `boundingBox`) |
| `pos` = | origine du repère des points |
| Pivot | `center` (défaut) ou `pos` |
| Chemin (`travel`, `pathX`…) | tracé ; **ouvert**, ou **fermé** si `closed:true`. `t=0` au premier point |
| `reveal` | `default` (fondu) ou `draw` (tracé progressif) |
| Ancres lisibles | `boundingBox`, `vertex[i]` |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `points` | liste de points | requis | ≥ 2 sommets | non | Sommets, repère local. |
| `closed` | booléen | `false` | — | non | Referme la ligne vers le premier point. |
| `stroke` | couleur | `#9c9c9c`† | — | oui | Couleur du trait. |
| `strokeWidth` | nombre | 2† | ≥ 0 | oui | Épaisseur du trait. |

**Sommets** : `vertex[i]` (i = 0, 1, …) donne le sommet n° i **en coordonnées de la scène**. Il se lit dans une expression (`"pent.vertex[2]"`, `"pent.vertex[2].x"`) et s'affecte comme une propriété (`"vertex[0]": {"x":260,"y":120}`), ce qui le rend animable et liable. Un indice hors bornes est une erreur d'exécution (`E_ANCHOR_INDEX`).

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "wire", "type": "polyline", "properties": {"points": [{"x": 0, "y": 0}, {"x": 200, "y": 0}, {"x": 200, "y": 100}, {"x": 400, "y": 100}], "stroke": "#22c55e", "strokeWidth": 4, "pos": {"x": 100, "y": 300}}},
    {"action": "animate", "target": "wire", "properties": {"reveal": "draw"}, "duration": 2, "ease": "linear"}
  ] }
```

*Ce que l'on voit* : Une ligne brisée verte se trace en 2 s.

**Circuit fermé et `travel`**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "circuit", "type": "polyline", "properties": {"points": [{"x": 0, "y": 0}, {"x": 300, "y": 0}, {"x": 300, "y": 200}, {"x": 0, "y": 200}], "closed": true, "stroke": "#22c55e", "strokeWidth": 4, "pos": {"x": 400, "y": 260}}},
    {"action": "create", "target": "electron", "type": "circle", "properties": {"radius": 8, "fill": "yellow", "x": "circuit.pathX(main, 0)", "y": "circuit.pathY(main, 0)"}},
    {"action": "animate", "target": "circuit", "properties": {"reveal": "draw"}, "duration": 1},
    {"action": "animate", "target": "electron", "properties": {"reveal": true}, "duration": 0.3},
    {"action": "travel", "target": "electron", "along": "circuit", "duration": 4, "repeat": 3}
  ] }
```

*Ce que l'on voit* : Un circuit fermé : un électron jaune en fait 3 fois le tour (`closed: true` rend le chemin fermé). Durée : 13,3 s.

**À savoir**

- Pas de `fill` (choix du moteur†) : pour une forme pleine, utilisez `polygon`.
- `closed: true` referme la ligne **et** en fait un chemin fermé, utilisable pour un `travel` en boucle ; ouverte, `t` doit rester dans [0, 1].
- `points` ne s'anime pas ; affectez `vertex[i]` pour déformer.

### `curve`

Courbe lissée passant par les points (`spline`) ou définie par des points de contrôle (`bezier`).

**En bref**

| | |
|---|---|
| Famille | bornée (via `boundingBox`) |
| `pos` = | origine du repère des points |
| Pivot | `center` (défaut) ou `pos` |
| Chemin (`travel`, `pathX`…) | tracé ; **ouvert**, ou **fermé** si `closed:true` |
| `reveal` | `default` (fondu) ou `draw` (tracé progressif) |
| Ancres lisibles | `boundingBox`, `vertex[i]` |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `points` | liste de points | requis | ≥ 2 sommets | non | Points de la courbe ou de contrôle. |
| `closed` | booléen | `false` | — | non | Referme la courbe. |
| `interpolation` | énumération | `spline` | `spline` · `bezier` | non | Mode d'interpolation. |
| `start` | point | — | lecture seule | lecture seule | Premier point du chemin. |
| `end` | point | — | lecture seule | lecture seule | Dernier point du chemin. |
| `stroke` | couleur | `#9c9c9c`† | — | oui | Couleur du trait. |
| `strokeWidth` | nombre | 2† | ≥ 0 | oui | Épaisseur du trait. |

**Sommets** : `vertex[i]` (i = 0, 1, …) donne le sommet n° i **en coordonnées de la scène**. Il se lit dans une expression (`"pent.vertex[2]"`, `"pent.vertex[2].x"`) et s'affecte comme une propriété (`"vertex[0]": {"x":260,"y":120}`), ce qui le rend animable et liable. Un indice hors bornes est une erreur d'exécution (`E_ANCHOR_INDEX`).

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "wave", "type": "curve", "properties": {"points": [{"x": 0, "y": 100}, {"x": 100, "y": 0}, {"x": 200, "y": 100}, {"x": 300, "y": 0}], "stroke": "#38bdf8", "strokeWidth": 5, "pos": {"x": 100, "y": 200}}},
    {"action": "create", "target": "arch", "type": "curve", "properties": {"points": [{"x": 0, "y": 0}, {"x": 0, "y": 100}, {"x": 100, "y": 100}, {"x": 100, "y": 0}], "interpolation": "bezier", "stroke": "#f472b6", "strokeWidth": 5, "pos": {"x": 600, "y": 200}}},
    {"action": "animate", "target": "wave", "properties": {"reveal": "draw"}, "duration": 1.5},
    {"action": "animate", "target": "arch", "properties": {"reveal": "draw"}, "duration": 1.5, "start": "<"}
  ] }
```

*Ce que l'on voit* : Une courbe `spline` (bleue) et une courbe `bezier` (rose) se tracent ensemble en 1,5 s.

**À savoir**

- `spline` (défaut) : la courbe **passe par** tous les points.
- `bezier` : les points sont `[P0, C1, C2, P1, C3, C4, P2, …]` (cubiques enchaînées). Il faut **3n+1** points (ouvert) ou **3n** points (fermé), sinon `E_VALUE_RANGE`†.
- `vertex[i]` renvoie les points **que vous avez donnés**, pas les points de la courbe lissée. `start` et `end` sont en lecture seule.
- Pas de `fill`†.

### `segment`

Segment de droite entre deux points.

**En bref**

| | |
|---|---|
| Famille | bornée (via `boundingBox`) |
| `pos` = | `start` |
| Pivot | `center` (défaut) ou `pos` |
| Chemin (`travel`, `pathX`…) | tracé, **ouvert** ; `t=0` à `start`, vers `end` |
| `reveal` | `default` (fondu) ou `draw` (tracé progressif) |
| Ancres lisibles | `boundingBox` |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `start` | point | (0, 0) | — | oui | Point de départ (repère de la scène). Ne déplace pas `end`. |
| `end` | point | (100, 0) | — | oui | Point d'arrivée. Ne déplace pas `start`. |
| `stroke` | couleur | `#9c9c9c`† | — | oui | Couleur du trait. |
| `strokeWidth` | nombre | 2† | ≥ 0 | oui | Épaisseur du trait. |

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "a", "type": "rectangle", "properties": {"width": 60, "height": 60, "fill": "#3b82f6", "pos": {"x": 100, "y": 300}}},
    {"action": "create", "target": "b", "type": "rectangle", "properties": {"width": 60, "height": 60, "fill": "#ef4444", "pos": {"x": 400, "y": 300}}},
    {"action": "create", "target": "link", "type": "segment", "properties": {"stroke": "white", "strokeWidth": 3}},
    {"action": "animate", "target": "a", "properties": {"reveal": true}, "duration": 0.3, "start": 0},
    {"action": "animate", "target": "b", "properties": {"reveal": true}, "duration": 0.3, "start": 0},
    {"action": "animate", "target": "b", "properties": {"x": 900}, "duration": 2, "start": 0.3, "ease": "sineInOut"},
    {"action": "bind", "target": "link", "properties": {"start": "a.center", "end": "b.center"}, "start": "<"},
    {"action": "animate", "target": "link", "properties": {"reveal": true}, "duration": 0.3, "start": "<"}
  ] }
```

*Ce que l'on voit* : Un trait relie le centre d'un carré bleu et celui d'un carré rouge ; le carré rouge glisse vers la droite et le trait suit. Durée : 2,3 s.

**À savoir**

- `start` et `end` sont **indépendants** : en affecter un ne déplace pas l'autre. C'est ce qui permet de relier deux objets par `bind`.
- `pos` est la translation de l'ensemble : l'affecter déplace `start` **et** `end`.
- Quand vous donnez `start` et `end` à `create`, `pos` vaut la position de `start`.
- Coordonnées de la scène (un `start` donné en littéral `{x, y}` est absolu, pas relatif à `pos`).

### `arrow`

Segment avec une ou deux pointes.

**En bref**

| | |
|---|---|
| Famille | bornée (via `boundingBox`) |
| `pos` = | `start` |
| Pivot | `center` (défaut) ou `pos` |
| Chemin (`travel`, `pathX`…) | tracé, **ouvert** ; `t=0` à `start` |
| `reveal` | `default` (fondu) ou `draw` (tracé progressif) |
| Ancres lisibles | `boundingBox` |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `start` | point | (0, 0) | — | oui | Point de départ. |
| `end` | point | (100, 0) | — | oui | Point d'arrivée. |
| `head` | énumération | `end` | `end` · `start` · `both` · `none` | non | Où se trouvent les pointes. |
| `stroke` | couleur | `#9c9c9c`† | — | oui | Couleur du trait. |
| `strokeWidth` | nombre | 2† | ≥ 0 | oui | Épaisseur du trait. |

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "a1", "type": "arrow", "properties": {"start": {"x": 100, "y": 300}, "end": {"x": 400, "y": 300}, "stroke": "white", "strokeWidth": 4, "head": "both"}},
    {"action": "animate", "target": "a1", "properties": {"reveal": "draw"}, "duration": 1},
    {"action": "animate", "target": "a1", "properties": {"end": {"x": 400, "y": 500}}, "duration": 1, "ease": "cubicInOut"}
  ] }
```

*Ce que l'on voit* : Une flèche à deux pointes se trace, puis son extrémité descend. Durée : 2 s.

**À savoir**

- Mêmes règles que `segment` ; `head` se fixe à `create` ou `set` et ne s'anime pas.
- La pointe est dessinée quand le tracé est complet (`reveal: "draw"` termine la flèche avec sa pointe)†.

### `ray`

Demi-droite infinie partant de `origin` et passant par `through`.

**En bref**

| | |
|---|---|
| Famille | infinie (pas de `boundingBox`) |
| `pos` = | `origin` |
| Pivot | `pos` |
| Chemin (`travel`, `pathX`…) | aucun |
| `reveal` | `default` (fondu) |
| Ancres lisibles | aucune ancre de boîte |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `origin` | point | (0, 0) | — | oui | Origine de la demi-droite. |
| `through` | point | (100, 0) | — | oui | Un point par où elle passe (donne la direction). |
| `stroke` | couleur | `#9c9c9c`† | — | oui | Couleur du trait. |
| `strokeWidth` | nombre | 2† | ≥ 0 | oui | Épaisseur du trait. |

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "r", "type": "ray", "properties": {"origin": {"x": 400, "y": 360}, "through": {"x": 800, "y": 360}, "stroke": "yellow", "strokeWidth": 3}},
    {"action": "animate", "target": "r", "properties": {"reveal": true}, "duration": 0.5},
    {"action": "animate", "target": "r", "properties": {"rotation": 360}, "duration": 4, "ease": "linear"}
  ] }
```

*Ce que l'on voit* : Une demi-droite jaune pivote d'un tour complet autour de son origine en 4 s.

**À savoir**

- **Infinie** : pas de `boundingBox`, pas de chemin. On ne peut donc ni la lire comme une boîte, ni faire un `travel` dessus, ni `focusOn` sur elle.
- La rotation se fait autour de `origin` (pivot `pos`).
- La vue la dessine jusqu'au bord du cadre.
- Pas de `boundingBox` ni de chemin : on ne peut ni la référencer comme boîte, ni faire un `travel` dessus.

### `line`

Droite infinie passant par `p1` et `p2`.

**En bref**

| | |
|---|---|
| Famille | infinie (pas de `boundingBox`) |
| `pos` = | `p1` |
| Pivot | `pos` |
| Chemin (`travel`, `pathX`…) | aucun |
| `reveal` | `default` (fondu) |
| Ancres lisibles | aucune ancre de boîte |

**Propriétés propres** (en plus des propriétés communes du §2.2)

| Nom | Type | Défaut | Contraintes | Animable | Rôle |
|---|---|---|---|---|---|
| `p1` | point | (0, 0) | — | oui | Premier point de passage. |
| `p2` | point | (100, 0) | — | oui | Second point de passage. |
| `stroke` | couleur | `#9c9c9c`† | — | oui | Couleur du trait. |
| `strokeWidth` | nombre | 2† | ≥ 0 | oui | Épaisseur du trait. |

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "horizon", "type": "line", "properties": {"p1": {"x": 0, "y": 600}, "p2": {"x": 1280, "y": 560}, "stroke": "gray", "strokeWidth": 2}},
    {"action": "animate", "target": "horizon", "properties": {"reveal": true}, "duration": 0.5},
    {"action": "animate", "target": "horizon", "properties": {"p2": {"x": 1280, "y": 700}}, "duration": 1}
  ] }
```

*Ce que l'on voit* : Une droite grise apparaît, puis son second point descend : la droite s'incline. Durée : 1,5 s.

**À savoir**

- **Infinie** : même limites que `ray`. Interdite dans un groupe à `layout`.
- On la définit par deux points : `p1` et `p2` (et non `start`/`end`).
- N'expose rien d'exploitable dans une expression (hors `p1` et `p2`). Interdite dans un groupe avec `layout`.

### `point`

Ancre **invisible** : centre d'orbite, repère mobile. N'a aucun rendu.

**En bref**

| | |
|---|---|
| Famille | ponctuelle |
| `pos` = | le point lui-même |
| Pivot | `pos` |
| Chemin (`travel`, `pathX`…) | aucun |
| `reveal` | `default` (sans effet visible) |
| Ancres lisibles | aucune ancre de boîte |

**Propriétés propres** (en plus des propriétés communes du §2.2)

*Aucune.*

**Exemple**

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "center", "type": "point", "properties": {"pos": "scene.center"}},
    {"action": "create", "target": "orbit", "type": "arc", "properties": {"radius": 200, "startAngle": 0, "endAngle": 360, "stroke": "#555555", "strokeWidth": 2, "pos": "center.pos"}},
    {"action": "create", "target": "planet", "type": "circle", "properties": {"radius": 14, "fill": "blue", "x": "orbit.pathX(main, 0)", "y": "orbit.pathY(main, 0)"}},
    {"action": "animate", "target": "orbit", "properties": {"reveal": true}},
    {"action": "animate", "target": "planet", "properties": {"reveal": true}, "start": "<"},
    {"action": "animate", "target": "center", "properties": {"x": 900}, "duration": 6, "ease": "sineInOut"},
    {"action": "bind", "target": "orbit", "properties": {"pos": "center.pos"}, "start": "<"},
    {"action": "travel", "target": "planet", "along": "orbit", "duration": 6, "start": "<"}
  ] }
```

*Ce que l'on voit* : Une planète tourne sur une orbite dont le centre (un `point`) glisse vers la droite ; l'orbite est liée à ce point. Durée : 6,5 s.

**À savoir**

- Aucun rendu : ni fondu, ni tracé visible.
- Il n'a ni dimensions, ni `boundingBox` (`E_EXPR_INFINITE_REF`) : seule `pos` est utilisable dans une expression.
- Idéal comme centre d'orbite ou repère mobile : animez `x`/`y`, et liez d'autres objets à `.pos`.
- Utile comme repère : `"pos": "origin.pos"` ou `bind` sur sa position.

---

## 4. `scene`

`scene` n'est pas une primitive qu'on crée : c'est l'objet racine, de taille `scene.width` × `scene.height`. On peut **lire** ses propriétés dans les expressions (`scene.center`, `scene.width`, les 9 ancres) ; elles sont en lecture seule. On la **pilote** (`set`, `animate`, `bind`, `stop`, `unbind`) avec quatre propriétés de **vue** — ce que montre la vidéo.

| Propriété | Valeur | Effet |
|---|---|---|
| `focusOn` | un objet, ou un tableau d'objets | Cadre la boîte (ou l'union des boîtes), élargie de `focusMargin`. `"scene"` revient au plan d'ensemble. |
| `focusMargin` | nombre | Marge de chaque côté, **en unités de scène**. N'a de sens qu'avec `focusOn`. |
| `view` | `{ x, y, width, height }` | Cadre cette région (`x`, `y` = coin haut-gauche). Un champ omis garde sa valeur ; si seule `width` ou `height` est donnée, l'autre suit le ratio de la scène. Chaque champ peut être une expression. |
| `zoom` | nombre > 0 | 1 = toute la scène ; 2 = une région deux fois plus petite, centrée au même endroit. |

```json
{ "version": "1.0", "scene": {"width": 1280, "height": 720, "background": "#101014"},
  "steps": [
    {"action": "create", "target": "box", "type": "rectangle", "properties": {"width": 200, "height": 120, "fill": "#3b82f6", "pos": {"x": 900, "y": 500}, "reveal": true}},
    {"action": "animate", "target": "scene", "properties": {"focusOn": "box", "focusMargin": 80}, "duration": 1.5, "ease": "cubicInOut"},
    {"action": "animate", "target": "scene", "properties": {"focusOn": "scene"}, "duration": 1, "ease": "cubicInOut"},
    {"action": "animate", "target": "scene", "properties": {"zoom": 2}, "duration": 1},
    {"action": "animate", "target": "scene", "properties": {"view": {"x": 0, "y": 0, "width": 640}}, "duration": 1}
  ] }
```

*Ce que l'on voit* : la vue zoome sur le rectangle (marge 80), revient au plan d'ensemble, double le zoom, puis cadre la moitié gauche haute de la scène. Durée : 4,5 s.

**À savoir**
- La vue garde **toujours le ratio de la scène** : une région d'un autre ratio est agrandie sur son plus petit côté, autour de son centre.
- `animate` interpole le **centre linéairement et le zoom géométriquement** (mouvement perçu comme régulier). La cible est **figée au démarrage** ; avec `bind`, elle est recalculée à chaque image (la vue suit l'objet) ; avec `set`, le changement est instantané.
- `focusOn`, `view` et `zoom` pilotent le **même état** : ils sont en conflit entre eux (le dernier prend la main). `focusMargin` accompagne `focusOn`.
- `scene.view.center.x`, `scene.view.topLeft`, `scene.view.width`… lisent la vue **courante** ; `scene.center` etc. restent ceux de la scène entière. Utile pour accrocher un objet au bord de ce qui est visible.
- Erreurs : `focusOn` sur `line`/`ray`, `zoom` ou dimension ≤ 0, `focusMargin` sans `focusOn`, toute autre propriété ; `create`, `travel`, `group`, `ungroup` interdits sur `scene`.

---

## 5. Récapitulatifs

### 5.1 Animable ou non
| Primitive | Animables | Non animables (`set` seulement) | Lecture seule |
|---|---|---|---|
| `rectangle` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `width`, `height`, `fill`, `stroke`, `strokeWidth`, 9 ancres | `pivot` | — |
| `text` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `color`, `fontSize`, 9 ancres | `pivot`, `text`, `fontFamily`, `fontWeight` | `width`, `height` |
| `image` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `width`, `height`, 9 ancres | `pivot`, `url` | — |
| `group` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, 9 ancres | `pivot`, `layout`, `gap`, `margin` | — |
| `circle` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `radius`, `fill`, `stroke`, `strokeWidth` | `pivot` | — |
| `ellipse` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `width`, `height`, `fill`, `stroke`, `strokeWidth` | `pivot` | — |
| `arc` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `radius`, `startAngle`, `endAngle`, `stroke`, `strokeWidth` | `pivot` | `start`, `end` |
| `polygon` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `fill`, `stroke`, `strokeWidth`, `vertex[i]` | `pivot`, `points` | — |
| `triangle` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `fill`, `stroke`, `strokeWidth`, `vertex[i]` | `pivot`, `points` | — |
| `polyline` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `stroke`, `strokeWidth`, `vertex[i]` | `pivot`, `points`, `closed` | — |
| `curve` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `stroke`, `strokeWidth`, `vertex[i]` | `pivot`, `points`, `closed`, `interpolation` | `start`, `end` |
| `segment` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `start`, `end`, `stroke`, `strokeWidth` | `pivot` | — |
| `arrow` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `start`, `end`, `stroke`, `strokeWidth` | `pivot`, `head` | — |
| `ray` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `origin`, `through`, `stroke`, `strokeWidth` | `pivot` | — |
| `line` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity`, `p1`, `p2`, `stroke`, `strokeWidth` | `pivot` | — |
| `point` | `x`, `y`, `pos`, `rotation`, `scale`, `opacity` | `pivot` | — |

### 5.2 Erreurs fréquentes
| Code | Cause habituelle | Correction |
|---|---|---|
| `E_PROPERTY_UNKNOWN` | Propriété d'une autre primitive (`width` sur un `circle`, `fill` sur un `text`) | Voir la fiche : `radius`, `color`… |
| `E_PROPERTY_READONLY` | Affectation de `width` d'un `text`, de `end` d'un `arc` | Changer `fontSize`, `endAngle` |
| `E_PROPERTY_NOT_ANIMATABLE` | `animate` sur `text`, `pivot`, `points`, `head`, `closed`… | Utiliser `set` (ou `vertex[i]` pour les sommets) |
| `E_PROPERTY_DUPLICATE` | `pos` et `x` dans la même étape | N'en garder qu'un |
| `E_DURATION_MISSING` | `animate` d'une propriété sans `duration` | Ajouter `duration` |
| `E_FORWARD_REFERENCE` | Un `create` lit un objet créé plus bas | Réordonner les `create` |
| `E_EXPR_POINT_IN_ARITHMETIC` | `a.center + 1` | `a.center.x + 1` |
| `E_EXPR_SEGMENT_UNKNOWN` | `a.left`, ancre inexistante pour la classe | Voir §2.4 |
| `E_EXPR_INFINITE_REF` | `boundingBox` d'un `ray`/`line`/`point` | Lire `origin`/`p1`/`pos` |
| `E_FIELD_REQUIRED` | `points` d'un `polygon` ou `url` d'une `image` absents | Les fournir à `create` |
| `E_VALUE_RANGE` | `scale` ≤ 0, `opacity` > 1, 2 points pour un `polygon`… | Corriger la valeur |
| `E_COLOR_INVALID` | Nom de couleur hors de la liste | Voir §2.6 |
| `E_EFFECT_VALUE` | `reveal: "draw"` sur un `rectangle` | `default` seulement |
| `E_EFFECT_BIND` | `bind` d'un `reveal` | `animate` ou `set` |
| `E_STOP_NOTHING` | `stop` quand rien n'est actif (souvent un `start` oublié : sans `start`, une action démarre **à la fin** de la précédente) | Donner `start` |
| `E_TRAVEL_INFINITE_PATH` | `travel` le long d'un `ray`/`line` | Utiliser un objet borné |

## 6. Écarts et points à trancher

1. **Orbites et formes « sans remplissage ».** L'exemple d'orbite de la spec (§8.8) ne donne que `stroke:"#888"` à une ellipse. Dans le moteur, une ellipse a par défaut un `fill` gris et `strokeWidth` 0† : l'exemple s'affiche en **disque gris sans contour**. Contournements : `arc` de 0° à 360° (anneau, fonctionne), ou, avec l'extension P10, `"fill": "#00000000"` et un `strokeWidth` > 0. **Décision à prendre** : rendre le remplissage par défaut transparent pour `circle`/`ellipse` (changement de défaut), ou documenter seulement.
2. **‡ `margin` de groupe** : la spec §10.2 accepte un nombre **ou** `{ top, right, bottom, left }` ; seul le nombre est implémenté.
3. **`reveal` et `opacity`** : la spec §5.3 décrit `reveal` comme agissant sur `opacity` ; le moteur utilise un facteur interne, de sorte que les deux restent indépendants (choix Q6). Effet visible identique dans tous les exemples de la spec.
4. **Défauts†** : tailles (`rectangle` 100×100, `circle` rayon 50, `ellipse` 100×60, `arc` 0°→90° rayon 50), couleurs (`#9c9c9c` remplissage, `#ffffff` contour, `#ffffff` texte, `#9c9c9c` traits), `strokeWidth` (0 / 2), police (`sans-serif`, 32, `bold`), durée et easing des effets (0,5 s, `cubicOut`), `segment` de (0,0) à (100,0).
5. **Autres choix hors spec†** : point littéral `{x,y}` ; liste de points en `{x,y}` ; `-` unaire ; alignement des layouts sur le bord de départ ; `pos` de groupe non recalé ; nombre de points d'un `bezier` ; pointe de flèche de taille `max(10, 4×strokeWidth)` ; pas de `fill` pour `polyline`, `curve`, `arc`.
6. **Non couvert par la spec ni par le moteur** : rotation de la vue, marges différentes par côté, `fill` sur tracés (spec §3.5, §11).

*Ce document est généré à partir d'un schéma unique des primitives. Ses exemples ont été vérifiés par un validateur indépendant qui rejoue les règles de la spec et du kit (ce n'est **pas** le vrai moteur). Le test `core/src/engine/golden/docExamples.golden.test.ts` les fait passer dans le vrai moteur : à lancer pour confirmer.*
