# C-engine-runtime — `core/src/engine/sim/`

Réf : ADR-010, 011. Aucun import Pixi, aucune horloge réelle.

```
engine/sim/buildWorld.ts     buildWorld(program, env) : World      (exécute `init`, appelle world.captureInitial())
engine/sim/ticks.ts          tickTimes(program, fps, from, to) : number[]
engine/sim/context.ts        SimContext, Ownership
engine/sim/mechanisms/*.ts   animate, bind, effect, travel, (set, stop, unbind, group = « activations » sans mécanisme durable)
engine/sim/simulation.ts     Simulation
```

## Types
```ts
export interface SimEnv { catalog: Catalog; objectEnv: ObjectEnv; fps?: number }   // fps défaut 60
export class Simulation {
  constructor(program: Program, env: SimEnv);
  readonly world: World;
  readonly duration: number;          // program.duration
  get time(): number;                 // dernier instant simulé (-1 avant tout tick)
  reset(): void;                      // world.reset(), mécanismes vidés, time = -1
  seek(t: number): void;              // t clampé dans [0, duration] ; si t < time → reset() ; puis ticks jusqu'à t inclus
}
export interface Mechanism {
  readonly actionIndex: number;
  readonly targetId: string;
  readonly kind: "animate" | "travel" | "bind" | "effect";
  readonly end: number;               // Infinity si infini ou bind
  keys: Set<string>;                  // clés de base possédées (effet : "@nom")
  active: boolean;
  activate(ctx: SimContext, now: number): void;    // capture des cibles figées
  evaluate(ctx: SimContext, now: number): void;    // écrit les valeurs à l'instant now
  finalize(ctx: SimContext): void;                 // écrit la valeur finale exacte (phase F)
}
export interface SimContext { world: World; ownership: Ownership; mechanisms: Mechanism[] }
export class Ownership {
  claim(objectId: string, keys: readonly string[], owner: Mechanism | null): void;  // retire ces clés aux anciens propriétaires (ADR-011)
  ownerOf(objectId: string, key: string): Mechanism | undefined;
  ownersOf(objectId: string): ReadonlyMap<string, Mechanism>;   // clé → propriétaire
  release(m: Mechanism): void;
  clear(): void;
}
```

## Ticks (ADR-010)
`tickTimes(program, fps, after, upTo)` renvoie, triés et sans doublon (arrondi 1e-9), les instants `τ` tels que `after < τ ≤ upTo` parmi : `k/fps`, tous les `action.start`, toutes les `action.end` finies. Le premier tick d'une simulation est **0** (inclus : appeler avec `after = -1`).

## Boucle d'un tick (`τ`)
```
Phase F : pour m de mechanisms (ordre d'action) : si m.active && m.end <= τ : m.finalize(); désactiver m ; ownership.release(m)
Phase U : pour a de program.actions (ordre de déclaration) :
            si !started[a.index] && a.start <= τ : activer a (selon son type) ; started[a.index] = true
            si mécanisme de a actif : mécanisme.evaluate(ctx, τ)
Fin : si τ >= duration : couper (active=false) tous les mécanismes restants
```
Activation par type : `set` → écrit les valeurs (prise de propriété) ; `animate` → crée un mécanisme (cibles évaluées et figées) ; `bind` → crée un mécanisme ; `stop`/`unbind` → retire les clés (le mécanisme désigné perd la clé ; vide → inactif) ; `travel` → mécanisme ; `group`/`ungroup` → opération immédiate (+ mécanisme de transition si `duration`).
Un `animate` dont `p` calculé donne `finished` est finalisé par la phase F du tick suivant ou du même tick si `end ≤ τ`.
