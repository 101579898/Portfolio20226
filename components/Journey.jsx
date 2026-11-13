"use client";

// Hero + scroll journey. As you scroll, the welcome title drifts away, a
// shooting star spirals toward the centre, the stars stretch into warp
// streaks, and you arrive in digi-space where the About section begins.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { space, smoothstep } from "@/lib/space";
import { profile } from "@/data/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);
// Keep animations on real time: on a slow frame they skip ahead instead of crawling.
gsap.ticker.lagSmoothing(0);

const bump = (a, b, c, d, v) => smoothstep(a, b, v) * (1 - smoothstep(c, d, v));

export default function Journey() {
  const root = useRef(null);
  const title = useRef(null);
  const follow = useRef(null);
  const entering = useRef(null);
  const flash = useRef(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        space.warp = 0;
        space.digi = 1;
        space.cometA = 0;
        return;
      }

      function apply(q) {
        space.cometP = (q - 0.05) / 0.83;
        space.cometA = bump(0.05, 0.12, 0.8, 0.88, q);
        space.warp = bump(0.45, 0.82, 0.9, 1, q);
        space.digi = smoothstep(0.85, 1, q);
        const out = smoothstep(0.02, 0.18, q);
        title.current.style.opacity = 1 - out;
        title.current.style.transform = `scale(${1 + out * 0.35})`;
        title.current.style.visibility = out >= 1 ? "hidden" : "visible";
        follow.current.style.opacity = bump(0.16, 0.26, 0.4, 0.5, q);
        entering.current.style.opacity = bump(0.58, 0.68, 0.84, 0.9, q);
        flash.current.style.opacity = bump(0.84, 0.92, 0.93, 1, q) * 0.85;
      }

      const state = { q: 0 };
      apply(0);
      gsap.to(state, {
        q: 1,
        ease: "none",
        onUpdate: () => apply(state.q),
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });

      gsap.from(".hero-line > span", {
        yPercent: 110,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.12,
        delay: 0.15,
      });
      gsap.from(".hero-fade", { opacity: 0, y: 12, duration: 0.8, delay: 0.9, stagger: 0.15 });

      return () => {
        space.warp = 0;
        space.digi = 1;
        space.cometA = 0;
      };
    },
    { scope: root }
  );

  return (
    <section className="journey" ref={root} aria-label="Welcome">
      <div className="journey-stage">
        <div className="hud-marks" aria-hidden="true" />
        <div className="hero" ref={title}>
          <p className="label hero-fade">[ PORTFOLIO_2026 ] &nbsp;{profile.name} — {profile.role}</p>
          <h1>
            <span className="hero-line"><span className="serif">Welcome to my</span></span>
            <span className="hero-line"><span>Portfolio</span></span>
          </h1>
          <p className="scroll-hint hero-fade">
            <span className="scroll-dot" aria-hidden="true" />
            Scroll to follow the shooting star
          </p>
        </div>
        <p className="journey-text" ref={follow} aria-hidden="true">
          <span className="label">[ TRACKING ]</span>
          Follow the shooting star
        </p>
        <p className="journey-text" ref={entering} aria-hidden="true">
          <span className="label">[ COORDINATES_LOCKED ]</span>
          Entering digi-space
        </p>
        <div className="journey-flash" ref={flash} aria-hidden="true" />
      </div>
    </section>
  );
}
