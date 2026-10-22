# Presk — kit d'agents (pour l'humain)

## Installation
1. Dézippe ce dossier **à côté** de ton projet : `<parent>/presk-kit/` et `<parent>/<ton-projet>/`.
2. Vérifie que la spec est bien dans le projet : `<ton-projet>/language/Presk — Spécification v1.0.md`.
3. Crée un commit propre dans le projet (l'agent démarrera par `git switch -c presk-v1`).

## Lancer un agent (à coller à chaque session)
> Tu es un agent d'exécution. Le kit est dans `../presk-kit/` et le projet dans `./`.
> Lis `../presk-kit/agent.md` puis `../presk-kit/BACKLOG.md`, et suis la boucle d'exécution décrite.
> Enchaîne les tâches sans me demander confirmation, jusqu'à ce qu'une règle d'arrêt s'applique.

(Remplace les chemins selon ton outil. Une session = une reprise du backlog : l'agent retrouve tout seul où il en est.)

## Ce que tu as à faire toi-même
- Lire `architecture/open-questions.md` (Q1–Q23) : choix déjà tranchés là où la spec se tait. Corrige ceux qui ne te conviennent pas **avant** que les tâches concernées ne soient exécutées (dis-le-moi : je mets à jour les ADR et tâches).
- Quand un agent s'arrête en `BLOCKED` ou `FAILED` : lis `BACKLOG.md › Questions pour l'architecte` / `Journal`. Ce sont des questions de conception : à me remonter.
- Les contrôles visuels (`BACKLOG.md › Contrôles humains`) sont à toi.

## Contenu du kit
| Fichier / dossier | Rôle |
|---|---|
| `agent.md` | règles et boucle d'exécution (lu à chaque session) |
| `BACKLOG.md` | état d'avancement, reprise après coupure, journal, questions |
| `architecture/00-overview.md` | architecture cible, carte legacy → nouveau, phases |
| `architecture/gap-analysis.md` | écarts spec v1.0 ↔ code existant |
| `architecture/conventions.md` | style, contraintes TypeScript, commandes |
| `architecture/open-questions.md` | choix là où la spec est silencieuse (à valider) |
| `architecture/decisions/` | 20 ADR (une décision = un fichier) |
| `architecture/contracts/` | signatures exactes (`C-*.md`) et fiches de classes (`classes/*.md`) |
| `tasks/` | 97 tâches microscopiques, chaînées par le backlog |
| `tasks/assets/T004/` | fichiers prêts à copier (garde-fou d'architecture, déjà testés) |

## Ce qui a été vérifié avant livraison
- Les 3 tests en échec de départ sont bien ceux de la tâche T002 ; `tsc` est vert avec T003 ; le garde-fou de T004 passe (12 tests) sur une copie de ton dépôt.
- 97 tâches : aucune dépendance cassée ni placée après coup, aucune référence à un ADR/contrat/fichier inexistant.
- Ce qui **n'a pas** été exécuté : le code des tâches P1 à P9 (les agents l'écrivent). Les valeurs attendues des cas de test ont été calculées à la main d'après la spec ; si un agent signale un écart, c'est une information précieuse.
