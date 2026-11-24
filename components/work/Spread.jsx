"use client";

// Every card at once: they land face-down and turn over one by one.
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import ProjectCard from "../ProjectCard";
import { RARITY_LABEL } from "@/lib/deck";

const pad = (n) => String(n).padStart(2, "0");

const Spread = forwardRef(function Spread({ cards, onSeen, onOpen }, handle) {
  const total = cards.length;
  const root = useRef(null);
  const last = useRef(null);
  const [up, setUp] = useState(0);
  useImperativeHandle(handle, () => ({ focus: () => last.current?.focus({ preventScroll: true }) }));

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setUp(total);
      return;
    }
    const tw = gsap.from(root.current.querySelectorAll(".pull"), { y: 60, opacity: 0, scale: 0.75, duration: 0.5, stagger: 0.06, ease: "back.out(1.5)", clearProps: "all" });
    return () => tw.kill();
  }, [total]);

  useEffect(() => {
    if (up >= total) {
      cards.forEach((c) => onSeen(c.card.id));
      return;
    }
    const timer = setTimeout(() => setUp((n) => n + 1), up === 0 ? 560 : 150);
    return () => clearTimeout(timer);
  }, [up, total, cards, onSeen]);

  return (
    <ul className="spread" ref={root}>
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
              <ProjectCard card={card} rarity={rarity} number={`${pad(i + 1)}/${pad(total)}`} tilt={i < up} flipped={i >= up} />
            </div>
            {i < up && card.kind === "project" ? <span className="pull-new">NEW</span> : null}
            {i < up && rarity === "cosmic" ? <span className="pull-rare">✦ Cosmic</span> : null}
          </div>
        </li>
      ))}
    </ul>
  );
});

export default Spread;
