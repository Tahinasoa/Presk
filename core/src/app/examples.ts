// ─────────────────────────────────────────────────────────────────────────────
// HELLO — exemple d'origine
// ─────────────────────────────────────────────────────────────────────────────
export const HELLO: unknown = {
  version: "1.0",
  scene: { width: 1280, height: 720, background: "#101014" },
  steps: [
    { action: "create", target: "title", type: "text", properties: { text: "Presk", fontSize: 64, color: "white", pos: { x: 100, y: 100 } } },
    { action: "create", target: "box", type: "rectangle", properties: { width: 200, height: 80, fill: "#3b82f6", topLeft: "title.bottomLeft" } },
    { action: "animate", target: "title", properties: { reveal: true } },
    { action: "animate", target: "box", properties: { reveal: true }, start: "<0.3" },
    { action: "animate", target: "box", properties: { x: 600 }, duration: 2, ease: "cubicInOut" },
  ],
};

/**
 * Presk — exemple progressif
 *
 *  1. Un rectangle seul : apparition, chemin, déplacement, rotation, échelle, taille, couleur.
 *  2. D'autres rectangles qui le suivent (bind sur ses ancres).
 *  3. D'autres formes, chacune avec sa capacité propre.
 *  4. Du texte, lui aussi lié à une forme.
 *
 * Note : la spec n'a pas d'action `follow`. Le suivi se fait avec `bind`,
 * qui maintient une propriété égale à une expression, réévaluée à chaque frame.
 */

export const EXEMPLE: unknown = {
  version: "1.0",
  scene: { width: 1280, height: 720, background: "#101014" },
  steps: [
    // ── 1. Un rectangle seul ────────────────────────────────────────────────
    { action: "create", target: "box", type: "rectangle",
      properties: { width: 220, height: 100, fill: "#3b82f6", x: 80, y: 80 } },
    // Petit point posé sur son coin haut-gauche, pour illustrer son chemin `main`.
    { action: "create", target: "dot", type: "circle",
      properties: { radius: 8, fill: "white", x: "box.topLeft.x", y: "box.topLeft.y" } },

    { action: "animate", target: "box", properties: { reveal: true }, duration: 0.6 },
    { action: "animate", target: "dot", properties: { reveal: true }, duration: 0.3 },

    // Le contour du rectangle est un chemin fermé : le point en fait le tour.
    { action: "travel", target: "dot", along: "box", duration: 3 },
    { action: "animate", target: "dot", properties: { reveal: false }, duration: 0.3 },

    // Déplacement, puis rotation, échelle, taille et style (repeat: 2 + yoyo = aller-retour).
    { action: "animate", target: "box", properties: { x: 400 }, duration: 1.5, ease: "cubicInOut" },
    { action: "animate", target: "box", properties: { rotation: 25 },
      duration: 0.8, ease: "sineInOut", repeat: 2, repeatMode: "yoyo" },
    { action: "animate", target: "box", properties: { scale: 1.3 },
      duration: 0.6, ease: "backOut", repeat: 2, repeatMode: "yoyo" },
    { action: "animate", target: "box", properties: { width: 300, height: 140 },
      duration: 1, ease: "cubicInOut" },
    { action: "animate", target: "box", properties: { fill: "#8b5cf6", opacity: 0.6 },
      duration: 0.8, repeat: 2, repeatMode: "yoyo" },

    // ── 2. D'autres rectangles qui suivent le premier ───────────────────────
    { action: "create", target: "f1", type: "rectangle",
      properties: { width: 200, height: 60, fill: "#10b981", topLeft: "box.bottomLeft" } },
    { action: "create", target: "f2", type: "rectangle",
      properties: { width: 140, height: 60, fill: "#f59e0b", topLeft: "f1.bottomLeft" } },

    // f1 reste accroché sous box, f2 sous f1 : une chaîne de suivi.
    { action: "bind", target: "f1", properties: { topLeft: "box.bottomLeft" } },
    { action: "bind", target: "f2", properties: { topLeft: "f1.bottomLeft" } },
    { action: "animate", target: "f1", properties: { reveal: true }, duration: 0.5 },
    { action: "animate", target: "f2", properties: { reveal: true }, duration: 0.5, start: "<0.25" },

    // On déplace box : les deux suiveurs suivent sans qu'on les touche.
    { action: "animate", target: "box", properties: { x: 700, y: 120 },
      duration: 2, ease: "cubicInOut", start: ">0.3" },
    { action: "animate", target: "box", properties: { x: 200, y: 80 },
      duration: 2, ease: "cubicInOut", start: ">0.3" },

    // ── 3. D'autres formes, chacune avec sa capacité propre ─────────────────
    { action: "create", target: "c", type: "circle",
      properties: { radius: 40, fill: "#ef4444", x: 200, y: 500 } },
    { action: "create", target: "e", type: "ellipse",
      properties: { width: 180, height: 90, fill: "#06b6d4", x: 520, y: 500 } },
    { action: "create", target: "p", type: "polygon",
      properties: { pos: { x: 900, y: 500 },
        points: [{ x: 0, y: -60 }, { x: 60, y: 0 }, { x: 0, y: 60 }, { x: -60, y: 0 }],
        fill: "#facc15" } },
    // La flèche a deux extrémités assignables : on les lie au cercle et à l'ellipse.
    { action: "create", target: "a", type: "arrow",
      properties: { start: "c.pos", end: "e.pos", stroke: "white", strokeWidth: 3 } },

    { action: "animate", target: "c", properties: { reveal: true }, duration: 0.5, start: ">0.4" },
    { action: "animate", target: "e", properties: { reveal: true }, duration: 0.5, start: "<0.25" },
    // Le polygone a une variante de reveal propre : "draw" (tracé progressif).
    { action: "animate", target: "p", properties: { reveal: "draw" }, duration: 1, start: "<0.25" },
    { action: "bind", target: "a", properties: { start: "c.pos", end: "e.pos" }, start: ">" },
    { action: "animate", target: "a", properties: { reveal: "draw" }, duration: 0.8, start: "<" },

    // Cercle : `radius`. Ellipse : `width` et `height`. Polygone : rotation et échelle.
    { action: "animate", target: "c", properties: { radius: 70 },
      duration: 0.6, repeat: 2, repeatMode: "yoyo", start: ">0.3" },
    { action: "animate", target: "e", properties: { width: 260, height: 60 },
      duration: 0.8, ease: "cubicInOut", start: "<" },
    { action: "animate", target: "p", properties: { rotation: 180, scale: 0.7 },
      duration: 1, ease: "cubicInOut", start: "<" },
    // On déplace le cercle : la flèche, liée à lui, le suit.
    { action: "animate", target: "c", properties: { x: 320 }, duration: 1, ease: "cubicOut", start: ">0.2" },

    // ── 4. Du texte, lié à une forme ────────────────────────────────────────
    // Le texte est un rectangle (9 ancres) : il se colle sous la boîte englobante de l'ellipse.
    { action: "create", target: "t", type: "text",
      properties: { text: "lié à l'ellipse", fontSize: 28, color: "white",
        topLeft: "e.boundingBox.bottomLeft" } },
    { action: "create", target: "t2", type: "text",
      properties: { text: "suit box", fontSize: 22, color: "white",
        x: "f1.topLeft.x + 16", y: "f1.topLeft.y + 16" } },

    { action: "bind", target: "t", properties: { topLeft: "e.boundingBox.bottomLeft" }, start: ">0.3" },
    { action: "bind", target: "t2", properties: { x: "f1.topLeft.x + 16", y: "f1.topLeft.y + 16" }, start: "<" },
    { action: "animate", target: "t", properties: { reveal: true }, duration: 0.5, start: "<" },
    { action: "animate", target: "t2", properties: { reveal: true }, duration: 0.5, start: "<0.25" },

    // `set` change le contenu instantanément ; `animate` interpole couleur et échelle.
    { action: "set", target: "t", properties: { text: "texte lié, qui change" }, start: ">0.8" },
    { action: "animate", target: "t", properties: { color: "#facc15" }, duration: 0.8 },
    { action: "animate", target: "t", properties: { scale: 1.3 },
      duration: 0.5, ease: "sineInOut", repeat: 2, repeatMode: "yoyo", start: "<" },
    // L'ellipse s'élargit : le texte reste collé dessous.
    { action: "animate", target: "e", properties: { width: 360 }, duration: 1, ease: "cubicInOut", start: ">0.3" },
  ],
};