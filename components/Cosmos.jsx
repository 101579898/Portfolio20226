"use client";

// The 2.5D layered universe behind every page. Each object is a flat picture
// placed at its own depth. Far things barely move; near things move more, both
// when you scroll and when the pointer moves. All light comes from the upper left.
//
//   depth 1 deep space   2 nebula light   3 moons, planets   4 flowers   5 foreground
//
// To move or add an object, edit the list below.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { asset } from "@/lib/asset";
import { clamp, smoothstep, space } from "@/lib/space";

// at:    the chapter (element id) the object belongs to
// x, y:  centre position in % of the screen      w: width in vw (min in px)
// depth: 1 (far) to 5 (near)                     o: how visible it is
// move:  optional slow motion: "drift" | "turn" | "sway"
const OBJECTS = [
  // Opening
  { img: "blackhole", at: "intro", x: 13, y: 78, w: 30, min: 300, depth: 1, o: 0.5 },
  { img: "nebula", at: "intro", x: 72, y: 46, w: 92, min: 760, depth: 2, o: 0.62, move: "drift" },
  { img: "moon", at: "intro", x: 88, y: 20, w: 27, min: 230, depth: 3, o: 0.95, move: "drift" },
  { img: "flower", at: "intro", x: 6, y: 25, w: 20, min: 160, depth: 4, o: 0.85, move: "turn" },
  { img: "blossom", at: "intro", x: 99, y: 103, w: 40, min: 330, depth: 5, o: 0.5, blur: 7, move: "sway" },
  // About
  { img: "nebula", at: "about", x: 22, y: 30, w: 88, min: 700, depth: 2, o: 0.42, flip: true, move: "drift" },
  { img: "planet", at: "about", x: 97, y: 44, w: 58, min: 500, depth: 3, o: 0.62, move: "drift" },
  { img: "flower", at: "about", x: -1, y: 92, w: 24, min: 190, depth: 4, o: 0.5, move: "turn" },
  { img: "blossom", at: "about", x: 103, y: 100, w: 30, min: 260, depth: 5, o: 0.42, blur: 6, move: "sway" },
  // Work
  { img: "galaxy", at: "work", x: 12, y: 40, w: 46, min: 420, depth: 1, o: 0.4 },
  { img: "nebula", at: "work", x: 62, y: 60, w: 96, min: 760, depth: 2, o: 0.45, move: "drift" },
  { img: "moon", at: "work", x: 88, y: 46, w: 17, min: 130, depth: 3, o: 0.85, move: "drift" },
  { img: "flower", at: "work", x: 96, y: 86, w: 26, min: 210, depth: 4, o: 0.62, move: "turn" },
  { img: "blossom", at: "work", x: -3, y: 98, w: 36, min: 280, depth: 5, o: 0.45, blur: 7, move: "sway" },
  // Signal (waves)
  { img: "blackhole", at: "signal", x: 50, y: 46, w: 62, min: 560, depth: 2, o: 0.5 },
  // Contact
  { img: "nebula", at: "contact", x: 40, y: 74, w: 96, min: 760, depth: 2, o: 0.5, move: "drift" },
  { img: "planet", at: "contact", x: 80, y: 58, w: 56, min: 480, depth: 3, o: 0.78, move: "drift" },
  { img: "flower", at: "contact", x: 97, y: 18, w: 18, min: 150, depth: 4, o: 0.55, move: "turn" },
  { img: "blossom", at: "contact", x: 0, y: 104, w: 34, min: 280, depth: 5, o: 0.4, blur: 7, move: "sway" },
];
// On other pages (case files) there are no chapters, so these are used instead.
const ELSEWHERE = [
  { img: "nebula", x: 30, y: 30, w: 96, min: 760, depth: 2, o: 0.5, move: "drift" },
  { img: "moon", x: 94, y: 16, w: 18, min: 150, depth: 3, o: 0.7, move: "drift" },
  { img: "flower", x: 1, y: 88, w: 22, min: 180, depth: 4, o: 0.45, move: "turn" },
];
// How far each depth moves: with the pointer (px) and with a screen of scroll (share of the screen).
const POINTER = [0, 3, 6, 12, 22, 38];
const SCROLL = [0, 0.1, 0.2, 0.42, 0.7, 1.1];

// A tile of stars, drawn once. The brightest few get a four-point sparkle.
function starTile(size, count, maxR, seed) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < count; i++) {
    const r = 0.35 + rnd() * rnd() * maxR;
    const tint = rnd();
    g.fillStyle = tint > 0.93 ? "#c8c793" : tint > 0.6 ? "#dcb1c2" : tint > 0.3 ? "#c9c2ea" : "#ffffff";
    g.globalAlpha = 0.25 + rnd() * 0.65;
    const x = rnd() * size;
    const y = rnd() * size;
    g.beginPath();
    g.arc(x, y, r, 0, 7);
    g.fill();
    if (r > 1.5) {
      g.globalAlpha *= 0.6;
      g.fillRect(x - r * 4, y - 0.35, r * 8, 0.7);
      g.fillRect(x - 0.35, y - r * 4, 0.7, r * 8);
    }
  }
  return `url(${c.toDataURL()})`;
}

export default function Cosmos() {
  const root = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = root.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const stars = [...el.querySelectorAll(".cosmos-stars")];
    if (!stars[0].style.backgroundImage) {
      stars[0].style.backgroundImage = starTile(700, 260, 0.7, 11);
      stars[1].style.backgroundImage = starTile(900, 90, 1.2, 37);
      stars[2].style.backgroundImage = starTile(1100, 26, 2.1, 73);
    }

    const items = [...el.querySelectorAll(".cosmos-obj")].map((node) => ({
      node,
      at: node.dataset.at,
      depth: Number(node.dataset.depth),
      o: Number(node.dataset.o),
      shown: null,
    }));
    const lights = [...el.querySelectorAll(".cosmos-light")];
    const ids = [...new Set(items.map((i) => i.at).filter(Boolean))];

    let h = innerHeight;
    let raf = 0;
    let chapters = {}; // id -> { top, bottom } in page pixels
    const now = { x: 0, y: 0, s: scrollY };
    const goal = { x: 0, y: 0, s: scrollY };

    function measure() {
      h = innerHeight;
      chapters = {};
      for (const id of ids) {
        const c = document.getElementById(id);
        if (!c) continue;
        const r = c.getBoundingClientRect();
        chapters[id] = { top: r.top + scrollY, bottom: r.bottom + scrollY };
      }
      wake();
    }

    // How many screens away is a chapter from the middle of the view? 0 = inside it.
    function away(id) {
      const c = chapters[id];
      if (!c) return null;
      const mid = now.s + h / 2;
      const half = (c.top + c.bottom) / 2;
      const top = Math.min(c.top + h * 0.5, half);
      const bottom = Math.max(c.bottom - h * 0.5, half);
      if (mid < top) return (top - mid) / h;
      if (mid > bottom) return (bottom - mid) / h;
      return 0;
    }

    function paint() {
      const home = Object.keys(chapters).length > 0;
      for (const it of items) {
        let t = 0;
        if (it.at) {
          const a = away(it.at);
          t = a === null ? 9 : a;
        } else if (home) t = 9;
        const vis = Math.abs(t) < 1.25;
        if (vis !== it.shown) {
          it.shown = vis;
          it.node.style.visibility = vis ? "visible" : "hidden";
        }
        if (!vis) continue;
        // Objects in the opening slide past as you travel, then make way for the galaxy.
        const trip = it.at === "intro" && !reduce ? space.p : 0;
        const inner = it.at ? -trip * h * SCROLL[it.depth] * 0.55 : -now.s * 0.04 * it.depth;
        const x = -now.x * POINTER[it.depth];
        const y = -now.y * POINTER[it.depth] + t * h * SCROLL[it.depth] + inner;
        it.node.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
        it.node.style.opacity = (it.o * (1 - smoothstep(0.3, 1.15, Math.abs(t))) * (1 - smoothstep(0.5, 0.88, trip))).toFixed(3);
      }
      for (const l of lights) {
        const a = l.dataset.at ? away(l.dataset.at) : home ? 9 : 0;
        l.style.opacity = a === null ? 0 : (1 - clamp(Math.abs(a))).toFixed(3);
      }
      stars.forEach((s, i) => {
        const k = 0.015 + i * 0.03;
        s.style.transform = `translate3d(${(-now.x * (3 + i * 5)).toFixed(1)}px,${(-((now.s * k) % 350) - now.y * (3 + i * 5)).toFixed(1)}px,0)`;
      });
    }

    function frame() {
      now.x += (goal.x - now.x) * 0.06;
      now.y += (goal.y - now.y) * 0.06;
      now.s += (goal.s - now.s) * 0.16;
      paint();
      const still = Math.abs(goal.x - now.x) + Math.abs(goal.y - now.y) < 0.002 && Math.abs(goal.s - now.s) < 0.3;
      raf = still ? 0 : requestAnimationFrame(frame); // sleeps when nothing moves
    }
    function wake() {
      if (reduce) {
        now.s = goal.s = scrollY;
        paint();
      } else if (!raf) raf = requestAnimationFrame(frame);
    }
    function onScroll() {
      goal.s = scrollY;
      wake();
    }
    function onMove(e) {
      if (e.pointerType !== "mouse") return;
      goal.x = e.clientX / innerWidth - 0.5;
      goal.y = e.clientY / h - 0.5;
      wake();
    }

    measure();
    paint();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    addEventListener("resize", measure);
    addEventListener("scroll", onScroll, { passive: true });
    if (fine && !reduce) addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("resize", measure);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onMove);
    };
  }, [pathname]);

  return (
    <div className="cosmos" ref={root} aria-hidden="true">
      {["intro", "about", "work", "signal", "contact", ""].map((id) => (
        <span key={id || "else"} className={`cosmos-light light-${id || "else"}`} data-at={id} />
      ))}
      <span className="cosmos-stars" />
      <span className="cosmos-stars" />
      <span className="cosmos-stars" />
      {[...OBJECTS, ...ELSEWHERE].map((o, i) => (
        <div
          key={i}
          className={`cosmos-obj d${o.depth} is-${o.img}`}
          data-at={o.at || ""}
          data-depth={o.depth}
          data-o={o.o}
          style={{ left: `${o.x}%`, top: `${o.y}%`, "--w": `${o.w}vw`, "--min": `${o.min}px` }}
        >
          <img
            className={`${o.move ? `move-${o.move}` : ""} ${o.flip ? "is-flip" : ""}`}
            style={o.blur ? { filter: `blur(${o.blur}px)` } : undefined}
            src={asset(`/cosmos/${o.img}.webp`)}
            alt=""
            draggable="false"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}
