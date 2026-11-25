"use client";

// Kiwi, the kitten-star. She floats in the corner, watches your pointer,
// smiles when you come close, dodges once or twice if you chase her with a
// mouse, and spins when you tap her.
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import KiwiArt from "./KiwiArt";
import { profile, music } from "@/data/site";

const tapLines = ["Wheee!", "Again, again!", "So dizzy…", "Stardust everywhere!", "Mrrp! I'm " + profile.starName + "!"];
const sectionLines = {
  about: "That's Kiara! She made me.",
  skills: "Look at those stats go!",
  work: "Ooh, a pack! Tear it open!",
  music: "A playlist called " + music.title + "?" + (music.title === profile.starName ? " That's me!" : ""),
  contact: "Say hi to her, she's nice.",
};

export default function StarPal() {
  const btn = useRef(null);
  const body = useRef(null);
  const eyes = useRef(null);
  const [say, setSay] = useState("");
  const [happy, setHappy] = useState(false);
  const sayTimer = useRef(0);
  const dodges = useRef(0);
  const taps = useRef(0);

  function speak(text) {
    setSay(text);
    clearTimeout(sayTimer.current);
    sayTimer.current = setTimeout(() => setSay(""), 2800);
  }

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function onMove(e) {
      const r = btn.current.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      // Eyes look toward the pointer.
      const look = Math.min(1, dist / 160);
      eyes.current.setAttribute("transform", `translate(${(dx / dist) * look} ${(dy / dist) * look})`);
      setHappy(dist < 150);

      // Playing tag: with a mouse she hops away twice, then lets you catch her.
      if (!reduce && e.pointerType === "mouse" && dist < 70 && dodges.current < 2 && !gsap.isTweening(btn.current)) {
        dodges.current += 1;
        gsap.killTweensOf(btn.current);
        const hopX = -(60 + Math.random() * 80);
        const hopY = -(40 + Math.random() * 90);
        gsap.to(btn.current, { x: hopX * dodges.current, y: hopY, duration: 0.35, ease: "back.out(2)" });
        speak(dodges.current === 1 ? "Can't catch me!" : "Okay okay, you win!");
        gsap.to(btn.current, {
          x: 0,
          y: 0,
          duration: 0.8,
          delay: 4,
          ease: "power2.inOut",
          onComplete: () => (dodges.current = 0),
        });
      }
    }
    window.addEventListener("pointermove", onMove, { passive: true });

    // She comments on each section the first time you reach it.
    const said = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !said.has(entry.target.id)) {
            said.add(entry.target.id);
            speak(sectionLines[entry.target.id]);
          }
        }
      },
      { threshold: 0.35 }
    );
    Object.keys(sectionLines).forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
      clearTimeout(sayTimer.current);
    };
  }, []);

  function spin() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    speak(tapLines[taps.current % tapLines.length]);
    taps.current += 1;
    if (reduce) return;
    gsap.killTweensOf(body.current);
    gsap.fromTo(
      body.current,
      { rotation: 0, scale: 1 },
      { rotation: 720, duration: 1.1, ease: "back.out(1.2)", transformOrigin: "50% 50%" }
    );
    gsap.fromTo(body.current, { scale: 1.25 }, { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.4)" });
    gsap.fromTo(
      ".pal-spark",
      { scale: 0, opacity: 1, x: 0, y: 0 },
      {
        scale: 1,
        opacity: 0,
        x: (i) => Math.cos((i / 6) * Math.PI * 2) * 58,
        y: (i) => Math.sin((i / 6) * Math.PI * 2) * 58,
        duration: 0.8,
        ease: "power2.out",
      }
    );
  }

  return (
    <button
      ref={btn}
      className={`pal ${happy ? "is-happy" : ""}`}
      onClick={spin}
      aria-label={`${profile.starName}, the kitten star. Press to make her spin.`}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="pal-spark" aria-hidden="true" />
      ))}
      <span className="pal-bits" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <i key={i} style={{ "--i": i }} />)}
      </span>
      <span className="pal-bob">
        <span className="pal-art" ref={body}>
          <KiwiArt eyesRef={eyes} aura />
        </span>
      </span>
      {say ? <span className="pal-say" aria-hidden="true">{say}</span> : null}
    </button>
  );
}
