# Analyse d'écart : spec v1.0 ↔ code existant

Légende : ✅ conforme · ⚠️ divergent · ❌ absent. « Traité par » = phase/tâches (voir BACKLOG).
Le code existant est lu **sans faire confiance** aux commentaires ni aux README (ils décrivent une v0.1 périmée).

## Constat global
Le code implémente un langage **v0.1** : actions `create/set/transform/follow/unfollow/group/ungroup/destroy`, `version: "0.1"`.
La spec v1.0 : `create/set/animate/travel/bind/unbind/stop/group/ungroup`, objets jamais détruits, effets (`reveal`), chemins.
**Base mesurée** (avant chantier) : 184 tests passent, 3 échouent, `tsc` signale 2 erreurs.
Tous les `input*.json` du dépôt sont en v0.1 → inutilisables tels quels.

## Langage
| Spec | État | Écart constaté dans le code | Traité par |
|---|---|---|---|
| §2.1 champs, §12.1 champs autorisés par action | ❌ | Aucune validation : tout champ est accepté silencieusement | P1 (T019–T023) |
| §2.2 `animate` | ⚠️ | Existe sous le nom `transform`, sans effets, sans `repeat` | P4 |
| §2.2 `bind`/`unbind` | ⚠️ | `follow`/`unfollow`, sans règles de conflit ni cibles figées | P4 |
| §2.2 `stop`, `travel` | ❌ | Absents | P4 (`stop`), P6 (`travel`) |
| §2.2 `group`/`ungroup` | ❌ | Stub : `console.warn` puis ignoré | P7 |
| (non spec) `destroy` | ⚠️ | Existe ; la spec §4 dit « jamais détruits » | supprimé à la bascule |
| §4.1 `create` hors timeline, objet invisible, `reveal` | ⚠️ | `create` est sur la timeline (anime scale/opacity, 0,4 s par défaut), champ `follow` non spec | P4, P5 |
| §4.1 référence vers objet futur = erreur | ⚠️ | Le code fait 2 passes **pour permettre** les références futures | T069 |
| §5.2 effets, §5.3 `reveal` | ❌ | Absents (`visible` booléen + tween d'échelle) | T053, T076 |
| §6.1 `start` : `"<3"`, `">2"`, `"nom<5"`, `"nom>-2"` | ⚠️ | Le code parle GSAP (`+=1`, `nom+=0.3`) ; `nom>x` absent | T013 |
| §6.1 défaut = fin de l'action **précédente** | ⚠️ | Le code utilise `cursor = max(fins)` | T064 |
| §6.4–6.6 `repeat`, `yoyo`, infinis, durée de scène | ❌ | Absents | T065, T078 |
| §6.3 31 easings | ✅ | `timer/easing` conforme (31 fonctions) ; **conservé** | T012 (garde-fou) |
| §7.1–7.2 grammaire d'expressions stricte | ⚠️ | Accès réflexif à n'importe quelle propriété (`title.left` accepté, spec : erreur) ; pas de `-` unaire ; parse+évalue en une passe | T015–T017, T060–T061 |
| §7.2 point entier en arithmétique = erreur | ✅ | Détecté à l'exécution seulement (doit être à la compilation) | T060 |
| §7.3 cycles autorisés, pas de tri topologique | ⚠️ | Les **docs** parlent de tri topologique et de détection de cycles : **FAUX** par rapport à la spec | ADR-010 |
| §7.4 `pathX/pathY/pathAngle` | ❌ | Absents | P6 |
| §7.1 valeur string : expression ou littéral ? | ⚠️ | Heuristique regex dans `resolveNow` | T062 (décidé par le type de propriété) |
| §3.1 `rotation` en degrés | ⚠️ | Le code passe la valeur en **radians** à `rotate()` | T031 |
| §3.1 `pos` = coin haut-gauche (famille rectangle) | ⚠️ | `pos` = point d'ancrage (`anchorX/Y`, défaut centre) ; rendu toujours centré | ADR-006, T042 |
| §3.1 pivot = centre par défaut, propriété `pivot` | ❌ | Remplacé à tort par `anchorX/anchorY` | ADR-006 |
| §3.2 ancres `centerLeft`/`centerRight` | ⚠️ | Le code les nomme `leftCenter`/`rightCenter` | T047 |
| §3.2 `top/bottom/left/right` scalaires | ⚠️ | Existent dans le code, **absents de la spec** (erreur de segment inconnu) | T047 |
| §3.3 `boundingBox` sur tout objet borné | ⚠️ | Existe sur rectangle seulement, objet partiel | T048 |
| §3.4 ancres propres (`vertex[i]`, `start`, `end`…) | ❌ | Absentes | P6 |
| §3.5 vue de la scène (`focusOn`, `view`, `zoom`) | ❌ | Absente | P8 |
| §5.4 / §9.3–9.4 conflits de propriétés, équivalences | ❌ | Aucun suivi de propriété | T067, ADR-011 |
| §8 chemins, `travel` | ❌ | Absents | P6 |
| §10 groupes, layouts | ⚠️ | Hiérarchie parent/enfant existe dans `KObject`, pas de `group` DSL ni de layout | P7 |
| §11 `circle`, `ellipse`, `arc`, `polygon`, `triangle`, `polyline`, `curve`, `ray`, `line`, `point`, `image`, `segment`, `arrow` | ❌ | Seuls `rectangle` (alias legacy `shape`), `text`, `line` existent | P6, P9 |
| §11 `line` = droite infinie par `p1`,`p2` | ⚠️ | Le `line` du code est en réalité un **segment** (`startX/startY/endX/endY`, pastilles aux extrémités) → à migrer vers `segment` | T115 |
| §11.3 style `fill/stroke/strokeWidth/color` (couleurs CSS) | ⚠️ | Couleurs numériques (`0x9c9c9c`) ; chaînes acceptées sans validation | T033, ADR-019 |
| (non spec) `text.frame`, `margins` | ⚠️ | Extension non spec dans `KText` ; **retirée** de v1.0 (voir open-questions Q12) | T050 |
| §11.2 dimensions de `text` calculées par le moteur, connues dès `create` | ⚠️ | Mesurées par la couche graphique **après** coup, qui **écrit dans le modèle** | ADR-014, T049 |

## Architecture
| Sujet | Constat | Traité par |
|---|---|---|
| Séparation modèle / rendu | Bonne idée à garder (`primitives` sans Pixi) | ADR-003 |
| Rendu mute le modèle (`KGraphicText` écrit `width/height`) | À interdire | ADR-014, ADR-017 |
| `KTimer` + `KTween` « seekables » | Fonctionne pour l'ancien modèle ; ne gère pas `bind` par frame, ownership, infinis, `travel` | ADR-010 (simulation par ticks, rejeu depuis 0) |
| Détection d'expression par regex | Fragile | ADR-007, ADR-008 |
| `Presk.create` mélange registre, scène, rendu | À découper | `engine/` + `app/` |
| `tsconfig` : `ktimer.live.ts` casse `tsc` (`process`) | Erreur de type pré-existante | T003 |
| Tests obsolètes (3 KO : `kobject.create`, 2 compiler/follow-on-create) | Testent la v0.1 | T002 |
| Dépendance `pnpm-workspace` vers `lib/*` inexistant | Inoffensif, **ne pas toucher** | — |

## Assets réutilisables du code existant
- `timer/easing/**` (31 easings, licence MIT, **ne pas modifier**).
- Usage de `transformation-matrix` (garder la dépendance, l'encapsuler dans `geom/matrix.ts`).
- Squelette PixiJS : `KRenderer` (init Application, canvas), dessin `Graphics`/`Text`, `setFromMatrix`.
- `index.html`, `style.css` (contrôles play/pause/curseur).
- Idée d'un temps « seekable » (on la garde via rejeu déterministe).
