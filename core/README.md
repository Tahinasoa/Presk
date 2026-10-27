# Presk

**Presk** is a declarative, AI-friendly animation DSL and rendering engine designed for creating polished educational and instructional animations. It translates JSON-based animation scripts into deterministic, high-performance visual timelines rendered via PixiJS.

---

## 🎯 Core Principles

1. **Describe, Don't Draw:** The DSL specifies what appears and how it evolves, never the low-level rendering mechanics.
2. **Relative Positioning by Default:** Objects are positioned relative to other objects' semantic anchors (e.g., `topLeft: "title.bottomLeft"`) rather than hardcoded coordinates.
3. **Strict Semantic Actions:** Every action (`create`, `set`, `animate`, `travel`, `bind`, `unbind`, `stop`, `group`, `ungroup`) has a single, unambiguous semantic role.
4. **Semantic Effects:** Complex behaviors and appearances (`reveal`, `powerOn`, `state`) are triggered as effects without exposing mutable internal states.
5. **Strict Over Guessed:** Ambiguities (such as invalid references, forbidden fields, or infinite paths in bounded contexts) fail at compile time.
6. **Core & Catalog Separation:** Pure geometric primitives are separated from specialized domain components.

---

## 🏗️ Project Architecture

Presk is organized as a monorepo containing:
- **`core/` (`@presk/core`)**: The main engine package comprising:
  - **Primitives & Model (`core/src/primitives/`)**: Pure data models (`KObject`, `KRectangle`, `KScene`, etc.) with **zero graphics framework dependencies** (no PixiJS imports), enabling robust unit testing without a browser or DOM. Powered by `transformation-matrix` for 2D transform hierarchies.
  - **Expressions & Binding (`core/src/binding/`)**: Lightweight AST parser and pull-based binding/travel engines (`bind`, `travel`).
  - **Compiler (`core/src/compiler/`)**: Translates JSON DSL step definitions into absolute timeline schedules (`KTimer` & `KTween`).
  - **Renderer (`core/src/renderer/`)**: Unidirectional PixiJS rendering layer that syncs pure data models to visual display objects via world transformation matrices.
- **`language/`**: Comprehensive specifications (`Presk-language-specification.md`) detailing the DSL syntax, timing rules, and anchor semantics.
- **`presk-kit/`**: Supplementary packages and utilities.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>=18.0.0`
- `pnpm` (configured via pnpm workspace)

### Installation & Development

```bash
# Install dependencies
pnpm install

# Run core engine tests
pnpm --filter @presk/core test

# Run core development server
pnpm --filter @presk/core dev
```

---

## 📖 Documentation

- **Language Specification:** See [`language/Presk-language-specification.md`](./language/Presk-language-specification.md) for the complete v1.0 DSL specification.
- **Architecture Guide:** See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for detailed structural breakdown and design logs.
