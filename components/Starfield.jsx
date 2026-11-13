"use client";

// The space behind every page. Everything here is drawn in code:
//   - drifting stars that stretch into warp streaks
//   - the comet you follow during the journey
//   - a glowing ringed planet and a dithered pixel galaxy that appear in digi-space
//   - the digi-space floor grid
// It reads its settings from lib/space.js.
import { useEffect, useRef } from "react";
import { space, cometPath } from "@/lib/space";

// 4x4 Bayer matrix: the classic pattern old computers used to fake shading with dots.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

// A pink and yellow spiral galaxy made of dithered pixels (drawn once, then reused).
function makeGalaxy() {
  const gw = 190;
  const gh = 124;
  const c = document.createElement("canvas");
  c.width = gw;
  c.height = gh;
  const g = c.getContext("2d");
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      // Position relative to the galaxy centre, tilted and squashed into a disc.
      const ux = (x / gw - 0.52) * 2;
      const uy = (y / gh - 0.5) * 2;
      const rx = ux * 0.94 - uy * 0.34;
      const ry = (ux * 0.34 + uy * 0.94) * 2.1;
      const r = Math.hypot(rx, ry);
      const arms = 0.5 + 0.5 * Math.cos(2 * Math.atan2(ry, rx) - 7 * Math.log(r + 0.08));
      const grain = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      let v = Math.exp(-r * 4.2) * 1.5 + Math.exp(-r * 1.9) * 0.75 * arms;
      v += Math.abs(grain) * 0.06 - 0.03;
      const threshold = (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
      if (v > threshold) {
        g.fillStyle = v > 0.95 ? "#fff6b0" : v > 0.5 ? "#ff8fd0" : "#a45ad8";
        g.fillRect(x, y, 1, 1);
      } else if (Math.abs(grain) > 0.994) {
        g.fillStyle = "#ffd0ea";
        g.fillRect(x, y, 1, 1);
      }
    }
  }
  return c;
}

// A dark planet lit from behind with a pink glow, purple rings and a small moon.
function makePlanet(R) {
  const c = document.createElement("canvas");
  const W = Math.ceil(R * 5);
  const H = Math.ceil(R * 3.4);
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  const cx = W * 0.56;
  const cy = H * 0.52;
  const tilt = -0.3;

  function ring(from, to) {
    g.save();
    g.translate(cx, cy);
    g.rotate(tilt);
    const bands = [
      [2.05, 0.2, "rgba(120, 110, 220, 0.5)"],
      [1.82, 0.16, "rgba(185, 140, 255, 0.6)"],
      [1.6, 0.1, "rgba(255, 143, 208, 0.55)"],
      [1.45, 0.05, "rgba(255, 220, 240, 0.5)"],
    ];
    for (const [radius, width, color] of bands) {
      g.strokeStyle = color;
      g.lineWidth = R * width;
      g.beginPath();
      g.ellipse(0, 0, R * radius, R * radius * 0.26, 0, from, to);
      g.stroke();
    }
    g.restore();
  }

  // Glow behind everything
  const halo = g.createRadialGradient(cx - R * 0.25, cy - R * 0.15, R * 0.7, cx, cy, R * 1.65);
  halo.addColorStop(0, "rgba(255, 150, 225, 0.75)");
  halo.addColorStop(0.45, "rgba(200, 110, 255, 0.28)");
  halo.addColorStop(1, "rgba(200, 110, 255, 0)");
  g.fillStyle = halo;
  g.fillRect(0, 0, W, H);

  // Moon
  const mx = cx - R * 1.05;
  const my = cy - R * 0.72;
  const moon = g.createRadialGradient(mx - R * 0.1, my - R * 0.1, 0, mx, my, R * 0.34);
  moon.addColorStop(0, "#fff0fa");
  moon.addColorStop(0.6, "#f0a8dc");
  moon.addColorStop(1, "#7a3a86");
  g.fillStyle = moon;
  g.beginPath();
  g.arc(mx, my, R * 0.34, 0, Math.PI * 2);
  g.fill();

  ring(Math.PI, Math.PI * 2); // far half of the rings, behind the planet

  // Planet body: mostly in shadow, bright pink along the lit edge
  const body = g.createRadialGradient(cx - R * 0.95, cy - R * 0.55, R * 0.05, cx + R * 0.15, cy + R * 0.1, R * 1.15);
  body.addColorStop(0, "#ffd9f2");
  body.addColorStop(0.2, "#e58ad0");
  body.addColorStop(0.42, "#6a2a66");
  body.addColorStop(0.7, "#1c0a20");
  body.addColorStop(1, "#0d0410");
  g.fillStyle = body;
  g.beginPath();
  g.arc(cx, cy, R, 0, Math.PI * 2);
  g.fill();

  ring(0, Math.PI); // near half of the rings, in front
  return c;
}

export default function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = window.innerWidth < 700 ? 260 : 520;
    const stars = [];
    const galaxy = makeGalaxy();
    let planet = null;
    let w = 0;
    let h = 0;
    let raf = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    function spawn(s, far) {
      s.x = (Math.random() - 0.5) * 2;
      s.y = (Math.random() - 0.5) * 2;
      s.z = far ? 1 : Math.random() * 0.98 + 0.02;
      s.pz = s.z;
      s.tw = Math.random() * 6.28;
      s.hue = Math.random();
    }
    for (let i = 0; i < count; i++) {
      const s = {};
      spawn(s, false);
      stars.push(s);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      planet = makePlanet(Math.round(Math.min(w, h) * (w < 700 ? 0.16 : 0.2)));
      if (reduce) draw(0);
    }

    // Planet (top right) and pixel galaxy (lower left) drift slowly as the page scrolls.
    function drawScenery() {
      const a = space.digi;
      if (a < 0.01) return;
      const scroll = window.scrollY;
      const small = w < 700;

      const px = small ? 3 : 5;
      const gw = galaxy.width * px;
      const gh = galaxy.height * px;
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = a * (small ? 0.22 : 0.3);
      ctx.drawImage(galaxy, -gw * 0.22 - pointer.x * 10, h * 0.62 - gh * 0.5 + ((scroll * 0.03) % (h * 0.6)) - h * 0.1, gw, gh);
      ctx.imageSmoothingEnabled = true;

      if (planet) {
        const grow = 0.75 + a * 0.25;
        const pw = planet.width * grow;
        const ph = planet.height * grow;
        ctx.globalAlpha = a * (small ? 0.4 : 0.55);
        ctx.drawImage(planet, w * (small ? 0.8 : 0.88) - pw * 0.5 + pointer.x * 26, h * 0.7 - scroll * 0.045 - ph * 0.5 + pointer.y * 16, pw, ph);
      }
      ctx.globalAlpha = 1;
    }

    function drawGrid(t, cx) {
      const a = space.digi * 0.2;
      if (a < 0.005) return;
      const horizon = h * 0.7;
      ctx.lineWidth = 1;
      const fade = ctx.createLinearGradient(0, horizon, 0, h);
      fade.addColorStop(0, "rgba(255,143,208,0)");
      fade.addColorStop(1, `rgba(215,140,255,${a})`);
      ctx.strokeStyle = fade;
      ctx.beginPath();
      for (let i = -12; i <= 12; i++) {
        ctx.moveTo(cx + i * 14, horizon);
        ctx.lineTo(cx + i * w * 0.16, h);
      }
      const drift = reduce ? 0 : (t * 0.00012) % 1;
      for (let i = 0; i < 9; i++) {
        const k = (i + drift) / 9;
        const y = horizon + (h - horizon) * k * k;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    }

    // The comet: a long purple-pink tail with a white-blue head.
    function drawComet(t) {
      const alpha = space.cometA;
      if (alpha < 0.01) return;
      const head = cometPath(space.cometP);
      const big = Math.min(1.6, Math.max(0.8, w / 900));
      const STEPS = 56;
      const layers = [
        [78, "140,90,235", 0.16],
        [42, "205,120,240", 0.3],
        [18, "255,170,225", 0.55],
        [5, "255,255,255", 0.9],
      ];
      ctx.lineCap = "round";
      for (const [width, color, strength] of layers) {
        let prev = head;
        for (let k = 1; k <= STEPS; k++) {
          const pt = cometPath(space.cometP - k * 0.0075);
          const f = 1 - k / STEPS;
          ctx.strokeStyle = `rgba(${color},${alpha * Math.pow(f, 1.5) * strength})`;
          ctx.lineWidth = Math.max(0.5, width * big * head.s * (0.25 + f * 0.75));
          ctx.beginPath();
          ctx.moveTo(prev.x * w, prev.y * h);
          ctx.lineTo(pt.x * w, pt.y * h);
          ctx.stroke();
          prev = pt;
        }
      }
      const x = head.x * w;
      const y = head.y * h;
      const pulse = reduce ? 1 : 1 + Math.sin(t * 0.006) * 0.1;
      const r = 92 * big * head.s * pulse;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, `rgba(255,255,255,${alpha})`);
      glow.addColorStop(0.14, `rgba(205,235,255,${alpha * 0.9})`);
      glow.addColorStop(0.36, `rgba(150,170,255,${alpha * 0.4})`);
      glow.addColorStop(0.65, `rgba(200,110,255,${alpha * 0.14})`);
      glow.addColorStop(1, "rgba(200,110,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      // Four-point sparkle
      ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`;
      ctx.lineWidth = 1.2;
      const arm = r * 0.7;
      ctx.beginPath();
      ctx.moveTo(x - arm, y);
      ctx.lineTo(x + arm, y);
      ctx.moveTo(x, y - arm);
      ctx.lineTo(x, y + arm);
      ctx.stroke();
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      const cx = w / 2 - pointer.x * 18;
      const cy = h / 2 - pointer.y * 18;
      const f = Math.max(w, h) * 0.5;
      const warp = reduce ? 0 : space.warp;
      const speed = reduce ? 0 : 0.00035 + warp * 0.028;

      drawScenery();
      drawGrid(t, cx);

      ctx.lineCap = "round";
      for (const s of stars) {
        s.pz = s.z;
        s.z -= speed;
        if (s.z <= 0.02) spawn(s, true);
        const sx = cx + (s.x / s.z) * f;
        const sy = cy + (s.y / s.z) * f;
        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) continue;
        const twinkle = reduce ? 1 : 0.7 + 0.3 * Math.sin(t * 0.002 + s.tw);
        const a = Math.min(1, (1 - s.z) * 1.6 + 0.15) * twinkle;
        const size = (1 - s.z) * 1.5 + 0.3;
        // Mostly purple-to-pink stars, with the odd pale yellow one.
        const hue = s.hue > 0.9 ? 52 : 265 + s.hue * 75;
        const color = `hsla(${hue}, ${45 + space.digi * 45}%, ${90 - space.digi * 5}%, ${a})`;
        if (warp > 0.02) {
          const px = cx + (s.x / s.pz) * f;
          const py = cy + (s.y / s.pz) * f;
          ctx.strokeStyle = color;
          ctx.lineWidth = size;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        } else {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      drawComet(t);
    }

    function loop(t) {
      draw(t);
      raf = requestAnimationFrame(loop);
    }

    function onMove(e) {
      pointer.tx = e.clientX / w - 0.5;
      pointer.ty = e.clientY / h - 0.5;
    }
    function onScrollStill() {
      draw(0);
    }

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      raf = requestAnimationFrame(loop);
    } else {
      // No animation loop: redraw only when the page scrolls so the scenery still drifts.
      window.addEventListener("scroll", onScrollStill, { passive: true });
      draw(0);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScrollStill);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
