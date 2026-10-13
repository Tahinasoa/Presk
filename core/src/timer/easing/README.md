# Easing functions

The implementations and their names in `easing/easing/` follow the downloaded
`@alloc/easing` library (MIT). Presk uses the library's native function names,
such as `quadIn`, `sineOut`, and `backInOut`, without aliases.

The library's MIT license is retained in [LICENSE](./LICENSE).

```ts
import { easings, quadIn, type EasingName } from "./easing";

const name: EasingName = "quadIn";
easings[name](0.5);
quadIn(0.3);
```
