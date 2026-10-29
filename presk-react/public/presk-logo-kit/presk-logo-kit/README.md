# Kit logo Presk

Logo : deux diapositives 16:9 empilées. La bleue (devant) porte un play blanc, la jaune (derrière) dépasse en bas à droite. Une présentation et une vidéo en un seul signe.

## Couleurs

| Rôle | Valeur |
|---|---|
| Bleu | `#2563EB` |
| Jaune | `#F5B800` |
| Blanc (play) | `#FFFFFF` |

Aucun dégradé, fond transparent : le logo fonctionne sur fond clair et sombre.

## Contenu

```
svg/
  presk-logo.svg            logo complet, 172 x 102
  presk-logo-animated.svg   même logo avec animation d'entrée (CSS dans le SVG)
  presk-icon.svg            icône carrée pour favicon et avatar (proportions adaptées aux petites tailles)
png/
  presk-logo-512.png, presk-logo-1024.png
  favicon-16.png, favicon-32.png, favicon-48.png
  icon-192.png, icon-512.png            transparent, pour manifest PWA
  apple-touch-icon.png                  180 x 180, fond #101014 (iOS n'accepte pas la transparence)
favicon.ico                             16, 32 et 48 px
react/PreskLogo.tsx                     composants PreskLogo et PreskIcon
preview.html                            aperçu sur fond clair et sombre
```

## Favicon (HTML)

```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/presk-icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

## React

```tsx
import { PreskLogo, PreskIcon } from "./PreskLogo";

<PreskLogo size={120} />
<PreskLogo size={120} animated />   {/* animation d'entrée */}
<PreskIcon size={32} />
```

Pour rejouer l'animation, change la `key` du composant. L'animation est coupée si l'utilisateur a activé « réduire les animations ».

## Animation

Chaque pièce est séparée (`back`, `front`, `play`) : tu peux les piloter toi-même en CSS ou avec le moteur Presk. L'animation fournie est volontairement simple : la diapo bleue apparaît, la jaune glisse en place, le play surgit.

## Règles d'usage

- Laisser autour du logo une marge d'au moins la moitié de la hauteur du play.
- Ne pas modifier les couleurs ni ajouter d'ombre ou de dégradé.
- Sous 24 px de large, utiliser `presk-icon.svg` plutôt que le logo complet.
