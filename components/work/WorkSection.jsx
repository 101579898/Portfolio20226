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
import Decode from "../Decode";
import FlatPack from "./FlatPack";
import Collection from "./Collection";
import Spread from "./Spread";
import CardZoom from "./CardZoom";
import CaseOverlay from "./CaseOverlay";
import { canGo, PACK } from "./machine";
import { projects } from "@/data/site";

// How much of the pack must be on screen before it calls for attention.
const CALL_AT = 0.55;
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
  const [complete, setComplete] = useState(false); // every card has been reached once
  const fly = useRef(null); // where the cards were on screen, so they can fly into the full collection
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
      if (store.get("packDone")) {
        setComplete(true);
        if (store.get("packView") !== "browse") setView("spread");
      }
      go("collection");
    }

    const el = stage.current;
    // Prepare the 3D pack once the opening has settled or we are close to it, but only
    // while the page is still, so it never interrupts a scroll. Until then the flat
    // pack stands in.
    let wanted = false;
    let quiet = 0;
    const whenStill = () => {
      clearTimeout(quiet);
      if (wanted) quiet = setTimeout(() => setNear(true), 380);
    };
    const want = () => {
      wanted = true;
      whenStill();
    };
    window.addEventListener("scroll", whenStill, { passive: true });
    const nearIO = new IntersectionObserver(([e]) => e.isIntersecting && want(), { rootMargin: "900px 0px" });
    const onIO = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    nearIO.observe(el);
    const later = setTimeout(want, 4200);
    onIO.observe(el);
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / 350, e.contentRect.height / 560)));
    ro.observe(el);
    return () => {
      clearTimeout(later);
      clearTimeout(quiet);
      window.removeEventListener("scroll", whenStill);
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
    setComplete(false);
    store.set("packDone", null);
    store.set("packView", null);
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
    setComplete(false);
    ["packPull", "packSeen", "packIndex", "packDone", "packView"].forEach((k) => store.set(k, null));
  }

  // ── The full collection ───────────────────────────────────
  // Reaching the end of the cards lays the whole collection out (see Collection).
  const showAll = useCallback(() => {
    if (phaseNow.current !== "collection") return;
    const at = {};
    document.querySelectorAll(".collection-item").forEach((el) => {
      if (el.style.visibility === "hidden") return;
      const r = el.getBoundingClientRect();
      at[el.dataset.card] = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width };
    });
    fly.current = at;
    setComplete(true);
    setView("spread");
    store.set("packDone", true);
    store.set("packView", "spread");
  }, []);
  function browse(i = index) {
    setIndex(i);
    setView("browse");
    store.set("packView", "browse");
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
  // The first time the sealed pack is properly in view, it lights up and gives a little
  // wiggle, and Kiwi points it out, so nobody scrolls straight past it.
  const [calling, setCalling] = useState(false);
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let done = false;
    const io = new IntersectionObserver(
      ([e]) => {
        setLit(e.intersectionRatio >= CALL_AT);
        if (done || e.intersectionRatio < CALL_AT) return;
        done = true;
        setCalling(true);
        window.dispatchEvent(new Event("pack:here"));
        setTimeout(() => setCalling(false), 2400);
      },
      { threshold: [0, CALL_AT] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hint =
    phase === "sealed" || phase === "interacting"
      ? "Drag across the pack to tear it open, or click it."
      : phase === "collection" || phase === "detail"
        ? view === "browse"
          ? "Drag, swipe or use the arrows. Click a card to open it."
          : "Your full collection. Pick any card to open it again."
        : "";

  return (
    <section className="chapter work" id="work" aria-labelledby="work-title">
      <div className="chapter-head">
        <Decode text="Work / Card pack" />
        <Decode text="Chapter 03" />
      </div>
      <Reveal as="h2" id="work-title" className="display center">
        {showCards ? "The collection." : "Open the work pack."}
      </Reveal>

      <div
        className={`pack-stage is-${phase} view-${view} ${lit ? "is-lit" : ""} ${calling ? "is-calling" : ""}`}
        ref={stage}
        onPointerMove={(e) => showPack && e.pointerType === "mouse" && point(e)}
      >
        {showPack && near && mode === "3d" ? (
          <PackScene fx={fx} cards={cards} scale={scale} awake={onScreen && warm} onReady={() => setWarm(true)} onFail={() => setMode("flat")} />
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
            onEnd={showAll}
            complete={complete}
            paused={zoom !== null}
            away={phase === "detail"}
          />
        ) : null}
        {showCards && view === "spread" ? <Spread ref={collection} cards={cards} seen={seen} from={fly} onSeen={discover} onOpen={openCard} /> : null}
      </div>

      <p className="pack-hint" role="status">{hint}</p>
      <div className="pack-controls">
        {phase === "sealed" || phase === "interacting" ? <button className="btn primary" onClick={open}>Open pack</button> : null}
        {phase === "opening" ? <button className="btn ghost" onClick={skip}>Skip</button> : null}
        {phase === "collection" || phase === "detail" ? (
          <>
            {view === "spread" ? (
              <button className="btn" onClick={() => browse()}>Browse one at a time</button>
            ) : complete ? (
              <button className="btn text" onClick={showAll}>Back to the full collection</button>
            ) : null}
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
