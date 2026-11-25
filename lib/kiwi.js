// Kiwi's pixels on a 30 x 30 grid: her original kitten inside a chubby four-point
// star, drawn from maths. Used for the little companion on screen (KiwiArt.jsx) and for the back
// of every card (cardback.js).
export const N = 30;
export const K = {
  tip: "#fffaf0",
  glow: "#eee6c4",
  edge: "#c8c793",
  rim: "#dcb1c2",
  fur: "#a88bb0",
  furDark: "#7c5f8c",
  stripe: "#523560",
  muzzle: "#ecd3de",
  ear: "#dcb1c2",
  nose: "#b8728f",
  ink: "#17101f",
};

const M = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const bayer = (x, y) => (M[(((y % 4) + 4) % 4) * 4 + (((x % 4) + 4) % 4)] + 0.5) / 16;

// Her star: a round, chubby body with four tapered arms, the same sparkle used across
// the site. BODY = body size, REACH = how far the tips go, ARM = how wide each arm
// starts (radians), TAPER = how quickly it thins.
const BODY = 9.9;
const REACH = 14.8;
const ARM = 0.4;
const TAPER = 3.8;

// Distance to the star's outline: negative = inside.
function toStar(x, y) {
  const dx = x - 15;
  const dy = y - 15.8;
  const a = Math.atan2(dy, dx);
  const off = Math.abs((((a % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2)) - Math.PI / 4);
  const k = Math.max(0, 1 - (Math.PI / 4 - off) / ARM);
  return (Math.hypot(dx, dy) - (BODY + (REACH - BODY) * Math.pow(k, TAPER))) * 0.9;
}

// The kitten and her star (no eyes, nose or mouth: see below).
export function kiwiPixel(px, py) {
  const x = px + 0.5;
  const y = py + 0.5;
  const face = Math.hypot((x - 15) / 6.9, (y - 16.6) / 5.9);
  const ex = Math.abs(x - 15);
  const ear = y >= 8 && y < 13 && ex > 2.4 && ex < 6.8 && ex - 4.7 < (y - 8) * 0.55 && 4.7 - ex < (y - 8) * 0.62;
  if (ear && face > 0.86) return y > 10 && Math.abs(ex - 4.7) < 0.9 ? K.ear : K.furDark;
  if (face < 1) {
    if (Math.hypot((x - 15) / 3, (y - 19.3) / 2.1) < 1) return K.muzzle;
    if (y < 14 && (ex < 0.6 || (Math.abs(ex - 2.5) < 0.6 && y < 13))) return K.stripe; // forehead
    if (ex > 5.2 && (py === 17 || py === 19)) return K.stripe; // cheeks
    return face > 0.86 ? K.furDark : K.fur;
  }
  const d = toStar(x, y);
  if (d > 0) return null;
  if (d > -1) return K.rim;
  if (d > -2) return K.edge;
  return Math.hypot(x - 15, y - 15.8) > 9.5 ? K.tip : K.glow;
}

// Her features, as [x, y, width, height, colour].
export const EYES = [10, 17].map((x) => [
  [x, 15, 3, 3, K.ink],
  [x + 1, 14, 1, 1, K.ink],
  [x + 1, 15, 1, 1, "#ffffff"],
]);
export const ASLEEP = [10, 17].map((x) => [
  [x, 16, 1, 1, K.ink],
  [x + 1, 15, 1, 1, K.ink],
  [x + 2, 16, 1, 1, K.ink],
]);
export const NOSE = [[14.5, 18, 1, 1, K.nose]];
export const MOUTH = [
  [13.5, 19.5, 1, 0.8, K.ink],
  [14.5, 19, 1, 0.8, K.ink],
  [15.5, 19.5, 1, 0.8, K.ink],
];
export const SMILE = [
  [13.5, 19, 3, 1, K.ink],
  [14, 20, 2, 1, K.nose],
];

// The glow around her, as scattered pixels: [colour, opacity] or null.
export function auraPixel(px, py) {
  const d = toStar(px + 0.5, py + 0.5);
  if (d <= 0 || d > 6) return null;
  const p = 1 - d / 6;
  if (p * p * 0.95 < bayer(px, py)) return null;
  return [d < 2 ? "#a9a4f2" : d < 4 ? "#6a63f0" : "#7c679e", 0.14 + p * 0.4];
}

// Paints Kiwi on a 2D canvas, one unit per pixel (no aura).
export function paintKiwi(g) {
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const c = kiwiPixel(x, y);
      if (!c) continue;
      g.fillStyle = c;
      g.fillRect(x, y, 1, 1);
    }
  for (const [x, y, w, h, c] of [...EYES.flat(), ...NOSE, ...MOUTH]) {
    g.fillStyle = c;
    g.fillRect(x, y, w, h);
  }
}
