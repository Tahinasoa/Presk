# ADR-014-ports-text-measurer-and-images
**Ports : mesure de texte et images** · Réf spec : §4.1, §11.2

## Contexte
Un `create` peut référencer les dimensions d'un `text` créé juste avant : elles doivent être connues **à la création**, hors navigateur dans les tests. Le legacy fait mesurer la vue puis écrire dans le modèle.

## Décision
- `model/ports.ts` définit `TextMeasurer { measure(text, style): { width, height } }` et `ImageInfoProvider { sizeOf(url): { width, height } | undefined }`.
- `ObjectEnv = { measurer: TextMeasurer; images: ImageInfoProvider }` est passé à `ClassDef.create`.
- `TextObject` appelle `measurer.measure` à la création et à chaque changement de `text`, `fontSize`, `fontFamily`, `fontWeight`. `width`/`height` sont `mode: "ro"`.
- Implémentation de test : `FakeTextMeasurer` (largeur = 0,6 × fontSize × nb de caractères, hauteur = 1,2 × fontSize). Implémentation réelle : `view/pixiTextMeasurer.ts`.
- `images` : préchargées par `Presk.load` avant la compilation (T152).
- La **vue ne modifie jamais le modèle** (ADR-017).

## Alternatives écartées
Mesurer dans la vue : dépend de Pixi, introuvable dans les tests, mutation du modèle.

## Conséquences
Les résultats de mesure sont déterministes pour un même mesureur ; l'export vidéo doit utiliser le même mesureur que l'aperçu.
