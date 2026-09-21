# registry/

The extension point of the engine: where a DSL type name (e.g. `"shape"`,
`"text"`) is mapped to a `{ KObject subclass, KGraphicObject subclass }`
pair. This is the mechanism the future `lib/` component packages (per the
root README) will plug into — a domain package just calls
`presk.register("resistor", KResistor, KGraphicResistor)`.

## Files

- `builtins.ts` — `registerBuiltins(presk)`, registers the two types the
  spec's examples currently use: `"shape"` (-> `KRectangle` /
  `KGraphicRectangle`) and `"text"` (-> `KText` / `KGraphicText`). Called
  once from `main.ts` before compiling/running a DSL document.

The registry itself (the `Map` and the `register()`/`create()` methods) lives
on the `Presk` class in `../presk.ts`, not here — this folder only holds
concrete registrations.
