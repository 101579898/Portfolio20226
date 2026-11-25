"use client";

// A card opening into its project. A sheet grows from the card's own rectangle, the
// card's picture travels to become the main visual, then the panels arrive. Closing
// plays it backwards into the same card. The project gets its own address while it
// is open, so it can be shared, and the browser's Back button closes it.
import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import CaseStudy from "./CaseStudy";
import useModal from "./useModal";
import { asset } from "@/lib/asset";

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function clipFor(rect, radius) {
  return `inset(${rect.top}px ${innerWidth - rect.right}px ${innerHeight - rect.bottom}px ${rect.left}px round ${radius}px)`;
}

export default function CaseOverlay({ project, hasNext, getCard, onClosed, onNext }) {
  const sheet = useRef(null);
  const scroller = useRef(null);
  const veil = useRef(null);
  const back = useRef(null);
  const busy = useRef(false);
  const home = useRef(null);
  const first = useRef(project.slug);
  useModal();

  // ── Open ──────────────────────────────────────────────────
  useLayoutEffect(() => {
    back.current?.focus({ preventScroll: true });
    const card = getCard();
    if (calm() || !card) return;
    const c = card.getBoundingClientRect();
    const art = card.querySelector(".card-art")?.getBoundingClientRect() || c;
    const hero = sheet.current.querySelector("[data-hero]");
    const h = hero.getBoundingClientRect();
    const panels = sheet.current.querySelectorAll(".case-top > *, [data-in], .case-bar");
    card.style.visibility = "hidden";
    const tl = gsap.timeline({ onComplete: () => (card.style.visibility = "") });
    tl.fromTo(veil.current, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0)
      .fromTo(
        sheet.current,
        { clipPath: clipFor(c, 18) },
        { clipPath: clipFor({ top: 0, left: 0, right: innerWidth, bottom: innerHeight }, 0), duration: 0.85, ease: "power4.inOut", clearProps: "clipPath" },
        0.05
      )
      .fromTo(
        hero,
        { x: art.left + art.width / 2 - (h.left + h.width / 2), y: art.top + art.height / 2 - (h.top + h.height / 2), scale: art.width / h.width },
        { x: 0, y: 0, scale: 1, duration: 0.85, ease: "power4.inOut", clearProps: "transform" },
        0.05
      )
      .fromTo(panels, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: "power3.out", clearProps: "opacity,transform" }, 0.6);
    return () => {
      card.style.visibility = "";
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Close ─────────────────────────────────────────────────
  function shut() {
    if (busy.current) return;
    busy.current = true;
    const card = getCard();
    if (calm() || !card) {
      onClosed();
      return;
    }
    const c = card.getBoundingClientRect();
    card.style.visibility = "hidden";
    const tl = gsap.timeline({
      onComplete: () => {
        card.style.visibility = "";
        onClosed();
      },
    });
    tl.to(sheet.current.querySelectorAll(".case > *, .case-bar"), { opacity: 0, duration: 0.22, ease: "power2.in" }, 0)
      .fromTo(
        sheet.current,
        { clipPath: clipFor({ top: 0, left: 0, right: innerWidth, bottom: innerHeight }, 0) },
        { clipPath: clipFor(c, 18), duration: 0.55, ease: "power3.inOut" },
        0.1
      )
      .to(veil.current, { opacity: 0, duration: 0.45 }, 0.25)
      .to(sheet.current, { opacity: 0, duration: 0.16 }, 0.52);
  }
  const shutRef = useRef(shut);
  shutRef.current = shut;

  // ── Address + keys ────────────────────────────────────────
  useEffect(() => {
    home.current = { href: location.href, title: document.title };
    history.pushState(null, "", asset(`/work/${project.slug}/`));
    const onPop = () => shutRef.current();
    const onKey = (e) => e.key === "Escape" && history.back();
    window.addEventListener("popstate", onPop);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
      document.title = home.current.title;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Next project: swap the contents in place.
  useEffect(() => {
    document.title = `${project.title} — Case file`;
    if (project.slug === first.current) return;
    first.current = project.slug;
    history.replaceState(null, "", asset(`/work/${project.slug}/`));
    scroller.current.scrollTop = 0;
    back.current?.focus({ preventScroll: true });
    if (calm()) return;
    const tw = gsap.fromTo(sheet.current.querySelector(".case"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", clearProps: "opacity,transform" });
    return () => tw.kill();
  }, [project]);

  return createPortal(
    <>
      <div className="case-veil" ref={veil} aria-hidden="true" />
      <div className="case-sheet" ref={sheet} role="dialog" aria-modal="true" aria-labelledby="case-title" style={{ "--hue": project.hue }}>
        <div className="case-scroll" ref={scroller} data-lenis-prevent tabIndex={-1}>
          <div className="case-bar">
            <button className="btn" ref={back} onClick={() => history.back()}>
              <span aria-hidden="true">←</span> Back to collection
            </button>
            {hasNext ? (
              <button className="btn ghost" onClick={() => !busy.current && onNext()}>
                Next project <span aria-hidden="true">→</span>
              </button>
            ) : null}
          </div>
          <CaseStudy project={project} titleId="case-title" />
        </div>
      </div>
    </>,
    document.body
  );
}
