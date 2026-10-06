# Easing functions (MIT)

Function names and the `easings` map follow https://easings.net/.
The implementations come from `@alloc/easing` (https://github.com/alloc/easing), MIT,
which itself builds on glsl-easings / Robert Penner's equations. Functions were renamed
(e.g. `sineIn` -> `easeInSine`) and given explicit return types; the maths are unchanged.

License: MIT, see LICENSE .

## Differences with easings.net
Identical values (checked): 24 of the 30 functions.
Slightly different curves (same family, other formula):
- easeInElastic, easeOutElastic, easeInOutElastic
- easeInBounce, easeOutBounce, easeInOutBounce

## Usage
```ts
import { easings, easeOutBack, type EasingName } from "./easing";

const name: EasingName = "easeInOutCubic";
easings[name](0.5);
easeOutBack(0.3);
```
