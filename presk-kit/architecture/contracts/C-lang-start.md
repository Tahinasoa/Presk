# C-lang-start — `core/src/lang/start.ts`

```ts
export type StartSpec =
  | { kind: "absolute"; time: number }
  | { kind: "prevStart"; offset: number }                       // "<"  "<3"
  | { kind: "prevEnd"; offset: number }                         // ">"  ">2"   (défaut quand start est omis)
  | { kind: "labelStart"; label: string; offset: number }       // "nom"  "nom<5"
  | { kind: "labelEnd"; label: string; offset: number };        // "nom>-2"
export const DEFAULT_START: StartSpec;                           // { kind: "prevEnd", offset: 0 }
export function parseStart(value: unknown): StartSpec | null;    // null = invalide
```

## Table de vérité (§6.1)
| Entrée | Résultat |
|---|---|
| `3`, `0`, `3.5` | absolute 3, 0, 3.5 |
| `"3.3"`, `"0"` | absolute 3.3, 0 |
| `"<"` / `">"` | prevStart 0 / prevEnd 0 |
| `"<3"` / `">2"` | prevStart 3 / prevEnd 2 |
| `"<-1.5"` / `">-2"` | prevStart −1.5 / prevEnd −2 |
| `"titleReveal"` | labelStart offset 0 |
| `"titleReveal<5"` | labelStart offset 5 |
| `"titleReveal>-2"` | labelEnd offset −2 |
| `"menu_1>0.5"` | labelEnd offset 0.5 |
| `"-1"` | absolute −1 (le planner rejettera : `E_START_NEGATIVE`) |
| `""`, `" 3"`, `"3 "`, `"<<"`, `"a<"`, `"1a"`, `"+=1"`, `"nom+=2"`, `"3."`, `".5"` | `null` |
| `NaN`, `Infinity`, `true`, `null`, `undefined`, objet | `null` |

Un label valide : `^[A-Za-z_][A-Za-z0-9_]*$`. Nombres : `-?\d+(\.\d+)?`.
