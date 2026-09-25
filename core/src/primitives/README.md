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
  Holds properties common to every object per the spec (§4.1): `x`, `y`,
  `pos`, `scale`, `rotation`, `opacity`, and `visible` (starts `false` until `create()` is called).
  Implements generalized parent/child hierarchy (`addChild`, `removeChild`, `getChild`) and 2D transform composition via `transformation-matrix` (`worldMatrix()`, `toWorld()`, `toLocal()`).
- `kabstractRectangle.ts` — `KAbstractRectangle`, intermediate abstract class for rectangular primitives/scenes. Encapsulates width, height, anchors, and geometry (corners, bounding boxes) using `toWorld()`.
- `krectangle.ts` — `KRectangle`, backs the DSL's `"shape"` type.
- `ktext.ts` — `KText`, backs the DSL's `"text"` type. Manages a background frame `KRectangle` child via `addChild()`.
- `kscene.ts` — `KScene`, the data-only scene graph. Holds the registry of
  every live `KObject` by id (`get`/`add`/`remove`), supporting nested ID resolution (e.g., `"chart1.bar1"`).

## Hierarchical Composition & Local Coordinates Convention

- *Règle pour les auteurs de scènes / DSL* : Les enfants ajoutés à un objet parent via `addChild` doivent être définis avec des **coordonnées locales** (relatives au repère du parent). Le modèle de données `KObject` calcule automatiquement les coordonnées monde via `worldMatrix()` et `toWorld()`, tandis que les getters/setters `x`/`y` gèrent la transparence monde ↔ local.
