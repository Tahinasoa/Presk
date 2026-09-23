# binding/

Implements the DSL's positioning expressions (spec §8) and the `follow`
action (spec §10) as a **pull-based** binding system: no proxies, no
subscriptions. Every tick, each active binding just re-runs its expression
and writes the result onto its target.

This was a deliberate simplification for v1 (see the chat/design log this
project came out of): GSAP already mutates plain object properties directly,
so a reactive/proxy layer would fight GSAP rather than help it. Polling is
also trivially easy to reason about and debug.

## Files

- `expression.ts` — parses and evaluates the small arithmetic expression
  grammar from spec §8.2 (`identifier.prop`, `+ - * /`, numeric literals,
  chained point props like `title.topRight.x`). Resolves identifiers via a
  `KScene` (so `"scene.center.x"` and `"someId.x"` both work).
- `bindingEngine.ts` — `BindingEngine`, the runtime registry of active
  `follow` bindings (`target id -> prop name -> expression string`) plus the
  `flush()` method Presk calls once per tick to re-evaluate all of them, grouping
  properties per target and applying them via `target.setNow()` to fully respect
  component property animators.

## Known limitations (tracked, not yet fixed — see root README)

- **Chained bindings can lag one frame.** If B follows A, and C follows B,
  and all three are flushed in a single top-to-bottom pass in registration
  order, C only sees B's *previous* value unless B happens to be registered
  before C. A topological sort over the dependency graph (spec §8.4) would
  fix this properly; not implemented yet.
- **No cycle detection** (spec §8.5). A `follow` cycle will just keep
  reading stale values forever instead of raising a compile-time error.
- **`boundingBox.*` and `pathX`/`pathY`/`pathAngle` are not implemented** in
  the expression grammar yet (spec §4.3, §9).
