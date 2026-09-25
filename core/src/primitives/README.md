# primitives/

Pure data model for Presk objects. Everything in this folder must stay free
of any rendering dependency (no PixiJS import, ever) so that:

- it can be unit-tested without a browser or canvas (see `kobject.test.ts`,
  `krectangle.test.ts`);
- it can, in principle, be paired with a different renderer later without
  any change here (see `core/src/renderer/README.md`).

## Files

- `types.ts` — shared geometry types (`KPoint`) used across the whole engine.
- `kobject.ts` — `KObject`, the base class every DSL-creatable type extends.
  Holds the properties common to every object per the spec (§4.1): `x`, `y`,
  `pos` (as `{ x, y }` getter/setter), `scale`, `rotation`, and `opacity`.
- `krectangle.ts` — `KRectangle`, backs the DSL's `"shape"` type. Adds
  `width`/`height` and implements the full corner/bounding-box geometry from
  spec §4.2-4.3 (`topLeft`, `center`, `boundingBox.*`, ...).
- `ktext.ts` — `KText`, backs the DSL's `"text"` type. Adds a `text` string
  property; reuses `KRectangle`'s geometry since text has a width/height box
  too (needed once it's actually measured by the renderer — see the TODO in
  `renderer/kgraphicText.ts`).
- `kscene.ts` — `KScene`, the data-only scene graph. Holds the registry of
  every live `KObject` by id (`get`/`add`/`remove`) — this is what makes
  `"someId.x"` resolvable from an expression (see `binding/expression.ts`).
  Also represents the DSL's reserved `"scene"` identifier (§4, `scene.width`,
  `scene.center.x`, ...).
- `kcomposite.ts` — `KComposite`, base data class for composite objects holding children.

## Composite: local vs absolu (Design Choice §3)

We have chosen **Option 2** (Coordinates = absolute in data model, local/hierarchical transformation handled at render time via PixiJS `Container` hierarchy). 
- *Rationale:* Lowest risk, minimal footprint on the pure data model (`primitives/` remains free of hierarchy math), fully compatible with existing expressions while achieving true rigid-body visual composition through PixiJS `Container.addChild()`. Option 1 remains a recommended future refactor if deep external parent-child path referencing becomes a primary requirement.
