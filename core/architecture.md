# KTimer architecture
KTimer is a simple object that call functions at the right moment. That's all.

the compler convert relative time to absolute and solve temporal dependencies.

I'm about to switch from a GSAP style into a remotion style because of 2 reasons : it is very hard to seek a given time with GSAP if animation if based on internal function which are not exposet to GSAP.
GSAP is very powerfull, but it look like an overkill and unnecessary complexity for my use case.

```mermaid
flowchart TD
  A[PrivyMermaid Desktop] --> B[Edit Mermaid]
  B --> C[Preview]
  C --> D{Export}
  D -->|SVG| E[Vector]
  D -->|PNG| F[Image]
  A --> G[Windows]
  A --> H[Linux]
```