"use client";

// One card shown big, free to spin in 3D.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import ProjectCard from "../ProjectCard";
import useModal from "./useModal";

const pad = (n) => String(n).padStart(2, "0");

export default function CardZoom({ entry, number, total, index, onClose, onOpen }) {
  const { card, rarity } = entry;
  const [flipped, setFlipped] = useState(false);
  const box = useRef(null);
  const close = useRef(null);
  const from = useRef(null);
  useModal();

  useEffect(() => {
    from.current = document.activeElement;
    const src = document.querySelector(`[data-card="${card.id}"] .card3d`)?.getBoundingClientRect();
    const to = box.current.getBoundingClientRect();
    close.current?.focus({ preventScroll: true });
    if (src && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.from(box.current, {
        x: src.left + src.width / 2 - (to.left + to.width / 2),
        y: src.top + src.height / 2 - (to.top + to.height / 2),
        scale: src.width / to.width,
        duration: 0.55,
        ease: "power3.out",
      });
    }
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      requestAnimationFrame(() => from.current?.isConnected && from.current.focus?.({ preventScroll: true }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className="zoom" role="dialog" aria-modal="true" aria-label={`${card.title} card`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button className="btn zoom-close" ref={close} onClick={onClose}>Close ✕</button>
      <div className="zoom-card" ref={box}>
        <ProjectCard
          card={card}
          rarity={rarity}
          number={`${pad(number)}/${pad(total)}`}
          spin
          info
          flipped={flipped}
          onFlip={setFlipped}
          onNavigate={onClose}
          onOpen={card.kind === "project" ? () => onOpen(index) : undefined}
        />
      </div>
      <p className="zoom-hint">Drag to spin the card. Tap it to flip.</p>
      <div className="pack-controls">
        <button className="btn" onClick={() => setFlipped((f) => !f)} aria-pressed={flipped}>Flip card</button>
        {card.kind === "project" ? <button className="btn primary" onClick={() => onOpen(index)}>Open project</button> : null}
      </div>
    </div>,
    document.body
  );
}
