# compiler/

Turns a DSL document (spec §2-§11) into a running scene: it drives `Presk`'s
registry (create/destroy/follow/unfollow) and builds a GSAP timeline that
drives `transform` animations.

## Why it leans on GSAP directly

The DSL's `start` field (spec §6.1) was explicitly designed to mirror GSAP's
own timeline "position parameter" syntax (`"<"`, `">"`, `"+=1"`, absolute
seconds, named-label offsets, ...). Rather than reimplementing that
resolution logic, `compiler.ts` passes `step.start` straight through as the
third argument to `tl.to()`/`tl.call()` — GSAP already does exactly what the
spec asks for.

Similarly, "a `transform` expression is evaluated once, when the action
starts" (spec §8.3) maps directly onto GSAP's own **functional values**:
passing a function instead of a number as a tween property value makes GSAP
invoke it once, the first time that tween renders. `compiler.ts` wraps every
expression string in such a function instead of resolving it up front.

## Files

- `types.ts` — TypeScript types for the DSL JSON document (spec §2-§11).
- `compiler.ts` — `compile(doc, presk)`, returns a `gsap.core.Timeline`.
  Handles `create`/`set`/`transform`/`follow`/`unfollow`/`destroy`. See the
  root README's "Known gaps" for what's intentionally not handled yet
  (`group`/`ungroup`, path anchoring).
- `mockInput.json` — a full example DSL document (used by `main.ts`'s demo
  and by `compiler.test.ts`).
