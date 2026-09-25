# Rapport de Refactorisation — Composition Hiérarchique (Rigid-Body) pour Presk

Ce document récapitule l'ensemble des travaux, des décisions architecturales, des extraits de code clés et des évolutions réalisés lors du refactor complet du moteur **Presk** (`core/`).

---

## 1. Objectifs du Refactor

1. **Composition Hiérarchique (Rigid-Body)** : Permettre aux objets du moteur de devenir des objets composés dont les transformations du parent se propagent aux enfants sans muter leurs coordonnées locales.
2. **Invisibilité par défaut jusqu'au `create`** : Les objets instanciés dans la scène débutent avec `visible = false` et ne deviennent visibles qu'au moment où leur action DSL `create` est explicitement appelée sur la timeline.

---

## 2. Décisions Architecturales Majeures

1. **Conservation de la séparation Données / Rendu** :
   - La couche `primitives/` (`KObject`, `KRectangle`, `KScene`, etc.) reste **totalement exempte de PixiJS**.
   - La couche `renderer/` (`KGraphicObject`, `KGraphicComposite`, etc.) gère l'affichage PixiJS de manière unidirectionnelle.
2. **Généralisation de la hiérarchie sur `KObject`** :
   - N'importe quel `KObject` peut porter des enfants via `addChild()` / `removeChild()` / `getChild()`.
3. **Composition 2D via `transformation-matrix`** :
   - Utilisation de la bibliothèque pure TypeScript `transformation-matrix` (`compose`, `translate`, `rotate`, `scale`, `applyToPoint`, `inverse`).
4. **Application des Matrices Monde aux Display Objects (`setFromMatrix`)** :
   - Les objets graphiques consomment directement `worldMatrix()` calculée par le modèle de données et l'appliquent à PixiJS via `setFromMatrix(new Matrix(wm.a, wm.b, wm.c, wm.d, wm.e, wm.f))`.
5. **Visibilité conditionnelle au `create`** :
   - Initialisation à `this._visible = false` dans le constructeur de `KObject`, basculé à `this._visible = true` au moment de l'appel de `create()`.

---

## 3. Extraits de Code Clés

### A. Visibilité au `create` (`core/src/primitives/kobject.ts`)
```ts
  constructor({ id, x, y, scale = 1, rotation = 0, opacity = 1 }: KObjectParams) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._scale = scale;
    this._rotation = rotation;
    this._opacity = opacity;
    this._visible = false; // Invisible par défaut
  }

  create(options: { duration?: number; ease?: string } = {}): gsap.core.Timeline {
    this._visible = true; // Devient visible à l'appel de create
    const tl = gsap.timeline(options);
    for (const [, child] of this._children) {
      tl.add(child.create(options), 0);
    }
    return tl;
  }
```

---

## 4. Bilan des Tests

- **100% des tests passés avec succès** (61 tests unitaires validant la géométrie, les expressions, la hiérarchie des objets, la visibilité conditionnelle et la résolution des IDs imbriqués).
