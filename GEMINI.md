# GEMINI.md — Architecture & Refactor Spec : Composition hiérarchique (rigid-body) pour Presk

Ce document sert de spécification d'implémentation et de référence architecturale pour le moteur Presk (`core/`).

---

## 0. Objectif métier et Vision

Les objets du moteur sont des **objets composés** (un chart fait de plusieurs rectangles + du texte, un graph fait de plusieurs lines, etc.).
On applique un comportement **rigid-body** strict :

> Transformer un parent (`x`, `y`, `scale`, `rotation`, `opacity`) affecte visuellement tous ses enfants, **sans jamais réécrire les coordonnées internes des enfants**. Un enfant à `x: 50` dans son parent reste à `x: 50` après que le parent ait bougé — seule sa position *rendue* (monde) change.

---

## 1. Décisions structurantes actées

1. **NE PAS fusionner `KObject` et `KGraphicObject`** :
   - Séparation stricte entre données pures (`primitives/`, zéro import PixiJS, testables sans DOM/WebGL) et rendu (`renderer/`, PixiJS, lecture seule de l'état).
2. **Composition hiérarchique généralisée à tout `KObject`** :
   - N'importe quel `KObject` peut porter des enfants via `addChild()` / `removeChild()` / `getChild()`.
   - La composition de matrices 2D repose exclusivement sur la bibliothèque pure **`transformation-matrix`** (`compose`, `translate`, `rotate`, `scale`, `applyToPoint`, `inverse`).
3. **Rendu délégué aux matrices monde (`transformation-matrix` + PixiJS)** :
   - `KObject.worldMatrix()` calcule la matrice monde en pur TS.
   - Le renderer applique directement la matrice monde calculée à l'objet visuel PixiJS (`localTransform.set(...)`), éliminant les redondances de calcul entre data et PixiJS.
4. **Ticker unifié déterministe (`presk.ts`)** :
   - Ordre fixe à chaque frame : 1. Mise à jour GSAP → 2. `binding.flush()` → 3. `graphicScene.tick()`.

---

## 2. Organisation du code source (`core/src/`)

- **`primitives/`** : Modèle de données hiérarchique, géométrie, calculs de matrices monde (`worldMatrix()`, `toWorld()`, `toLocal()`). Zéro PixiJS.
- **`renderer/`** : Couche visuelle PixiJS (`KGraphicObject`, `KGraphicComposite`, `KGraphicRectangle`, etc.), appliquant les matrices monde.
- **`binding/`** : Moteur de liaisons `follow` (pull-based) et parseur d'expressions (`expression.ts`) supportant la résolution d'IDs imbriqués (ex: `chart1.bar1.width`).
- **`compiler/`** : Traduction du DSL JSON en timeline GSAP.
- **`registry/`** : Enregistrement des types de composants DSL.
- **`presk.ts`** : Orchestrateur central et ticker unifié.
