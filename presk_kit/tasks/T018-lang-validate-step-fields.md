# T018-lang-validate-step-fields
**Phase** P1 · **Dépend de** : T017-lang-validate-shell · **Réf spec** : §2.1, §12.1

## À lire (et rien d'autre)
- `agent.md` et `BACKLOG.md` (déjà lus)
- `architecture/contracts/C-lang-types.md (table des champs autorisés)`
- `architecture/contracts/C-lang-diagnostics.md`

## Objectif
Valider, pour une étape : `action`, `target`, champs autorisés/requis par action, types JSON des champs. Pas encore les valeurs de timing.

## Fichiers
- créer : `core/src/lang/validate/stepFields.ts`
- créer : `core/src/lang/validate/stepFields.test.ts`

## Étapes (note la dernière terminée dans BACKLOG › Reprise)
T018.1 Écris les tests (cas ci-dessous).
T018.2 Crée `validateStepFields(raw: unknown, index: number, d: DiagnosticCollector): Step | null`.
T018.3 Implémente avec **deux tables** (pas de `switch` géant) : `REQUIRED: Record<ActionName, string[]>` et `OPTIONAL: Record<ActionName, string[]>`, recopiées de la table de `C-lang-types.md`.
T018.4 Ordre des contrôles : étape objet (`E_STEP_NOT_OBJECT`) → `action` connue (`E_ACTION_UNKNOWN`, on s'arrête) → `target` chaîne (`E_TARGET_MISSING`) puis format `^[A-Za-z_][A-Za-z0-9_]*$` (`E_TARGET_INVALID`) → champs requis (`E_FIELD_REQUIRED`) → champs hors REQUIRED∪OPTIONAL (`E_FIELD_FORBIDDEN`, un diagnostic **par champ**, `field` = nom du champ) → types : `name` chaîne ; `type` chaîne ; `along` chaîne ; `anchor` chaîne ; `properties` : objet (non tableau) sauf pour `unbind`/`stop` où c'est un tableau ; sinon `E_FIELD_TYPE`.
T018.5 Si au moins une erreur a été ajoutée pour cette étape : renvoie `null`. Sinon renvoie l'objet casté en `Step`.
T018.6 Ne valide PAS le contenu de `start`, `duration`, `ease`, `repeat`… (T019) ni le contenu des `properties` (T020).

## Cas de test (à écrire AVANT le code)
| étape | diagnostics (code, field) |
|---|---|
| `{action:"set",target:"a",properties:{x:1}}` | aucun |
| `{action:"create",target:"a",type:"rectangle"}` | aucun |
| `{action:"create",target:"a",type:"rectangle",start:1}` | `E_FIELD_FORBIDDEN` field `start` |
| `{action:"create",target:"a",type:"rectangle",name:"n",duration:1}` | 2× `E_FIELD_FORBIDDEN` (`name`, `duration`) |
| `{action:"set",target:"a",properties:{},duration:1}` | `E_FIELD_FORBIDDEN` `duration` |
| `{action:"bind",target:"a",properties:{x:"b.x"},ease:"linear"}` | `E_FIELD_FORBIDDEN` `ease` |
| `{action:"travel",target:"a",along:"o",properties:{}}` | `E_FIELD_FORBIDDEN` `properties` |
| `{action:"travel",target:"a"}` | `E_FIELD_REQUIRED` `along` |
| `{action:"create",target:"a"}` | `E_FIELD_REQUIRED` `type` |
| `{action:"set",target:"a"}` | `E_FIELD_REQUIRED` `properties` |
| `{action:"stop",target:"a",properties:["x"]}` | aucun |
| `{action:"stop",target:"a",properties:{x:1}}` | `E_FIELD_TYPE` |
| `{action:"animate",target:"a",properties:[]}` | `E_FIELD_TYPE` |
| `{action:"fly",target:"a"}` / `{target:"a"}` | `E_ACTION_UNKNOWN` |
| `{action:"set",properties:{}}` | `E_TARGET_MISSING` |
| `{action:"set",target:"a b",properties:{}}` | `E_TARGET_INVALID` |
| `3`, `null`, `[]` | `E_STEP_NOT_OBJECT` |

## Ne pas toucher
Tout fichier hors de la liste « Fichiers ». Le legacy (`primitives/ binding/ compiler/ timer/ renderer/ registry/ presk.ts main.ts`). Le dossier du kit (`architecture/`, `tasks/`).

## Validation
```
cd core && pnpm exec vitest run src/lang/validate/stepFields.test.ts
cd core && pnpm exec tsc --noEmit
cd core && pnpm exec vitest run src/__arch__
cd core && pnpm exec vitest run   # aucune régression sur les anciens tests
```
Tout doit passer (0 échec, 0 erreur tsc).

## Commit
`feat(lang): step fields validation (T018)`

## Suivante
`T019-lang-validate-timing-values`
