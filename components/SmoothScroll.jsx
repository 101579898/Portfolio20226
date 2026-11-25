"use client";

// Smooth scrolling (Lenis) driven by GSAP's clock, so scroll animations and
// the page move in step. Off for reduced motion; touch keeps native scrolling.
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis, scrollToId } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    // In-page links glide to their chapter.
    function onClick(e) {
      const link = e.target.closest?.('a[href*="#"]');
      if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      const url = new URL(link.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const id = url.hash.slice(1);
      if (id === "main") return; // the skip link uses the browser's own jump
      if (scrollToId(id)) {
        e.preventDefault();
        e.stopPropagation();
        history.replaceState(history.state, "", url.hash);
      }
    }

    document.addEventListener("click", onClick, true);

    // On phones, Kiwi and the static switch step aside while you scroll down (so they
    // never cover a button) and come back when you scroll up or reach either end.
    const phone = window.matchMedia("(max-width: 700px)");
    let lastY = scrollY;
    const root = document.documentElement;
    const onScroll = () => {
      const y = scrollY;
      const d = y - lastY;
      if (Math.abs(d) < 10) return;
      const opening = document.getElementById("intro");
      const end = y < 80 || y + innerHeight > document.documentElement.scrollHeight - 80 || (opening && y < opening.offsetHeight - innerHeight * 0.5);
      root.classList.toggle("floaters-away", phone.matches && d > 0 && !end);
      lastY = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => {
        document.removeEventListener("click", onClick, true);
        removeEventListener("scroll", onScroll);
      };
    }

    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      document.removeEventListener("click", onClick, true);
      removeEventListener("scroll", onScroll);
      root.classList.remove("floaters-away");
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
