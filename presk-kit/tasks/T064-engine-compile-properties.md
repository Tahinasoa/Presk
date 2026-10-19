# T064-engine-compile-properties
**Phase** P4 · **Dépend de** : T063-engine-compile-value, T044-model-effects-reveal · **Réf spec** : §5, §9.4, §12.2

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-engine-compile.md`
- `architecture/contracts/C-model-core.md`
- `architecture/decisions/ADR-008-class-catalog-and-prop-specs.md`
- `architecture/decisions/ADR-011-mechanisms-ownership-and-conflicts.md`
- `architecture/decisions/ADR-012-effects-reveal-presence.md`
- `architecture/contracts/C-lang-diagnostics.md`

## Objectif
`compileProperties` : classe chaque clé en propriété ou effet, applique les règles du mode (`create|set|animate|bind`), détecte les doublons équivalents, trie par `order`.

## Fichiers
- créer : `core/src/engine/compile/properties.ts`
- créer : `core/src/engine/compile/properties.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T064.1 Écris les tests (cas ci-dessous). `PropSpec.required` existe déjà (champ optionnel du contrat).
T064.2 Signature : `compileProperties(raw: PropertiesObject, mode: "create"|"set"|"animate"|"bind", def: ClassDef, ctx: { scope: AnalyzeScope; d: DiagnosticCollector; stepIndex: number }): CompiledEntry[] | null`. Renvoie `null` si au moins une erreur a été ajoutée par cet appel.
T064.3 Pour chaque clé de `raw` (ordre d'écriture) : (a) `spec = def.props[key]` ; (b) sinon `def.effects[key]` → effet ; (c) sinon erreur `E_PROPERTY_UNKNOWN` (**ou `E_SCENE_PROPERTY` si `def.type === "scene"`**).
T064.4 Propriété : `mode:"ro"` → `E_PROPERTY_READONLY` (`E_SCENE_PROPERTY` pour `scene`). `animate` et `!spec.animatable` → `E_PROPERTY_NOT_ANIMATABLE`. `bind` et pas (`kind` ∈ number|point et `mode` rw) → `E_PROPERTY_NOT_BINDABLE`. Puis `compileValue` ; entrée `{kind:"prop", name:key, spec, value, reads}`.
T064.5 Effet : `bind` → `E_EFFECT_BIND`. Valeur `true` → `{variant:"default", on:true}` ; chaîne présente dans `def.variants` → `{variant:chaîne, on:true}` ; `false` → `{variant:"", on:false}` (la variante est résolue en T069) ; autre → `E_EFFECT_VALUE`. Entrée `{kind:"effect", name:key, def: def.effects[key], variant, on}`.
T064.6 Clés indexées : une clé de la forme `nom[i]` (regex `^([A-Za-z_]\w*)\[(\d+)\]$`) avec `def.indexed[nom]` existant → `PropSpec` **synthétique** `{kind:"point", writes:[indexed.writeKey(i)], mode:"rw", animatable:true, order:2, get:(o)=>indexed.get(o,i), set:(o,v)=>indexed.set!(o,i,v as Pt)}` (si `indexed.set` absent : `E_PROPERTY_READONLY`). Clé de cette forme mais `nom` inconnu : `E_PROPERTY_UNKNOWN`. L'indice hors bornes est une erreur d'exécution (`E_ANCHOR_INDEX`).
T064.7 Doublons : mémorise les `writes` de chaque propriété déjà vue dans cet appel ; si une nouvelle propriété partage une clé → `E_PROPERTY_DUPLICATE` (sur la 2ᵉ).
T064.8 Mode `create` uniquement : pour toute `PropSpec` avec `required: true` absente de `raw` → `E_FIELD_REQUIRED` (field `properties.<nom>`).
T064.9 Tri **stable** du résultat : propriétés par `spec.order` croissant, puis effets en dernier (dans l'ordre d'écriture). `where` des diagnostics : `{stepIndex, field: "properties."+key}`.

## Cas de test (à écrire AVANT le code)
Classe rectangle (catalogue par défaut), objets `a` existants :
| mode, properties | résultat |
|---|---|
| create `{x:10,width:50,reveal:true}` | 3 entrées triées : `width`(0), `x`(2), `reveal`(effet) |
| create `{opacity:0.5,x:1}` | ordre : `x` (2) puis `opacity` (3) |
| set `{nope:1}` | `E_PROPERTY_UNKNOWN` |
| set `{topRight:"a.center"}` | ok (ancre point rw) |
| set `{pos:"a.topLeft",x:3}` | `E_PROPERTY_DUPLICATE` |
| set `{topLeft:"a.center",y:1}` | `E_PROPERTY_DUPLICATE` |
| animate `{pivot:"pos"}` | `E_PROPERTY_NOT_ANIMATABLE` ; set `{pivot:"topLeft"}` ok |
| bind `{pivot:"pos"}` / bind `{reveal:true}` | `E_PROPERTY_NOT_BINDABLE` / `E_EFFECT_BIND` |
| set `{reveal:"zzz"}` / `{reveal:3}` | `E_EFFECT_VALUE` |
| set `{reveal:false}` | effet `on:false`, `variant:""` |
| classe text : set `{width:5}` | `E_PROPERTY_READONLY` |
| classe scene : set `{x:1}` / `{zzz:1}` | `E_SCENE_PROPERTY` ×2 |
| classe de test avec `points` `required` : create `{}` | `E_FIELD_REQUIRED` |
| classe de test avec `indexed.vertex` (3 sommets) : set `{"vertex[1]":"a.center"}` | 1 entrée, `spec.writes = ["points.1"]` |
| même classe : set `{"nope[1]":"a.center"}` / `{"vertex[x]":1}` | `E_PROPERTY_UNKNOWN` ×2 |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/engine/compile/properties.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(engine): properties compilation (T064)`

## Suivante
`T065-engine-compile-create`
