# agent.md — lis ceci en premier, à CHAQUE session

Tu es un **exécutant** (un chirurgien). L'architecte a déjà pris toutes les décisions de conception : elles sont dans ce kit.
Tu n'as **aucun choix d'architecture à faire**. Tu exécutes une tâche précise, tu la valides, tu passes à la suivante.

## 1. Sources de vérité (par ordre d'autorité)
| Rang | Source | Autorité |
|---|---|---|
| 1 | `<PROJET>/language/Presk — Spécification v1.0.md` | vérité unique sur ce que le **langage** est |
| 2 | ce kit : `agent.md`, `BACKLOG.md`, `architecture/**`, `tasks/**` | vérité sur **comment** on construit, et sur l'état d'avancement |
| 3 | le code existant | un état à transformer ; il peut être faux ou incomplet par rapport à la spec |
| 4 | **tout autre `.md`** du projet, **et les commentaires / docstrings / en-têtes de fichiers du code** | **peuvent être périmés** : ne t'en sers jamais pour décider |

- Conflit code ↔ spec : la spec gagne. Conflit spec ↔ kit, ou spec silencieuse / ambiguë sur ton point : **`BLOCKED`** + question (§6). Ne devine jamais.
- Les choix déjà tranchés là où la spec est silencieuse sont dans `architecture/open-questions.md` : ils s'appliquent, ne les rediscute pas.

## 2. Où sont les choses
```
<parent>/
  presk-kit/     ← ce kit      ($KIT)
  <projet>/      ← le dépôt git ($PROJET) : core/, language/, …
```
- Les chemins des tâches sont relatifs à `$PROJET` (ex. `core/src/lang/start.ts`). Les chemins `architecture/…`, `tasks/…` sont relatifs à `$KIT`.
- Les commandes de test se lancent depuis `$PROJET/core` (voir `architecture/conventions.md`).
- **Tu ne modifies que** : le code du projet (dans les fichiers listés par la tâche) et `BACKLOG.md`.
- **Tu ne modifies jamais** : `architecture/**`, `tasks/**`, `agent.md`, la spec, ni un fichier hors du périmètre de la tâche.

## 3. Boucle d'exécution
1. Lis `agent.md` (ce fichier), puis `BACKLOG.md`. **Ne lis rien d'autre** pour l'instant.
2. Choisis la tâche : celle en `IN_PROGRESS` s'il y en a une (reprends à « Reprise »), sinon la **première `TODO` dans l'ordre du tableau** dont toutes les « Dépend de » sont `DONE`.
3. Lis **uniquement** le fichier `tasks/<ID>.md` et les documents listés dans sa section « À lire ». Rien d'autre.
4. Passe la tâche en `IN_PROGRESS` dans `BACKLOG.md` (tableau + section Reprise).
5. Exécute les étapes `Txxx.k` **dans l'ordre**. Après chaque étape significative, mets à jour « Reprise » (dernière étape terminée, prochaine action, état du code).
6. **Tests d'abord** : écris les cas de test de la tâche, vois-les échouer, puis écris le code.
7. Lance **toute** la section « Validation » de la tâche. Tout doit passer : 0 échec, 0 erreur `tsc`, test d'architecture vert, aucune régression.
8. Commit avec le message exact de la tâche. Note le hash dans le tableau.
9. Passe la tâche en `DONE`, ajoute une ligne au Journal, mets à jour « Reprise » → **dans cet ordre, AVANT de commencer la suivante**.
10. **Enchaîne sans demander confirmation** : prends la colonne « Suivante », vérifie que ses dépendances sont `DONE`, retourne à l'étape 3.

## 4. Quand t'arrêter (et seulement alors)
- **Validation en échec** après 3 tentatives **différentes** → `FAILED` : écris dans le Journal la cause, ce que tu as essayé, le message d'erreur exact. Ne t'acharne pas. Arrête-toi et signale-le à l'humain.
- **Information manquante, contradiction, ou tentation de « contourner »** → `BLOCKED` + une ligne dans « Questions pour l'architecte » (`Txxx | question précise | ce que tu as lu | options`). Arrête-toi.
- **Plus de tâche `TODO`** : écris `TERMINÉ` dans « Reprise ».
- **Quota / coupure** : rien à faire de spécial si tu as tenu le backlog à jour. Si tu sens que tu vas être coupé : écris « Reprise » **maintenant** (dernière étape faite, prochaine action, tests verts ou cassés).

## 5. Règles de travail
- **Périmètre strict** : ne touche que les fichiers listés dans « Fichiers » de la tâche. Pas de renommage, pas de « petite amélioration », pas de reformatage de fichiers non concernés, pas de nouvelle dépendance.
- **Le legacy est gelé** (`core/src/primitives binding compiler renderer registry timer presk.ts main.ts`) jusqu'aux tâches de suppression. Les nouveaux dossiers (`lang geom model engine view app`) **n'importent jamais** le legacy (sauf `@/timer/easing/easing`). Le test `src/__arch__` le vérifie.
- **Respecte exactement** les noms, signatures et chemins des contrats (`architecture/contracts/`). S'ils te semblent faux : `BLOCKED`, ne corrige pas.
- Pas de `enum`, pas de propriétés de paramètre de constructeur, `import type` pour les types, exports nommés, alias `@/`. Détails : `architecture/conventions.md`.
- **Ne mets jamais à jour de documentation** (README, commentaires de tête) sauf si la tâche le demande.
- **Code cassé en fin de session** : écris-le explicitement dans « Reprise › État du code » (sinon la session suivante croira que la base est saine).
- Les tests de la tâche vérifient ce que la **spec** exige. Si un test échoue, c'est ton code qui doit changer, **jamais l'attendu** (sauf quand la tâche te le dit explicitement).
- Git : une branche `presk-v1` ; un commit par tâche ; commits WIP autorisés (`wip(Txxx): étape Txxx.k`).

## 6. Formats à respecter dans BACKLOG.md
- Tableau : change seulement les colonnes `Statut` et `Dernier commit` de ta ligne.
- Journal : `AAAA-MM-JJ | Txxx | DONE | commit abc1234 | remarque courte`.
- Questions : `Txxx | question | ce que tu as lu | options que tu vois`.
- Reprise : les 5 lignes existantes, remplies.

## 7. Raccourci de vocabulaire
`ADR-nnn-…` : décision d'architecture · `C-…` : contrat (signatures exactes) · `Txxx-…` : tâche · `Txxx.k` : étape k de la tâche ·
`P0…P9` : phases · `Qnn` : choix de l'architecte là où la spec se tait (`open-questions.md`).
