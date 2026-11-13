"use client";

// The work pack. Three phases:
//   "sealed" – a foil pack. Drag across the top to tear it open.
//   "stack"  – the cards come out in a pile. Swipe the top one to see the next.
//   "grid"   – every card laid out. Pick one to open its case file.
// Every drag has a button that does the same thing, for keyboard users.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import Reveal from "./Reveal";
import ProjectCard from "./ProjectCard";
import { projects, profile } from "@/data/site";

const TOTAL = projects.length;
const startOrder = () => projects.map((_, i) => i);
const speed = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;

export default function WorkPack() {
  const [phase, setPhase] = useState("sealed");
  const [order, setOrder] = useState(startOrder); // order[0] is the top card
  const [seen, setSeen] = useState(0);
  const [flipped, setFlipped] = useState(false); // is the top card showing its back?

  const stage = useRef(null);
  const pack = useRef(null);
  const flap = useRef(null);
  const glow = useRef(null);
  const flash = useRef(null);
  const cardEls = useRef([]);
  const tear = useRef({ active: false, startX: 0, width: 1, progress: 0 });
  const drag = useRef(null);
  const busy = useRef(false);
  const dealt = useRef(false);
  const seenRef = useRef(0);

  // If the visitor already opened the pack (e.g. came back from a case file), skip to the cards.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("packOpened") === "1") setPhase("grid");
    } catch {}
  }, []);

  function remember(opened) {
    try {
      if (opened) sessionStorage.setItem("packOpened", "1");
      else sessionStorage.removeItem("packOpened");
    } catch {}
  }

  // ── Phase 1: tearing the pack ─────────────────────────────
  function setTear(progress, direction = 1) {
    tear.current.progress = progress;
    gsap.set(glow.current, { scaleX: progress, transformOrigin: direction > 0 ? "0% 50%" : "100% 50%" });
    gsap.set(flap.current, {
      rotation: -progress * 6 * direction,
      y: -progress * 8,
      transformOrigin: direction > 0 ? "100% 100%" : "0% 100%",
    });
  }

  function tearDown(e) {
    if (busy.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const t = tear.current;
    t.active = true;
    t.startX = e.clientX;
    t.width = e.currentTarget.getBoundingClientRect().width;
  }
  function tearMove(e) {
    const t = tear.current;
    if (!t.active || busy.current) return;
    const dx = e.clientX - t.startX;
    const progress = Math.min(1, Math.abs(dx) / (t.width * 0.8));
    setTear(progress, dx >= 0 ? 1 : -1);
    if (progress >= 1) openPack();
  }
  function tearUp() {
    const t = tear.current;
    if (!t.active) return;
    t.active = false;
    if (busy.current) return;
    if (t.progress > 0.6) openPack();
    else {
      gsap.to(glow.current, { scaleX: 0, duration: 0.3 });
      gsap.to(flap.current, { rotation: 0, y: 0, duration: 0.4, ease: "back.out(2)" });
      t.progress = 0;
    }
  }

  function openPack() {
    if (busy.current) return;
    busy.current = true;
    tear.current.active = false;
    const d = speed();
    gsap
      .timeline({
        onComplete: () => {
          busy.current = false;
          dealt.current = false;
          setPhase("stack");
          remember(true);
        },
      })
      .to(glow.current, { scaleX: 1, duration: 0.15 * d })
      .to(flap.current, { x: 150, y: -230, rotation: 40, opacity: 0, duration: 0.6 * d, ease: "power2.in" })
      .to(flash.current, { opacity: 1, duration: 0.12 * d }, "<0.25")
      .to(pack.current, { y: 90, scale: 0.92, opacity: 0, duration: 0.45 * d, ease: "power2.in" }, "<")
      .to(flash.current, { opacity: 0, duration: 0.5 * d });
  }

  // Pack leans toward the pointer.
  function stageMove(e) {
    if (phase !== "sealed" || e.pointerType !== "mouse" || !pack.current) return;
    const r = stage.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    stage.current.style.setProperty("--ry", `${x * 22}deg`);
    stage.current.style.setProperty("--rx", `${-y * 14}deg`);
    stage.current.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
  }

  // ── Phase 2: the stack of cards ───────────────────────────
  useLayoutEffect(() => {
    if (phase !== "stack") return;
    const d = speed();
    order.forEach((cardIndex, slot) => {
      const el = cardEls.current[cardIndex];
      if (!el) return;
      if (!dealt.current) gsap.set(el, { y: 220, opacity: 0, x: 0, rotation: 0 });
      gsap.set(el, { zIndex: 50 - slot });
      gsap.to(el, {
        x: 0,
        y: slot * 20,
        scale: 1 - slot * 0.05,
        rotation: slot === 0 ? 0 : slot % 2 ? 4 : -4,
        opacity: slot > 3 ? 0 : 1,
        duration: 0.5 * d,
        delay: dealt.current ? 0 : slot * 0.07 * d,
        ease: "power3.out",
        overwrite: true,
      });
    });
    dealt.current = true;
  }, [phase, order]);

  function sendBack(direction) {
    if (busy.current || phase !== "stack") return;
    busy.current = true;
    setFlipped(false);
    const el = cardEls.current[order[0]];
    gsap.to(el, {
      x: direction * Math.min(window.innerWidth * 0.6, 520),
      rotation: direction * 22,
      opacity: 0,
      duration: 0.32 * speed(),
      ease: "power2.in",
      onComplete: () => {
        busy.current = false;
        seenRef.current += 1;
        setSeen(seenRef.current);
        if (seenRef.current >= TOTAL) showAll();
        else setOrder((o) => [...o.slice(1), o[0]]);
      },
    });
  }

  // Bottom card comes back in from the left and lands on top.
  function prevCard() {
    if (busy.current || phase !== "stack") return;
    setFlipped(false);
    const el = cardEls.current[order[order.length - 1]];
    gsap.set(el, { x: -Math.min(window.innerWidth * 0.6, 520), rotation: -22, opacity: 0 });
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
  }

  // A tap flips the card; a sideways drag swipes it away.
  function cardDown(e, cardIndex) {
    if (busy.current || order[0] !== cardIndex || e.target.closest("a")) return;
    drag.current = { startX: e.clientX, x: 0, el: e.currentTarget, moved: false, id: e.pointerId };
  }
  function cardMove(e) {
    const g = drag.current;
    if (!g) return;
    g.x = e.clientX - g.startX;
    if (!g.moved && Math.abs(g.x) > 6) {
      g.moved = true;
      g.el.setPointerCapture(g.id);
    }
    if (g.moved) gsap.set(g.el, { x: g.x, rotation: g.x / 18, y: -Math.abs(g.x) * 0.04 });
  }
  function cardUp(e) {
    const g = drag.current;
    if (!g) return;
    drag.current = null;
    if (!g.moved) {
      if (e.type === "pointerup") setFlipped((f) => !f);
      return;
    }
    if (Math.abs(g.x) > 80) sendBack(Math.sign(g.x));
    else gsap.to(g.el, { x: 0, y: 0, rotation: 0, duration: 0.5 * speed(), ease: "elastic.out(1, 0.6)" });
  }

  // ── Phase 3: all cards ────────────────────────────────────
  function showAll() {
    setPhase("grid");
    remember(true);
  }

  useLayoutEffect(() => {
    if (phase !== "grid" || speed() === 0) return;
    const tween = gsap.from(".grid-card", {
      y: 60,
      opacity: 0,
      rotationY: -70,
      duration: 0.7,
      stagger: 0.09,
      ease: "back.out(1.4)",
      clearProps: "all",
    });
    return () => tween.kill();
  }, [phase]);

  function reseal() {
    seenRef.current = 0;
    setSeen(0);
    setOrder(startOrder());
    setPhase("sealed");
    remember(false);
  }

  const hint =
    phase === "sealed"
      ? "Drag across the top of the pack to tear it open."
      : phase === "stack"
        ? `Tap the card to flip it. Swipe sideways for the next one. Card ${Math.min(seen + 1, TOTAL)} of ${TOTAL}.`
        : "Pick a card to open its case file.";

  return (
    <section className="chapter" id="work" aria-labelledby="work-title">
      <Reveal className="chapter-head">
        <p className="label">Work <span aria-hidden="true">/</span> Card pack</p>
        <p className="label">Chapter 03</p>
      </Reveal>
      <Reveal as="h2" id="work-title" className="display center">
        {phase === "grid" ? (
          <>Opening <span className="serif">results.</span></>
        ) : (
          <>Open the <span className="serif">work pack.</span></>
        )}
      </Reveal>

      <div className={`pack-stage is-${phase}`} ref={stage} onPointerMove={stageMove}>
        <div className="pack-flash" ref={flash} aria-hidden="true" />

        {phase === "sealed" && (
          <div className="pack-float">
            <div className="pack-tilt">
            <div className="pack" ref={pack}>
              <div
                className="pack-flap"
                ref={flap}
                onPointerDown={tearDown}
                onPointerMove={tearMove}
                onPointerUp={tearUp}
                onPointerCancel={tearUp}
              >
                <span className="pack-crimp" aria-hidden="true" />
                <span className="pack-tear-label" aria-hidden="true">‹ TEAR HERE ›</span>
              </div>
              <span className="pack-glow" ref={glow} aria-hidden="true" />
              <div className="pack-body">
                <p className="label">DIGI-SPACE // VOL.01</p>
                <svg className="pack-art" viewBox="0 0 120 120" aria-hidden="true">
                  <circle cx="60" cy="60" r="26" fill="url(#packPlanet)" />
                  <ellipse cx="60" cy="60" rx="50" ry="13" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="1.5" transform="rotate(-18 60 60)" />
                  <path d="M96 20 l2.6 7.4 7.4 2.6 -7.4 2.6 -2.6 7.4 -2.6 -7.4 -7.4 -2.6 7.4 -2.6z" fill="#fff" />
                  <path d="M22 84 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6z" fill="#fff" opacity=".8" />
                  <defs>
                    <radialGradient id="packPlanet" cx="35%" cy="30%">
                      <stop offset="0" stopColor="#ffffff" />
                      <stop offset=".5" stopColor="#bcd6ff" />
                      <stop offset="1" stopColor="#6a55e0" />
                    </radialGradient>
                  </defs>
                </svg>
                <strong className="pack-title glitch">Work<br />Pack</strong>
                <p className="label">{TOTAL} CARDS · {profile.name.toUpperCase()}</p>
                <span className="pack-crimp bottom" aria-hidden="true" />
              </div>
            </div>
            </div>
          </div>
        )}

        {phase === "stack" && (
          <div className="stack">
            {projects.map((project, i) => (
              <div
                key={project.slug}
                className={`stack-card ${order[0] === i ? "is-top" : ""}`}
                ref={(el) => (cardEls.current[i] = el)}
                onPointerDown={(e) => cardDown(e, i)}
                onPointerMove={cardMove}
                onPointerUp={cardUp}
                onPointerCancel={cardUp}
                inert={order[0] !== i}
              >
                <ProjectCard
                  project={project}
                  index={i}
                  total={TOTAL}
                  withBack
                  tilt={order[0] === i}
                  flipped={order[0] === i && flipped}
                />
              </div>
            ))}
          </div>
        )}

        {phase === "grid" && (
          <ul className="card-grid">
            {projects.map((project, i) => (
              <li key={project.slug} className="grid-card">
                <Link href={`/work/${project.slug}/`} aria-label={`Open the case file for ${project.title}`}>
                  <ProjectCard
                    project={project}
                    index={i}
                    total={TOTAL}
                    tilt
                    badge={project.placeholder ? "SLOT" : "NEW"}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="pack-hint" role="status">{hint}</p>

      <div className="pack-controls">
        {phase === "sealed" && (
          <button className="btn" onClick={openPack}>Open pack</button>
        )}
        {phase === "stack" && (
          <>
            <button className="btn ghost" onClick={prevCard} aria-label="Previous card">‹ Prev</button>
            <button className="btn" onClick={() => setFlipped((f) => !f)} aria-pressed={flipped}>Flip card</button>
            <button className="btn" onClick={() => sendBack(1)} aria-label="Next card">Next ›</button>
            <button className="btn ghost" onClick={showAll}>Show all cards</button>
          </>
        )}
        {phase === "grid" && (
          <button className="btn ghost" onClick={reseal}>Reseal pack</button>
        )}
      </div>
    </section>
  );
}
