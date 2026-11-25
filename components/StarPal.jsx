"use client";

// Kiwi, the kitten-star. In the opening she sits by the shooting star, says hi and
// tags along as you follow it, then floats in the corner: she watches your pointer,
// smiles when you come close, dodges once or twice if you chase her with a mouse,
// and spins when you tap her.
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import KiwiArt from "./KiwiArt";
import { profile, music } from "@/data/site";
import { space, smoothstep } from "@/lib/space";

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
  const [near, setNear] = useState(false);
  const sayTimer = useRef(0);
  const dodges = useRef(0);
  const taps = useRef(0);

  function speak(text, ms = 4200) {
    setSay(text);
    clearTimeout(sayTimer.current);
    sayTimer.current = setTimeout(() => setSay(""), ms);
  }

  // Tagging along with the star in the opening.
  useEffect(() => {
    const el = btn.current;
    const home = document.getElementById("intro");
    if (!home || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    let wasNear = false;
    let cheered = false;
    let hello = 0;

    function frame() {
      raf = 0;
      const p = space.p;
      const wide = innerWidth > 900;
      const here = space.active && document.documentElement.dataset.booted ? smoothstep(0.5, 1, space.intro) * space.sa : 0;
      // Wide screens: right by the star from the start. Phones: once the title has gone.
      const f = here * (wide ? 1 : smoothstep(0.22, 0.34, p)) * (1 - smoothstep(0.72, 0.95, p));
      const w = el.offsetWidth;
      const baseX = el.offsetLeft + w / 2;
      const baseY = el.offsetTop + el.offsetHeight / 2;
      const tx = Math.min(innerWidth - w, Math.max(w, space.sx + (wide ? -96 : -40)));
      const ty = Math.min(innerHeight - w, Math.max(w + 40, space.sy + (wide ? 92 : 70)));
      const gx = (tx - baseX) * f;
      const gy = (ty - baseY) * f;
      x += (gx - x) * 0.07;
      y += (gy - y) * 0.07;
      const still = Math.abs(gx - x) + Math.abs(gy - y) < 0.4;
      if (Math.abs(x) + Math.abs(y) < 0.5 && f === 0) {
        el.style.translate = "";
        el.style.transition = "";
      } else {
        el.style.transition = "opacity 0.35s ease";
        el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      }
      const isNear = wide && f > 0.6 && p < 0.12;
      if (isNear !== wasNear) setNear((wasNear = isNear));
      if (!hello && here > 0.9 && p < 0.05 && scrollY < 40) hello = setTimeout(() => scrollY < 40 && speak("Hi, I'm " + profile.starName + "! Scroll and we'll follow the star together.", 7000), 1600);
      if (!cheered && p > 0.3) {
        cheered = true;
        speak("Wheee! Wait for me!", 2600);
      }
      if (space.active || !still || f > 0) raf = requestAnimationFrame(frame);
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    wake();
    addEventListener("journey:active", wake);
    addEventListener("portfolio:booted", wake);
    addEventListener("scroll", wake, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hello);
      removeEventListener("journey:active", wake);
      removeEventListener("portfolio:booted", wake);
      removeEventListener("scroll", wake);
      el.style.translate = "";
      el.style.transition = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      className={`pal ${happy ? "is-happy" : ""} ${near ? "is-near" : ""}`}
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
