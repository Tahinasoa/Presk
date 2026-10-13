# core/src — engine internals

This folder implements the Presk engine described in the root `README.md`.
It has one job: take a DSL document (see `language/spec.md`) and turn it into
a running, animated, rendered scene.

## Responsibility split

The engine is deliberately split into layers that don't know about each
other's implementation details. This is the single most important design
rule in this codebase — respect it when adding code:

```
compiler/    DSL (JSON) -> calls into Presk + a KTimer timeline
                 |
presk.ts     the public API + registry + the unified ticker
                 |
        +--------+--------+
        |                 |
primitives/          renderer/
(KObject, KScene)    (KGraphicObject, KGraphicScene, KRenderer)
"what an object IS"  "how an object is DRAWN"
no graphics knowledge   PixiJS-specific
        |                 ^
        +--- read by -----+
binding/     (pull-based `follow` expression evaluation)
```

- **`primitives/`** — plain data model. A `KObject` (and its subclasses like
  `KRectangle`) knows its own x/y/scale/rotation/opacity and geometry. It
  never imports PixiJS and never draws anything. You can unit-test this
  layer with zero DOM/browser/canvas involved (see `kobject.test.ts`).
- **`renderer/`** — the PixiJS side. A `KGraphicObject` holds a *reference*
  to a `KObject` and knows how to redraw itself from that object's current
  state. It never mutates the `KObject` — data flows one way, primitives to
  renderer, every tick.
- **`binding/`** — implements the DSL's `follow` action (§10 of the spec) as
  a **pull-based** binding: every tick, it re-evaluates each active
  expression and writes the result directly onto the target `KObject`. No
  proxies, no event subscriptions — see `binding/README.md` for why, and for
  the known limitation (chained bindings can lag one frame).
- **`compiler/`** — turns a DSL JSON document into: (1) calls to `Presk`'s
  registry to create/destroy objects, and (2) KTimer-managed `KTween`s and
  timed actions. It resolves the DSL's timeline positions (`"<"`, `">"`,
  `"+=1"`, labels, ...) and creates property tweens through `KObject.getTweens()`.
- **`registry/`** — where concrete DSL types (`"shape"`, `"text"`, ...) are
  registered as `{ KObject subclass, KGraphicObject subclass }` pairs. This
  is the extension point for the future `lib/` component packages.
- **`presk.ts`** — the `Presk` class: the object the end user (or the
  compiler) actually talks to. Owns the registry, the `KScene`, the
  `KGraphicScene`, the `KRenderer`, the binding engine, and the single
  shared KTimer that drives all four of them in a fixed, deterministic
  order every frame (state update -> binding flush -> redraw).

## Tick order (why it's deterministic)

`Presk.start()` starts the shared KTimer. On every frame, in this order:

1. KTimer renders all active KObject tweens and timed DSL actions.
2. `bindingEngine.flush()` re-evaluates every active `follow` expression and
   writes the result onto its target `KObject`.
3. `graphicScene.tick()` calls `redraw()` on every `KGraphicObject`, which
   reads final values off its paired `KObject` and pushes them to PixiJS.

This means a value can be driven by a tween, then immediately re-read by a
`follow` on another object, then rendered — all within the same frame, with
no one-frame lag. See the root README's "Known gaps" for the one thing this
order does *not* protect you from (dependency cycles between `follow`s).
