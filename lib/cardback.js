// The back of every card: a deep, smooth sky, one fine line around it and a small
// Kiwi in the middle. All backs are identical. Used by the HTML cards and the 3D pack.
import { paintKiwi } from "./kiwi";

const W = 720;
const H = 1010;

function star(g, x, y, r) {
  g.beginPath();
  g.moveTo(x, y - r);
  g.quadraticCurveTo(x, y, x + r, y);
  g.quadraticCurveTo(x, y, x, y + r);
  g.quadraticCurveTo(x, y, x - r, y);
  g.quadraticCurveTo(x, y, x, y - r);
  g.fill();
}

function glow(g, x, y, r, stops) {
  const c = g.createRadialGradient(x, y, 0, x, y, r);
  stops.forEach(([at, color]) => c.addColorStop(at, color));
  g.fillStyle = c;
  g.fillRect(0, 0, W, H);
}

function paint(g) {
  const cx = W / 2;
  const cy = H / 2;

  // Sky: midnight navy into violet, lit from behind Kiwi.
  const sky = g.createLinearGradient(0, 0, W * 0.5, H);
  sky.addColorStop(0, "#0d0b19");
  sky.addColorStop(0.5, "#1c1738");
  sky.addColorStop(1, "#0f0c1e");
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = "screen";
  glow(g, cx, cy, 560, [[0, "rgba(92, 78, 168, 0.75)"], [0.45, "rgba(58, 46, 122, 0.38)"], [1, "rgba(20, 16, 40, 0)"]]);
  glow(g, W * 0.1, H * 0.04, 520, [[0, "rgba(220, 177, 194, 0.2)"], [1, "rgba(220, 177, 194, 0)"]]);
  glow(g, W * 0.92, H * 0.98, 560, [[0, "rgba(72, 74, 200, 0.34)"], [1, "rgba(53, 54, 156, 0)"]]);
  glow(g, cx, cy, 210, [[0, "rgba(238, 230, 196, 0.3)"], [0.5, "rgba(220, 177, 194, 0.12)"], [1, "rgba(220, 177, 194, 0)"]]);
  g.globalCompositeOperation = "source-over";

  // A breath of grain, so the gradients never band.
  const im = g.getImageData(0, 0, W, H);
  let s = 11;
  for (let i = 0; i < im.data.length; i += 4) {
    s = (s * 16807) % 2147483647;
    const v = (s / 2147483647 - 0.5) * 7;
    for (let k = 0; k < 3; k++) im.data[i + k] += v;
  }
  g.putImageData(im, 0, 0);

  // One fine line, opened at the top and bottom by a tiny star.
  const line = g.createLinearGradient(0, 0, W, H);
  line.addColorStop(0, "#f1e4f2");
  line.addColorStop(0.35, "#a99bd8");
  line.addColorStop(0.65, "#dcb1c2");
  line.addColorStop(1, "#8f8be6");
  const m = 44;
  const r = 34;
  const gap = 40;
  g.strokeStyle = line;
  g.lineWidth = 2.5;
  for (const side of [1, -1]) {
    g.beginPath();
    g.moveTo(cx + side * gap, m);
    g.arcTo(cx + side * (cx - m), m, cx + side * (cx - m), cy, r);
    g.arcTo(cx + side * (cx - m), H - m, cx, H - m, r);
    g.lineTo(cx + side * gap, H - m);
    g.stroke();
  }
  g.fillStyle = line;
  star(g, cx, m, 17);
  star(g, cx, H - m, 17);

  // Kiwi, small and crisp.
  const k = 7;
  g.save();
  g.translate(cx - 15 * k, cy - 15.8 * k);
  g.scale(k, k);
  paintKiwi(g);
  g.restore();
}

let done = null;
export function cardBack() {
  if (done) return done;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  paint(c.getContext("2d", { willReadFrequently: true }));
  done = c;
  return c;
}
