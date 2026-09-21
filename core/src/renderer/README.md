# renderer/

The visual side of Presk. Everything here is allowed to depend on PixiJS —
this is the only layer that does.

## The contract

Every `KGraphicObject` holds a reference to exactly one `KObject` (from
`primitives/`) and knows how to `redraw()` itself by reading that object's
*current* state. Data only flows one way: primitives -> renderer. Nothing in
this folder ever mutates a `KObject`.

## Files

- `kgraphicObject.ts` — `KGraphicObject`, the abstract base every visual
  component extends. Defines `redraw()` and `destroy()`.
- `kgraphicRectangle.ts` — draws a `KRectangle` as a PixiJS `Graphics` rect.
  Paired with `KRectangle` under the `"shape"` type (see
  `registry/builtins.ts`).
- `kgraphicText.ts` — draws a `KText` as a PixiJS `Text`. Paired with `KText`
  under the `"text"` type.
- `kgraphicScene.ts` — `KGraphicScene`, the visual counterpart of `KScene`:
  a registry of every live `KGraphicObject` by id, and a `tick()` that calls
  `redraw()` on all of them once per frame (see `presk.ts` for exactly when
  this runs relative to tween/binding updates).
- `krenderer.ts` — `KRenderer`, a thin wrapper around a PixiJS
  `Application`. Owns the actual `<canvas>` and its container element, and
  exposes `add()`/`remove()` so `KGraphicObject`s can attach/detach their
  PixiJS display objects from the stage without reaching into the
  `Application` directly.

## Adding a new visual component

1. Add a `KObject` subclass in `primitives/` (data only, no PixiJS).
2. Add a `KGraphicObject` subclass here that reads from it and draws with
   PixiJS.
3. Register the pair with `presk.register("myType", KMyThing, KGraphicMyThing)`
   (see `registry/builtins.ts` for the pattern, or `presk.ts` for the
   registry itself).
