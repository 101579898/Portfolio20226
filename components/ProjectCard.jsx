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
import KiwiArt from "./KiwiArt";
import { asset } from "@/lib/asset";
import { RARITY_LABEL } from "@/lib/deck";

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
        <KiwiArt className="is-happy-art" />
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
  onOpen,
  children,
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
    el.classList.toggle("is-tilting", tilt && !flipped);
    if (tilt && e.pointerType === "mouse") {
      el.style.setProperty("--ry", `${(x - 0.5) * 22}deg`);
      el.style.setProperty("--rx", `${(0.5 - y) * 22}deg`);
    }
  }

  function onLeave() {
    const el = ref.current;
    el.classList.remove("is-tilting");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    if (spin && !drag.current) gsap.to(rot.current, { hx: 0, hy: 0, duration: 0.5, onUpdate: paint });
  }

  function onDown(e) {
    if (!spin || e.target.closest("a, button")) return;
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
      style={{ "--hue": card.hue, "--glitter": `url(${asset("/work/glitter.webp")})` }}
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
          <img className="back-art" src={asset("/work/card-back.webp")} alt="" draggable="false" />
          {info ? (
            <div className="back-info">
              <h3 className="card-title">{card.title}</h3>
              <ol className="card-back-list">
                {card.list.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
              {onOpen ? (
                <button className="btn primary" onClick={(e) => { e.stopPropagation(); onOpen(); }}>{card.cta}</button>
              ) : (
                <Link className="btn primary" href={card.href} onClick={onNavigate}>{card.cta}</Link>
              )}
            </div>
          ) : null}
          <span className="card-sheen" aria-hidden="true" />
        </div>
      </div>
      {children}
    </div>
  );
}
