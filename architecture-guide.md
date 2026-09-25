# Guide d'Architecture et d'Exploration du Projet Presk

Ce document sert de guide de lecture et de compréhension globale et détaillée du moteur **Presk** (`core/`). Il propose un **ordre de lecture vertical** rigoureux pour mener une relecture de code (code review) efficace, de la vision macroscopique vers les détails d'implémentation.

---

## 🧭 Ordre de Lecture Vertical Recommandé

Pour appréhender l'architecture de Presk sans vous perdre, suivez cet ordre de lecture pas à pas :

1. **`README.md` (Racine)** : Objectif du projet et vision générale.
2. **`language/spec.md`** : Spécification du DSL (syntaxe, actions, timing GSAP, expressions).
3. **`core/src/presk.ts`** : Le chef d'orchestre public et le ticker unifié.
4. **`core/src/primitives/kobject.ts`** & **`kabstractRectangle.ts`** : Le modèle de données pur, la hiérarchie parent/enfant et les matrices de transformation (`transformation-matrix`).
5. **`core/src/primitives/kscene.ts`** : Le graphe de scène des données.
6. **`core/src/binding/expression.ts`** & **`bindingEngine.ts`** : Le parseur d'expressions et le moteur de liaison pull-based (`follow`).
7. **`core/src/compiler/compiler.ts`** : Le traducteur DSL JSON $\rightarrow$ Timeline GSAP.
8. **`core/src/renderer/kgraphicObject.ts`**, **`kgraphicComposite.ts`** & **`kgraphicRectangle.ts`** : La couche visuelle (PixiJS) et l'application des matrices monde via `setFromMatrix()`.
9. **`core/src/registry/builtins.ts`** : Le registre liant les types DSL aux paires `{ ObjectClass, GraphicClass }`.

---

## 📖 Détail des Fichiers et Rôles

### 1. Spécifications & Documentation
- **`README.md` (racine)** : Présente le projet Presk, un DSL déclaratif pour animations pédagogiques conçu pour être généré par une IA.
- **`language/spec.md`** : Définit la syntaxe du DSL (sections sur la création, les transformations, les liaisons `follow`, et les expressions géométriques).

### 2. Orchestration & Entrée du Moteur (`core/src/`)
- **`presk.ts` (`Presk`)** : 
  - Point d'entrée public de l'engine.
  - Gère l'initialisation du renderer PixiJS (`KRenderer`), de la scène de données (`KScene`) et du binding engine.
  - Enregistre les types (`register()`), crée les objets de manière récursive (`create()`) et pilote la boucle d'animation unifiée (ticker GSAP) :
    1. Mise à jour des tweens GSAP.
    2. `binding.flush()` (évaluation des liaisons `follow`).
    3. `graphicScene.tick()` (rafraîchissement visuel).

### 3. Primitives & Modèle de Données (`core/src/primitives/`)
*Règle d'or : Zéro import PixiJS, testable unitairement sans DOM.*
- **`kobject.ts` (`KObject`)** : 
  - Classe de base pour tout objet créable.
  - Porte les propriétés géométriques (`x`, `y`, `scale`, `rotation`, `opacity`, `visible`).
  - Implémente la hiérarchie parent/enfant (`addChild`, `removeChild`, `parent`) et le calcul matriciel 2D via `transformation-matrix` (`worldMatrix()`, `toWorld()`, `toLocal()`).
  - Gère l'invisibilité par défaut (`visible = false`) basculée à `true` lors de l'appel de `create()`.
- **`kabstractRectangle.ts` (`KAbstractRectangle`)** :
  - Classe intermédiaire pour les objets rectangulaires (réutilisant `toWorld()` pour les coins, ancres et `boundingBox`).
- **`krectangle.ts` & `ktext.ts`** :
  - Implémentations concrètes (`"shape"` et `"text"`). `KText` gère un cadre (`KRectangle`) enfant.
- **`kscene.ts` (`KScene`)** :
  - Registre de tous les objets vivants par ID, supportant la résolution d'IDs imbriqués (ex: `"chart1.bar1"`).

### 4. Bindings & Expressions (`core/src/binding/`)
- **`expression.ts` (`Parser`, `evaluateExpression`)** :
  - Parseur AST léger pour les expressions arithmétiques et géométriques (spécification §8 du DSL). Supporte la résolution d'identifiants profonds par matching du plus long préfixe.
- **`bindingEngine.ts` (`BindingEngine`)** :
  - Moteur de liaison *pull-based* (`follow`). Réévalue à chaque frame les expressions et applique les résultats via `setNow()`.

### 5. Compilateur (`core/src/compiler/`)
- **`compiler.ts` (`compile`, `prepareScene`, `addStep`)** :
  - Traduit un document JSON DSL en une timeline **GSAP**.
  - Prépare les coquilles d'objets (pass 1) puis ajoute séquentiellement les actions (`create`, `set`, `transform`, `follow`, `destroy`).

### 6. Rendu Visuel (`core/src/renderer/`)
*Règle d'or : Seule couche autorisée à importer PixiJS.*
- **`kgraphicObject.ts`** : Classe abstraite de base pour les visuels liés à un `KObject`.
- **`kgraphicComposite.ts`** : Gère un conteneur PixiJS (`Container`) pour le regroupement et le `destroy()`.
- **`kgraphicRectangle.ts` & `kgraphicLine.ts`** : Dessinent les formes avec PixiJS `Graphics` et appliquent la matrice monde via `setFromMatrix()`.
- **`kgraphicScene.ts`** : Registre des visuels, séparant les objets racines (itérés dans `tick()`) des enfants de composites (anti-double-redraw).
- **`krenderer.ts`** : Encapsule l'application PixiJS.

### 7. Registre (`core/src/registry/`)
- **`builtins.ts`** : Associe les types du DSL (`"shape"`, `"text"`, `"line"`) à leurs paires `{ ObjectClass, GraphicClass }`.
