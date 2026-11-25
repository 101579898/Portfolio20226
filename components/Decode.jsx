"use client";

// A label that tunes in: its letters flicker through signal characters once, then
// settle. Screen readers always get the real words. Still for reduced motion.
import { useEffect, useRef } from "react";

const NOISE = "▚▞▌▐░▒+·:/\\<>=01";

export default function Decode({ text, className = "" }) {
  const out = useRef(null);

  useEffect(() => {
    const el = out.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let n = 0;
        timer = setInterval(() => {
          n += 1.5;
          el.textContent = [...text].map((c, i) => (c === " " || i < n ? c : NOISE[Math.floor(Math.random() * NOISE.length)])).join("");
          if (n >= text.length) clearInterval(timer);
        }, 34);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
      el.textContent = text;
    };
  }, [text]);

  return (
    <p className={`label ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" ref={out}>{text}</span>
    </p>
  );
}
