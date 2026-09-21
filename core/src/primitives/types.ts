// Shared geometry types used across primitives, binding and rendering.
// Kept in their own file (rather than inside kobject.ts/krectangle.ts) so
// that any layer can import just the shape it needs without pulling in a
// concrete class.

/** A single point in scene-space coordinates (spec §4). */
export interface KPoint {
  x: number;
  y: number;
}
