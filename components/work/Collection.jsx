"use client";

// The cards, one at a time, in 3D perspective with glimpses of their neighbours.
// Cards stay face-down until you reach them, then turn over: each is a discovery.
// `pos` is where we are along the row (a decimal while dragging); layout() turns it
// into positions. The intro plays through the same layout, from the fan the 3D pack
// left behind, to a stack, to the row.
import Link from "next/link";
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import ProjectCard from "../ProjectCard";
import { RARITY_LABEL } from "@/lib/deck";
import { fanPose, PACK } from "./machine";

const pad = (n) => String(n).padStart(2, "0");
const mix = (a, b, t) => a + (b - a) * t;
const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Collection = forwardRef(function Collection(
  { cards, index, onIndex, seen, onSeen, intro, fx, scale, onIntroDone, onOpen, onInspect, onEnd, complete, paused, away },
  handle
) {
  const total = cards.length;
  const root = useRef(null);
  const items = useRef([]);
  const openBtn = useRef(null);
  const pos = useRef({ v: index });
  const stage = useRef({ t: intro ? 0 : 2 }); // 0 fan, 1 stack, 2 row
  const drag = useRef(null);
  const suppress = useRef(false); // a drag just ended: ignore the click that follows
  const [flipped, setFlipped] = useState(false);
  const [ready, setReady] = useState(!intro);

  useImperativeHandle(handle, () => ({ focus: () => openBtn.current?.focus({ preventScroll: true }) }));

  function layout() {
    const W = items.current[0]?.offsetWidth || 280;
    const room = root.current?.clientWidth || 800;
    const gap = Math.min(W * 0.82, room * 0.42);
    const t = stage.current.t;
    items.current.forEach((el, i) => {
      if (!el) return;
      const d = i - pos.current.v;
      const ad = Math.abs(d);
      const s = Math.sign(d);
      // the row
      let x = s * (Math.min(ad, 1) * gap + Math.max(0, ad - 1) * gap * 0.46);
      let y = 0;
      let z = -(Math.min(ad, 1) * 150 + Math.max(0, ad - 1) * 120);
      let ry = -s * Math.min(ad, 1) * 34;
      let rz = 0;
      let sc = 1;
      let dim = Math.min(0.62, ad * 0.42);
      let op = ad > 2.4 ? Math.max(0, 1 - (ad - 2.4) * 2) : 1;
      if (t < 2) {
        // the fan (from the 3D pack) and the stack (index 0 on top)
        const k = total - 1 - i;
        const f = fanPose(k, total);
        const fs = (PACK.cardW * scale) / W;
        const a = Math.min(t, 1);
        const b = Math.max(0, t - 1);
        const stackY = i * 5;
        const sx = mix(f.x * scale, 0, a);
        const sy = mix(f.y * scale, stackY, a);
        const sr = mix(f.rotation, i === 0 ? 0 : (i % 2 ? 1.2 : -1.2), a);
        const ss = mix(fs, 1 - i * 0.015, a);
        x = mix(sx, x, b);
        y = mix(sy, y, b);
        z = mix(0, z, b);
        ry = mix(0, ry, b);
        rz = mix(sr, 0, b);
        sc = mix(ss, sc, b);
        dim = mix(0, dim, b);
        op = mix(1, op, b);
      }
      el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      el.style.zIndex = t < 2 ? total - i : 100 - Math.round(ad * 10);
      el.style.opacity = op;
      el.style.visibility = op < 0.01 ? "hidden" : "visible";
      el.style.setProperty("--dim", dim.toFixed(3));
    });
  }

  useLayoutEffect(() => {
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(root.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intro: take over from the 3D cards, gather into a stack, deal into the row.
  useEffect(() => {
    if (!intro) return;
    const tl = gsap.timeline({
      onComplete: () => {
        setReady(true);
        onIntroDone();
      },
    });
    tl.from(root.current, { opacity: 0, duration: 0.16, ease: "none" })
      .to(fx.current, { cards: 0, duration: 0.2, ease: "none" }, "<0.1")
      .to(stage.current, { t: 1, duration: 0.5, ease: "power3.inOut", onUpdate: layout }, "+=0.12")
      .to(stage.current, { t: 2, duration: 0.8, ease: "power3.inOut", onUpdate: layout }, "+=0.08");
    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move to the current card whenever it changes.
  useEffect(() => {
    setFlipped(false);
    const tw = gsap.to(pos.current, { v: index, duration: calm() ? 0 : 0.6, ease: "power3.out", onUpdate: layout, overwrite: true });
    return () => tw.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Turn the current card over the first time it is reached.
  useEffect(() => {
    if (!ready) return;
    const id = cards[index].card.id;
    if (seen.has(id)) return;
    const timer = setTimeout(() => onSeen(id), calm() ? 0 : 320);
    return () => clearTimeout(timer);
  }, [ready, index, cards, seen, onSeen]);

  // At the last card, once it has turned over, the whole collection lays itself out.
  // Doing anything with the card (dragging, flipping, opening, pointing at it) waits.
  const [touch, setTouch] = useState(0);
  const stay = () => setTouch((n) => n + 1);
  useEffect(() => {
    if (!ready || complete || away || paused || flipped || index !== total - 1 || !seen.has(cards[index].card.id)) return;
    const timer = setTimeout(onEnd, 2600);
    return () => clearTimeout(timer);
  }, [ready, complete, away, paused, flipped, index, total, seen, cards, onEnd, touch]);

  const goTo = (i) => {
    if (i >= total && index === total - 1) {
      onEnd(); // going past the last card
      return;
    }
    const to = Math.max(0, Math.min(total - 1, i));
    if (to !== index) onIndex(to);
    else gsap.to(pos.current, { v: to, duration: 0.45, ease: "power3.out", onUpdate: layout, overwrite: true });
  };

  // ── Drag / swipe ──────────────────────────────────────────
  function down(e) {
    if (!ready || away || (e.pointerType === "mouse" && e.button !== 0) || e.target.closest("a")) return;
    suppress.current = false;
    drag.current = { x: e.clientX, from: pos.current.v, moved: false, id: e.pointerId, last: e.clientX, time: e.timeStamp, v: 0 };
  }
  function move(e) {
    const g = drag.current;
    if (!g) {
      if (e.pointerType === "mouse" && index === total - 1 && !complete) stay();
      return;
    }
    const dx = e.clientX - g.x;
    if (!g.moved && Math.abs(dx) > 7) {
      g.moved = true;
      root.current.setPointerCapture(g.id);
      gsap.killTweensOf(pos.current);
    }
    if (!g.moved) return;
    const dt = Math.max(1, e.timeStamp - g.time);
    g.v = g.v * 0.6 + ((e.clientX - g.last) / dt) * 0.4;
    g.last = e.clientX;
    g.time = e.timeStamp;
    const W = items.current[0].offsetWidth;
    let v = g.from - dx / (W * 0.9);
    if (v < 0) v *= 0.3; // rubber band at the ends
    if (v > total - 1) v = total - 1 + (v - total + 1) * 0.3;
    pos.current.v = v;
    layout();
  }
  function up(e) {
    const g = drag.current;
    drag.current = null;
    if (!g?.moved) return;
    suppress.current = true;
    setTimeout(() => (suppress.current = false), 60);
    // A quick flick always moves one card; a long drag can travel further.
    if (pos.current.v > total - 1 + 0.12) {
      onEnd(); // pulled past the last card
      return;
    }
    let to = Math.round(pos.current.v);
    if (to === index && e.type === "pointerup" && Math.abs(g.v) > 0.35) to = index - Math.sign(g.v);
    goTo(to);
  }

  function click(i, e) {
    if (suppress.current || !ready || e.target.closest("a")) return;
    if (i !== index) goTo(i);
    else if (flipped) setFlipped(false);
    else onOpen(i);
  }
  function key(e) {
    const to = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: total - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    goTo(to);
  }

  const { card: now, rarity } = cards[index];
  const known = seen.has(now.id);

  return (
    <div className={`collection ${away ? "is-away" : ""} ${ready ? "is-ready" : ""}`} role="group" aria-roledescription="carousel" aria-label="Project cards" onKeyDown={key}>
      <div className="collection-row" ref={root} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {cards.map(({ card, rarity: r }, i) => {
          const isNow = i === index;
          const up = seen.has(card.id);
          return (
            <div
              key={card.id}
              data-card={card.id}
              className={`collection-item ${isNow ? "is-now" : ""}`}
              ref={(el) => (items.current[i] = el)}
              aria-hidden={!isNow}
              onClick={(e) => click(i, e)}
            >
              <ProjectCard
                card={card}
                rarity={r}
                number={`${pad(i + 1)}/${pad(total)}`}
                tilt={isNow && ready}
                flipped={!up || (isNow && flipped)}
              >
                {isNow && ready && !flipped ? (
                  <button
                    ref={openBtn}
                    className="card-open"
                    aria-label={known ? `Open ${card.title}` : "Turn over this card"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!suppress.current) onOpen(i);
                    }}
                  />
                ) : null}
              </ProjectCard>
            </div>
          );
        })}
      </div>

      <div className="collection-bar" inert={!ready || away}>
        <button className="btn round" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous card">‹</button>
        <ol className="progress" aria-label="Collection progress">
          {cards.map(({ card }, i) => (
            <li key={card.id}>
              <button
                className={`${i === index ? "is-now" : ""} ${seen.has(card.id) ? "is-seen" : ""}`}
                onClick={() => goTo(i)}
                aria-current={i === index ? "true" : undefined}
                aria-label={`Card ${i + 1}${seen.has(card.id) ? `, ${card.title}` : ", not discovered yet"}`}
              >
                <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 0 Q53 47 100 50 Q53 53 50 100 Q47 53 0 50 Q47 47 50 0 Z" /></svg>
              </button>
            </li>
          ))}
        </ol>
        <button className="btn round" onClick={() => goTo(index + 1)} aria-label={index === total - 1 ? "Show the full collection" : "Next card"}>{index === total - 1 ? "✦" : "›"}</button>
      </div>
      <p className="collection-count" aria-live="polite">
        {pad(index + 1)} / {pad(total)}
        {known ? <> · {now.title} · <span className={`rarity r-${rarity}`}>{RARITY_LABEL[rarity]}</span></> : null}
      </p>
      <div className="pack-controls" inert={!ready || away}>
        {now.kind === "project" ? (
          <button className="btn" onClick={() => onOpen(index)}>Open project</button>
        ) : (
          <Link className="btn" href={now.href}>{now.cta}</Link>
        )}
        <button className="btn ghost" onClick={() => setFlipped((f) => !f)} aria-pressed={flipped}>Flip card</button>
        <button className="btn ghost" onClick={() => onInspect(index)}>Spin in 3D</button>
      </div>
    </div>
  );
});

export default Collection;
