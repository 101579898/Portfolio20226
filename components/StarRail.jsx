"use client";

// The shooting star as a guide: it rides a thin line down the right edge of the
// screen as you travel, and each stop jumps to a chapter. (Hidden on phones.)
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const STOPS = [
  { id: "intro", n: "01", label: "Opening" },
  { id: "about", n: "02", label: "About" },
  { id: "work", n: "03", label: "Work" },
  { id: "music", n: "04", label: "Music" },
  { id: "contact", n: "05", label: "Contact" },
];

export default function StarRail() {
  const pathname = usePathname();
  const star = useRef(null);
  const read = useRef(null);
  const [current, setCurrent] = useState(0);
  const [home, setHome] = useState(false);

  useEffect(() => {
    const els = STOPS.map((s) => document.getElementById(s.id));
    const ok = els.every(Boolean);
    setHome(ok);
    if (!ok) return;

    let raf = 0;
    function update() {
      raf = 0;
      const mid = innerHeight * 0.5;
      // Position between stops = which chapter the middle of the screen is in, and how far through it.
      let pos = 0;
      els.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.top <= mid) pos = i + Math.min(1, (mid - r.top) / Math.max(r.height, 1));
      });
      const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
      if (atEnd) pos = STOPS.length - 1;
      pos = Math.min(pos, STOPS.length - 1);
      if (star.current) star.current.style.transform = `translateY(${(pos / (STOPS.length - 1)) * 100}%)`;
      if (read.current) {
        const max = document.documentElement.scrollHeight - innerHeight;
        read.current.textContent = String(Math.round((scrollY / Math.max(1, max)) * 100)).padStart(3, "0");
      }
      setCurrent(Math.min(STOPS.length - 1, Math.floor(pos + 0.02)));
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  if (!home) return null;

  return (
    <nav className="star-rail" aria-label="Chapters">
      <span className="star-rail-track" aria-hidden="true">
        <span className="star-rail-mover" ref={star}>
          <svg viewBox="0 0 100 100"><path d="M50 0 Q53 47 100 50 Q53 53 50 100 Q47 53 0 50 Q47 47 50 0 Z" /></svg>
        </span>
      </span>
      <span className="star-rail-read" aria-hidden="true"><b ref={read}>000</b></span>
      {STOPS.map((s, i) => (
        <a key={s.id} href={`#${s.id}`} aria-current={i === current ? "true" : undefined}>
          <span className="star-rail-label"><i>{s.n}</i> {s.label}</span>
        </a>
      ))}
    </nav>
  );
}
