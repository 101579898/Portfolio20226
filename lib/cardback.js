// The back of every card, drawn as pixel art: Kiwi on her little moon, under a
// constellation. All backs share the layout; each card gets its own moon colour,
// constellation, sky and small symbol. Used by the HTML cards and by the 3D pack.
import { bayer, paintKiwi } from "./kiwi";

const W = 72;
const H = 101;
const SCALE = 6; // drawn big with hard edges, so it scales down cleanly

// Moon colours, dark to light.
const MOONS = [
  ["#3f2548", "#7a4a72", "#b9789a", "#dcb1c2", "#f6dde6"], // blush
  ["#241f52", "#35369c", "#6a66d6", "#a9a4f2", "#dcdcff"], // electric blue
  ["#2c2149", "#4f3f86", "#7c679e", "#b3a0d6", "#e3d8f5"], // violet
  ["#33332a", "#64643f", "#97966a", "#c8c793", "#f0efcf"], // pale
];

// A tiny 3 x 5 alphabet (rows of bits).
const GLYPH = { D: "65556", I: "72227", G: "34557", "-": "00700", S: "34216", P: "65644", A: "25755", C: "34443", E: "74647", "0": "75557", "1": "26227", "2": "61247", "3": "61216", "4": "55711", "5": "74616", "6": "34757", "7": "71122", "8": "75757", "9": "75716" };
function text(g, s, x, y, color) {
  g.fillStyle = color;
  for (const ch of s) {
    const rows = GLYPH[ch];
    if (rows) for (let r = 0; r < 5; r++) for (let b = 0; b < 3; b++) if ((+rows[r] >> (2 - b)) & 1) g.fillRect(x + b, y + r, 1, 1);
    x += 4;
  }
}

// One 9 x 9 symbol per kind of card. Projects choose theirs with `symbol` in data/site.js.
export const SYMBOLS = {
  cup: ["..#..#...", ".#..#....", "..#..#...", "#######..", "#######.#", "#######.#", "########.", ".#####...", "#######.."],
  pen: [".......##", "......###", ".....###.", "....###..", "...###...", "..###....", ".###.....", "###......", "##......."],
  bars: ["......##.", "......##.", "...##.##.", "...##.##.", "...##.##.", "##.##.##.", "##.##.##.", "##.##.##.", "##.##.##."],
  paw: ["..##.##..", "..##.##..", "##.....##", "##.###.##", "..#####..", ".#######.", ".#######.", "..##.##..", "........."],
  star: ["....#....", "....#....", "...###...", "..#####..", "#########", "..#####..", "...###...", "....#....", "....#...."],
  code: ["..#....#.", ".#......#", "#...#....", "....#....", "#...#...#", "....#....", "#...#....", ".#......#", "..#....#."],
  heart: [".##...##.", "####.####", "#########", "#########", ".#######.", "..#####..", "...###...", "....#....", "........."],
};

function seeded(id) {
  let s = 7;
  for (const ch of id) s = (s * 31 + ch.charCodeAt(0)) % 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}
const noise = (x, y, k) => {
  const f = (a, b) => {
    const v = Math.sin(a * 127.1 + b * 311.7 + k) * 43758.5453;
    return v - Math.floor(v);
  };
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = x - xi;
  const v = y - yi;
  return (f(xi, yi) * (1 - u) + f(xi + 1, yi) * u) * (1 - v) + (f(xi, yi + 1) * (1 - u) + f(xi + 1, yi + 1) * u) * v;
};

function paint(g, card) {
  const rnd = seeded(card.id);
  const px = (x, y, c, a = 1) => {
    g.globalAlpha = a;
    g.fillStyle = c;
    g.fillRect(x, y, 1, 1);
    g.globalAlpha = 1;
  };
  const k = rnd() * 50;
  const moon = MOONS[(card.backTone ?? Math.floor(rnd() * MOONS.length)) % MOONS.length];
  const cx = 36;
  const cy = 80;
  const r = 19.5;

  // Sky: stepped colours, blended with dithering, with a band of cloud.
  const sky = ["#090812", "#0f0c1c", "#171330", "#211a45", "#2d2464", "#3a3290"];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const glow = Math.exp(-(((x - 36) / 27) ** 2 + ((y - 46) / 33) ** 2)) * 3.6;
      const cloud = Math.max(0, noise(x / 11 + y / 26, y / 9 - x / 22, k) - 0.46) * 4.4;
      const v = glow + cloud + y * 0.004 + (bayer(x, y) - 0.5) * 1.05;
      px(x, y, sky[Math.max(0, Math.min(sky.length - 1, Math.floor(v)))]);
    }

  // Stars
  for (let i = 0; i < 46; i++) px(4 + Math.floor(rnd() * 64), 4 + Math.floor(rnd() * 92), ["#ffffff", "#8f9bff", "#dcb1c2", "#c8c793"][Math.floor(rnd() * 4)], 0.35 + rnd() * 0.6);
  for (let i = 0; i < 5; i++) {
    const x = 8 + Math.floor(rnd() * 56);
    const y = 16 + Math.floor(rnd() * 72);
    const c = ["#9fb4ff", "#f0b3d0", "#e8e4ff"][i % 3];
    for (const [dx, dy, a] of [[0, 0, 1], [1, 0, 0.8], [-1, 0, 0.8], [0, 1, 0.8], [0, -1, 0.8], [2, 0, 0.35], [-2, 0, 0.35], [0, 2, 0.35], [0, -2, 0.35]]) px(x + dx, y + dy, c, a);
  }

  // This card's own constellation, either side of Kiwi.
  const pts = [];
  const count = 5 + Math.floor(rnd() * 3);
  for (let i = 0; i < count; i++) {
    const a = -2.8 + (i / (count - 1)) * 2.46 + (rnd() - 0.5) * 0.3;
    const far = 24 + rnd() * 9;
    pts.push([Math.max(7, Math.min(63, Math.round(36 + Math.cos(a) * (far - 1)))), Math.max(16, Math.round(47 + Math.sin(a) * far))]);
  }
  pts.forEach(([x, y], i) => {
    if (i) {
      const [x0, y0] = pts[i - 1];
      const n = Math.max(Math.abs(x - x0), Math.abs(y - y0));
      for (let s = 2; s < n - 1; s += 2) px(Math.round(x0 + ((x - x0) * s) / n), Math.round(y0 + ((y - y0) * s) / n), "#a9a4f2", 0.55);
    }
    g.fillStyle = "#f3efff";
    g.fillRect(x, y, 2, 2);
  });

  // Moon, lit from the upper left like everything else in Digi-Space.
  const craters = Array.from({ length: 8 }, () => {
    const a = rnd() * 6.28;
    const d = Math.sqrt(rnd()) * 0.82;
    return [Math.cos(a) * d, Math.sin(a) * d, 0.08 + rnd() * 0.13];
  });
  for (let y = Math.floor(cy - r - 4); y <= Math.min(H - 1, cy + r + 4); y++)
    for (let x = Math.floor(cx - r - 4); x <= cx + r + 4; x++) {
      const nx = (x + 0.5 - cx) / r;
      const ny = (y + 0.5 - cy) / r;
      const d = Math.hypot(nx, ny);
      if (d > 1) {
        if (d < 1.22 && (1.22 - d) / 0.22 > bayer(x, y) + 0.1) px(x, y, moon[2], 0.5);
        continue;
      }
      const nz = Math.sqrt(1 - d * d);
      let l = nx * -0.55 + ny * -0.6 + nz * 0.58;
      for (const [qx, qy, qr] of craters) {
        const e = Math.hypot(nx - qx, ny - qy) / qr;
        if (e < 1) l -= 0.3;
        else if (e < 1.5 && nx - qx + (ny - qy) > 0) l += 0.18;
      }
      if (Math.abs(nx) < 0.52 && ny < -0.6) l -= 0.34; // Kiwi's shadow
      const v = (l + 0.22) * 3.5 + (bayer(x, y) - 0.5) * 1.1;
      px(x, y, moon[Math.max(0, Math.min(4, Math.floor(v)))]);
    }

  // Pixel border with stepped corners and little notches.
  const line = (x, y, w, h, c) => {
    g.fillStyle = c;
    g.fillRect(x, y, w, h);
  };
  line(0, 0, W, 2, "#07060b");
  line(0, H - 2, W, 2, "#07060b");
  line(0, 0, 2, H, "#07060b");
  line(W - 2, 0, 2, H, "#07060b");
  line(6, 3, W - 12, 1, "#b7a4ea");
  line(6, H - 4, W - 12, 1, "#b7a4ea");
  line(3, 6, 1, H - 12, "#b7a4ea");
  line(W - 4, 6, 1, H - 12, "#b7a4ea");
  for (const [sx, sy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const X = (v) => (sx ? W - 1 - v : v);
    const Y = (v) => (sy ? H - 1 - v : v);
    px(X(5), Y(4), "#b7a4ea");
    px(X(4), Y(5), "#b7a4ea");
    for (const [a, b] of [[7, 6], [6, 7], [8, 6], [6, 8]]) px(X(a), Y(b), "#6a63f0");
  }

  // Title plate and this card's symbol.
  line(14, 2, 44, 9, "#0b0917");
  line(14, 11, 44, 1, "#6a63f0");
  text(g, "DIGI-SPACE", 16, 4, "#f3e6f4");
  const sym = SYMBOLS[card.symbol] || SYMBOLS.star;
  line(28, H - 16, 16, 14, "#0b0917");
  line(28, H - 17, 16, 1, "#6a63f0");
  line(27, H - 16, 1, 12, "#6a63f0");
  line(44, H - 16, 1, 12, "#6a63f0");
  sym.forEach((row, y) => [...row].forEach((ch, x) => ch === "#" && px(32 + x, H - 14 + y, y < 5 ? moon[4] : moon[3])));
}

const cache = new Map();
export function cardBack(card) {
  const key = card.id + (card.symbol || "") + (card.backTone ?? "");
  if (cache.has(key)) return cache.get(key);
  const small = document.createElement("canvas");
  small.width = W;
  small.height = H;
  paint(small.getContext("2d"), card);
  const big = document.createElement("canvas");
  big.width = W * SCALE;
  big.height = H * SCALE;
  const g = big.getContext("2d");
  g.imageSmoothingEnabled = false;
  g.drawImage(small, 0, 0, big.width, big.height);
  g.scale(SCALE, SCALE);
  paintKiwi(g, 21, 33);
  cache.set(key, big);
  return big;
}
