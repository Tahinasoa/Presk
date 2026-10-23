/**
 * Presk — exemple : les orbites des planètes
 *
 * Ce que le document montre :
 *  - une orbite est une ellipse, le Soleil occupe un foyer (centre de l'ellipse décalé) ;
 *  - une planète est une petite sphère qui parcourt le chemin de son ellipse (`travel`) ;
 *  - la Lune tourne autour de la Terre : son orbite est liée à la Terre (`bind`) ;
 *  - plus l'orbite est grande, plus la période est longue (T ∝ a^1,5).
 *
 * Simplifications assumées :
 *  - excentricité exagérée (b = 0,9 a) pour que le foyer se voie ;
 *  - tailles et distances illustratives, pas à l'échelle ;
 *  - vitesse constante le long de l'orbite (le `travel` de Presk est paramétré par
 *    longueur d'arc, §8.2) : seule la période change d'une planète à l'autre.
 *
 * TypeScript sert à générer les objets répétitifs (Presk n'a pas de boucle, §8.6).
 */

type Step = Record<string, unknown>;

// Couleur du fond de scène, réutilisée pour « effacer » le remplissage des orbites.
const BG = "#101014";

// Soleil au centre-gauche de la scène : les orbites s'ouvrent vers la droite.
const SUN = { x: 560, y: 380 };

// Période en secondes, déduite de la 3e loi de Kepler : T = 3 · (a / 130)^1,5
const period = (a: number) => +(3 * Math.pow(a / 130, 1.5)).toFixed(1);
// Distance centre → foyer d'une ellipse de demi-axes a et b.
const focus = (a: number, b: number) => +Math.sqrt(a * a - b * b).toFixed(1);

const PLANETS = [
  { id: "mercury", label: "Mercure", a: 130, b: 117, r: 7, color: "#a8a29e", phase: 0 },
  { id: "earth", label: "Terre", a: 220, b: 198, r: 10, color: "#3b82f6", phase: 0.35 },
  { id: "mars", label: "Mars", a: 300, b: 270, r: 8, color: "#ef4444", phase: 0.7 },
];
const [mercury, earth, mars] = PLANETS;

/** Orbite + planète + nom qui la suit, puis la planète se met à parcourir son orbite. */
const introduce = (p: (typeof PLANETS)[number], first: string): Step[] => [
  { action: "animate", target: `${p.id}Orbit`, properties: { reveal: true }, duration: 0.6, start: first },
  { action: "animate", target: p.id, properties: { reveal: true }, duration: 0.4, start: "<0.3" },
  { action: "animate", target: `${p.id}Label`, properties: { reveal: true }, duration: 0.4, start: "<0.2" },
  // Un tour complet sur un chemin fermé ; `from` déphase les planètes (§8.6).
  { action: "travel", target: p.id, along: `${p.id}Orbit`, from: p.phase, to: p.phase + 1,
    duration: period(p.a), repeat: "infinite", name: `${p.id}Run`, start: ">0.1" },
  // Déclaré après le travel : le nom lit la position déjà mise à jour dans la frame (§7.3).
  { action: "bind", target: `${p.id}Label`,
    properties: { x: `${p.id}.boundingBox.center.x + 14`, y: `${p.id}.boundingBox.center.y - 26` },
    start: "<" },
];

export const EXEMPLE: unknown = {
  version: "1.0",
  scene: { width: 1280, height: 720, background: BG },
  steps: [
    // ── Objets (créés invisibles, révélés par `animate … reveal`) ────────────
    { action: "create", target: "title", type: "text",
      properties: { text: "Les orbites des planètes", fontSize: 40, color: "white", x: 60, y: 24 } },
    { action: "create", target: "caption", type: "text",
      properties: { text: "Au centre du système : le Soleil.", fontSize: 24, color: "#cbd5e1", x: 60, y: 672 } },

    // Ancre invisible (type `point`, §11.2) : repère du Soleil, créé en premier pour que les
    // orbites se placent par rapport à lui sans dépendre de l'ordre d'empilement du dessin.
    { action: "create", target: "sunAnchor", type: "point", properties: { x: SUN.x, y: SUN.y } },

    // Orbites : le centre de l'ellipse est décalé de `c` par rapport au Soleil → le Soleil est à un foyer.
    // Pas de remplissage « transparent » possible : on remplit avec la couleur du fond (BG), et on crée
    // les grandes orbites d'abord pour qu'elles ne recouvrent pas les petites.
    ...[...PLANETS].reverse().map((p) => ({ action: "create", target: `${p.id}Orbit`, type: "ellipse",
      properties: { width: p.a * 2, height: p.b * 2, fill: BG, stroke: "#475569", strokeWidth: 2,
        x: `sunAnchor.pos.x + ${focus(p.a, p.b)}`, y: "sunAnchor.pos.y" } })),
    // Orbite lunaire : un `arc` de 360° est un simple tracé (stroke seulement, pas de `fill`).
    // Posé au départ de la Terre ; un `bind` la fait ensuite suivre la Terre.
    { action: "create", target: "moonOrbit", type: "arc",
      properties: { radius: 34, startAngle: 0, endAngle: 360, stroke: "#475569", strokeWidth: 1,
        x: `earthOrbit.pathX(main, ${earth.phase})`, y: `earthOrbit.pathY(main, ${earth.phase})` } },

    // Le Soleil et les planètes viennent après les orbites : ils sont dessinés par-dessus.
    { action: "create", target: "sun", type: "circle",
      properties: { radius: 30, fill: "#fbbf24", pos: "sunAnchor.pos" } },
    // Planètes : posées au point de départ de leur parcours (pas de saut au premier `travel`).
    ...PLANETS.map((p) => ({ action: "create", target: p.id, type: "circle",
      properties: { radius: p.r, fill: p.color,
        x: `${p.id}Orbit.pathX(main, ${p.phase})`, y: `${p.id}Orbit.pathY(main, ${p.phase})` } })),
    { action: "create", target: "moon", type: "circle",
      properties: { radius: 5, fill: "#cbd5e1", x: "moonOrbit.pathX(main, 0)", y: "moonOrbit.pathY(main, 0)" } },
    ...PLANETS.map((p) => ({ action: "create", target: `${p.id}Label`, type: "text",
      properties: { text: p.label, fontSize: 18, color: "#9ca3af",
        x: `${p.id}.boundingBox.center.x + 14`, y: `${p.id}.boundingBox.center.y - 26` } })),

    // ── 1. Le Soleil ────────────────────────────────────────────────────────
    { action: "animate", target: "title", properties: { reveal: true }, duration: 0.8 },
    { action: "animate", target: "sun", properties: { reveal: true }, duration: 0.8, start: ">0.2" },
    { action: "animate", target: "caption", properties: { reveal: true }, duration: 0.6, start: "<" },

    // ── 2. Mercure : une ellipse, le Soleil à un foyer ──────────────────────
    { action: "set", target: "caption",
      properties: { text: "Chaque planète suit une ellipse, le Soleil occupant l'un des foyers." },
      start: ">1.5" },
    ...introduce(mercury, "<0.4"),

    // ── 3. La Terre, puis la Lune ───────────────────────────────────────────
    // `mercuryRun` est infinie : on s'ancre sur son DÉBUT ("mercuryRun<4"), jamais sur sa fin (§6.5).
    { action: "set", target: "caption",
      properties: { text: "La Terre est plus loin : son orbite est plus grande, elle met plus de temps." },
      start: "mercuryRun<4" },
    ...introduce(earth, "<0.4"),

    { action: "set", target: "caption",
      properties: { text: "La Lune tourne autour de la Terre : son orbite suit la Terre." },
      start: "earthRun<1.5" },
    // Orbites imbriquées (§8.9) : le centre de l'orbite lunaire suit la Terre, la Lune la parcourt.
    { action: "bind", target: "moonOrbit", properties: { pos: "earth.pos" }, start: "earthRun" },
    { action: "animate", target: "moonOrbit", properties: { reveal: true }, duration: 0.5, start: "earthRun<1.5" },
    { action: "animate", target: "moon", properties: { reveal: true }, duration: 0.4, start: "<0.2" },
    { action: "travel", target: "moon", along: "moonOrbit", duration: 1.2,
      repeat: "infinite", name: "moonRun", start: ">0.1" },

    // ── 4. Mars ─────────────────────────────────────────────────────────────
    { action: "set", target: "caption",
      properties: { text: "Mars, plus loin encore, est encore plus lente." },
      start: "moonRun<4" },
    ...introduce(mars, "<0.4"),

    // ── 5. Conclusion : la période dépend de la taille de l'orbite ──────────
    { action: "set", target: "caption",
      properties: { text: "Plus l'orbite est grande, plus la période est longue : T² ∝ a³" },
      start: "marsRun<4" },
    // On met en évidence l'orbite de la Terre : couleur, puis épaisseur qui pulse (6 passages finis).
    { action: "animate", target: "earthOrbit", properties: { stroke: "#3b82f6" }, duration: 1, start: "<0.5" },
    { action: "animate", target: "earthOrbit", properties: { strokeWidth: 6 },
      duration: 1, repeat: 6, repeatMode: "yoyo", start: "<" },
  ],
};