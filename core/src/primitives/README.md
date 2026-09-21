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
  `scale`, `rotation`, `opacity`.
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
