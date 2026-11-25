"use client";

// Flowing lines behind the music. They bend away from the pointer, swell while
// music is playing, and settle when it pauses. `energy` is a ref from 0 to 1
// that the player sets. (Spotify does not share its sound with web pages, so the
// waves follow play and pause rather than the beat.)
import { useEffect, useRef } from "react";

const LINES = 26;

export default function Waves({ energy }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const area = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let phase = 0; // how far the waves have travelled
    let e = 0; // eased energy
    let visible = false;
    const p = { x: -999, y: -999, tx: -999, ty: -999, force: 0, target: 0 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const radius = Math.min(220, w * 0.28);
      const step = w < 700 ? 12 : 9;
      const breathe = 0.5 + 0.5 * Math.sin(phase * 1.7);
      const amp = 12 + e * (20 + 9 * breathe);
      const fine = 4 + e * 9;
      for (let i = 0; i < LINES; i++) {
        const k = i / (LINES - 1);
        const base = h * (0.08 + 0.84 * k);
        const edge = Math.sin(k * Math.PI);
        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          let y =
            base +
            Math.sin(x * 0.0055 + phase * 0.7 + i * 0.32) * amp +
            Math.sin(x * 0.012 - phase * 0.5 + i * 0.9) * fine +
            Math.sin(x * 0.0021 - phase * 1.15 + i * 0.12) * e * 16;
          const dx = x - p.x;
          const dy = base - p.y;
          y += (dy >= 0 ? 1 : -1) * Math.exp(-(dx * dx + dy * dy) / (0.7 * radius * radius)) * 62 * p.force;
          if (x === -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${246 + k * 92}, ${46 - k * 6}%, ${76 + e * 5}%, ${0.1 + edge * (0.34 + e * 0.3)})`;
        ctx.lineWidth = 1 + e * 0.35;
        ctx.stroke();
      }
    }

    function frame(t) {
      const dt = Math.min(0.05, (t - last) / 1000 || 0);
      last = t;
      e += ((energy?.current || 0) - e) * Math.min(1, dt * 1.8);
      phase += dt * (0.5 + e * 1.15);
      p.x += (p.tx - p.x) * 0.12;
      p.y += (p.ty - p.y) * 0.12;
      p.force += (p.target - p.force) * 0.08;
      draw();
      raf = visible ? requestAnimationFrame(frame) : 0; // sleeps off screen
    }
    function onMove(ev) {
      if (ev.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      p.tx = ev.clientX - r.left;
      p.ty = ev.clientY - r.top;
      p.target = 1;
    }
    const onLeave = () => (p.target = 0);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !reduce;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);
    resize();
    if (!reduce) {
      area.addEventListener("pointermove", onMove, { passive: true });
      area.addEventListener("pointerleave", onLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
    };
  }, [energy]);

  return <canvas ref={canvasRef} className="waves" aria-hidden="true" />;
}
