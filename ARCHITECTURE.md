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
  - GSAP directly mutates plain object properties (`_x`, `_y`, etc.). Reactive proxy or subscription layers would fight GSAP's animation loop and add unnecessary complexity.
  - Polling is trivial to reason about, debug, and trace.
* **Known Limitations & Backlog:**
  - *Chained Binding Lag:* Chained bindings (e.g. C follows B, B follows A) can lag by one frame depending on registration order. A topological sort over the dependency graph (spec §8.4) is required.
  - *Cycle Detection:* Cyclic `follow` expressions currently loop infinitely without compile-time error detection (spec §8.5).

---

## 3. DSL Compilation & Direct Delegation to GSAP

* **Decision:** Compile DSL steps directly into a GSAP timeline, leveraging GSAP's native features rather than building a custom animation scheduler.
* **Rationale:**
  - The DSL timeline position-parameter specification (spec §6.1) was explicitly designed to mirror GSAP's syntax (`"<"`, `">"`, `"+=1"`, named labels, etc.). Passing `start` directly to GSAP avoids reinvention.
  - `transform` expressions (evaluated once at action start per spec §8.3) map directly onto GSAP's **functional values** (passing a function instead of a value makes GSAP evaluate it on first render).

---

## 4. Unified Deterministic Ticker (`Presk`)

* **Decision:** A single GSAP ticker drives all engine subsystems in a fixed, deterministic sequence every frame.
* **Tick Order:**
  1. **GSAP Tweens Update:** Internal GSAP engine updates active tweens.
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
