"use client";

// Chapter 03: the work pack. This file owns the state (see machine.js) and the
// opening sequence. The pieces it arranges:
//   PackScene  the 3D foil pack            FlatPack   the same pack without WebGL
//   Collection the cards, one at a time    Spread     every card at once
//   CardZoom   one card to spin in 3D      CaseOverlay a card opened into a project
// Every drag has a button that does the same thing.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import Reveal from "../Reveal";
import FlatPack from "./FlatPack";
import Collection from "./Collection";
import Spread from "./Spread";
import CardZoom from "./CardZoom";
import CaseOverlay from "./CaseOverlay";
import { canGo, PACK } from "./machine";
import { projects } from "@/data/site";
import { buildDeck, rollPull } from "@/lib/deck";

const PackScene = dynamic(() => import("./PackScene"), { ssr: false });
const FX = { hover: 0, mx: 0, my: 0, tear: 0, dir: 1, strip: 0, gape: 0, light: 0, rise: 0, fan: 0, drop: 0, cards: 1 };
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function hasWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}
const store = {
  get(key) {
    try {
      return JSON.parse(sessionStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      if (value === null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

export default function WorkSection() {
  const deck = useMemo(buildDeck, []);
  const total = deck.length;

  // ── State ─────────────────────────────────────────────────
  const [phase, setPhase] = useState("sealed");
  const phaseNow = useRef("sealed");
  const go = useCallback((to) => {
    if (!canGo(phaseNow.current, to)) return false;
    phaseNow.current = to;
    setPhase(to);
    return true;
  }, []);

  const [pull, setPull] = useState(() => deck.map((c) => ({ id: c.id, rarity: "common" })));
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(() => new Set());
  const [view, setView] = useState("browse"); // "browse" one at a time, "spread" all at once
  const [zoom, setZoom] = useState(null);
  const [openSlug, setOpenSlug] = useState(null);

  const cards = useMemo(() => pull.map((p) => ({ card: deck.find((c) => c.id === p.id), rarity: p.rarity })), [pull, deck]);

  const stage = useRef(null);
  const fx = useRef({ ...FX });
  const timeline = useRef(null);
  const drag = useRef(null);
  const collection = useRef(null);
  const [mode, setMode] = useState("pending"); // pending | 3d | flat
  const [near, setNear] = useState(false); // time to prepare the 3D pack
  const [warm, setWarm] = useState(false); // the 3D pack is ready to draw
  const [onScreen, setOnScreen] = useState(false);
  const [scale, setScale] = useState(1);

  // ── Set-up ────────────────────────────────────────────────
  useEffect(() => {
    setMode(!reduced() && hasWebGL() ? "3d" : "flat");

    // Coming back: show the same cards, at the same place.
    const saved = store.get("packPull");
    const focus = store.get("packFocus"); // set by a project page opened from a link
    store.set("packFocus", null);
    const valid = saved?.length === total && saved.every((s) => deck.some((c) => c.id === s.id));
    if (valid || focus) {
      const p = valid ? saved : rollPull(deck);
      if (!valid) store.set("packPull", p);
      setPull(p);
      const at = focus ? p.findIndex((c) => c.id === focus) : store.get("packIndex") || 0;
      setIndex(Math.max(0, Math.min(total - 1, at)));
      setSeen(new Set([...(store.get("packSeen") || []), ...(focus ? [focus] : [])]));
      go("collection");
    }

    const el = stage.current;
    const nearIO = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "900px 0px" });
    const onIO = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    nearIO.observe(el);
    // Prepare it quietly once the opening has settled, so arriving here is smooth.
    let idle = 0;
    const later = setTimeout(() => {
      idle = window.requestIdleCallback ? requestIdleCallback(() => setNear(true), { timeout: 4000 }) : setTimeout(() => setNear(true), 500);
    }, 4500);
    onIO.observe(el);
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / 350, e.contentRect.height / 560)));
    ro.observe(el);
    return () => {
      clearTimeout(later);
      if (idle) (window.cancelIdleCallback || clearTimeout)(idle);
      nearIO.disconnect();
      onIO.disconnect();
      ro.disconnect();
      timeline.current?.kill();
      gsap.killTweensOf(fx.current);
    };
  }, [deck, total, go]);

  useEffect(() => {
    if (phase === "collection" || phase === "detail") store.set("packIndex", index);
  }, [index, phase]);

  const discover = useCallback((id) => {
    setSeen((s) => {
      if (s.has(id)) return s;
      const n = new Set(s).add(id);
      store.set("packSeen", [...n]);
      return n;
    });
  }, []);

  // ── Sealed / interacting: hover, drag to tear, click to open ──
  function point(e) {
    const r = stage.current.getBoundingClientRect();
    const w = PACK.w * scale;
    const h = PACK.h * scale;
    fx.current.mx = Math.max(-1.4, Math.min(1.4, (e.clientX - (r.left + r.width / 2)) / (w / 2)));
    fx.current.my = Math.max(-1.4, Math.min(1.4, -(e.clientY - (r.top + r.height / 2)) / (h / 2)));
  }
  const hover = (v) => gsap.to(fx.current, { hover: v, duration: 0.5, ease: "power2.out", overwrite: "auto" });

  function hitDown(e) {
    if (phaseNow.current !== "sealed" || (e.pointerType === "mouse" && e.button !== 0)) return;
    point(e);
    drag.current = { x: e.clientX, moved: false, id: e.pointerId };
  }
  function hitMove(e) {
    const g = drag.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    if (!g.moved && Math.abs(dx) > 6) {
      g.moved = true;
      e.currentTarget.setPointerCapture(g.id);
      gsap.killTweensOf(fx.current, "tear,light");
      go("interacting");
    }
    if (!g.moved) return;
    fx.current.dir = dx >= 0 ? 1 : -1;
    fx.current.tear = Math.min(1, Math.abs(dx) / (PACK.w * scale * 0.85));
    fx.current.light = fx.current.tear * 0.35;
    if (fx.current.tear >= 1) {
      drag.current = null;
      open();
    }
  }
  function hitUp(e) {
    const g = drag.current;
    if (!g) return;
    drag.current = null;
    if (!g.moved) {
      if (e.type === "pointerup") open();
      return;
    }
    if (fx.current.tear > 0.5 && e.type === "pointerup") open();
    else if (go("sealed")) gsap.to(fx.current, { tear: 0, light: 0, duration: 0.5, ease: "back.out(1.3)" });
  }

  // ── Opening ───────────────────────────────────────────────
  function open() {
    if (!go("opening")) return;
    const rolled = rollPull(deck);
    setPull(rolled);
    setIndex(0);
    setSeen(new Set());
    setView("browse");
    store.set("packPull", rolled);
    store.set("packSeen", []);
    store.set("packIndex", 0);
    hover(0);

    if (reduced()) {
      go("collection");
      return;
    }
    const f = fx.current;
    gsap.killTweensOf(f, "tear,light");
    const tl = gsap.timeline({ onComplete: () => go("revealing") });
    timeline.current = tl;
    tl.to(f, { tear: 1, duration: 0.2 + 0.55 * (1 - f.tear), ease: "power2.inOut" })
      .to(f, { strip: 1, duration: 1, ease: "power2.in" }, "-=0.08")
      .to(f, { gape: 1, duration: 0.6, ease: "back.out(1.7)" }, "<0.12")
      .to(f, { light: 1, duration: 0.6, ease: "power2.out" }, "<")
      .to(f, { rise: 1, duration: 1.25, ease: "power2.inOut" }, "<0.35")
      .to(f, { light: 0.2, duration: 0.5 }, "-=0.45")
      .to(f, { drop: 1, duration: 0.75, ease: "power2.in" }, "-=0.35")
      .to(f, { fan: 1, duration: 0.55, ease: "back.out(1.5)" }, "<0.2");
  }
  const skip = () => timeline.current?.progress(1);

  function reseal() {
    if (!go("sealed")) return;
    setWarm(false);
    timeline.current?.kill();
    Object.assign(fx.current, FX);
    setSeen(new Set());
    setIndex(0);
    setView("browse");
    ["packPull", "packSeen", "packIndex"].forEach((k) => store.set(k, null));
  }

  // ── Project detail ────────────────────────────────────────
  const project = projects.find((p) => p.slug === openSlug) || null;

  function openCard(i) {
    const { card } = cards[i];
    discover(card.id);
    setIndex(i);
    if (card.kind !== "project") {
      setZoom(i);
      return;
    }
    if (go("detail")) setOpenSlug(card.id);
  }
  function closeProject() {
    setOpenSlug(null);
    go("collection");
    requestAnimationFrame(() => collection.current?.focus());
  }
  function nextProject() {
    const order = cards.map((c, i) => ({ ...c, i })).filter((c) => c.card.kind === "project");
    const at = order.findIndex((c) => c.card.id === openSlug);
    const to = order[(at + 1) % order.length];
    discover(to.card.id);
    setIndex(to.i);
    setOpenSlug(to.card.id);
  }

  const showPack = phase === "sealed" || phase === "interacting" || phase === "opening" || phase === "revealing";
  const showCards = phase === "revealing" || phase === "collection" || phase === "detail";
  const hint =
    phase === "sealed" || phase === "interacting"
      ? "Drag across the pack to tear it open, or click it."
      : phase === "collection" || phase === "detail"
        ? view === "browse"
          ? "Drag, swipe or use the arrows. Click a card to open it."
          : "Pick a card to look at it."
        : "";

  return (
    <section className="chapter work" id="work" aria-labelledby="work-title">
      <div className="chapter-head">
        <p className="label">Work <span aria-hidden="true">/</span> Card pack</p>
        <p className="label">Chapter 03</p>
      </div>
      <Reveal as="h2" id="work-title" className="display center">
        {showCards ? "The collection." : "Open the work pack."}
      </Reveal>

      <div
        className={`pack-stage is-${phase} view-${view}`}
        ref={stage}
        onPointerMove={(e) => showPack && e.pointerType === "mouse" && point(e)}
      >
        {showPack && near && mode === "3d" ? (
          <PackScene fx={fx} total={total} scale={scale} awake={onScreen && warm} onReady={() => setWarm(true)} onFail={() => setMode("flat")} />
        ) : null}
        {showPack && (mode === "flat" || (mode === "3d" && !warm)) ? <FlatPack fx={fx} scale={scale} /> : null}
        {phase === "sealed" || phase === "interacting" ? (
          <div
            className="pack-hit"
            style={{ width: PACK.w * scale, height: PACK.h * scale }}
            onPointerEnter={(e) => e.pointerType === "mouse" && hover(1)}
            onPointerLeave={(e) => e.pointerType === "mouse" && hover(0)}
            onPointerDown={hitDown}
            onPointerMove={hitMove}
            onPointerUp={hitUp}
            onPointerCancel={hitUp}
          />
        ) : null}

        {showCards && view === "browse" ? (
          <Collection
            ref={collection}
            cards={cards}
            index={index}
            onIndex={setIndex}
            seen={seen}
            onSeen={discover}
            intro={phase === "revealing"}
            fx={fx}
            scale={scale}
            onIntroDone={() => go("collection")}
            onOpen={openCard}
            onInspect={setZoom}
            away={phase === "detail"}
          />
        ) : null}
        {showCards && view === "spread" ? <Spread ref={collection} cards={cards} onSeen={discover} onOpen={openCard} /> : null}
      </div>

      <p className="pack-hint" role="status">{hint}</p>
      <div className="pack-controls">
        {phase === "sealed" || phase === "interacting" ? <button className="btn primary" onClick={open}>Open pack</button> : null}
        {phase === "opening" ? <button className="btn ghost" onClick={skip}>Skip</button> : null}
        {phase === "collection" || phase === "detail" ? (
          <>
            <button className="btn text" onClick={() => setView(view === "browse" ? "spread" : "browse")}>
              {view === "browse" ? "See all cards" : "One at a time"}
            </button>
            <button className="btn text" onClick={reseal}>Reseal and pull again</button>
          </>
        ) : null}
      </div>

      {zoom !== null ? (
        <CardZoom
          entry={cards[zoom]}
          number={zoom + 1}
          total={total}
          onClose={() => setZoom(null)}
          onOpen={(i) => {
            setZoom(null);
            openCard(i);
          }}
          index={zoom}
        />
      ) : null}

      {project ? (
        <CaseOverlay
          project={project}
          hasNext={projects.length > 1}
          getCard={() => document.querySelector(`[data-card="${openSlug}"] .card-front`)}
          onClosed={closeProject}
          onNext={nextProject}
        />
      ) : null}
    </section>
  );
}
