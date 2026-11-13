"use client";

// Astral cursor: a soft pink-purple nebula glow drifts after the mouse and
// sheds twinkling stardust. Mouse only (no touch), off with reduced motion,
// and the drawing loop sleeps whenever the pointer is still.
import { useEffect, useRef } from "react";

const COLORS = ["255,176,234", "200,150,255", "255,243,196", "255,255,255"];

export default function CursorTrail() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let seen = false;
    const mouse = { x: 0, y: 0, px: 0, py: 0 };
    // Three glows that follow at different speeds, so the light smears into a tail.
    const blobs = [
      { x: 0, y: 0, ease: 0.2, r: 70, color: "255,176,234", a: 0.32 },
      { x: 0, y: 0, ease: 0.1, r: 120, color: "190,130,255", a: 0.22 },
      { x: 0, y: 0, ease: 0.05, r: 180, color: "120,110,255", a: 0.14 },
    ];
    let dust = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function sparkle(p, a) {
      const s = p.size * (0.6 + 0.4 * Math.sin(p.life * 0.4 + p.seed));
      ctx.fillStyle = `rgba(${p.color},${a})`;
      if (p.star) {
        // four-point star
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - s * 2.4);
        ctx.quadraticCurveTo(p.x, p.y, p.x + s * 2.4, p.y);
        ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + s * 2.4);
        ctx.quadraticCurveTo(p.x, p.y, p.x - s * 2.4, p.y);
        ctx.quadraticCurveTo(p.x, p.y, p.x, p.y - s * 2.4);
        ctx.fill();
      } else {
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s); // tiny pixel
      }
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      let moving = false;

      for (const b of blobs) {
        b.x += (mouse.x - b.x) * b.ease;
        b.y += (mouse.y - b.y) * b.ease;
        if (Math.abs(mouse.x - b.x) + Math.abs(mouse.y - b.y) > 0.6) moving = true;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(${b.color},${b.a})`);
        g.addColorStop(1, `rgba(${b.color},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      dust = dust.filter((p) => p.life < p.max);
      for (const p of dust) {
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.012;
        p.vx *= 0.98;
        const t = p.life / p.max;
        sparkle(p, (1 - t) * (1 - t));
      }

      if (moving || dust.length) raf = requestAnimationFrame(frame);
      else running = false; // the three glows stay put where the pointer rests
    }

    function wake() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }

    function onMove(e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!seen) {
        seen = true;
        for (const b of blobs) {
          b.x = mouse.x;
          b.y = mouse.y;
        }
        mouse.px = mouse.x;
        mouse.py = mouse.y;
      }
      // Shed more stardust the faster the pointer moves.
      const dist = Math.hypot(mouse.x - mouse.px, mouse.y - mouse.py);
      const n = Math.min(4, Math.floor(dist / 14));
      for (let i = 0; i < n && dust.length < 140; i++) {
        dust.push({
          x: mouse.x + (Math.random() - 0.5) * 16,
          y: mouse.y + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          size: 1.5 + Math.random() * 2.2,
          star: Math.random() < 0.4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          seed: Math.random() * 6,
          life: 0,
          max: 34 + Math.random() * 40,
        });
      }
      if (n > 0) {
        mouse.px = mouse.x;
        mouse.py = mouse.y;
      }
      wake();
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="cursor-trail" aria-hidden="true" />;
}
