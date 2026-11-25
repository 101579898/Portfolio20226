"use client";

// Chapter 01. One continuous scroll: the star flies in, the title appears, and
// as you scroll the star pulls you past glass and dust, then fades away as About begins. The star itself lives in StarScene.jsx.
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Transmission from "./Transmission";
import { space, smoothstep } from "@/lib/space";
import { glide, gliding } from "@/lib/scroll";
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
  const actions = useRef(null);
  const message = useRef(null);
  // "pending" until we know; "3d" shows the scene; "flat" shows a drawn star instead.
  const [mode, setMode] = useState("pending");
  const gate = useRef({ booted: false, warm: false, flown: false });
  const hasWebGL3D = useRef(false);

  function flyIn() {
    const g = gate.current;
    if (!g.booted || !g.warm || g.flown) return;
    g.flown = true;
    gsap.fromTo(space, { intro: 0 }, { intro: 1, duration: 3.2, ease: "power2.out" });
  }

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const can = !reduce && hasWebGL();
    hasWebGL3D.current = can;
    document.documentElement.classList.toggle("kiwi-flying", can && space.p < 0.93);
    setMode(can ? "3d" : "flat");

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
      document.documentElement.classList.remove("kiwi-flying");
    };
  }, []);

  // Following the star takes one scroll (wheel, swipe or key): down flies to About,
  // up from the top of About flies back. Anything lower on the page scrolls normally.
  // Scrolling again on the way hurries the flight, or turns it around. Reduced motion
  // has no smooth scroll, so nothing is taken over there.
  useEffect(() => {
    const about = document.getElementById("about");
    if (!about || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const landing = () => Math.round(about.getBoundingClientRect().top + scrollY - 80);

    // Starts (or redirects) the flight. Says whether this gesture belongs to it.
    const fly = (down) => {
      if (!document.documentElement.dataset.booted) return false;
      const there = landing();
      const now = gliding();
      if (now) {
        const goingDown = now.to > 0;
        if (goingDown !== down) return glide(down ? there : 0, 2);
        if (performance.now() - now.began > 700) glide(now.to, 0.9);
        return true;
      }
      if (down) return scrollY < there - 24 && glide(there);
      return scrollY > 4 && scrollY <= there + 4 && glide(0);
    };
    const stop = (e) => {
      if (e.cancelable) e.preventDefault();
      e.stopImmediatePropagation();
    };

    // A wheel or trackpad gesture is a run of events with no pause. Its first event
    // decides for all of them; the leftover push after landing is swallowed briefly.
    let last = 0;
    let dir = 0;
    let taken = false;
    let landed = 0;
    const onWheel = (e) => {
      if (e.ctrlKey || e.shiftKey || !e.deltaY || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const t = performance.now();
      const d = Math.sign(e.deltaY);
      if (t - last > 170 || d !== dir) {
        dir = d;
        landed = 0;
        taken = fly(d > 0);
      }
      last = t;
      if (!taken) return;
      if (!gliding()) {
        landed = landed || t;
        if (t - landed > 450) {
          taken = false;
          return;
        }
      }
      stop(e);
    };

    // A touch decides once too, on its first real movement.
    let start = null;
    let mine = null; // null = not decided yet
    const onStart = (e) => {
      mine = null;
      start = e.touches.length === 1 && !e.target.closest?.("input") ? [e.touches[0].clientX, e.touches[0].clientY] : null;
    };
    const onTouch = (e) => {
      if (!start || e.touches.length > 1) return;
      if (mine === null) {
        const dx = e.touches[0].clientX - start[0];
        const dy = e.touches[0].clientY - start[1];
        if (Math.abs(dy) < 4 && Math.abs(dx) < 4) return;
        mine = e.cancelable && Math.abs(dy) > Math.abs(dx) && fly(dy < 0);
      }
      if (mine) stop(e);
    };

    const DOWN = ["ArrowDown", "PageDown", " "];
    const UP = ["ArrowUp", "PageUp"];
    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.("input, textarea, select, [role=dialog], [contenteditable]")) return;
      if (e.key === " " && e.target.closest?.("button, a, summary")) return;
      const down = DOWN.includes(e.key) && !(e.key === " " && e.shiftKey);
      if (!down && !UP.includes(e.key) && e.key !== " ") return;
      if (e.repeat ? gliding() : fly(down)) stop(e);
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
        // While Kiwi is the star, the little Kiwi in the corner waits for her to land.
        document.documentElement.classList.toggle("kiwi-flying", hasWebGL3D.current && q < 0.93);
        const out = smoothstep(0.04, 0.3, q);
        title.current.style.opacity = 1 - out;
        title.current.style.transform = `translateZ(0) scale(${1 + out * 0.28})`;
        // The heading stays readable to screen readers; only its links are switched off.
        title.current.style.pointerEvents = out >= 1 ? "none" : "";
        actions.current.style.visibility = out >= 1 ? "hidden" : "visible";
        message.current.style.opacity = 1 - out;
        message.current.style.visibility = out >= 1 ? "hidden" : "visible";
        message.current.style.transform = `translateY(${-out * 90}px)`;
        entering.current.style.opacity = bump(0.2, 0.36, 0.84, 0.98, q);
        entering.current.style.transform = `translateY(${(0.36 - Math.min(q, 0.36)) * 60}px)`;
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
        .from(".hero-line > span", { yPercent: 34, opacity: 0.001, duration: 1.8, ease: "power2.out", stagger: 0.4 }, 0.9)
        .from(".hero-flourish path", { strokeDashoffset: 1, duration: 2, ease: "power2.inOut" }, 2)
        .from(".hero-fade", { opacity: 0.001, y: 12, duration: 1.2, stagger: 0.35 }, 2.5);
      // Behind the black boot screen, draw everything once in its final place, so the
      // first frames of the opening never stall.
      const rehearse = () => {
        space.intro = 1;
        intro.progress(1).pause();
      };
      const playIntro = () => {
        gate.current.booted = true;
        space.intro = 0;
        flyIn();
        intro.progress(0).play();
      };
      if (document.documentElement.dataset.booted) playIntro();
      else {
        window.addEventListener("portfolio:rehearse", rehearse, { once: true });
        window.addEventListener("portfolio:booted", playIntro, { once: true });
      }

      return () => {
        window.removeEventListener("portfolio:rehearse", rehearse);
        window.removeEventListener("portfolio:booted", playIntro);
      };
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
            onFail={() => {
              hasWebGL3D.current = false;
              document.documentElement.classList.remove("kiwi-flying");
              setMode("flat");
            }}
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
      </div>
    </section>
  );
}
