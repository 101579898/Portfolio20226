"use client";

// The full collection. Cards fly here from wherever they were on screen; any that
// have not been met yet land face-down and turn over one by one.
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import ProjectCard from "../ProjectCard";
import { RARITY_LABEL } from "@/lib/deck";

const pad = (n) => String(n).padStart(2, "0");

const Spread = forwardRef(function Spread({ cards, seen, from, onSeen, onOpen }, handle) {
  const total = cards.length;
  const root = useRef(null);
  const last = useRef(null);
  const known = useRef(new Set(seen)); // met before the collection was laid out
  const [up, setUp] = useState(0);
  useImperativeHandle(handle, () => ({ focus: () => last.current?.focus({ preventScroll: true }) }));

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setUp(total);
      return;
    }
    const at = from?.current || {};
    if (from) from.current = null;
    const pulls = [...root.current.querySelectorAll(".pull")];
    const tl = gsap.timeline();
    pulls.forEach((el, i) => {
      const was = at[el.dataset.card];
      const r = el.getBoundingClientRect();
      if (was) tl.from(el, { x: was.x - (r.left + r.width / 2), y: was.y - (r.top + r.height / 2), scale: was.w / r.width, duration: 0.85, ease: "power3.inOut", clearProps: "all" }, i * 0.05);
      else tl.from(el, { y: 50, opacity: 0, scale: 0.8, duration: 0.5, ease: "back.out(1.5)", clearProps: "all" }, 0.35 + i * 0.06);
    });
    return () => tl.progress(1).kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (up >= total) {
      cards.forEach((c) => onSeen(c.card.id));
      return;
    }
    const timer = setTimeout(() => setUp((n) => n + 1), up === 0 ? 900 : 130);
    return () => clearTimeout(timer);
  }, [up, total, cards, onSeen]);

  return (
    <ul className="spread" data-count={total} ref={root}>
      {cards.map(({ card, rarity }, i) => (
        <li key={card.id}>
          <div
            className="pull"
            data-card={card.id}
            role="button"
            tabIndex={0}
            aria-label={`${card.title}, ${RARITY_LABEL[rarity]} card. Open.`}
            onClick={(e) => {
              last.current = e.currentTarget;
              onOpen(i);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              last.current = e.currentTarget;
              onOpen(i);
            }}
          >
            <div className="pull-scale">
              <ProjectCard card={card} rarity={rarity} number={`${pad(i + 1)}/${pad(total)}`} tilt flipped={i >= up && !known.current.has(card.id)} />
            </div>
            {(i < up || known.current.has(card.id)) && card.kind === "project" ? <span className="pull-new">NEW</span> : null}
            {(i < up || known.current.has(card.id)) && rarity === "cosmic" ? <span className="pull-rare">✦ Cosmic</span> : null}
          </div>
        </li>
      ))}
    </ul>
  );
});

export default Spread;
