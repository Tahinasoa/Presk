# ADR-021
**Couleurs : chaînes canoniques avec alpha** · Réf spec : §11.3 (extension, Q24) · Complète **ADR-019** (qui reste valable pour les noms et les entrées `#rgb`/`#rrggbb`)

> ADR-019 disait : « représentation interne : nombre 0xRRGGBB, pas de canal alpha ». **Cette ADR remplace ces deux points.** Le reste d'ADR-019 (entrées acceptées, défauts) est inchangé.

## Contexte
Le moteur stockait les couleurs en nombres opaques. On veut un alpha propre à `fill`, `stroke` et `color`, interpolable par `animate`. Un audit du dépôt (migration d'essai validée sur une copie) montre que le format est « connu » à trois endroits : 13 lectures `getNumber("fill"|"stroke"|"color")` dans 5 vues, 10 classes qui écrivent leurs défauts (`0x9c9c9c`, `0xffffff`), et quelques getters de propriétés.
Piège central : `SceneObject.getNumber` est un **cast**. Une chaîne dans l'état ne fait donc **pas** échouer `tsc` : les erreurs n'apparaissent qu'à l'exécution. D'où `getColor`, accesseur vérifié.

## Décision
1. **Forme canonique** d'une couleur dans l'état : chaîne en minuscules, `"#rrggbb"` si l'alpha vaut 1, `"#rrggbbaa"` sinon (`aa` = octet 00..ff). Un alpha `ff` est **toujours omis** (une seule représentation de l'opaque).
2. **Entrées acceptées** par `parseColor` (documents) : `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa` (insensible à la casse), les 26 noms d'ADR-019, **et un entier JSON 0..0xFFFFFF**. Sortie : toujours la forme canonique. Pas de `rgb()`, `hsl()` (Q25 : ajoutables plus tard dans `parseColor` seul, sans autre changement).
3. **Jamais de nombre dans l'état** (une fois la migration finie) : `getColor` lève si l'état n'est pas une chaîne canonique.
4. **Interpolation** : canal par canal, **alpha compris** (octet 0..255), arrondi, clampé 0..255, puis reformatage canonique.
5. **API** (voir `contracts/C-geom-color-v2.md`) : `parseColor`, `lerpColor`, `splitColor`, `colorFromRgba`, `COLOR_STRING_RE` dans `geom/color.ts` ; `SceneObject.getColor(key)`.
6. **Ordre de migration** (tâches T157 à T163), choisi pour que le dépôt reste vert à chaque commit : (a) ajouter les fonctions sans rien changer ; (b) `getColor` ; (c) vues ; (d) lecture et interpolation en chaînes ; (e) bascule de `parseColor` ; (f) défauts des classes ; (g) nettoyage.

## Alternatives écartées
- **Objet `{r,g,b,a}`** : interpolation un peu plus simple, mais il faut un nouveau type d'état, et il touche ~18 fichiers de code et ~7 de test. La chaîne ne demande aucun nouveau type (`StateValue` contient déjà `string`).
- **`fillOpacity` / `strokeOpacity`** : moins de fichiers, mais deux propriétés de plus par classe et deux sources de vérité pour la transparence d'un remplissage. Reste possible plus tard sans conflit.
- **Nombre avec alpha dans l'octet de poids fort** : comportement de Pixi non vérifié ; ambigu avec les entiers du DSL.

## Conséquences
- `C-geom.md` (section `color.ts`) et ADR-019 sont partiellement périmés : `C-geom-color-v2.md` fait foi pour les couleurs.
- Les tests qui comparaient `0x9c9c9c` / `0xffffff` comparent maintenant `"#9c9c9c"` / `"#ffffff"`.
- Le rendu n'interprète jamais la chaîne (ADR-022).
