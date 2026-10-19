# C-engine-compile — `core/src/engine/` (compilation)

Réf : ADR-004, 007, 009, 011, 012. Toute la compilation est **pure** et **collecte** des diagnostics (ADR-004).

## Fichiers
```
engine/program.ts                 types Program (ci-dessous)
engine/analyze/scope.ts           AnalyzeScope (types des objets visibles)
engine/analyze/expr.ts            analyzeExpr
engine/compile/exprEval.ts        compileExpr (closure)
engine/compile/value.ts           compileValue (par PropKind)
engine/compile/properties.ts      compileProperties (classement prop/effet, équivalences, ordre)
engine/compile/create.ts          compileCreates (InitStep[], références futures)
engine/compile/steps.ts           compileSteps (entrées des set/animate/bind…)
engine/plan/passProgress.ts       passProgress (répétition, yoyo, easing)
engine/plan/timeline.ts           planTimeline
engine/analyze/effects.ts         résolution des variantes d'effets (inverse)
engine/analyze/activity.ts        stop/unbind valides, prises de propriété
engine/analyze/travelPlan.ts      from:"current" (P6)
engine/compileProgram.ts          orchestrateur public
```

## Types (`program.ts`)
```ts
export type Evaluator = (world: World) => StateValue;       // évalue maintenant, lit les objets du world
export interface CompiledProp   { kind: "prop";   name: string; spec: PropSpec; value: Evaluator; reads: readonly string[] }
export interface CompiledEffect { kind: "effect"; name: string; def: EffectDef; variant: string; on: boolean }
        // on=true : jouer `variant` ; on=false : inverse de `variant` (déjà résolu à la compilation, jamais « dernière » au runtime)
export type CompiledEntry = CompiledProp | CompiledEffect;
export interface InitStep { id: string; type: string; entries: CompiledEntry[] }   // entries triées par spec.order puis ordre d'écriture
export interface ActionBase { index: number; target: string; name?: string; start: number; end: number; duration: number }
export interface SetAction     extends ActionBase { action: "set";    entries: CompiledEntry[] }
export interface AnimateAction extends ActionBase { action: "animate"; entries: CompiledEntry[]; ease: string; repeat: number | "infinite"; repeatMode: RepeatMode }
export interface BindAction    extends ActionBase { action: "bind";   entries: CompiledProp[] }
export interface UnbindAction  extends ActionBase { action: "unbind"; keys: string[] | null }     // null = tout le bind du target
export interface StopAction    extends ActionBase { action: "stop";   keys: string[] | null }
export interface TravelAction  extends ActionBase { action: "travel"; along: { object: string; path: string };
  fromT: number; toT: number; ease: string; repeat: number | "infinite"; repeatMode: RepeatMode;
  orient: { offset: number } | null; anchor: string }
export interface GroupAction   extends ActionBase { action: "group";  props: CompiledEntry[]; children: string[]; ease: string }   // `children` n'est PAS une prop d'état
export interface UngroupAction extends ActionBase { action: "ungroup"; children: string[] | null }
export type PlannedAction = SetAction | AnimateAction | BindAction | UnbindAction | StopAction | TravelAction | GroupAction | UngroupAction;
export interface Program { scene: SceneConfig; init: InitStep[]; actions: PlannedAction[]; duration: number; warnings: Diagnostic[] }
```
`actions` est dans l'**ordre de déclaration** (= ordre d'évaluation, §7.3). `duration` = fin de scène (ADR-009).

## API publique (`compileProgram.ts`)
```ts
export interface CompileEnv { catalog: Catalog; objectEnv: ObjectEnv }
export function compileProgram(raw: unknown, env: CompileEnv): Program;   // lève PreskCompileError(diagnostics d'erreur)
export function tryCompileProgram(raw: unknown, env: CompileEnv): { program?: Program; diagnostics: Diagnostic[] };
```
Ordre : `validateDocument` → `compileCreates` → `compileSteps` → `planTimeline` → analyses (`effects`, `activity`, `travelPlan`) → `Program`.
Chaque phase s'arrête (sans lever) si la précédente a produit des erreurs ; les erreurs d'une même phase sont toutes collectées.

## AnalyzeScope
```ts
export interface AnalyzeScope {
  catalog: Catalog;
  typeOf(id: string): string | undefined;      // "scene" → "scene"
  isForward?(id: string): boolean;             // vrai si l'id sera créé plus bas → E_FORWARD_REFERENCE au lieu de E_OBJECT_UNKNOWN
}
export type ExprType = "scalar" | "point";
export interface Analyzed { type: ExprType; reads: string[] }              // ids lus, sans doublon
export function analyzeExpr(expr: Expr, scope: AnalyzeScope, d: DiagnosticCollector, where: DiagnosticWhere): Analyzed | null;
```

## passProgress (`plan/passProgress.ts`)
```ts
export interface PassSpec { duration: number; repeat: number | "infinite"; mode: RepeatMode; ease: (x: number) => number }
export interface PassResult { p: number; finished: boolean }   // p = position eased ∈ ℝ (easings overshoot) entre from(0) et to(1)
export function passProgress(elapsed: number, spec: PassSpec): PassResult;
```
Règles : `elapsed ≤ 0` → `{p: ease(0)=…, finished:false}` (utiliser `ease(0)`). `k = floor(elapsed / duration)`, `u = elapsed/duration − k`.
Fini si `repeat` fini et `elapsed ≥ duration × repeat` : `p = 1` (restart) ou, en yoyo, `p = repeat impair ? 1 : 0`.
Passage `k` : restart → `ease(u)` ; yoyo → `k` pair : `ease(u)`, `k` impair : `ease(1 − u)`.
`duration === 0` → `{ p: 1, finished: true }`.

## Brouillons d'actions (entre `compileSteps` et `planTimeline`)
```ts
export type DraftOf<T> = T extends ActionBase ? Omit<T, "start" | "end" | "duration"> : never;
export type DraftAction = DraftOf<PlannedAction> & {
  startSpec: StartSpec;
  explicitDuration?: number;     // `duration` du JSON
  effectDefaultDuration?: number;// max des durées par défaut des effets (animate sans propriété interpolée)
};
```
`compileSteps` fixe `ease` (explicite, sinon `"linear"` ; sinon, pour un `animate` composé **uniquement d'effets**, `defaultEase` du premier effet), `repeat` (défaut 1), `repeatMode` (défaut `"restart"`).
Tant qu'une action n'est pas implémentée (travel avant T113, group/ungroup avant T131), `compileSteps` ajoute `E_ACTION_UNKNOWN` (« action not implemented yet »).

## Options du planificateur
```ts
export interface PlanHooks {
  resolveTravel?(d: DraftOf<TravelAction> & { startSpec: StartSpec; explicitDuration?: number; speed?: number; fromSpec: number | "current"; toSpec?: number }, start: number): { fromT: number; toT: number; duration: number } | null;  // null : erreur déjà signalée
  onPlanned?(a: PlannedAction): void;     // appelé pour chaque action planifiée, dans l'ordre des steps (alimente le suivi de `from: "current"`)
}
```

## Travel : valeurs provisoires
`compileSteps` (T113) produit un brouillon `travel` avec `fromT: 0`, `toT: 1` **provisoires** ; le champ `fromSpec: number | "current"`, `toSpec?: number` et `speed?: number` sont portés par le brouillon (types : `TravelDraft`, ajouté dans `program.ts` par T113). Le résolveur (T114) renvoie les vraies valeurs, que `planTimeline` écrit dans l'action planifiée.
`along` du DSL : `"objet"` (chemin `main`) ou `"objet.cheminNom"`.
