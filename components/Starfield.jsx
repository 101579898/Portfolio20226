"use client";

// The space behind every page: drifting stars, warp streaks, the digi-space
// grid and the shooting star. It reads its settings from lib/space.js.
import { useEffect, useRef } from "react";
import { space, cometPath } from "@/lib/space";

export default function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = window.innerWidth < 700 ? 260 : 520;
    const stars = [];
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
      if (reduce) draw(0);
    }

    function drawGrid(t, cx) {
      const a = space.digi * 0.16;
      if (a < 0.005) return;
      const horizon = h * 0.7;
      ctx.lineWidth = 1;
      const fade = ctx.createLinearGradient(0, horizon, 0, h);
      fade.addColorStop(0, "rgba(150,170,255,0)");
      fade.addColorStop(1, `rgba(150,170,255,${a})`);
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

    function drawComet(t) {
      const alpha = space.cometA;
      if (alpha < 0.01) return;
      const head = cometPath(space.cometP);
      // Tail: earlier points on the same path, fading out.
      ctx.lineCap = "round";
      let prev = head;
      for (let k = 1; k <= 34; k++) {
        const pt = cometPath(space.cometP - k * 0.007);
        const f = 1 - k / 34;
        ctx.strokeStyle = `rgba(200,220,255,${alpha * f * f * 0.75})`;
        ctx.lineWidth = Math.max(0.5, 7 * head.s * f);
        ctx.beginPath();
        ctx.moveTo(prev.x * w, prev.y * h);
        ctx.lineTo(pt.x * w, pt.y * h);
        ctx.stroke();
        prev = pt;
      }
      const x = head.x * w;
      const y = head.y * h;
      const pulse = reduce ? 1 : 1 + Math.sin(t * 0.006) * 0.12;
      const r = 46 * head.s * pulse;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, `rgba(255,255,255,${alpha})`);
      glow.addColorStop(0.18, `rgba(215,228,255,${alpha * 0.8})`);
      glow.addColorStop(0.5, `rgba(165,148,255,${alpha * 0.22})`);
      glow.addColorStop(1, "rgba(165,148,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      // Four-point sparkle
      ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`;
      ctx.lineWidth = 1.2;
      const arm = r * 0.9;
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
        const color = `hsla(${215 + s.hue * 55}, ${35 + space.digi * 45}%, ${90 - space.digi * 6}%, ${a})`;
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

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      raf = requestAnimationFrame(loop);
    } else {
      draw(0);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
