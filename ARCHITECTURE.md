> ⚠️ PÉRIMÉ — décrit la v0.1 du moteur. Source de vérité : `language/Presk — Spécification v1.0.md`. Ne pas utiliser pour décider.

# Presk Architectural Decisions & Design Log

This document centralizes major architectural decisions, design rationale, and known structural trade-offs for the Presk engine.

---

## 1. Separation of Concerns: Primitives vs. Renderer

* **Decision:** Strict separation between pure data models (`primitives/`) and rendering (`renderer/`).
* **Rationale:**
  - `primitives/` (`KObject`, `KRectangle`, `KText`, `KScene`) contains zero graphics framework dependencies (no PixiJS import). This allows complete unit testing of geometry, coordinates, and bounding boxes without a browser, DOM, or canvas.
  - `renderer/` (`KGraphicObject`, `KGraphicScene`, `KRenderer`) holds PixiJS display objects and acts in a strictly **unidirectional** flow: graphic objects read state from primitives during the tick phase and never mutate primitives.
* **Implications:** Any new DSL primitive requires defining a data class in `primitives/` and a visual representation class in `renderer/`, then registering them together.

---

## 2. Pull-Based Binding Engine (`follow` / `unfollow`)

* **Decision:** Implement continuous binding (`follow`, spec §10) via a **pull-based** polling engine (`BindingEngine` + AST expression parser) rather than reactive proxies or event observables.
* **Rationale:**
  - The timer writes plain object properties deterministically. Polling bindings after tween updates keeps the update order explicit without a proxy or subscription layer.
  - Polling is trivial to reason about, debug, and trace.
* **Known Limitations & Backlog:**
  - *Chained Binding Lag:* Chained bindings (e.g. C follows B, B follows A) can lag by one frame depending on registration order. A topological sort over the dependency graph (spec §8.4) is required.
  - *Cycle Detection:* Cyclic `follow` expressions currently loop infinitely without compile-time error detection (spec §8.5).

---

## 3. DSL Compilation & KTimer

* **Decision:** Compile DSL steps into the project-owned `KTimer` timeline and `KTween` property animations.
* **Rationale:**
  - The compiler resolves the DSL's timeline positions (`"<"`, `">"`, relative offsets, and labels) into absolute times before adding tweens.
  - Transform expressions are resolved when the tween initializes, after preceding tweens have rendered their endpoint state.

---

## 4. Unified Deterministic Ticker (`Presk`)

* **Decision:** A single `KTimer` loop drives all engine subsystems in a fixed, deterministic sequence every frame.
* **Tick Order:**
  1. **KTimer Tweens Update:** The timer evaluates active tweens at the current time.
  2. **Binding Flush:** `BindingEngine.flush()` re-evaluates active `follow` expressions and applies results via `target.setNow()`.
  3. **Graphic Scene Tick:** `KGraphicScene.tick()` calls `redraw()` on all visual components, pushing final values to PixiJS.
* **Rationale:** Ensures zero frame lag between a tween update, a dependent `follow` binding re-evaluation, and final rendering, all within the same animation frame.

---

## 5. Extensible Component Registry (`registry/` and future `lib/`)

* **Decision:** Runtime type registration mapping DSL type strings (e.g., `"shape"`, `"text"`, `"line"`) to `{ ObjectClass, GraphicClass }` pairs.
* **Rationale:** Provides an open extension point where future domain component packages (`lib/` for electrical circuits, geometry, grammar, etc.) can register new components without modifying core engine code.

---

## 6. Generalized Hierarchical Composition (`KObject` + `transformation-matrix`)

* **Decision:** Generalize parent/child hierarchy capabilities directly onto the base `KObject` class rather than restricting it to a dedicated `KComposite` class, powered by the pure math library `transformation-matrix`.
* **Rationale:**
  - Any `KObject` can act as a parent (`addChild`, `removeChild`, `getChild`), providing maximum architectural flexibility (Unity/Pixi-like transform hierarchy on all objects).
  - `transformation-matrix` provides robust, pure-TS 2D matrix composition (`compose`, `translate`, `rotate`, `scale`, `applyToPoint`, `inverse`) without introducing PixiJS dependencies into `primitives/`.
  - `KObject.worldMatrix()` computes absolute world matrices, which are directly consumed by the renderer (`KGraphicObject`) via PixiJS matrix setting, eliminating redundant layout/transform calculations.
  - Nested ID resolution (`chart1.bar1`) is natively supported across the data scene and expression engine.
