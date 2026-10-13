# compiler/

Turns a DSL document (spec §2-§11) into a running scene: it drives `Presk`'s
registry (create/destroy/follow/unfollow) and adds KTimer-managed `KTween`s
that drive `transform` animations.

## Timeline compilation

The `PreskCompiler` instance is owned by `Presk`. It resolves the DSL's
timeline positions (`"<"`, `">"`, relative offsets, absolute seconds, and
named labels) and registers the resulting tweens and actions with the `KTimer`
owned by that same `Presk` instance.

Use `presk.compile(doc)` or `presk.compiler.compile(doc)`. The original
standalone `compile(doc, presk)` helper remains available for compatibility.

Similarly, "a `transform` expression is evaluated once, when the action
starts" (spec §8.3) is preserved by resolving expression values when the
corresponding KTimer tween initializes. Property tweens are created with
`KObject.getTweens()`.

## Files

- `types.ts` — TypeScript types for the DSL JSON document (spec §2-§11).
- `compiler.ts` — `PreskCompiler.compile(doc)`, adds work to and returns
  its owner's timer. Handles `create` (via two-pass shell instantiation),
  `set` (`target.setNow()`), `transform` (property tweens via `target.getTweens()`), `follow`,
  `unfollow`, and `destroy`. See the root README's "Known gaps" for what's
  intentionally not handled yet (`group`/`ungroup`, path anchoring).
- `mockInput.json` — a full example DSL document (used by `main.ts`'s demo
  and by `compiler.test.ts`).
