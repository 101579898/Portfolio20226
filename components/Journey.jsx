"use client";

// Chapter 01. One continuous scroll: the star flies in, the title appears, and
// as you scroll the star pulls you past glass and dust into a small bloom of light (drawn by
// Cosmos.jsx, so it carries on into the next chapter), where About begins. The star itself lives in StarScene.jsx.
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Transmission from "./Transmission";
import { space, smoothstep } from "@/lib/space";
import { glide, isGliding } from "@/lib/scroll";
import { profile } from "@/data/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const StarScene = dynamic(() => import("./StarScene"), { ssr: false });
const bump = (a, b, c, d, v) => smoothstep(a, b, v) * (1 - smoothstep(c, d, v));

function hasWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export default function Journey() {
  const root = useRef(null);
  const title = useRef(null);
  const entering = useRef(null);
  const flash = useRef(null);
  const actions = useRef(null);
  const message = useRef(null);
  // "pending" until we know; "3d" shows the scene; "flat" shows a drawn star instead.
  const [mode, setMode] = useState("pending");
  const gate = useRef({ booted: false, warm: false, flown: false });

  function flyIn() {
    const g = gate.current;
    if (!g.booted || !g.warm || g.flown) return;
    g.flown = true;
    gsap.to(space, { intro: 1, duration: 2.1, ease: "power3.out" });
  }

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode(!reduce && hasWebGL() ? "3d" : "flat");

    const onMove = (e) => {
      space.mx = (e.clientX / innerWidth) * 2 - 1;
      space.my = 1 - (e.clientY / innerHeight) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Put the 3D scene to sleep once the journey has scrolled away.
    const io = new IntersectionObserver(([e]) => {
      space.active = e.isIntersecting;
      window.dispatchEvent(new Event("journey:active"));
    });
    io.observe(root.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  // Following the star takes one scroll (wheel, swipe or key): down flies to About,
  // up flies back. Reduced motion has no smooth scroll, so nothing is taken over there.
  useEffect(() => {
    const about = document.getElementById("about");
    if (!about) return;
    const inside = () => document.documentElement.dataset.booted && scrollY < root.current.offsetHeight - 70;
    const fly = (down) => {
      if (isGliding()) return true;
      if (!inside() || (!down && scrollY < 4)) return false;
      return down ? glide(about, -40) : glide(0);
    };
    const stop = (e) => {
      if (e.cancelable) e.preventDefault();
      e.stopImmediatePropagation();
    };
    const onWheel = (e) => {
      if (e.ctrlKey || e.shiftKey || Math.abs(e.deltaY) < Math.abs(e.deltaX) || !e.deltaY) return;
      if (fly(e.deltaY > 0)) stop(e);
    };
    let start = null;
    const onStart = (e) => (start = e.touches.length === 1 ? [e.touches[0].clientX, e.touches[0].clientY] : null);
    const onTouch = (e) => {
      if (!start || e.touches.length > 1) return;
      const dx = e.touches[0].clientX - start[0];
      const dy = e.touches[0].clientY - start[1];
      if (Math.abs(dy) < 6 || Math.abs(dy) < Math.abs(dx)) return;
      if (fly(dy < 0)) stop(e);
    };
    const DOWN = ["ArrowDown", "PageDown", " "];
    const UP = ["ArrowUp", "PageUp"];
    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.("input, textarea, select, [role=dialog], [contenteditable]")) return;
      if (e.key === " " && e.target.closest?.("button, a, summary")) return;
      const down = DOWN.includes(e.key) && !(e.key === " " && e.shiftKey);
      if (!down && !UP.includes(e.key) && e.key !== " ") return;
      if (fly(down)) stop(e);
    };
    const opt = { passive: false, capture: true };
    addEventListener("wheel", onWheel, opt);
    addEventListener("touchstart", onStart, { passive: true, capture: true });
    addEventListener("touchmove", onTouch, opt);
    addEventListener("keydown", onKey, true);
    return () => {
      removeEventListener("wheel", onWheel, opt);
      removeEventListener("touchstart", onStart, { capture: true });
      removeEventListener("touchmove", onTouch, opt);
      removeEventListener("keydown", onKey, true);
    };
  }, []);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        space.p = 0;
        space.intro = 1;
        return;
      }

      function apply(q) {
        space.p = q;
        const out = smoothstep(0.04, 0.3, q);
        title.current.style.opacity = 1 - out;
        title.current.style.transform = `translateZ(0) scale(${1 + out * 0.28})`;
        // The heading stays readable to screen readers; only its links are switched off.
        title.current.style.pointerEvents = out >= 1 ? "none" : "";
        actions.current.style.visibility = out >= 1 ? "hidden" : "visible";
        message.current.style.opacity = 1 - out;
        message.current.style.visibility = out >= 1 ? "hidden" : "visible";
        message.current.style.transform = `translateY(${-out * 90}px)`;
        entering.current.style.opacity = bump(0.4, 0.55, 0.78, 0.9, q);
        entering.current.style.transform = `translateY(${(0.55 - Math.min(q, 0.55)) * 60}px)`;
        flash.current.style.opacity = bump(0.82, 0.93, 0.94, 1, q) * 0.4;
      }

      const state = { q: 0 };
      apply(0);
      gsap.to(state, {
        q: 1,
        ease: "none",
        onUpdate: () => apply(state.q),
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.5 },
      });

      // Once the TV is on: the star shoots in first, then the title follows it.
      space.intro = 0;
      const intro = gsap
        .timeline({ paused: true })
        .from(".hero-line > span", { yPercent: 60, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.14 }, 0.45)
        .from(".hero-flourish path", { strokeDashoffset: 1, duration: 1.3, ease: "power2.inOut" }, 0.85)
        .from(".hero-fade", { opacity: 0, y: 12, duration: 0.8, stagger: 0.12 }, 1);
      const playIntro = () => {
        gate.current.booted = true;
        flyIn();
        intro.play();
      };
      if (document.documentElement.dataset.booted) playIntro();
      else window.addEventListener("portfolio:booted", playIntro, { once: true });

      return () => window.removeEventListener("portfolio:booted", playIntro);
    },
    { scope: root }
  );

  return (
    <section className="journey" id="intro" ref={root} aria-label="Welcome">
      <div className="journey-stage">
        {mode === "3d" ? <StarScene
            onReady={() => {
              gate.current.warm = true;
              flyIn();
            }}
            onFail={() => setMode("flat")}
          /> : null}
        {mode === "flat" ? (
          <svg className="journey-flatstar" viewBox="0 0 100 100" aria-hidden="true">
            <path d="M50 2 Q53 47 98 50 Q53 53 50 98 Q47 53 2 50 Q47 47 50 2 Z" fill="#efe6f6" />
          </svg>
        ) : null}

        <div className="hero" ref={title}>
          <p className="label hero-fade">[ Portfolio_2026 ] &nbsp;{profile.name} — {profile.role}</p>
          <h1>
            <span className="hero-line"><span className="hero-welcome">Welcome to my</span></span>{" "}
            <span className="hero-line"><span className="hero-script">Portfolio</span></span>
          </h1>
          <svg className="hero-flourish" viewBox="0 0 600 70" aria-hidden="true">
            <path pathLength="1" d="M20 22 C 60 64, 180 60, 300 42 S 520 14, 566 30 C 592 40, 560 58, 528 46" />
          </svg>
          <div className="hero-actions hero-fade" ref={actions}>
            <p className="scroll-hint">
              <span className="scroll-dot" aria-hidden="true" />
              Scroll to follow the star
            </p>
            <a className="skip-intro" href="#about">Skip to about ↓</a>
          </div>
        </div>
        <div className="transmission-dock" ref={message}>
          <Transmission />
        </div>

        <p className="journey-text" ref={entering} aria-hidden="true">
          <span className="label">[ Coordinates_locked ]</span>
          Entering Digi-Space
        </p>
        <div className="journey-flash" ref={flash} aria-hidden="true" />
      </div>
    </section>
  );
}
