"use client";

// The work pack. Three phases:
//   "sealed" – a foil pack. Drag across the top to tear it open.
//   "stack"  – the cards come out in a pile. Swipe the top one to see the next.
//   "grid"   – "opening results": every card laid out. Pick one to zoom in.
// Each time the pack is opened the cards are shuffled and given random foil
// finishes (see lib/deck.js), so every visitor gets a different pull.
// Every drag has a button that does the same thing, for keyboard users.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import Reveal from "./Reveal";
import ProjectCard from "./ProjectCard";
import { profile } from "@/data/site";
import { buildDeck, rollPull, RARITY_LABEL } from "@/lib/deck";

const speed = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;
const pad = (n) => String(n).padStart(2, "0");

export default function WorkPack() {
  const deck = useMemo(buildDeck, []);
  const TOTAL = deck.length;

  const [phase, setPhase] = useState("sealed");
  // The pull: cards in the order they came out, each with its foil finish.
  const [pull, setPull] = useState(() => deck.map((c) => ({ id: c.id, rarity: "common" })));
  const [order, setOrder] = useState(() => deck.map((_, i) => i)); // order[0] is the top card
  const [seen, setSeen] = useState(0);
  const [flipped, setFlipped] = useState(false); // is the top card showing its back?
  const [faceUp, setFaceUp] = useState(TOTAL); // how many result cards have turned face-up
  const [zoom, setZoom] = useState(null); // index of the card shown big, or null
  const [zoomFlipped, setZoomFlipped] = useState(false);

  const cards = pull.map((p) => ({ card: deck.find((c) => c.id === p.id), rarity: p.rarity }));

  const stage = useRef(null);
  const pack = useRef(null);
  const flap = useRef(null);
  const glow = useRef(null);
  const flash = useRef(null);
  const cardEls = useRef([]);
  const miniEls = useRef([]);
  const zoomCard = useRef(null);
  const closeBtn = useRef(null);
  const tear = useRef({ active: false, startX: 0, width: 1, progress: 0 });
  const drag = useRef(null);
  const busy = useRef(false);
  const dealt = useRef(false);
  const seenRef = useRef(0);

  // Coming back from a case file: show the same pull again instead of a sealed pack.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("packPull") || "null");
      if (saved && saved.length === TOTAL && saved.every((s) => deck.some((c) => c.id === s.id))) {
        setPull(saved);
        setPhase("grid");
      }
    } catch {}
  }, [deck, TOTAL]);

  function remember(value) {
    try {
      if (value) sessionStorage.setItem("packPull", JSON.stringify(value));
      else sessionStorage.removeItem("packPull");
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
    const rolled = rollPull(deck);
    const d = speed();
    gsap
      .timeline({
        onComplete: () => {
          busy.current = false;
          dealt.current = false;
          seenRef.current = 0;
          setSeen(0);
          setPull(rolled);
          setOrder(deck.map((_, i) => i));
          setPhase("stack");
          remember(rolled);
        },
      })
      .to(glow.current, { scaleX: 1, duration: 0.15 * d })
      .to(flap.current, { x: 150, y: -230, rotation: 40, opacity: 0, duration: 0.6 * d, ease: "power2.in" })
      .to(flash.current, { opacity: 1, duration: 0.12 * d }, "<0.25")
      .to(pack.current, { y: 90, scale: 0.92, opacity: 0, duration: 0.45 * d, ease: "power2.in" }, "<")
      .to(flash.current, { opacity: 0, duration: 0.5 * d });
  }

  // Pack leans toward the pointer and its plastic shine slides across.
  function stageMove(e) {
    if (phase !== "sealed" || e.pointerType !== "mouse" || !pack.current) return;
    const r = stage.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    stage.current.style.setProperty("--ry", `${x * 26}deg`);
    stage.current.style.setProperty("--rx", `${-y * 16}deg`);
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

  // ── Phase 3: opening results ──────────────────────────────
  function showAll() {
    setFlipped(false);
    setFaceUp(speed() ? 0 : TOTAL); // cards land face-down, then turn over one by one
    setPhase("grid");
  }

  useEffect(() => {
    if (phase !== "grid" || faceUp >= TOTAL) return;
    const timer = setTimeout(() => setFaceUp((n) => n + 1), faceUp === 0 ? 650 : 170);
    return () => clearTimeout(timer);
  }, [phase, faceUp, TOTAL]);

  useLayoutEffect(() => {
    if (phase !== "grid" || speed() === 0 || faceUp > 0) return;
    const tween = gsap.from(".pull", {
      y: 70,
      opacity: 0,
      scale: 0.7,
      duration: 0.55,
      stagger: 0.07,
      ease: "back.out(1.5)",
      clearProps: "all",
    });
    return () => tween.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function reseal() {
    seenRef.current = 0;
    setSeen(0);
    setFlipped(false);
    setFaceUp(TOTAL);
    setPhase("sealed");
    remember(null);
  }

  // ── Zoom: one card shown big, free to spin ────────────────
  function openZoom(i) {
    if (faceUp < TOTAL) return;
    setZoomFlipped(false);
    setZoom(i);
  }
  function closeZoom() {
    const i = zoom;
    setZoom(null);
    requestAnimationFrame(() => miniEls.current[i]?.focus({ preventScroll: true }));
  }

  useEffect(() => {
    if (zoom === null) return;
    // Everything behind the zoomed card is switched off while it is open.
    const behind = document.querySelectorAll("#main, .nav, .pal, .static-switch");
    behind.forEach((el) => el.setAttribute("inert", ""));
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e) => e.key === "Escape" && closeZoom();
    window.addEventListener("keydown", onKey);

    // The card grows out of its place in the spread.
    const from = miniEls.current[zoom]?.getBoundingClientRect();
    const to = zoomCard.current?.getBoundingClientRect();
    if (from && to && speed()) {
      gsap.from(zoomCard.current, {
        x: from.left + from.width / 2 - (to.left + to.width / 2),
        y: from.top + from.height / 2 - (to.top + to.height / 2),
        scale: from.width / to.width,
        duration: 0.55,
        ease: "power3.out",
      });
    }
    return () => {
      behind.forEach((el) => el.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const hint =
    phase === "sealed"
      ? "Drag across the top of the pack to tear it open."
      : phase === "stack"
        ? `Tap the card to flip it. Swipe sideways for the next one. Card ${Math.min(seen + 1, TOTAL)} of ${TOTAL}.`
        : "Pick a card to look at it up close.";

  const zoomed = zoom === null ? null : cards[zoom];

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
                  <span className="pack-plastic" aria-hidden="true" />
                </div>
                <span className="pack-glow" ref={glow} aria-hidden="true" />
                <div className="pack-body">
                  <p className="label">DIGI-SPACE // VOL.01</p>
                  <svg className="pack-art" viewBox="0 0 120 120" aria-hidden="true">
                    <circle cx="60" cy="60" r="26" fill="url(#packPlanet)" />
                    <ellipse cx="60" cy="60" rx="50" ry="13" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="1.5" transform="rotate(-18 60 60)" />
                    <path d="M96 20 l2.6 7.4 7.4 2.6 -7.4 2.6 -2.6 7.4 -2.6 -7.4 -7.4 -2.6 7.4 -2.6z" fill="#fff" />
                    <path d="M22 84 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6z" fill="#fff" opacity=".8" />
                    <defs>
                      <radialGradient id="packPlanet" cx="35%" cy="30%">
                        <stop offset="0" stopColor="#ffffff" />
                        <stop offset=".5" stopColor="#ffb0ea" />
                        <stop offset="1" stopColor="#6a2ab0" />
                      </radialGradient>
                    </defs>
                  </svg>
                  <strong className="pack-title glitch">Work<br />Pack</strong>
                  <p className="label">{TOTAL} CARDS · {profile.name.toUpperCase()}</p>
                  <span className="pack-crimp bottom" aria-hidden="true" />
                  <span className="pack-plastic" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === "stack" && (
          <div className="stack">
            {cards.map(({ card, rarity }, i) => (
              <div
                key={card.id}
                className={`stack-card ${order[0] === i ? "is-top" : ""}`}
                ref={(el) => (cardEls.current[i] = el)}
                onPointerDown={(e) => cardDown(e, i)}
                onPointerMove={cardMove}
                onPointerUp={cardUp}
                onPointerCancel={cardUp}
                inert={order[0] !== i}
              >
                <ProjectCard
                  card={card}
                  rarity={rarity}
                  number={`${pad(i + 1)}/${pad(TOTAL)}`}
                  info
                  tilt={order[0] === i}
                  flipped={order[0] === i && flipped}
                />
              </div>
            ))}
          </div>
        )}

        {phase === "grid" && (
          <ul className="spread">
            {cards.map(({ card, rarity }, i) => (
              <li key={card.id}>
                <div
                  className="pull"
                  role="button"
                  tabIndex={0}
                  ref={(el) => (miniEls.current[i] = el)}
                  aria-label={`${card.title}, ${RARITY_LABEL[rarity]} card. Look at it up close.`}
                  onClick={() => openZoom(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openZoom(i);
                    }
                  }}
                >
                  <div className="pull-scale">
                    <ProjectCard
                      card={card}
                      rarity={rarity}
                      number={`${pad(i + 1)}/${pad(TOTAL)}`}
                      tilt={i < faceUp}
                      flipped={i >= faceUp}
                    />
                  </div>
                  {i < faceUp && !card.placeholder ? <span className="pull-new">NEW</span> : null}
                  {i < faceUp && rarity === "cosmic" ? <span className="pull-rare">✦ Cosmic</span> : null}
                </div>
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
          <button className="btn ghost" onClick={reseal}>Reseal and pull again</button>
        )}
      </div>

      {zoomed
        ? createPortal(
            <div
              className="zoom"
              role="dialog"
              aria-modal="true"
              aria-label={`${zoomed.card.title} card`}
              onClick={(e) => e.target === e.currentTarget && closeZoom()}
            >
              <button className="btn zoom-close" ref={closeBtn} onClick={closeZoom}>Close ✕</button>
              <div className="zoom-card" ref={zoomCard}>
                <ProjectCard
                  card={zoomed.card}
                  rarity={zoomed.rarity}
                  number={`${pad(zoom + 1)}/${pad(TOTAL)}`}
                  spin
                  info
                  flipped={zoomFlipped}
                  onFlip={setZoomFlipped}
                  onNavigate={() => setZoom(null)}
                />
              </div>
              <p className="zoom-hint">Drag to spin the card. Tap it to flip.</p>
              <div className="pack-controls">
                <button className="btn" onClick={() => setZoomFlipped((f) => !f)} aria-pressed={zoomFlipped}>
                  Flip card
                </button>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
