# Presk : un DSL de présentation animée — Spécification v0.1

## 1. Objectif

Presk permet de décrire une présentation pédagogique animée sous forme d'une suite d'actions.

Il est conçu pour être :

* facilement générable par une IA ;
* déterministe et strict ;
* lisible par un humain ;
* indépendant du moteur graphique utilisé pour le rendu.

Le DSL décrit **ce qui doit apparaître et comment il doit évoluer**, jamais la manière technique de le dessiner.

---

## 2. Structure générale

```json
{
  "version": "0.1",

  "scene": {
    "width": 1920,
    "height": 1080,
    "background": "#101014"
  },

  "steps": []
}
```

`steps` est une liste d'actions exécutées dans l'ordre.

---

## 3. Vue d'ensemble des actions

| Action | Rôle |
| --- | --- |
| `create` | crée un nouvel objet |
| `set` | assigne une valeur instantanément, sans interpolation |
| `transform` | anime une propriété vers une valeur **constante** |
| `follow` | maintient une propriété égale à une expression, en continu ou sur une progression pilotée |
| `unfollow` | arrête un `follow` en cours sur une ou plusieurs propriétés |
| `group` | rattache des objets à un groupe (le crée si nécessaire) |
| `ungroup` | détache des objets d'un groupe |
| `destroy` | détruit un objet |

Toutes les actions (sauf mention contraire) partagent le même bloc de timing : `start`, `duration`, `ease` (voir §6).

---

## 4. Système de coordonnées

* Origine `(0, 0)` = **coin supérieur gauche de la scène**.
* Axe `x` croissant vers la droite, axe `y` croissant vers le bas — convention identique à CSS, SVG et Canvas 2D, choisie pour rester la plus naturelle possible à générer par une IA.
* Axes en unités arbitraires, indépendantes de la résolution de rendu (`scene.width`/`scene.height` ne servent qu'au rendu final, pas au repère de positionnement).

Chaque objet expose deux catégories d'accesseurs, utilisables à la fois comme valeurs à définir et comme points de référence dans les expressions (§8). C'est le **seul et unique** vocabulaire de positionnement du DSL : il n'existe pas de raccourcis alternatifs (pas de `left`/`right`/`top`/`bottom`/`centerX`/`centerY`), afin de donner à l'IA génératrice un moyen unique et sans ambiguïté d'exprimer une position.

### 4.1 Scalaires directs

| Propriété | Description |
| --- | --- |
| `x`, `y` | position de l'origine locale de l'objet |
| `width`, `height` | dimensions locales, avant rotation |
| `scale`, `rotation`, `opacity` | propriétés visuelles animables |

### 4.2 Points géométriques (chaînables)

Ces accesseurs retournent un **point**, pas un scalaire directement utilisable dans une expression arithmétique — il faut obligatoirement chaîner `.x` ou `.y` pour en extraire une coordonnée :

| Point | Description |
| --- | --- |
| `topLeft`, `topRight`, `bottomLeft`, `bottomRight` | coins réels du rectangle de l'objet ; suivent la rotation, restent toujours sur le coin géométrique de l'objet, tourné ou non |
| `center` | centre de l'objet |

```
"x": "title.topRight.x"
"y": "title.topRight.y"
```

### 4.3 Boîte englobante (`boundingBox`)

Préfixer un point par `boundingBox.` donne le point correspondant sur la **bounding box axis-aligned**, recalculée après rotation — les 4 coins de cette boîte restent toujours alignés aux axes x/y de la scène, quitte à ce que la boîte change de taille/forme apparente à chaque frame si l'objet tourne. Utile pour du layout ou de la détection de collision, pas pour accrocher visuellement un élément à un coin qui doit suivre la rotation :

```
"x": "title.boundingBox.topLeft.x"
"y": "title.boundingBox.center.y"
```

`scene` est un identifiant réservé désignant la racine, et suit les mêmes règles :

```
"scene.center.x"
"scene.width"
```

---

## 5. Cycle de vie d'un objet

```text
create → (set | transform | follow | unfollow | group | ungroup)* → destroy
```

### 5.1 `create`

```json
{
  "action": "create",
  "target": "title",
  "type": "text",
  "properties": {
    "text": "COD, COI et COS",
    "x": 0,
    "y": 0
  }
}
```

### 5.2 `set`

Assigne une valeur **instantanément**, sans interpolation ni consommation de durée sur la timeline. Équivalent du `.set()` de GSAP.

```json
{
  "action": "set",
  "target": "dot",
  "properties": {
    "x": 0,
    "opacity": 1
  }
}
```

Règles :

* `duration` est toujours `0` ; une valeur explicite `> 0` est une erreur.
* `ease` n'a pas de sens et est interdit.
* `start` reste valide (position dans la timeline).
* Une expression de type path (§9) à **trois arguments** (valeur animée) est interdite dans un `set` ; seule la forme à deux arguments (valeur figée) est autorisée.

### 5.3 `transform`

Anime une ou plusieurs propriétés vers une **valeur constante**, sur une durée donnée. C'est la seule sémantique de `transform` : une interpolation classique depuis la valeur courante vers une cible fixe, évaluée une seule fois au démarrage de l'action (voir §8.3).

```json
{
  "action": "transform",
  "target": "title",
  "properties": {
    "x": 0,
    "y": 0,
    "scale": 0.7
  },
  "duration": 0.8,
  "ease": "power2.out"
}
```

### 5.4 `destroy`

```json
{
  "action": "destroy",
  "target": "title"
}
```

---

## 6. Timing



Toute action (hors précisions du §5.2 pour `set`) accepte :

```json
{
  "start": "...",
  "duration": 1,
  "ease": "..."
}
```

Les trois propriétés sont indépendantes de l'action elle-même :

```text
WHAT     → action + target + properties
WHEN     → start
HOW LONG → duration
HOW      → ease
```

### 6.1 `start`

Détermine quand l'action commence. Valeur par défaut :

```text
"start": ">"
```

L'action commence à la fin de l'action précédente. Le moteur doit interpréter `start` comme un **position parameter**, indépendant de l'action elle-même.

Méthodes de timing disponibles (identiques à GSAP) :

| Type / Méthode de timing | Exemple de syntaxe | Description |
| --- | --- | --- |
| Temps absolu | `3` ou `"3"` | Démarre exactement à la marque de seconde spécifiée depuis le début de la timeline. |
| Écart de fin (relatif) | `"+=1"` | Démarre 1 seconde après la fin actuelle de toute la timeline. |
| Chevauchement de fin (relatif) | `"-=1"` | Démarre 1 seconde avant la fin actuelle de toute la timeline. |
| Ancre de début précédent | `"<"` | Aligne le début de cette action avec le début de l'action précédente. |
| Ancre de fin précédent | `">"` | Aligne le début de cette action avec la fin de l'action précédente. |
| Décalage d'ancre (post-début) | `"<1"` ou `"<+=1"` | Démarre N secondes après le début de l'action précédente. |
| Décalage d'ancre (pré-début) | `"<-0.5"` ou `"<=-0.5"` | Démarre N secondes avant le début de l'action précédente. |
| Décalage d'ancre (post-fin) | `">1"` ou `">+=1"` | Démarre N secondes après la fin de l'action précédente. |
| Décalage d'ancre (pré-fin) | `">-0.5"` ou `">=-0.5"` | Démarre N secondes avant la fin de l'action précédente. |
| Ancre d'étiquette nommée | `"menuOpen"` | Aligne l'action sur un repère nommé de la timeline. |
| Décalage d'étiquette | `"menuOpen+=0.5"` / `"-=0.5"` | Démarre N secondes après ou avant une étiquette nommée. |

#### Nommer une action (étiquette de timeline)

Toute action peut recevoir un champ optionnel `name`, qui lui donne une
**étiquette** utilisable par la suite comme valeur de `start` (§6.1,
« Ancre d'étiquette nommée »). Ce nom identifie l'**action elle-même**
dans la timeline, pas l'objet ciblé par `target` — plusieurs actions
peuvent viser le même `target`, mais chaque `name` doit être unique sur
l'ensemble de la timeline.

```json
{
  "action": "transform",
  "target": "menu",
  "name": "menuOpen",
  "properties": { "x": 0 },
  "duration": 0.5
}
```

```json
{
  "action": "create",
  "target": "codLabel",
  "type": "text",
  "properties": { "text": "COD" },
  "start": "menuOpen+=0.5",
  "duration": 0.5
}
```

Règles :

* `name` est optionnel ; une action sans `name` ne peut simplement pas
  être référencée comme étiquette par la suite.
* Un `name` dupliqué sur deux actions distinctes est une erreur de
  compilation.
* `name` n'a aucun effet sur l'exécution de l'action elle-même — c'est
  uniquement un repère pour le système de timing (§6.1).

### 6.2 `duration`

Durée de l'action, en secondes.

```json
{ "duration": 1.5 }
```

Une action instantanée utilise `{ "duration": 0 }`.

### 6.3 `ease`

Fonction d'interpolation de la transition, au sens des easing functions GSAP :

```text
linear
power1.in / power1.out / power1.inOut
power2.in / power2.out / power2.inOut
power3.in / power3.out / power3.inOut
power4.in / power4.out / power4.inOut
back.out
elastic.out
bounce.out
```

### 6.4 Exemples

**Démarrer en même temps que l'action précédente**

```json
{
  "action": "transform",
  "target": "title",
  "properties": { "x": 0, "y": 0, "scale": 0.7 },
  "start": "<",
  "duration": 1,
  "ease": "power2.out"
}
```

**Commencer 1 seconde après le début de l'action précédente**

```json
{
  "action": "create",
  "target": "sentence",
  "type": "text",
  "properties": {
    "text": "Paul donne un livre à Marie.",
    "x": 0,
    "y": 100
  },
  "start": "<1",
  "duration": 0.5,
  "ease": "power1.out"
}
```

**Commencer 0,5 seconde avant la fin de l'action précédente**

```json
{
  "action": "transform",
  "target": "sentence",
  "properties": { "opacity": 1 },
  "start": ">-0.5",
  "duration": 0.5,
  "ease": "power1.out"
}
```

**Position absolue sur la timeline**

```json
{
  "action": "transform",
  "target": "title",
  "properties": { "scale": 1 },
  "start": 3,
  "duration": 1,
  "ease": "power2.out"
}
```

**Étiquette nommée, avec décalage**

```json
{
  "action": "transform",
  "target": "codLabel",
  "properties": { "opacity": 1 },
  "start": "explainCOD+=0.5",
  "duration": 0.5,
  "ease": "power1.out"
}
```

---

## 7. Groupes

Traité ici car les groupes sont des objets à part entière et interagissent avec le système de points géométriques du §4 — voir §7.3.

### 7.1 `group`

Rattache un ou plusieurs objets à un groupe. Le groupe est créé implicitement si `target` ne correspond à aucun objet existant.

```json
{
  "action": "group",
  "target": "circuitGroup",
  "properties": {
    "children": ["wire1", "switch", "lamp"],
    "keepVisual": true
  }
}
```

`children` accepte un identifiant unique ou un tableau d'identifiants.

`keepVisual` détermine comment sont recalculées les propriétés locales (`x`, `y`, `scale`, `rotation`) de chaque enfant au moment du rattachement :

* **`true`** *(par défaut)* : le moteur calcule la transformation locale de l'enfant de façon à ce que son rendu à l'écran ne change pas, quelle que soit la transformation déjà appliquée au groupe. Concrètement, `local = inverse(groupWorldTransform) × childWorldTransform`.
* **`false`** : l'enfant garde ses valeurs `x`/`y`/`scale`/`rotation` brutes, mais celles-ci sont désormais interprétées dans le repère du groupe — l'enfant peut donc visuellement « sauter » si le groupe n'est pas à l'identité.

`duration`/`ease` n'ont de sens que si `keepVisual: false` (ils animent alors la transition entre la position visuelle actuelle et la position recalculée dans le nouveau repère). Avec `keepVisual: true`, rien ne change visuellement à l'instant du `group` : une `duration > 0` explicite doit être considérée comme une erreur.

```json
{
  "action": "group",
  "target": "circuitGroup",
  "properties": {
    "children": "lamp",
    "keepVisual": false
  },
  "duration": 0.6,
  "ease": "power2.inOut"
}
```

Si un enfant ciblé appartient déjà à un autre groupe, il est **reparenté silencieusement** : retiré de l'ancien groupe, ajouté au nouveau, avec la même sémantique `keepVisual` appliquée par rapport au nouveau parent.

### 7.2 `ungroup`

Détache un ou plusieurs enfants d'un groupe. `target` désigne le groupe et reste obligatoire, pour permettre au moteur de valider que les `children` lui appartiennent bien.

```json
{
  "action": "ungroup",
  "target": "circuitGroup",
  "properties": {
    "children": ["switch", "lamp"],
    "keepVisual": true
  }
}
```

`keepVisual` suit la même logique qu'au §7.1, en sens inverse :

* **`true`** *(par défaut)* : le moteur recalcule les propriétés absolues de l'enfant pour qu'il ne bouge pas visuellement au moment de sa sortie du groupe.
* **`false`** : l'enfant garde ses valeurs locales brutes, désormais réinterprétées comme absolues — saut visuel possible, animable via `duration`/`ease`.

Si `children` est omis, tous les enfants sont détachés et le groupe lui-même est détruit.

### 7.3 Interaction avec les points géométriques (§4)

Un groupe expose les mêmes accesseurs que n'importe quel objet (`topLeft`, `center`, `boundingBox.*`, etc.), calculés par défaut comme la bounding box de ses enfants, sauf si le groupe a reçu un `width`/`height` explicite via `transform`. Un `transform` ou un `follow` appliqué directement au groupe (`x`, `y`, `scale`, `rotation`) affecte récursivement tous ses enfants.

---

## 8. Expressions et positionnement relatif

### 8.1 Principe

Plutôt que de calculer des coordonnées absolues, un objet peut se positionner **relativement à un autre objet**, via une expression textuelle. Cette expression est parsée en un petit AST, évalué au moment approprié (voir §8.3 pour la distinction snapshot / continu).

```json
{
  "action": "create",
  "target": "codLabel",
  "type": "text",
  "properties": {
    "text": "COD",
    "x": "title.center.x",
    "y": "title.bottomLeft.y + 40"
  }
}
```

### 8.2 Grammaire des expressions

```
expr        := term (("+" | "-") term)*
term        := factor (("*" | "/") factor)*
factor      := number | reference
reference   := identifier "." segment ("." segment)*
segment     := scalarProp | pointProp | "boundingBox"
scalarProp  := "x" | "y" | "width" | "height" | "scale" | "rotation" | "opacity"
pointProp   := "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "center"
```

Règle de résolution : une `reference` doit toujours se terminer sur un `scalarProp`. Un `pointProp` peut être précédé optionnellement de `boundingBox`, mais doit ensuite obligatoirement être suivi de `.x` ou `.y` — un `pointProp` isolé n'est pas une valeur numérique valide dans une expression arithmétique.

Exemples valides :

```
"title.topRight.x + 20"
"title.boundingBox.topLeft.y - 100"
"scene.center.x"
"title.width / 2"
```

Exemples invalides (erreur de parsing) :

```
"title.topRight"          // point sans .x/.y
"title.boundingBox"       // boundingBox sans point ni scalaire
"title.left"              // n'existe pas : utiliser title.topLeft.x
```

Pas de parenthèses ni d'appels de fonction généraux dans cette grammaire de base (les fonctions de path, §9, suivent une syntaxe dédiée). Volontairement limité pour rester facilement générable par une IA et trivial à parser.

### 8.3 Résolution : `transform` fige, `follow` maintient

C'est la règle la plus importante du DSL à retenir :

* Dans un **`transform`**, une expression est évaluée **une seule fois**, au moment où l'action démarre. La valeur obtenue devient la cible fixe de l'interpolation — cohérent avec la sémantique de `transform` (§5.3) : on anime toujours vers une constante.
* Dans un **`follow`** (§10), l'expression est réévaluée en continu, à chaque frame — voir §10 pour la sémantique complète.

Il n'existe pas de flag intermédiaire : si vous voulez une valeur qui bouge en suivant une autre propriété, l'action à utiliser est `follow`, jamais `transform`.

### 8.4 Résolution des dépendances

Le moteur doit :

1. Parser chaque expression en AST au moment du `create`/`transform`/`follow`.
2. Construire un graphe de dépendances entre objets (ex. `codLabel.x` dépend de `title.topRight.x`).
3. Détecter les **cycles** à la compilation (erreur explicite, jamais au runtime).
4. Évaluer en ordre topologique : une seule fois pour un `transform`, à chaque frame pour un `follow` actif.

### 8.5 Erreurs à gérer explicitement

* Référence à un `target` inexistant ou pas encore créé → erreur claire.
* Référence à un `target` déjà détruit → erreur claire.
* Cycle de dépendance entre expressions → erreur à la compilation.
* Segment inconnu ou mal formé (ex. `title.left`, `title.topRight` sans `.x`/`.y`) → erreur de parsing.

---

## 9. Ancrage sur une courbe (path)

### 9.1 Principe

Un objet (par exemple une fonction mathématique tracée à l'écran, ou un polygone) peut exposer un ou plusieurs **paths** nommés. Chaque path fournit trois fonctions de projection :

```
<target>.pathX(<pathName>, <t>)
<target>.pathY(<pathName>, <t>)
<target>.pathAngle(<pathName>, <t>)
```

où `t` est une position normalisée entre `0` (début du path) et `1` (fin du path). `pathAngle` retourne la tangente à la courbe en `t`, utile pour orienter un objet (ex. une flèche) dans le sens du déplacement. Le résultat de `pathX`/`pathY` est déjà exprimé dans le repère de la scène (§4) — aucune conversion supplémentaire n'est nécessaire, même si le path est défini en interne dans un repère local propre à la courbe.

### 9.2 Valeur figée vs valeur animée

```
<target>.pathX(<pathName>, <t>)                → valeur figée, un seul paramètre de position
<target>.pathX(<pathName>, <start>, <end>)     → valeur animée, progression pilotée par l'action qui la contient
```

**Valeur figée** (point fixe à 50 % du path, ne bouge jamais) :

```json
{
  "action": "create",
  "target": "dot",
  "type": "shape",
  "properties": {
    "x": "sineCurve.pathX(main, 0.5)",
    "y": "sineCurve.pathY(main, 0.5)"
  }
}
```

**Valeur animée** — nécessite `follow` (voir §10.2), car un path à trois arguments décrit une trajectoire dans le temps, pas une constante. Utiliser cette forme dans un `transform` est une erreur : `transform` anime toujours une propriété vers une valeur fixe, jamais vers une fonction du temps.

---

## 10. `follow` et `unfollow` — binding continu

### 10.1 Principe

`follow` maintient une égalité entre une propriété du `target` et une expression, réévaluée en continu — à ne pas confondre avec `transform`, qui anime toujours vers une constante figée au démarrage (§8.3).

```json
{
  "action": "follow",
  "target": "arrow",
  "properties": {
    "x": "dot.x",
    "y": "dot.y"
  }
}
```

Tant que `dot.x`/`dot.y` changent (par un `transform`, un autre `follow`, etc.), `arrow` recopie la valeur à chaque frame.

### 10.2 `follow` avec progression pilotée (path)

Quand les expressions utilisent un path à trois arguments (`pathX(name, start, end)`), `duration`/`ease` ne pilotent pas directement la propriété — ils pilotent le paramètre interne `t`, qui progresse de `start` à `end` sur la durée donnée. `pathX`/`pathY`/`pathAngle` se contentent de projeter ce `t` en coordonnées à chaque frame.

```json
{
  "action": "follow",
  "target": "dot",
  "properties": {
    "x": "sineCurve.pathX(main, 0.2, 0.8)",
    "y": "sineCurve.pathY(main, 0.2, 0.8)"
  },
  "duration": 2,
  "ease": "power1.inOut"
}
```

### 10.3 `follow` sans path — binding pur

Si `properties` ne contient que des références directes à d'autres objets (pas de fonction path), il n'y a pas de progression interne à piloter : `duration` n'a pas de sens et doit être omis. Le `follow` est alors **infini par défaut**, actif jusqu'à :

* un `destroy` du `target` ;
* une action `unfollow` explicite ;
* un autre `follow` ou `transform` qui reprend la main sur la même propriété (voir §10.5).

### 10.4 `unfollow`

Arrête un `follow` en cours sur une ou plusieurs propriétés. La propriété se fige à sa dernière valeur connue, redevenant pilotable normalement par `transform`/`set`.

```json
{
  "action": "unfollow",
  "target": "arrow",
  "properties": ["x", "y"]
}
```

### 10.5 Conflits de propriété

Un `target` ne peut avoir qu'un seul mécanisme actif sur une même propriété à la fois (`follow` ou `transform`, jamais les deux simultanément). Règle de résolution : **la dernière action déclarée sur cette propriété, dans l'ordre de la timeline, prend la main et arrête implicitement la précédente.** Le moteur peut émettre un avertissement non bloquant pour signaler l'écrasement, utile en débogage.

### 10.6 Exemple : électron se déplaçant dans un circuit

Un circuit est une suite de segments ; on enchaîne un `follow` par segment, chacun démarrant à la fin du précédent :

```json
{
  "action": "follow",
  "target": "electron",
  "properties": {
    "x": "wireAB.pathX(main, 0, 1)",
    "y": "wireAB.pathY(main, 0, 1)"
  },
  "duration": 1,
  "ease": "linear"
}
```

```json
{
  "action": "follow",
  "target": "electron",
  "properties": {
    "x": "wireBC.pathX(main, 0, 1)",
    "y": "wireBC.pathY(main, 0, 1)"
  },
  "start": ">",
  "duration": 1,
  "ease": "linear"
}
```

Une flèche indicatrice qui suit en continu la position et l'orientation de l'électron :

```json
{
  "action": "follow",
  "target": "arrowIndicator",
  "properties": {
    "x": "electron.x",
    "y": "electron.y",
    "rotation": "electron.rotation"
  }
}
```

### 10.7 Exemple : flèche accrochée à un coin tourné

Cas d'usage direct du système de points géométriques (§4.2) : une flèche qui reste accrochée au coin haut-droite d'un objet, même si celui-ci tourne.

```json
{
  "action": "follow",
  "target": "arrow",
  "properties": {
    "x": "box.topRight.x",
    "y": "box.topRight.y",
    "rotation": "box.rotation"
  }
}
```

`topRight` désigne toujours le coin réel du rectangle, qu'il ait tourné ou non (§4.2) — c'est la forme à utiliser ici, par opposition à `boundingBox.topRight` qui recalculerait un coin sur une boîte réalignée aux axes, non souhaité dans ce cas.

---

## 11. Récapitulatif des actions

| Action | `duration` | `ease` | Notes |
| --- | --- | --- | --- |
| `create` | optionnel (défaut `0`) | optionnel | crée l'objet, peut apparaître avec une transition |
| `set` | toujours `0` | interdit | assignation instantanée, pas d'expression path animée |
| `transform` | requis si interpolation | recommandé | anime toujours vers une valeur **constante** |
| `follow` | optionnel | optionnel | absent = binding infini ; présent = pilote la progression `t` d'un path |
| `unfollow` | n/a | n/a | arrête un `follow` en cours |
| `group` | pertinent seulement si `keepVisual: false` | idem | crée le groupe si absent |
| `ungroup` | pertinent seulement si `keepVisual: false` | idem | détruit le groupe si `children` omis |
| `destroy` | n/a | n/a | retire l'objet définitivement |