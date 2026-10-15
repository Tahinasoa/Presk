# Presk — Spécification v1.0

Oct 14, 2026 · @Randrianarimanana tahinasoa

## 1. Objectif et principes

Presk décrit une présentation pédagogique animée comme une suite d'actions JSON, rendue sous forme de vidéo. Ill est conçu pour être facilement générable par une IA, déterministe et strict, lisible par un humain, et indépendant du moteur graphique.

Six principes structurent la spécification :

1. **Décrire, pas dessiner.** Le DSL dit ce qui doit apparaître et comment il évolue, jamais la manière technique de le dessiner.
2. **Positionnement relatif par défaut.** Un objet se place par rapport aux points d'un autre objet (`"topLeft": "title.bottomLeft"`), pas par des coordonnées figées.
3. **Une action, une sémantique.** `set` est instantané, `animate` va vers une constante, `travel` parcourt un chemin, `bind` maintient une liaison, `stop` interrompt. Aucune action n'a deux modes aux règles opposées.
4. **Une couche sémantique par les effets.** `reveal`, `powerOn`, `state`… sont des effets déclenchés par `animate`, et non des propriétés : ils n'ont ni valeur lisible ni état enregistré, et leur rendu est défini par la classe de l'objet (§5).
5. **Strict plutôt que deviné.** Toute ambiguïté (cycle, référence inconnue, champ interdit, chemin infini) est une erreur de compilation.
6. **Noyau et catalogue séparés.** Ce document définit le noyau et les primitives géométriques. Les objets complexes (`axes`, `plot`, `math`, `lamp`, `switch`…) et la documentation propre à chaque classe vivent dans des documents distincts.

Le rendu est une vidéo linéaire : il n'y a pas d'interaction pendant la lecture. Un mécanisme de pause sur événement (`checkpoint`) est noté comme extension future (§12).

## 2. Structure générale et actions

Un document Presk est un objet JSON contenant la scène et une liste d'actions exécutées selon la timeline (§6).

```json
{
  "version": "1.0",
  "scene": {
    "width": 1920,
    "height": 1080,
    "background": "#101014"
  },
  "steps": []
}
```

### 2.1 Anatomie d'une action

Chaque élément de `steps` est un objet JSON dont les champs communs sont :

| Champ | Rôle |
| --- | --- |
| `action` (requis) | Type d'action : `create`, `set`, `animate`, `travel`, `bind`, `unbind`, `stop`, `group`, `ungroup`. |
| `target` (requis) | Objet visé. Pour `create`, l'identifiant de l'objet à instancier ; pour `group` et `ungroup`, le nom du groupe. |
| `type` | Classe de l'objet à créer. Réservé à `create`. |
| `properties` | Propriétés et valeurs à créer, assigner, animer, lier, arrêter. Voir le détail par action. |
| `name` | Étiquette unique de l'action sur la timeline, utilisable comme ancre de `start`. Généré automatiquement si absent. Interdit sur `create`, qui n'est pas sur la timeline. |
| `start` | Instant de départ (§6.1). |
| `duration` | Durée en secondes (§6.2). |
| `ease` | Fonction d'interpolation (§6.3). |
| `repeat`, `repeatMode` | Nombre de passages et mode de répétition (§6.4). |

`travel` ajoute ses champs propres (§8), et `animate` accepte des effets (§5). Les champs autorisés pour chaque action sont résumés au §12.

### 2.2 Vue d'ensemble des actions

| Action | Rôle |
| --- | --- |
| `create` | Déclare et initialise un objet à l'initialisation de la scène. |
| `set` | Assigne une valeur instantanément, sans interpolation. |
| `animate` | Anime des propriétés vers une valeur constante figée au démarrage, ou déclenche un effet. |
| `travel` | Fait parcourir un chemin à un objet, avec orientation, répétition et déphasage. |
| `bind` | Maintient une propriété égale à une expression, réévaluée à chaque frame. |
| `unbind` | Arrête un `bind` ; la propriété se fige à sa dernière valeur. |
| `stop` | Arrête un `animate` ou un `travel` en cours ; la propriété se fige. |
| `group` | Rattache des objets à un groupe (créé si nécessaire). |
| `ungroup` | Détache des objets d'un groupe. |

## 3. Coordonnées, propriétés et ancres

Les positions s'expriment dans le repère de la scène : origine (0, 0) en haut à gauche, x vers la droite, y vers le bas (convention CSS, SVG, Canvas 2D). Les axes suivent la résolution logique `scene.width` × `scene.height`, indépendante de la taille d'affichage. Les angles sont en degrés, dans le sens horaire à l'écran.

### 3.1 Propriétés communes

| Propriété | Description |
| --- | --- |
| `x`, `y` | Position de l'origine locale de l'objet. |
| `pos` | Même position sous forme de point. `pos` équivaut à `x` + `y` (§9.4). |
| `rotation` | Rotation en degrés, sens horaire. |
| `scale` | Échelle uniforme (un seul nombre). Une déformation non uniforme passe par `width` et `height`. |
| `opacity` | Opacité de 0 à 1. |
| `reveal` | Effet universel, sans valeur lisible (§5). |
| `width`, `height` | Dimensions locales, avant rotation. Portées par les rectangles et leurs descendants, et par `ellipse`. `circle` expose `radius`. |

La propriété `pos` désigne l'origine du repère local, dont le sens dépend du type (§11) : centre pour un rectangle (et ses descendants), un cercle, une ellipse ou un arc ; point de départ pour un segment. La rotation et l'échelle s'appliquent autour de pos : pour un rectangle, elles sont donc centrées sur l'objet.

### 3.2 Les 9 ancres du rectangle

Seuls les rectangles et leurs descendants (`text`, `image`, `group`, `scene`) exposent les 9 ancres standard :

| Point | Description |
| --- | --- |
| `topLeft`, `topCenter`, `topRight` | Coins et milieu du bord supérieur. |
| `centerLeft`, `center`, `centerRight` | Milieux des côtés et centre. |
| `bottomLeft`, `bottomCenter`, `bottomRight` | Coins et milieu du bord inférieur. |

Ces points suivent la rotation de l'objet : `topRight` désigne toujours le coin réel, tourné ou non. Une ancre s'utilise de deux façons :

- **Affectation de point à point** : `"topLeft": "title.bottomLeft"`. L'ancre cible doit appartenir à l'objet modifié.
- **Scalaire** dans une expression arithmétique, avec `.x` ou `.y` : `"x": "title.topRight.x + 20"`.

Une ancre assignée équivaut à `x` + `y` (§9.4). Pour un objet qui n'est pas un rectangle, les 9 ancres standard ne sont pas assignables, mais elles restent lisibles via `boundingBox`.

### 3.3 Boîte englobante (`boundingBox`)

Pour tout objet qui n'est pas un rectangle, on obtient les 9 points en préfixant par `boundingBox.`, par exemple `earth.boundingBox.center.x`. La boîte est alignée sur les axes de la scène et recalculée après rotation : ses coins ne suivent donc pas la rotation de l'objet. Elle sert au placement et au layout, pas à accrocher un élément à un coin tourné.

La validité se juge au niveau du scalaire : `.x` ou `.y` n'est valide que s'il est fini, et une affectation de point exige les deux. En conséquence :

- les objets bornés exposent les 9 points, plus `boundingBox.width` et `boundingBox.height` ;
- `ray` n'expose que ses côtés finis (son origine) ;
- `line` n'expose rien d'exploitable ;
- toute référence à une valeur infinie est une erreur de compilation.

`scene` est un identifiant réservé qui désigne la racine. Il se comporte comme un rectangle : `scene.center.x`, `scene.width`, `scene.bottomRight`.

### 3.4 Ancres propres au type

En plus des 9 ancres ou de `boundingBox`, **toute classe peut exposer des ancres qui lui sont propres** : des points nommés, liés à sa géométrie ou à sa sémantique, exprimés dans le repère de la scène. Elles s'utilisent comme les ancres standard : affectation de point à point, ou scalaire avec `.x` ou `.y` dans une expression.

Selon la classe et l'ancre, l'accès est en **lecture seule** ou en **lecture/écriture** :

- **Polygone, triangle, polyline, curve** : un point par sommet, `vertex[i]`, en lecture/écriture. `"vertex[1]": "A.pos"` déplace ce sommet.
- **`segment`, `arrow`** : `start` et `end`, en lecture/écriture. **`ray`** : `origin` et `through`, en lecture/écriture.
- **`arc`, `curve`** : `start` et `end` en lecture seule, car ils découlent des angles ou des points.
- **Objets complexes** : les points utiles de leur sémantique. Un `transistor` pourrait exposer `collector`, `base` et `emitter`, auxquels d'autres objets s'accrochent : `"end": "transistor.base"` dans le `bind` d'un fil.

Règles :

1. Les noms, le mode d'accès (lecture seule ou lecture/écriture) et la signification de chaque ancre sont déclarés dans la documentation de la classe, hors de ce document.
2. Assigner une ancre en lecture seule est une erreur de compilation. Une ancre en lecture/écriture se comporte comme une propriété de point : elle entre dans les conflits de propriétés (§9.3, §9.4).
3. Une ancre indexée (`vertex[i]`) dont l'indice n'existe pas est une erreur.
4. Une ancre propre est un point : elle suit les mêmes règles de grammaire que les ancres standard (§7.2).

Les fonctions de projection le long d'un chemin (`pathX`, `pathY`, `pathAngle`) sont décrites au §7.4.

## 4. Cycle de vie : `create` et `set`

Tous les objets sont déclarés par `create` et instanciés à l'initialisation de la scène. Ils existent pendant toute sa durée et ne sont jamais détruits. L'existence d'un objet est dissociée de son apparition : un objet créé est invisible tant que l'effet `reveal` n'a pas été déclenché (§5).

```
create (à l'initialisation) → (set | animate | travel | bind | stop | group | ungroup)*
```

### 4.1 `create`

`create` déclare l'objet, sa classe et ses propriétés initiales, en privilégiant le positionnement relatif.

```json
{
  "action": "create",
  "target": "codLabel",
  "type": "text",
  "properties": {
    "text": "COD",
    "topLeft": "title.bottomLeft"
  }
}
```

Règles :

- `create` n'est pas placé sur la timeline : `start`, `duration`, `ease`, `repeat`, `repeatMode` et `name` sont interdits.
- Après `create`, l'objet est invisible : c'est l'état initial géré par le moteur, qui n'est pas une valeur lisible dans le langage. Pour un objet visible dès le début, on écrit l'effet `reveal` dans `properties` : il est appliqué directement à son résultat final, sans animation (valeurs possibles et variantes : §5.3), ce qui évite un `set` par objet.
- Les expressions de `properties` sont évaluées une seule fois, à l'initialisation, dans l'ordre topologique du graphe de dépendances (§7.3). Elles ne créent aucune liaison : pour qu'une position suive un autre objet, on utilise `bind`.
- Un objet ne peut référencer qu'un objet créé dans la même scène, mais l'ordre des `create` dans `steps` n'a pas d'importance.

### 4.2 `set`

`set` assigne une valeur instantanément, sans interpolation et sans consommer de durée.

```json
{
  "action": "set",
  "target": "dot",
  "properties": { "pos": "otherDot.pos", "opacity": 1 },
  "start": 3
}
```

Règles :

- `start` est valide : il fixe l'instant où l'assignation a lieu.
- `duration`, `ease`, `repeat` et `repeatMode` sont interdits.
- Les expressions sont évaluées une seule fois, à l'instant de l'action.
- Sur un effet, `set` applique directement le résultat final de l'effet, sans l'animer (§5.2).
- Un `set` sur une propriété en cours d'`animate`, de `travel` ou de `bind` prend la main et arrête le mécanisme précédent (§9.3).

## 5. `animate` et effets

`animate` applique une transition depuis l'état courant vers une cible constante, évaluée une seule fois au démarrage de l'action. Il couvre deux familles : les propriétés numériques ou géométriques, interpolées, et les effets, qui sont déclenchés par leur nom et dont le rendu est défini par la classe.

### 5.1 Interpolation vers une constante

```json
{
  "action": "animate",
  "target": "title",
  "properties": { "pos": "scene.center", "scale": 0.7 },
  "duration": 0.8,
  "ease": "cubicOut"
}
```

Une expression dans `properties` (ici `scene.center`) est figée au démarrage : la valeur obtenue devient la cible de l'interpolation. Pour une valeur qui suit un objet en mouvement, on utilise `bind` (§9).

`animate` accepte `repeat` et `repeatMode` (§6.4) :

```json
{
  "action": "animate",
  "target": "pulsingCircle",
  "properties": { "scale": 1.2 },
  "duration": 0.5,
  "ease": "sineInOut",
  "repeat": "infinite",
  "repeatMode": "yoyo"
}
```

Un `animate` ne peut pas contenir d'expression qui dépend du temps. Pour parcourir un chemin, on utilise `travel` (§8).

### 5.2 Effets

Un effet n'est pas une propriété : il n'a ni valeur accessible ni état enregistré dans le langage. Le nommer dans les properties d'un animate déclenche une animation prédéfinie par la classe de l'objet. Exemples : `reveal` (tous les objets), `powerOn` (une lampe), `state` (un interrupteur). C'est la couche où Presk quitte l'animation géométrique pure.

```json
{ "action": "animate", "target": "lamp",   "properties": { "powerOn": true } }
{ "action": "animate", "target": "switch", "properties": { "state": "open" } }
{ "action": "animate", "target": "poly",   "properties": { "reveal": "draw" }, "duration": 1.2 }
```

Règles communes :

- **Valeurs.** `true` et `false` sont de vrais booléens JSON. Une chaîne désigne une variante nommée par la classe (`"draw"`, `"open"`). Une classe peut aussi accepter d'autres types, selon sa documentation.
- **Retour en arrière.** `false` joue l'inverse, précalculé par le moteur, de la dernière variante jouée ; ce suivi est interne au moteur et n'est pas accessible dans le langage. `animate reveal: false` fait donc disparaître l'objet, sans action `hide` dédiée.
- **`set`.** `set` sur un effet applique son résultat final instantanément (§4.2).
- **Durée et easing.** `duration` et `ease` sont optionnels : la classe fournit des valeurs par défaut.
- **Pas de pilotage fin.** Un effet n'a pas de valeur : il ne peut être lu dans aucune expression (obj.reveal n'existe pas), ni animé par un chemin, ni lié par `bind`.
- **Effets libres.** Un effet modifie ce que sa classe décide : opacité, tracé, couleur, géométrie, enfants. Ce que chaque effet touche est documenté dans la doc de la classe, pas dans le moteur.

### 5.3 `reveal`

`reveal` est universel : tous les objets l'implémentent grâce à une valeur par défaut dans la classe parente, qui ne modifie que `opacity` (fondu entre 0 et 1).

- Après `create`, l'objet est invisible : c'est l'état initial géré par le moteur, pas une valeur lisible.
- `reveal: true` est l'apparition par défaut de la classe.
- Une classe peut ajouter des variantes nommées et redéfinir l'effet. Par exemple `polygon` accepte `reveal: "draw"` pour se tracer progressivement.
- **`reveal` ne se propage pas aux enfants d'un groupe.** C'est un choix de cette version (§10.4).

### 5.4 Pas de détection automatique des conflits d'effets

Comme un effet peut toucher n'importe quelle propriété, le moteur ne détecte pas ses conflits avec un `animate` simultané sur les mêmes propriétés. La règle d'écriture est simple : on attend la fin d'une action sur un objet avant d'en lancer une autre qui peut modifier les mêmes propriétés. La doc de chaque classe liste ce que touche chacun de ses effets ; le moteur n'applique la règle « la dernière action prend la main » (§9.3) qu'aux propriétés explicitement nommées dans `properties`.

## 6. Timing

Toutes les actions sauf `create` sont placées sur la timeline. Chacune a un instant de début et un instant de fin. Les actions sans durée (`set`, `bind`, unbind, `stop`, `group` sans `duration`, `ungroup`) ont une fin égale à leur début.

### 6.1 `start`

`start` positionne le début de l'action. Si `start` est omis, l'action démarre à la fin de l'action précédente (équivalent de `">"`) ; la première action démarre à 0. L'« action précédente » est la précédente dans `steps` parmi celles qui sont sur la timeline : `create` est ignoré.

| Forme | Exemple | Sens |
| --- | --- | --- |
| Temps absolu | `3` ou `"3.3"` | Secondes depuis le début de la scène. |
| Début précédent | `"<"` | Même début que l'action précédente. |
| Fin précédente | `">"` | Début à la fin de l'action précédente. |
| Post-début | `"<3"` | 3 s après le début de l'action précédente. |
| Post-fin | `">2"` | 2 s après la fin de l'action précédente. |
| Étiquette | `"titleReveal"` | Même début que l'action nommée. |
| Post-début d'étiquette | `"titleReveal<5"` | 5 s après le début de l'action nommée. |
| Pré-fin d'étiquette | `"titleReveal>-2"` | 2 s avant la fin de l'action nommée (le signe `-` recule). |

Une action nommée par `name` (§2.1) sert d'ancre pour les suivantes :

```json
{ "action": "animate", "target": "menu", "name": "menuOpen",
  "properties": { "x": "scene.center.x" }, "duration": 0.5 }
{ "action": "animate", "target": "codLabel", "properties": { "reveal": true },
  "start": "menuOpen<0.5", "duration": 0.5 }
```

Un `start` qui aboutit à un instant négatif, qui référence un nom inconnu, ou qui référence la fin d'une action infinie (§6.5), est une erreur de compilation.

### 6.2 `duration`

Durée d'**un passage** de l'action, en secondes. Elle est requise pour `animate` s'il y a interpolation (un effet peut s'en passer, §5.2). `travel` utilise soit `duration`, soit `speed` (§8.4).

### 6.3 `ease`

Fonction d'interpolation, appliquée **à chaque passage** (pas à l'ensemble des répétitions). `linear` est le choix normal pour un mouvement périodique.

```
sineIn / sineOut / sineInOut
quadIn / quadOut / quadInOut
cubicIn / cubicOut / cubicInOut
quartIn / quartOut / quartInOut
quintIn / quintOut / quintInOut
expoIn / expoOut / expoInOut
circIn / circOut / circInOut
backIn / backOut / backInOut
elasticIn / elasticOut / elasticInOut
bounceIn / bounceOut / bounceInOut
linear
```

### 6.4 `repeat` et `repeatMode`

- `repeat` est le **nombre total de passages**, entier ≥ 1 (défaut 1), ou la chaîne `"infinite"` en minuscules. `repeat: 3` joue trois passages, pas quatre. `repeat: 0` est une erreur.
- `repeatMode` vaut `"restart"` (défaut : chaque passage repart du début) ou `"yoyo"` (les passages pairs rejouent la même courbe à l'envers, avec un easing miroir).
- Il n'existe aucun alias : ni `"Infinite"`, ni `"alternate"`, ni `"reverse"`.
- `repeat` et `repeatMode` sont valides pour `animate` et `travel` uniquement.

```json
{ "repeat": "infinite", "repeatMode": "yoyo" }
```

### 6.5 Actions infinies

Une action avec `repeat: "infinite"` a un début mais **pas de fin**. Conséquences :

- Toute référence à sa fin (`">"` placé juste après, ou `"nom>x"`) est une erreur de compilation.
- Les références à son début (`"nom"` ou `"nom<x"`) restent valides.
- Elle s'arrête quand un `stop` la cible, quand une autre action prend la main sur la même propriété (§9.3), ou à la fin de la scène.
- Une action `bind` n'est pas une action infinie : elle a une fin égale à son début, et sa liaison persiste jusqu'à `unbind` (§9).
- Un `repeat` fini donne une fin calculable : début + `duration` × `repeat`.

### 6.6 Durée de la scène

La scène se termine à l'instant maximal des fins des actions finies. Les actions encore actives (infinies, `bind`) sont coupées à cet instant.

- Le langage ne déclare aucune durée de scène : `scene.duration` n'existe pas. La durée est une notion du moteur, qui la déduit du calcul ci-dessus. Un moteur peut offrir un réglage de rendu propre (par exemple pour laisser tourner une orbite plus longtemps), mais il ne fait pas partie de Presk.
- Une action infinie qui démarre à l'instant de fin calculé, ou après, ne serait jamais jouée : c'est une erreur de compilation. L'auteur prolonge alors la scène en plaçant une action finie plus tard dans la timeline.
- Une action dont le `start` dépasse la fin de la scène n'a jamais lieu : avertissement.

## 7. Expressions et résolution

Puisque le positionnement relatif est la norme, une valeur de propriété est souvent une expression textuelle qui référence d'autres objets. L'expression est parsée en un petit arbre (AST) évalué au moment décrit au §7.3.

### 7.1 Deux types de références

- **Scalaires.** Un nombre : `title.width`, `title.topRight.x`, `scene.center.y`. Seules les références scalaires acceptent l'arithmétique `+`, `-`, `*`, `/`.
- **Points.** Un point entier : `title.bottomLeft`, `earth.pos`. Un point s'assigne directement à une propriété de point (`"topLeft": "rectangle.bottomRight"`), sans extraction de coordonnées.

```json
"x": "title.topRight.x + 20"
"y": "title.boundingBox.center.y - 100"
"topLeft": "otherBox.bottomRight"
"pos": "earth.pos"
```

### 7.2 Règles de grammaire

Une référence scalaire doit se terminer sur un scalaire. Un point peut être préfixé par `boundingBox.` mais doit ensuite être suivi de `.x` ou `.y` dans une formule arithmétique.

| Expression | Verdict | Remarque |
| --- | --- | --- |
| `title.topRight.x + 20` | valide |  |
| `title.boundingBox.topLeft.y - 100` | valide |  |
| `scene.center.x` | valide |  |
| `title.width / 2` | valide |  |
| `title.bottomLeft` | valide | affectation de point à point seulement |
| `title.topRight + 20` | erreur | addition sur un point entier |
| `title.boundingBox` | erreur | `boundingBox` sans point |
| `title.left` | erreur | segment inconnu : utiliser `title.topLeft.x` |

La grammaire n'a ni parenthèses ni appels de fonction généraux, pour rester facile à générer et trivial à parser. Seules exceptions, les fonctions de chemin (§7.4).

### 7.3 Résolution : `animate` fige, `bind` maintient

C'est la règle la plus importante du DSL.

| Contexte | Moment d'évaluation |
| --- | --- |
| `create` | Une fois, à l'initialisation. |
| `set` | Une fois, à l'instant de l'action. |
| `animate` | Une fois, au démarrage de l'action. La valeur obtenue devient la cible figée. |
| `bind` | À chaque frame, tant que la liaison est active. |
| `travel` | Le chemin est réévalué à chaque frame (§8.2). |

Il n'existe pas de mode intermédiaire : une valeur relative qui doit suivre un objet en mouvement passe par `bind`, jamais par `animate`.

Le moteur doit :

1. parser chaque expression au moment du `create`, `set`, `animate`, `bind` ou `travel` ;
2. construire le graphe de dépendances entre objets (par exemple `codLabel.topLeft` dépend de `title.bottomLeft`) ;
3. détecter les cycles à la compilation, jamais à l'exécution ;
4. évaluer dans l'ordre topologique, à chaque frame pour les liaisons actives.

### 7.4 Fonctions de chemin

Un objet qui expose un chemin nommé (§8.2) fournit trois fonctions de projection, **à position `t` figée** :

```
<objet>.pathX(<nom>, <t>)
<objet>.pathY(<nom>, <t>)
<objet>.pathAngle(<nom>, <t>)
```

- `t` est une position normalisée de 0 (début) à 1 (fin), proportionnelle à la longueur parcourue (§8.2). Hors de \[0, 1\], `t` n'est valide que sur un chemin fermé (modulo 1).
- `pathX` et `pathY` retournent des coordonnées dans le repère de la scène, sans conversion.
- `pathAngle` retourne la tangente en degrés, sens horaire à l'écran, 0 pointant vers la droite (+x). C'est un scalaire valide dans une expression arithmétique : `"rotation": "circuit.pathAngle(main, 0.5) + 90"`.
- `t` est un nombre littéral. Il n'existe pas de forme à `t` animé : ce rôle revient à `travel`.

```json
{ "action": "create", "target": "dot", "type": "circle",
  "properties": { "x": "sineCurve.pathX(main, 0.5)", "y": "sineCurve.pathY(main, 0.5)" } }
```

### 7.5 Erreurs à gérer explicitement

- Référence à un objet inexistant : erreur claire.
- Cycle de dépendance : erreur à la compilation.
- Segment inconnu ou mal formé, ou point entier dans une formule arithmétique : erreur de parsing.
- Référence à une valeur infinie (`line`, côté infini de `ray`) : erreur.

## 8. Chemins et `travel`

`travel` fait parcourir à un objet un chemin porté par un autre objet : une planète sur son orbite, un électron dans un circuit, un point sur une courbe. C'est une action distincte de `animate` (qui va vers une constante) et de `bind` (qui maintient une égalité) : la cible de `travel` est une fonction du temps.

### 8.1 Cas d'usage couverts

| Cas | Exemple | Outil |
| --- | --- | --- |
| Trajectoire finie, un seul passage | Un point parcourt une courbe sinus | `travel` |
| Mouvement périodique sur chemin fermé | Une planète sur son orbite | `travel` + `repeat: "infinite"` |
| Circuit à plusieurs segments | Un électron dans un circuit | `polyline` fermée ou ouverte, `travel` |
| Plusieurs objets sur un même chemin | 10 électrons répartis | un `travel` par objet, avec `from`/`to` décalés (§8.6) |
| Chemins imbriqués | Une lune autour d'une planète en orbite | `bind` du centre + `travel` (§8.9) |
| Orientation le long du chemin | Flèche, voiture, vaisseau | `orient` |
| Interruption et reprise | Un interrupteur coupe les électrons, puis les relance | `stop` + `from: "current"` (§8.7) |
| Marqueur sur une courbe de fonction | Un point parcourt f(x) | `travel` sur un chemin de `curve` ou de `plot` |

### 8.2 Définition d'un chemin

- **Fini.** Un chemin a toujours une longueur finie. `travel` sur `line` ou `ray` est une erreur de compilation.
- **Nommé.** Un objet peut exposer plusieurs chemins nommés. Tous les types bornés exposent un chemin par défaut appelé `main` (§11). `along: "earthOrbit"` équivaut à `along: "earthOrbit.main"`.
- **Fermé ou ouvert.** Les contours (rectangle, cercle, ellipse, polygon, triangle) sont fermés ; les tracés (arc, segment, arrow, polyline ouverte, curve ouverte) sont ouverts. Un chemin fermé est périodique : `t` boucle de façon naturelle.
- **Paramétrage par longueur d'arc.** `t` est proportionnel à la distance parcourue sur le chemin, pas au paramètre interne de la courbe. Un mouvement à `ease: linear` est donc à vitesse constante, y compris sur une ellipse ou une courbe de Bézier.
- **Repère de la scène, réévalué à chaque frame.** Un objet qui porte un chemin et qui bouge, tourne ou change d'échelle déplace son chemin avec lui. C'est ce qui rend possibles les orbites imbriquées.

### 8.3 Point de départ et sens

`t = 0` doit être fixé pour que le rendu soit déterministe :

| Type | `t = 0` | Sens de parcours |
| --- | --- | --- |
| `circle`, `ellipse` | point le plus à droite (angle 0) | horaire à l'écran |
| `rectangle` (et descendants) | coin haut-gauche | horaire à l'écran |
| `polygon`, `triangle` | `vertex[0]` | ordre des sommets |
| `polyline`, `curve` | premier point | ordre des points (bouclé si `closed`) |
| `arc` | `startAngle` | vers `endAngle` |
| `segment`, `arrow` | `start` | vers `end` |

### 8.4 L'action `travel`

```json
{
  "action": "travel",
  "target": "earth",
  "along": "earthOrbit",
  "from": 0,
  "to": 1,
  "duration": 6,
  "ease": "linear",
  "repeat": "infinite",
  "orient": { "offset": 90 }
}
```

| Champ | Défaut | Description |
| --- | --- | --- |
| `along` | requis | Chemin à parcourir : `"objet"` ou `"objet.nom"`. |
| `from`, `to` | `0`, `1` | Positions de départ et d'arrivée. Sur un chemin fermé, to vaut par défaut from + 1 (un tour complet). `from` peut valoir `"current"` (§8.7). Hors de \[0, 1\] : chemin fermé seulement (§8.6). |
| `duration` ou `speed` | requis, exclusifs | Durée d'un passage en secondes, ou vitesse en unités de scène par seconde. Avec `speed`, la durée d'un passage est la longueur du chemin entre `from` et `to` divisée par la vitesse, calculée une fois au démarrage. |
| `ease` | `linear` | Easing par passage. |
| `repeat`, `repeatMode` | `1`, `restart` | Répétition (§6.4). Avec `yoyo`, le passage retour parcourt le chemin de `to` vers `from`. |
| `orient` | absent | `true` ou `{ "offset": <degrés> }` : oriente l'objet selon la tangente (§8.5). |
| `anchor` | `pos` | Point de l'objet posé sur le chemin : `pos` ou l'une des 9 ancres pour un rectangle (par exemple `"bottomCenter"`). |

Effets :

- `travel` pilote `pos` (donc `x` et `y`) et, si `orient` est présent, `rotation`. L'action ne peut pas être incohérente entre `x`, `y` et `rotation`, puisqu'un seul paramètre `t` les commande.
- À la fin d'un `travel` fini, l'objet reste à `path(to)`.
- Si l'objet n'est pas déjà sur le chemin au démarrage, il saute à `path(from)` : l'auteur place l'objet avant avec `set` ou `animate`. Une option de rattrapage progressif est notée comme extension (§12).

### 8.5 Orientation

`orient: true` aligne l'objet sur la tangente du chemin : `rotation = pathAngle(t)`. `orient: { "offset": 90 }` ajoute un décalage en degrés, nécessaire pour un dessin qui pointe vers le haut. Les angles sont en degrés, sens horaire à l'écran, comme `rotation`. Sur un sommet de `polyline` ou `polygon`, la tangente est discontinue : l'orientation saute, sans lissage dans cette version.

### 8.6 Déphasage sur chemin fermé

Sur un chemin fermé, `from` et `to` peuvent sortir de \[0, 1\] (valeurs prises modulo 1), ce qui répartit plusieurs objets sans nouvelle syntaxe. Sur un chemin ouvert, c'est une erreur de compilation. Un passage doit rester de longueur `to - from` : les trois électrons ci-dessous décrivent un tour complet chacun.

```json
{ "action": "travel", "target": "e1", "along": "circuit", "from": 0.00, "to": 1.00, "duration": 4, "repeat": "infinite", "start": 5 }
{ "action": "travel", "target": "e2", "along": "circuit", "from": 0.25, "to": 1.25, "duration": 4, "repeat": "infinite", "start": 5 }
{ "action": "travel", "target": "e3", "along": "circuit", "from": 0.50, "to": 1.50, "duration": 4, "repeat": "infinite", "start": 5 }
```

Presk n'a ni boucle ni modèle de création en série : douze électrons demandent douze `create` et douze `travel`.

### 8.7 Interruption et reprise

Pour arrêter un `travel`, on utilise `stop` (§9.2) : l'objet se fige à sa position courante. Pour reprendre sans saut, `"from": "current"` repart de la dernière position `t` atteinte par cette cible sur ce chemin. Le moteur la calcule à la compilation, puisque l'instant du `stop` est connu. S'il n'existe aucun `travel` ou `stop` antérieur de cette cible sur ce chemin, c'est une erreur. Si l'objet a été déplacé entre-temps, il saute à cette position.

```json
{ "action": "stop", "target": "e1", "name": "switchOpen", "start": 10 }
{ "action": "travel", "target": "e1", "along": "circuit", "from": "current", "duration": 4,
  "repeat": "infinite", "start": 15 }
```

Sur un chemin fermé, `from: "current"` sans `to` reprend pour un tour complet, de la position courante à cette position + 1. Sur un chemin ouvert, `to` vaut 1 par défaut ; si la position reprise dépasse `to`, c'est une erreur.

### 8.8 Exemple : orbite

```json
{ "action": "create", "target": "earthOrbit", "type": "ellipse",
  "properties": { "pos": "sun.pos", "width": 600, "height": 400, "stroke": "#888", "reveal": true } }
{ "action": "create", "target": "earth", "type": "circle",
  "properties": { "radius": 16, "fill": "blue", "x": "earthOrbit.pathX(main, 0)", "y": "earthOrbit.pathY(main, 0)" } }
{ "action": "animate", "target": "earth", "properties": { "reveal": true }, "duration": 0.5 }
{ "action": "travel", "target": "earth", "along": "earthOrbit", "duration": 6, "repeat": "infinite" }
```

### 8.9 Exemple : orbites imbriquées

Le centre de l'orbite de la lune est lié à la position de la Terre. Le graphe de dépendances reste sans cycle (lune → orbite lunaire → Terre → orbite terrestre).

```json
{ "action": "bind", "target": "moonOrbit", "properties": { "pos": "earth.pos" } }
{ "action": "travel", "target": "moon", "along": "moonOrbit", "duration": 1.5, "repeat": "infinite", "start": "<" }
```

## 9. `bind`, `unbind`, `stop` et conflits de propriétés

`bind` maintient une propriété égale à une expression. `unbind` arrête un `bind`. `stop` arrête un `animate` ou un `travel`. Ces trois actions sont volontairement séparées : chacune a une règle unique.

### 9.1 `bind`

`bind` lie une propriété du `target` à une expression (scalaire ou point), réévaluée à chaque frame. C'est l'outil des liaisons persistantes : infobulle, flèche de liaison, centre d'une orbite qui suit une planète.

```json
{ "action": "bind", "target": "arrow", "properties": { "pos": "dot.pos" } }
```

Une flèche accrochée au coin haut-droite d'un rectangle, même quand celui-ci tourne :

```json
{ "action": "bind", "target": "arrow",
  "properties": { "topLeft": "box.topRight", "rotation": "box.rotation" } }
```

Règles :

- `duration`, `ease`, `repeat` et `repeatMode` sont interdits : `bind` n'a pas de progression interne.
- `start` est valide. La liaison commence à cet instant, et son action a une fin égale à son début (§6.5).
- Une expression comme `pathX(main, 0.5)` est valide et lie la propriété à un point fixe du chemin. Pour faire avancer un objet le long d'un chemin, on utilise `travel`.
- La liaison dure jusqu'à un `unbind`, ou jusqu'à ce qu'une autre action prenne la main sur la même propriété (§9.3).
- Un effet ne peut pas être lié par `bind`.

### 9.2 `unbind` et `stop`

|  | `unbind` | `stop` |
| --- | --- | --- |
| Arrête | un `bind` | un `animate` ou un `travel` en cours, y compris infini |
| `properties` | liste des propriétés à délier (tout le `bind` du target si absent) | liste des propriétés à arrêter (toutes celles du target si absent) |
| Résultat | la propriété se fige à sa dernière valeur | la propriété se fige à sa valeur courante |
| Si rien n'est actif | erreur | erreur |
| Champs autorisés | `start`, `name` | `start`, `name` |

```json
{ "action": "unbind", "target": "arrow", "properties": ["x", "y"] }
{ "action": "stop", "target": "earth", "start": 20 }
```

Dans les deux cas, la propriété redevient pilotable normalement par `set`, `animate`, `travel` ou `bind`.

Précisions sur `stop` :

- Un `stop` sur un `bind` est une erreur, de même qu'un `unbind` sur un `animate`. L'auteur dit explicitement ce qu'il arrête.
- Un `travel` pilote `pos` (et `rotation` avec `orient`) comme un ensemble : `properties` doit alors nommer `pos`, ou être absent. Arrêter `x` seul est une erreur.
- Sur un effet, `stop` fige l'effet à la frame courante. Ce comportement peut être précisé dans la doc de la classe.
- On peut s'ancrer sur un `stop` ou un `unbind` nommé, mais pas sur la fin d'une action infinie qu'il interrompt (§6.5).
- Un `travel` repris ensuite avec `"from": "current"` repart de la position où le `stop` l'a figé (§8.7).

### 9.3 Conflits de propriétés

Une propriété ne peut avoir qu'un seul mécanisme actif à la fois : `animate`, `travel` ou `bind`. La dernière action déclarée sur cette propriété, dans l'ordre de la timeline, prend la main et arrête implicitement la précédente, qui se fige à sa valeur courante à cet instant. Un `set` suit la même règle.

Le conflit se juge sur les propriétés équivalentes (§9.4), pas sur leur nom exact : un `bind` sur `x` et un `animate` sur `pos` sont en conflit.

### 9.4 Table d'équivalence

| Propriété assignée | Propriétés réellement affectées |
| --- | --- |
| `pos` | `x` + `y` |
| `topLeft`, `topCenter`, `topRight`, `centerLeft`, `center`, `centerRight`, `bottomLeft`, `bottomCenter`, `bottomRight` | `x` + `y` (rectangles seulement) |
| `start`, `end` (segment, arrow), `origin`, `through` (ray) | les points ou paramètres qu'elle pilote, selon la classe (§3.4, §11) ; idem pour toute ancre propre en lecture/écriture (vertex\[i\], terminaux d'un composant) |
| `travel` | `pos` et, avec `orient`, `rotation` |
| `scale`, `rotation`, `opacity`, `width`, `height` | elles-mêmes |
| effet (`reveal`, `powerOn`, `state`…) | aucune propriété assignable ; ce que l'effet touche est documenté dans la classe (§5.4) |

Les points de `boundingBox` et les ancres déclarées en lecture seule par leur classe ne sont pas assignables. Les ancres propres en lecture/écriture se traitent comme des propriétés de point (§3.4).

## 10. Groupes et layouts

Un groupe est un objet à part entière, descendant de `rectangle`. Il expose donc les 9 ancres standard (§3.2), qui sont par défaut la boîte englobante de ses enfants ou celle du layout. Un `animate`, un `travel` ou un `bind` appliqué au groupe (`x`, `y`, `scale`, `rotation`) affecte récursivement tous ses enfants.

Un groupe nommé dans un `group` est instancié à l'initialisation, comme tout objet : le moteur le déduit à la compilation. Il est créé visible (l'effet `reveal` est déjà appliqué), car c'est un conteneur et non un élément à faire apparaître.

### 10.1 `group`

Rattache un ou plusieurs objets à un groupe. `children` accepte un identifiant unique ou un tableau.

```json
{
  "action": "group",
  "target": "circuitGroup",
  "properties": { "children": ["wire1", "switch", "lamp"] }
}
```

Si le groupe a déjà subi des transformations (position, échelle, rotation), le regroupement s'accompagne d'une transition : les éléments rattachés sont animés depuis leur état courant vers les valeurs équivalentes dans le repère du groupe. `duration` et `ease` pilotent cette transition.

```json
{ "action": "group", "target": "circuitGroup",
  "properties": { "children": "lamp" }, "duration": 0.6, "ease": "cubicInOut" }
```

Un enfant qui appartient déjà à un autre groupe est reparenté. `repeat` et `repeatMode` sont interdits.

### 10.2 Layout automatique

Au moment du regroupement ou de sa configuration, un groupe accepte des propriétés de mise en page :

| Propriété | Description |
| --- | --- |
| `layout` | `"vertical"`, `"horizontal"` ou `"none"`. Place les enfants à la suite le long de l'axe, ou désactive tout placement automatique. |
| `gap` | Espace fixe entre deux enfants successifs, en unités de scène. |
| `margin` | Marge intérieure autour des enfants : un nombre, ou un objet `{ top, right, bottom, left }`. |

```json
{
  "action": "group",
  "target": "menuGroup",
  "properties": { "children": ["btn1", "btn2", "btn3"], "layout": "vertical", "gap": 20, "margin": 15 }
}
```

Les enfants sont placés par leur boîte englobante. Les objets dont la boîte est infinie (`line`) ne sont pas autorisés dans un groupe avec layout.

### 10.3 `ungroup`

Détache des enfants d'un groupe. `target` désigne le groupe et reste obligatoire, pour que le moteur valide que les `children` lui appartiennent. Si `children` est omis, tous les enfants sont détachés. `ungroup` n'a ni `duration` ni `ease` : l'objet détaché conserve sa position visuelle.

```json
{ "action": "ungroup", "target": "circuitGroup", "properties": { "children": ["switch", "lamp"] } }
```

### 10.4 `reveal` et groupes

**`reveal` ne se propage pas aux enfants.** L'effet `reveal` d'un groupe n'agit que sur le groupe lui-même (par défaut sur sa propre opacité). Le rendu compose l'opacité du groupe avec celle de ses enfants par multiplication ; un enfant qui n'a pas été révélé reste invisible, même dans un groupe révélé. Pour faire apparaître le contenu d'un groupe, on révèle chaque enfant. Une propagation éventuelle (en cascade par exemple) est notée comme extension (§12).

## 11. Catalogue des primitives

Ce catalogue décrit les primitives géométriques. Les objets complexes (`axes`, `plot`, `math`, `lamp`, `switch`…) n'en font pas partie : ils relèvent de documents distincts, au même titre que la liste détaillée des propriétés, des variantes de `reveal` et de ce que chaque effet touche, classe par classe.

### 11.1 Familles

- **Famille rectangle.** `rectangle`, `text`, `image`, `group` (et `scene`). Elle expose les 9 ancres (§3.2) et `width`/`height`.
- **Formes bornées.** `circle`, `ellipse`, `arc`, `polygon`, `triangle`, `polyline`, `curve`, `segment`, `arrow`. Elles passent par `boundingBox` pour les 9 points (§3.3) et exposent un chemin `main`.
- **Formes non bornées.** `line` et `ray`. Pas de chemin. `ray` n'expose que ses côtés finis.
- **Ancre pure.** `point`.

### 11.2 Types et propriétés

| Type | `pos` | Propriétés propres | Ancres propres | Chemin `main` |
| --- | --- | --- | --- | --- |
| `rectangle` | centre | `width`, `height` | 9 ancres | contour, fermé |
| `text` | centre | `text`, style (§11.3) ; dimensions calculées par le moteur | 9 ancres | contour, fermé |
| `image` | centre | `url`, `width`, `height` (si un seul est donné, le ratio est conservé) | 9 ancres | contour, fermé |
| `group` | centre de la boîte englobante | `children`, `layout`, `gap`, `margin` (§10) | 9 ancres | contour, fermé |
| `circle` | centre | `radius` | `boundingBox` | cercle, fermé |
| `ellipse` | centre | `width`, `height` | `boundingBox` | ellipse, fermé |
| `arc` | centre du cercle porteur | `radius`, `startAngle`, `endAngle` (degrés, sens horaire) | `start`, `end` | tracé, ouvert |
| `polygon` | origine du repère des points | `points` (≥ 3 sommets locaux) | `vertex[i]` | contour, fermé |
| `triangle` | origine du repère des points | `points` (exactement 3 sommets) | `vertex[0..2]` | contour, fermé |
| `polyline` | origine du repère des points | `points`, `closed` (défaut `false`) | `vertex[i]` | tracé, ouvert ou fermé selon `closed` |
| `curve` | origine du repère des points | `points`, `closed` (défaut `false`), `interpolation` : `"spline"` (passe par les points, défaut) ou `"bezier"` | `start`, `end` | tracé, ouvert ou fermé |
| `segment` | `start` | `start`, `end` | `start`, `end` | tracé, ouvert |
| `arrow` | `start` | `start`, `end`, `head` : `"end"` (défaut), `"start"`, `"both"`, `"none"` | `start`, `end` | tracé, ouvert |
| `ray` | `origin` | `origin`, `through` (un point de la demi-droite) | `origin` | aucun |
| `line` | `p1` | `p1`, `p2` (deux points de passage) | `p1`, `p2` | aucun |
| `point` | le point | — | `pos` | aucun |

`arrow` est un `segment` avec une pointe. `triangle` est un `polygon` à trois sommets. `point` n'a aucun rendu : c'est une ancre invisible, utile pour un centre d'orbite ou un repère mobile, et son `reveal` n'a pas d'effet visible.

### 11.3 Conventions

- **Sommets locaux.** Les `points` d'un polygon, polyline ou curve sont exprimés dans le repère local ; `vertex[i]` les restitue dans le repère de la scène, avec la rotation et l'échelle de l'objet. Assigné, vertex\[i\] modifie le point correspondant (converti en repère local).
- **Extrémités de segment et de flèche.** `start` et `end` sont des points assignables, donc liables à d'autres objets : `"end": "B.pos"` dans un `bind` fait suivre un segment. Ce `start` de propriété n'a aucun lien avec le champ de timing `start` d'une action.
- **Style.** Les propriétés de style communes sont `fill`, `stroke`, `strokeWidth` et `color` (pour le texte). Elles sont interpolées par `animate`. Leur liste complète est dans la doc des classes.
- **`reveal` par défaut.** Toutes les primitives héritent du fondu d'opacité. Les variantes nommées (par exemple `"draw"` pour `polygon`, `polyline`, `curve`, `segment`, `arrow`, `arc`) sont définies dans la doc de classe.
- **Chemin fermé d'un polygone.** Un `polygon` boucle de `vertex[last]` vers `vertex[0]`. Un `polyline` fermé se comporte comme un `polygon` pour `travel`, ce qui en fait le bon type pour un circuit électrique.

## 12. Récapitulatif, erreurs et extensions

### 12.1 Champs autorisés par action

| Action | `start` | `duration` | `ease` | `repeat` / `repeatMode` | Particularités |
| --- | --- | --- | --- | --- | --- |
| `create` | interdit | interdit | interdit | interdit | `type` requis ; `properties` initiales ; `reveal: false` par défaut. |
| `set` | oui | interdit | interdit | interdit | Assignation instantanée ; résultat final pour un effet. |
| `animate` | oui | requis si interpolation | optionnel | optionnels | Cible figée au démarrage ; effets possibles. |
| `travel` | oui | `duration` ou `speed` (exclusifs) | optionnel | optionnels | `along` requis ; `from`, `to`, `orient`, `anchor`. |
| `bind` | oui | interdit | interdit | interdit | Liaison réévaluée à chaque frame. |
| `unbind` | oui | interdit | interdit | interdit | Arrête un `bind` ; `properties` optionnel. |
| `stop` | oui | interdit | interdit | interdit | Arrête un `animate` ou un `travel` ; `properties` optionnel. |
| `group` | oui | optionnel | optionnel | interdit | Crée le groupe, layout, `gap`, `margin`. |
| `ungroup` | oui | interdit | interdit | interdit | `children` optionnel. |

`name` est autorisé sur toutes les actions sauf `create`.

### 12.2 Erreurs de compilation

- Référence à un objet, une propriété ou un chemin inexistant.
- Cycle de dépendance entre expressions.
- Expression mal formée, point entier utilisé dans une formule arithmétique, valeur infinie référencée.
- Champ interdit pour l'action (par exemple `duration` dans un `set` ou un `bind`).
- `travel` sur un chemin infini (`line`, `ray`), ou `from`/`to` hors de \[0, 1\] sur un chemin ouvert.
- `from: "current"` sans position antérieure connue.
- Référence à la fin d'une action infinie.
- `unbind` sans `bind` actif, `stop` sans `animate` ou `travel` actif, ou action d'arrêt mal appariée (`stop` sur un `bind`, `unbind` sur un `animate`).
- Action infinie qui démarre à l'instant de fin de scène calculé ou après (elle ne serait jamais jouée).
- `repeat` à zéro ou négatif, ou valeur autre qu'un entier ≥ 1 et `"infinite"`.

### 12.3 Extensions futures

Ces points sont volontairement hors de cette version :

- **`checkpoint`** : pause de la timeline en attente d'un clic ou d'un prompt, pour une présentation pilotée par pas.
- **Chemins composés** (`concat`) : une `polyline` suffit pour un circuit.
- **`blendIn`** : rattrapage progressif quand un objet n'est pas sur son chemin au démarrage d'un `travel`.
- **Propagation de `reveal`** aux enfants d'un groupe, en cascade ou non.
- **Création en série** (modèle ou boucle) pour de nombreux objets identiques.
- **Lissage de l'orientation** sur les sommets d'une `polyline`.
- **Objets complexes** : `axes`, `plot`, `math` (descendant de `text`), `lamp`, `switch`, `brace`, `angleMark`, `numberLine`.
- **Documentation par classe** : propriétés, variantes de `reveal`, ce que chaque effet touche.

### 12.4 Choix de cette version à valider

Ces choix ont été faits pour que la spécification soit complète ; ils méritent une relecture.

- **`start` par défaut** : si omis, l'action démarre à la fin de la précédente (`">"`).
- **Conflits d'effets** : pas d'empreinte déclarée dans le code ; elle est documentée dans les classes, et l'auteur évite les actions simultanées sur un même objet (§5.4).
- **`travel.anchor`** : option ajoutée pour poser sur le chemin un autre point que l'origine de l'objet (par exemple le bas d'une voiture, avec "bottomCenter").
- **`group`** : créé avec `reveal = true`.
- **`line`, `ray`, `segment`, `arrow`** : propriétés de définition `p1`/`p2`, `origin`/`through`, `start`/`end`.
- **`curve`** : `interpolation` entre `"spline"` et `"bezier"`, détail à confirmer.
- **`stop` et `unbind`** : actions séparées, une erreur si elles visent le mauvais mécanisme.
- **Propriétés de style** : `fill`, `stroke`, `strokeWidth`, `color`, à préciser dans la doc des classes.
