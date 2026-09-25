# renderer/

The visual side of Presk. Everything here is allowed to depend on PixiJS —
this is the only layer that does.

## The contract

Every `KGraphicObject` holds a reference to exactly one `KObject` (from
`primitives/`) and knows how to `redraw()` itself by reading that object's
*current* state via its world matrix (`worldMatrix()`). Data only flows one way: primitives -> renderer. Nothing in
this folder ever mutates a `KObject`.

## Files

- `kgraphicObject.ts` — `KGraphicObject`, the abstract base every visual
  component extends. Defines `redraw()` and `destroy()`.
- `kgraphicComposite.ts` — `KGraphicComposite`, base class for composite visuals owning a PixiJS `Container` for grouping/z-order/destroy.
- `kgraphicRectangle.ts` — draws a `KRectangle` as a PixiJS `Graphics` rect, applying absolute world matrices via `setFromMatrix()`.
- `kgraphicLine.ts` — draws a `KLine` as a PixiJS `Graphics` line, applying world matrices via `setFromMatrix()`.
- `kgraphicText.ts` — draws a `KText` as a PixiJS `Text` with a background frame.
- `kgraphicScene.ts` — `KGraphicScene`, the visual counterpart of `KScene`:
  a registry of every live `KGraphicObject` by id, separating root graphic objects (itored in `tick()`) from composite child graphics to prevent double redraws.
- `krenderer.ts` — `KRenderer`, a thin wrapper around a PixiJS
  `Application`. Owns the actual `<canvas>` and its container element, and
  exposes `add()`/`remove()` so `KGraphicObject`s can attach/detach their
  PixiJS display objects from the stage.

## Adding a new visual component

1. Add a `KObject` subclass in `primitives/` (data only, no PixiJS, supporting parent/child hierarchy via `addChild`).
2. Add a `KGraphicObject` (or `KGraphicComposite`) subclass here that reads world matrices (`worldMatrix()`) and applies them via `setFromMatrix()`.
3. Register the pair with `presk.register("myType", KMyThing, KGraphicMyThing)`
   (see `registry/builtins.ts` for the pattern, or `presk.ts` for the
   registry itself).
