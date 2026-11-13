"use client";

// A band of flowing lines that bend away from your pointer.
import { useEffect, useRef } from "react";

export default function Waves() {
  const wrap = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const LINES = 26;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    // Pointer position eases toward the real pointer so the bulge feels soft.
    const p = { x: -999, y: -999, tx: -999, ty: -999, force: 0, target: 0 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      p.x += (p.tx - p.x) * 0.12;
      p.y += (p.ty - p.y) * 0.12;
      p.force += (p.target - p.force) * 0.08;
      const radius = Math.min(220, w * 0.28);
      const step = w < 700 ? 10 : 8;

      for (let i = 0; i < LINES; i++) {
        const k = i / (LINES - 1);
        const base = h * (0.12 + 0.76 * k);
        const edge = Math.sin(k * Math.PI);
        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          let y =
            base +
            Math.sin(x * 0.0055 + t * 0.0007 + i * 0.32) * 16 +
            Math.sin(x * 0.012 - t * 0.0005 + i * 0.9) * 6;
          const dx = x - p.x;
          const dy = base - p.y;
          const push = Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius * 0.35));
          y += (dy >= 0 ? 1 : -1) * push * 62 * p.force;
          if (x === -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${268 + k * 62}, 92%, 80%, ${0.12 + edge * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    function loop(t) {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      p.tx = e.clientX - rect.left;
      p.ty = e.clientY - rect.top;
      p.target = 1;
    }
    function onLeave() {
      p.target = 0;
    }

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);
    resize();
    window.addEventListener("resize", resize);
    const el = wrap.current;
    if (!reduce) {
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section className="waves" ref={wrap} aria-label="Design statement">
      <canvas ref={canvasRef} aria-hidden="true" />
      <p className="waves-text">
        Clear, accessible,
        <br />
        and <span className="serif">friendly to real people.</span>
      </p>
      <p className="label waves-hint" aria-hidden="true">[ MOVE_THROUGH_THE_SIGNAL ]</p>
    </section>
  );
}
