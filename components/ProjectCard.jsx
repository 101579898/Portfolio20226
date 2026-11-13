"use client";

// One collectible card with real thickness: a front, a designed back and
// white edges in between, so it reads as a physical card when it turns.
//
//   rarity  – "common" | "holo" | "star" | "cosmic": how much foil it has
//   tilt    – leans toward the pointer and the foil shifts with it
//   flipped – show the back
//   info    – the back also shows the write-up and a button
//   spin    – drag to turn the card freely in 3D; a tap flips it (used in the zoom view)
import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import PixelArt from "./PixelArt";
import { asset } from "@/lib/asset";
import { RARITY_LABEL } from "@/lib/deck";

const STAR = "M50 12 L61.2 36.6 L88 39.6 L68.1 57.9 L73.5 84.4 L50 71 L26.5 84.4 L31.9 57.9 L12 39.6 L38.8 36.6 Z";

function CardArt({ card }) {
  if (card.kind === "skill") {
    return (
      <ul className="card-bars" aria-hidden="true">
        {card.bars.map((s) => (
          <li key={s.name}>
            <span>{s.short}</span>
            <i><b style={{ width: `${s.level * 10}%` }} /></i>
          </li>
        ))}
      </ul>
    );
  }
  if (card.kind === "star") {
    return (
      <div className="card-art-empty card-art-star" aria-hidden="true">
        <svg viewBox="0 0 100 100">
          <path d={STAR} fill="#ffe9a8" stroke="#ffe9a8" strokeWidth="13" strokeLinejoin="round" />
          <ellipse cx="42.5" cy="50" rx="3.4" ry="5.6" fill="#2a1a4a" />
          <ellipse cx="57.5" cy="50" rx="3.4" ry="5.6" fill="#2a1a4a" />
          <path d="M44 59 Q50 68 56 59 Z" fill="#2a1a4a" />
          <circle cx="34.5" cy="57" r="3.4" fill="#ff8fc8" opacity=".7" />
          <circle cx="65.5" cy="57" r="3.4" fill="#ff8fc8" opacity=".7" />
        </svg>
      </div>
    );
  }
  if (card.image) return <img src={asset(card.image)} alt="" draggable="false" />;
  if (card.kind === "designer") return <PixelArt src="/img/lily.svg" className="card-pixel" />;
  return (
    <div className="card-art-empty" aria-hidden="true">
      <span />
    </div>
  );
}

export default function ProjectCard({
  card,
  number,
  rarity = "common",
  tilt = false,
  flipped = false,
  info = false,
  spin = false,
  badge,
  onFlip,
  onNavigate,
}) {
  const ref = useRef(null);
  // Spin mode keeps its own rotation (in degrees): base turn + a small hover lean.
  const rot = useRef({ x: 0, y: 0, hx: 0, hy: 0 });
  const drag = useRef(null);

  function paint() {
    const el = ref.current;
    if (!el) return;
    const r = rot.current;
    el.style.setProperty("--sx", `${r.x + r.hx}deg`);
    el.style.setProperty("--sy", `${r.y + r.hy}deg`);
    // The foil slides as the card turns, like a real holo.
    el.style.setProperty("--mx", `${50 + Math.sin(((r.y + r.hy) * Math.PI) / 180) * 50}%`);
    el.style.setProperty("--my", `${50 - (r.x + r.hx) * 1.6}%`);
  }

  function turnTo(y, quick) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.killTweensOf(rot.current);
    gsap.to(rot.current, {
      x: 0,
      y,
      duration: reduce ? 0 : quick ? 0.5 : 0.8,
      ease: "back.out(1.5)",
      onUpdate: paint,
    });
  }

  // Flip button (or any outside change) turns the card half a turn.
  useEffect(() => {
    if (!spin) return;
    const showingBack = Math.round(rot.current.y / 180) % 2 !== 0;
    if (showingBack !== flipped) turnTo(Math.round(rot.current.y / 180) * 180 + 180);
  }, [flipped, spin]);

  function onMove(e) {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;

    if (spin) {
      const g = drag.current;
      if (g) {
        const dx = e.clientX - g.x;
        const dy = e.clientY - g.y;
        if (!g.moved && Math.hypot(dx, dy) > 6) {
          g.moved = true;
          el.setPointerCapture(g.id);
          gsap.killTweensOf(rot.current);
        }
        if (g.moved) {
          rot.current.y = g.startY + dx * 0.6;
          rot.current.x = Math.max(-32, Math.min(32, -dy * 0.35));
          rot.current.hx = 0;
          rot.current.hy = 0;
          paint();
        }
      } else if (e.pointerType === "mouse") {
        rot.current.hy = (x - 0.5) * 18;
        rot.current.hx = (0.5 - y) * 18;
        paint();
      }
      return;
    }

    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    if (tilt && e.pointerType === "mouse") {
      el.style.setProperty("--ry", `${(x - 0.5) * 22}deg`);
      el.style.setProperty("--rx", `${(0.5 - y) * 22}deg`);
    }
  }

  function onLeave() {
    const el = ref.current;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    if (spin && !drag.current) gsap.to(rot.current, { hx: 0, hy: 0, duration: 0.5, onUpdate: paint });
  }

  function onDown(e) {
    if (!spin || e.target.closest("a")) return;
    drag.current = { x: e.clientX, y: e.clientY, startY: rot.current.y, moved: false, id: e.pointerId };
  }

  function onUp(e) {
    const g = drag.current;
    if (!spin || !g) return;
    drag.current = null;
    // A tap flips; a drag settles on whichever face is closest.
    const target = g.moved ? Math.round(rot.current.y / 180) * 180 : Math.round(rot.current.y / 180) * 180 + 180;
    if (!g.moved && e.type !== "pointerup") return;
    turnTo(target, g.moved);
    onFlip?.(Math.round(target / 180) % 2 !== 0);
  }

  return (
    <div
      ref={ref}
      className={`card3d r-${rarity} ${spin ? "is-spin" : ""} ${flipped ? "is-flipped" : ""}`}
      style={{ "--hue": card.hue }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div className="card3d-inner">
        {/* Slices between the two faces: this is the card's thickness */}
        <span className="card-edge" style={{ "--z": "-2px" }} aria-hidden="true" />
        <span className="card-edge" style={{ "--z": "-1px" }} aria-hidden="true" />
        <span className="card-edge" style={{ "--z": "0px" }} aria-hidden="true" />
        <span className="card-edge" style={{ "--z": "1px" }} aria-hidden="true" />
        <span className="card-edge" style={{ "--z": "2px" }} aria-hidden="true" />

        {/* FRONT */}
        <article className="card card-front" inert={flipped}>
          <header className="card-head">
            <span className="card-type">{card.type}</span>
            <span className="card-no">{number}</span>
          </header>
          <h3 className="card-title">{card.title}</h3>
          <div className="card-art">
            <CardArt card={card} />
            {badge ? <span className="card-badge">{badge}</span> : null}
          </div>
          <dl className="card-rows">
            {card.rows.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
          <p className="card-text">{card.summary}</p>
          <footer className="card-foot">
            <span>{card.year}</span>
            <span className="card-rarity">{RARITY_LABEL[rarity]}</span>
          </footer>
          <span className="card-foil" aria-hidden="true" />
          <span className="card-sheen" aria-hidden="true" />
        </article>

        {/* BACK: the card-back design, plus the write-up when `info` is on */}
        <div className="card card-back" inert={!flipped || !info}>
          <div className="back-design" aria-hidden="true">
            <svg viewBox="0 0 120 132">
              <defs>
                <linearGradient id="backChrome" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset=".3" stopColor="#e6d2ff" />
                  <stop offset=".52" stopColor="#ffb0ea" />
                  <stop offset=".72" stopColor="#ffffff" />
                  <stop offset="1" stopColor="#b6c4ff" />
                </linearGradient>
                <radialGradient id="backCore">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset=".35" stopColor="#ffd0f0" stopOpacity=".9" />
                  <stop offset="1" stopColor="#ff8fd0" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g fill="url(#backChrome)" stroke="#fff" strokeWidth=".35" strokeLinejoin="round">
                {/* outer crescents */}
                <path d="M99 16 Q117 38 104 64 Q110 38 99 16 Z" />
                <path d="M21 116 Q3 94 16 68 Q10 94 21 116 Z" />
                {/* orbit swooshes */}
                <path d="M27 45 Q60 13 96 27 Q60 20 27 45 Z" />
                <path d="M93 87 Q60 119 24 105 Q60 112 93 87 Z" />
                {/* little four-point stars */}
                <path d="M40 22 L41.7 29.3 L49 31 L41.7 32.7 L40 40 L38.3 32.7 L31 31 L38.3 29.3 Z" />
                <path d="M29 39 L29.9 43.1 L34 44 L29.9 44.9 L29 49 L28.1 44.9 L24 44 L28.1 43.1 Z" />
                <path d="M80 92 L81.7 99.3 L89 101 L81.7 102.7 L80 110 L78.3 102.7 L71 101 L78.3 99.3 Z" />
                <path d="M91 83 L91.9 87.1 L96 88 L91.9 88.9 L91 93 L90.1 88.9 L86 88 L90.1 87.1 Z" />
                {/* the burst behind the main star */}
                <path d="M69.4 48.3 L63.8 62 L86 51 L65.5 65.9 L76.8 74.9 L64 69.8 L74.3 88.9 L60.2 71.5 L50.6 83.7 L56.2 70 L34 81 L54.5 66.1 L43.2 57.1 L56 62.2 L45.7 43.1 L59.8 60.5 Z" />
                {/* the long north star */}
                <path d="M60 6 L62.4 63.6 L114 66 L62.4 68.4 L60 126 L57.6 68.4 L6 66 L57.6 63.6 Z" />
              </g>
              {/* lens flare */}
              <g stroke="#ffb0ea" strokeWidth=".7" strokeLinecap="round" opacity=".75">
                <path d="M40 52 L98 92" />
                <path d="M46 86 L96 38" />
                <path d="M70 46 L84 104" opacity=".6" />
              </g>
              <circle cx="60" cy="66" r="10" fill="url(#backCore)" opacity=".85" />
            </svg>
            <strong>KGL</strong>
            <small>DIGI-SPACE · VOL.01</small>
          </div>
          {info ? (
            <div className="back-info">
              <header className="card-head">
                <span className="card-type">{card.kind === "project" ? "Case file" : card.type}</span>
                <span className="card-no">{number}</span>
              </header>
              <h3 className="card-title">{card.title}</h3>
              <ol className="card-back-list">
                {card.list.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
              <Link className="btn primary" href={card.href} onClick={onNavigate}>
                {card.cta}
              </Link>
            </div>
          ) : null}
          <span className="card-sheen" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
