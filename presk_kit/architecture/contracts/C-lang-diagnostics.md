# C-lang-diagnostics — `core/src/lang/diagnostics.ts`

## API exacte
```ts
export const DIAGNOSTIC_CODES = [ /* liste ci-dessous, dans cet ordre */ ] as const;
export type DiagnosticCode = (typeof DIAGNOSTIC_CODES)[number];
export type Severity = "error" | "warning";
export interface Diagnostic {
  severity: Severity;
  code: DiagnosticCode;
  message: string;
  stepIndex?: number;   // index dans steps
  field?: string;       // ex. "properties.x", "start"
}
export interface DiagnosticWhere { stepIndex?: number; field?: string }

export class DiagnosticCollector {
  error(code: DiagnosticCode, message: string, where?: DiagnosticWhere): void;   // refuse un code "W_*" (throw Error interne)
  warning(code: DiagnosticCode, message: string, where?: DiagnosticWhere): void; // refuse un code "E_*"
  merge(items: readonly Diagnostic[]): void;
  get hasErrors(): boolean;
  get items(): readonly Diagnostic[];
  get errors(): readonly Diagnostic[];
  get warnings(): readonly Diagnostic[];
}
export class PreskCompileError extends Error {   // name = "PreskCompileError"
  readonly diagnostics: readonly Diagnostic[];
  constructor(diagnostics: readonly Diagnostic[]);  // message = "Presk compile failed: N error(s): CODE1, CODE2…"
}
export class PreskRuntimeError extends Error {}   // name = "PreskRuntimeError"
```

## Liste fermée des codes
| Code | Sens |
|---|---|
| `E_DOC_NOT_OBJECT` | le document n'est pas un objet JSON |
| `E_DOC_VERSION` | `version` absente ou ≠ `"1.0"` |
| `E_SCENE_INVALID` | `scene` absent ; `width`/`height` non nombres > 0 ; `background` non chaîne |
| `E_STEPS_NOT_ARRAY` | `steps` absent ou non tableau |
| `E_STEP_NOT_OBJECT` | une étape n'est pas un objet |
| `E_ACTION_UNKNOWN` | `action` absent ou hors liste |
| `E_TARGET_MISSING` | `target` absent ou non chaîne |
| `E_TARGET_INVALID` | `target` ne respecte pas `^[A-Za-z_][A-Za-z0-9_]*$` |
| `E_FIELD_FORBIDDEN` | champ interdit pour cette action (§12.1) |
| `E_FIELD_TYPE` | champ du bon nom mais de mauvais type JSON |
| `E_FIELD_REQUIRED` | champ requis absent (`properties`, `along`, `type`…) |
| `E_NAME_INVALID` | `name` ne respecte pas `^[A-Za-z_][A-Za-z0-9_]*$` |
| `E_NAME_DUPLICATE` | `name` déjà utilisé |
| `E_TYPE_UNKNOWN` | classe absente du catalogue |
| `E_OBJECT_UNKNOWN` | objet référencé inexistant |
| `E_OBJECT_DUPLICATE` | deux `create` du même identifiant |
| `E_OBJECT_RESERVED` | `scene` utilisé comme cible de `create` |
| `E_FORWARD_REFERENCE` | un `create` référence un objet créé plus bas |
| `E_PROPERTY_UNKNOWN` | propriété ni connue de la classe ni effet |
| `E_PROPERTY_READONLY` | assignation d'une propriété `ro` (ancre en lecture seule, `boundingBox`, `width` de `text`…) |
| `E_PROPERTY_NOT_ANIMATABLE` | `animate` sur une propriété non animable (`pivot`, chaîne…) |
| `E_PROPERTY_NOT_BINDABLE` | `bind` sur une propriété non liable |
| `E_PROPERTY_DUPLICATE` | deux propriétés équivalentes dans une même étape (`pos` et `x`) |
| `E_VALUE_TYPE` | valeur du mauvais type pour la propriété |
| `E_VALUE_RANGE` | valeur hors bornes ou hors énumération |
| `E_COLOR_INVALID` | couleur non reconnue |
| `E_EXPR_SYNTAX` | expression mal formée |
| `E_EXPR_POINT_IN_ARITHMETIC` | point entier dans une opération arithmétique |
| `E_EXPR_BOUNDINGBOX_ALONE` | `x.boundingBox` sans point |
| `E_EXPR_SEGMENT_UNKNOWN` | segment de référence inconnu |
| `E_EXPR_INFINITE_REF` | référence à une valeur infinie (`line`, côté infini de `ray`) |
| `E_EXPR_TYPE_MISMATCH` | expression scalaire pour une propriété point, ou inverse |
| `E_EXPR_PATH` | `pathX/pathY/pathAngle` : chemin inconnu, `t` hors domaine |
| `E_EFFECT_VALUE` | valeur d'effet invalide (variante inconnue) |
| `E_EFFECT_IN_EXPRESSION` | effet lu dans une expression |
| `E_EFFECT_BIND` | `bind` sur un effet |
| `E_START_INVALID` | `start` mal formé |
| `E_START_UNKNOWN_NAME` | `start` référence un nom inconnu (ou déclaré plus bas) |
| `E_START_NEGATIVE` | instant de départ négatif |
| `E_START_REF_INFINITE_END` | `start` référence la fin d'une action infinie (y compris défaut) |
| `E_DURATION_INVALID` | `duration` non nombre fini > 0 |
| `E_DURATION_MISSING` | `duration` requise absente |
| `E_EASE_UNKNOWN` | easing inconnu |
| `E_REPEAT_INVALID` | `repeat` ≠ entier ≥ 1 ou `"infinite"` |
| `E_REPEAT_MODE_INVALID` | `repeatMode` ≠ `restart`/`yoyo` |
| `E_INFINITE_NEVER_PLAYED` | action infinie démarrant à/après la fin de scène |
| `E_UNBIND_NOTHING` | `unbind` sans `bind` actif |
| `E_STOP_NOTHING` | `stop` sans `animate`/`travel` actif |
| `E_STOP_ON_BIND` | `stop` visant un `bind` |
| `E_UNBIND_ON_ANIMATE` | `unbind` visant un `animate` |
| `E_STOP_PARTIAL_TRAVEL` | `stop` d'une partie seulement de `pos` pendant un `travel` |
| `E_TRAVEL_ALONG` | `along` : objet ou chemin inconnu |
| `E_TRAVEL_INFINITE_PATH` | `travel` sur `line`/`ray` |
| `E_TRAVEL_DURATION` | `duration`/`speed` : aucun ou les deux |
| `E_TRAVEL_RANGE` | `from`/`to` hors [0,1] sur chemin ouvert, ou `from: "current"` dépassant `to` |
| `E_TRAVEL_FROM_CURRENT` | `from: "current"` sans position antérieure |
| `E_TRAVEL_OPTION` | `anchor` ou `orient` invalide |
| `E_GROUP_CHILD_UNKNOWN` | enfant inexistant |
| `E_GROUP_CYCLE` | un groupe serait son propre ancêtre |
| `E_GROUP_TARGET_NOT_GROUP` | cible d'un `group` = objet existant non groupe |
| `E_GROUP_LAYOUT` | `layout`/`gap`/`margin` invalides, ou `line`/`ray` dans un groupe à layout |
| `E_UNGROUP_NOT_MEMBER` | enfant absent du groupe |
| `E_SCENE_ACTION` | `create`/`travel`/`group`/`ungroup` avec `scene` |
| `E_SCENE_PROPERTY` | propriété de `scene` autre que `focusOn`, `focusMargin`, `view`, `zoom` |
| `E_VIEW_FOCUS_UNBOUNDED` | `focusOn` sur `line`/`ray` |
| `E_VIEW_MARGIN_WITHOUT_FOCUS` | `focusMargin` sans `focusOn` |
| `E_VIEW_RANGE` | `zoom` ou dimension de région ≤ 0 |
| `E_ANCHOR_INDEX` | `vertex[i]` hors bornes (exécution) |
| `W_SPEED_PATH_MAY_CHANGE` | `travel.speed` sur un chemin modifié avant le `travel` (Q7) |
