// Kiwi's pixels on a 30 x 30 grid: a hand-drawn kitten inside a star made from maths. Used for the little
// companion on screen (KiwiArt.jsx) and for the back of every card (cardback.js).
export const N = 30;
export const K = {
  core: "#fbf6e6",
  mid: "#dccdf6",
  tip: "#8f9bff",
  rim: "#5a5cf2",
  line: "#2b2680",
  fur: "#a893dc",
  furLight: "#cbbaf2",
  furDark: "#5d4a9c",
  stripe: "#3a2a70",
  muzzle: "#f3e6f4",
  ear: "#f0b3d0",
  blush: "#e79bc6",
  nose: "#e0669f",
  ink: "#0f0a20",
};

const M = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const bayer = (x, y) => (M[(((y % 4) + 4) % 4) * 4 + (((x % 4) + 4) % 4)] + 0.5) / 16;

const star = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
  const r = i % 2 ? 7.6 : 14;
  return [15 + Math.cos(a) * r, 15.8 + Math.sin(a) * r];
});

// Distance to the star's outline: negative = inside.
function toStar(x, y) {
  let inside = false;
  let d = 99;
  for (let i = 0, j = 9; i < 10; j = i++) {
    const [ax, ay] = star[i];
    const [bx, by] = star[j];
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
    const t = Math.min(1, Math.max(0, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
    d = Math.min(d, Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)));
  }
  return (inside ? -d : d) - 0.9; // rounded
}

// The kitten's head, drawn by hand (no eyes, nose or mouth: see FEATURES).
const FACE = [
  ".oo........oo.",
  ".oeo......oeo.",
  ".oeeo....oeeo.",
  ".offooooooffo.",
  "olllffssfffffo",
  "ollfffssfffffo",
  "olfffffffffffo",
  "offffffffffffo",
  "offffffffffffo",
  "obbffffffffbbo",
  "obbmmmmmmmmbbo",
  ".offmmmmmmffo.",
  "..oooooooooo..",
];
const INK = { o: "furDark", f: "fur", l: "furLight", e: "ear", s: "stripe", b: "blush", m: "muzzle" };
const FX = 8;
const FY = 9;

// Eyes sit at these corners (2 wide, 3 tall); nose and mouth are single pixels.
export const EYES = [11, 17];
export const EYE_Y = 16;
export const NOSE = [[14, 18], [15, 18]];
export const MOUTH = [[13, 19], [16, 19], [14, 20], [15, 20]];

// The kitten and her star.
export function kiwiPixel(px, py) {
  const x = px + 0.5;
  const y = py + 0.5;
  const c = FACE[py - FY]?.[px - FX];
  if (c && c !== ".") return K[INK[c]];
  const d = toStar(x, y);
  if (d > 0) return null;
  if (d > -0.95) return K.line;
  if (d > -1.8) return K.rim;
  const t = Math.hypot(x - 15, y - 15.8) / 13.4 + (bayer(px, py) - 0.5) * 0.34 + (x + y - 30) * 0.008;
  return t < 0.62 ? K.core : t < 0.82 ? K.mid : K.tip;
}

// The glow around her, as scattered pixels: [colour, opacity] or null.
export function auraPixel(px, py) {
  const d = toStar(px + 0.5, py + 0.5);
  if (d <= 0 || d > 7) return null;
  const p = 1 - d / 7;
  if (p * p * 1.05 < bayer(px, py)) return null;
  return [d < 2 ? "#8f9bff" : d < 4.5 ? "#6a63f0" : "#7c679e", 0.25 + p * 0.6];
}

// Paints Kiwi on a 2D canvas with her top-left corner at (ox, oy), one unit per pixel.
export function paintKiwi(g, ox, oy, { aura = true, happy = false } = {}) {
  if (aura) {
    for (let y = -7; y < N + 7; y++)
      for (let x = -7; x < N + 7; x++) {
        const a = auraPixel(x, y);
        if (!a) continue;
        g.globalAlpha = a[1];
        g.fillStyle = a[0];
        g.fillRect(ox + x, oy + y, 1, 1);
      }
    g.globalAlpha = 1;
  }
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const c = kiwiPixel(x, y);
      if (!c) continue;
      g.fillStyle = c;
      g.fillRect(ox + x, oy + y, 1, 1);
    }
  const dot = (x, y, c) => {
    g.fillStyle = c;
    g.fillRect(ox + x, oy + y, 1, 1);
  };
  for (const e of EYES) {
    if (happy) [[-1, 2], [0, 1], [1, 1], [2, 2]].forEach(([a, b]) => dot(e + a, EYE_Y + b, K.ink));
    else {
      g.fillStyle = K.ink;
      g.fillRect(ox + e, oy + EYE_Y, 2, 3);
      dot(e, EYE_Y, "#ffffff");
    }
  }
  NOSE.forEach(([x, y]) => dot(x, y, K.nose));
  MOUTH.forEach(([x, y]) => dot(x, y, K.ink));
}
