"use client";

// The cursor as a light source. Two soft glows follow the mouse at different
// speeds (that lag is the trail), with the odd speck of stardust when it moves
// fast. Anything with the class "lit" is told where the light is, so its
// surface brightens on that side. Mouse only; off for reduced motion; sleeps
// when the pointer is still.
import { useEffect, useRef } from "react";

const DUST = ["220,177,194", "201,194,234", "200,199,147"];

export default function CursorTrail() {
  const canvasRef = useRef(null);
  const nearRef = useRef(null);
  const farRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const glows = [
      { el: nearRef.current, x: 0, y: 0, ease: 0.2 },
      { el: farRef.current, x: 0, y: 0, ease: 0.075 },
    ];
    const mouse = { x: 0, y: 0, px: 0, py: 0 };
    let w = 0;
    let h = 0;
    let raf = 0;
    let seen = false;
    let dust = [];
    let dirty = false;
    let lit = null;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function frame() {
      let moving = false;
      for (const g of glows) {
        g.x += (mouse.x - g.x) * g.ease;
        g.y += (mouse.y - g.y) * g.ease;
        if (Math.abs(mouse.x - g.x) + Math.abs(mouse.y - g.y) > 0.5) moving = true;
        g.el.style.transform = `translate3d(${g.x.toFixed(1)}px,${g.y.toFixed(1)}px,0)`;
      }
      if (dust.length || dirty) {
        ctx.clearRect(0, 0, w, h);
        dirty = dust.length > 0;
        dust = dust.filter((p) => ++p.life < p.max);
        for (const p of dust) {
          p.x += p.vx;
          p.y += p.vy;
          const a = (1 - p.life / p.max) ** 2 * 0.8;
          ctx.fillStyle = `rgba(${p.color},${a})`;
          const s = p.size;
          ctx.fillRect(p.x - s * 2, p.y - 0.4, s * 4, 0.8);
          ctx.fillRect(p.x - 0.4, p.y - s * 2, 0.8, s * 4);
        }
      }
      raf = moving || dust.length || dirty ? requestAnimationFrame(frame) : 0;
    }

    function onMove(e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!seen) {
        seen = true;
        for (const g of glows) {
          g.x = mouse.x;
          g.y = mouse.y;
          g.el.style.opacity = 1;
        }
        mouse.px = mouse.x;
        mouse.py = mouse.y;
      }
      const dist = Math.hypot(mouse.x - mouse.px, mouse.y - mouse.py);
      if (dist > 46) {
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        if (dust.length < 40) {
          dust.push({
            x: mouse.x + (Math.random() - 0.5) * 22,
            y: mouse.y + (Math.random() - 0.5) * 22,
            vx: (Math.random() - 0.5) * 0.5,
            vy: 0.15 + Math.random() * 0.25,
            size: 1 + Math.random() * 1.6,
            color: DUST[Math.floor(Math.random() * DUST.length)],
            life: 0,
            max: 34 + Math.random() * 30,
          });
        }
      }

      // Light the surface under the pointer.
      const el = e.target.closest?.(".lit") || null;
      if (lit && lit !== el) lit.classList.remove("is-lit");
      lit = el;
      if (el) {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--lx", `${(e.clientX - r.left).toFixed(0)}px`);
        el.style.setProperty("--ly", `${(e.clientY - r.top).toFixed(0)}px`);
        el.classList.add("is-lit");
      }
      if (!raf) raf = requestAnimationFrame(frame);
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

  return (
    <div className="cursor-light" aria-hidden="true">
      <span className="cursor-glow far" ref={farRef} />
      <span className="cursor-glow near" ref={nearRef} />
      <canvas ref={canvasRef} />
    </div>
  );
}
