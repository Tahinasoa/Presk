# 00 — Vue d'ensemble de l'architecture cible

> Source de vérité du **langage** : `language/Presk — Spécification v1.0.md` (dans le projet).
> Ce fichier décrit **comment** on construit le moteur. Il ne redéfinit jamais le langage.

## 1. Ce qu'on construit

Un moteur qui lit un document Presk (JSON, spec v1.0), le **valide strictement**, le **compile** en un programme,
puis le **simule** de façon déterministe (temps → état de la scène) et le **dessine** (PixiJS).

Le code existant implémente une **v0.1** du langage (actions `transform`, `follow`, `destroy`…). La v1.0 change
le vocabulaire et plusieurs sémantiques. On ne « répare » donc pas l'existant : on construit le nouveau pipeline
à côté (stratégie étrangleur, voir ADR-001), puis on bascule et on supprime le legacy.

## 2. Pipeline

```
JSON brut ──validateDocument──▶ DslDocument typé          (lang/)   structure seulement
          ──compileProgram───▶ Program                    (engine/) sémantique : classes, expressions, timing, conflits
          ──new Simulation───▶ World + état à l'instant t (engine/ + model/)
          ──views.update─────▶ pixels                      (view/)   seule couche qui importe PixiJS
```

## 3. Dossiers cibles (tous sous `core/src/`)

| Dossier | Rôle | Dépend de | Pixi ? |
|---|---|---|---|
| `lang/` | Types du DSL, diagnostics, validation structurelle, parseurs (start, expressions), noms d'easing | rien | non |
| `geom/` | Maths pures : points, matrices, boîtes, couleurs, chemins aplatis | rien | non |
| `model/` | Objets de scène (état, transform, ancres, effets, classes du catalogue) | `lang/` (types), `geom/` | non |
| `engine/` | Compilation (analyse, planning, conflits) et simulation (ticks, mécanismes) | `lang/`, `geom/`, `model/`, `timer/easing` | non |
| `view/` | Vues PixiJS lisant `model/` | `model/`, `geom/` | **oui** |
| `app/` | Façade `Presk`, câblage, démo | tout | oui |

Règles de dépendance : voir ADR-003 (vérifiées automatiquement par `T004`).

## 4. Carte legacy → nouveau

| Legacy (gelé jusqu'à la bascule) | Devenir |
|---|---|
| `timer/easing/**` | **CONSERVÉ tel quel** (déplacé en `lang/easing` à la toute fin) |
| `timer/ktimer.ts`, `timer/tween/**`, `timer/ktimer.live.ts` | remplacés par `engine/` (Simulation) → supprimés à la bascule |
| `primitives/**` (`KObject`, `KRectangle`, `KText`, `KLine`, `KScene`) | remplacés par `model/` → supprimés |
| `binding/**` | remplacé par `lang/expr` + `engine/` → supprimé |
| `compiler/**` (`compiler.ts`, `types.ts`, `input*.json`) | remplacé par `lang/` + `engine/` → supprimé |
| `renderer/**`, `registry/**`, `presk.ts`, `main.ts` | remplacés par `view/` + `app/` → supprimés |
| `index.html`, `style.css`, `vite.config.ts`, `tsconfig.json` | conservés (modifs ciblées par tâches) |

## 5. Phases

| Phase | Contenu |
|---|---|
| P0 | Base verte + garde-fou d'architecture |
| P1 | `lang/` : diagnostics, types, start, expressions, validation |
| P2 | `geom/` |
| P3 | `model/` : cœur + rectangle + text + scene |
| P4 | `engine/` : compilation + simulation (tranche verticale : create/set/animate/bind/stop/unbind/reveal) |
| P5 | `view/` + `app/` + bascule + suppression du legacy |
| P6 | Chemins et `travel` + formes (circle, ellipse, segment, arrow, polygon…) |
| P7 | Groupes et layouts |
| P8 | Vue de la scène (viewport / zoom) |
| P9 | `curve`, `image`, variante `draw`, finitions |

## 6. Glossaire

- **Étape (step)** : un élément de `steps`. **Action** : le champ `action` d'une étape.
- **Propriété de base (base key)** : clé d'état atomique (`x`, `y`, `rotation`…). Sert aux conflits (§9.4).
- **PropSpec** : description d'une propriété DSL d'une classe (type, clés écrites, accesseurs). ADR-008.
- **Mécanisme** : `animate`, `travel` ou `bind` actif. ADR-011.
- **Tick** : instant de simulation. ADR-010. **Program** : sortie de la compilation.
- **Legacy** : tout fichier existant avant ce chantier dans les dossiers marqués « gelé ».
