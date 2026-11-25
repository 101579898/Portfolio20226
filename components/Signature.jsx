"use client";

// Kiara's name as a drawn signature: sharp, blade-like chrome letters with orbit
// swooshes and sparkles. Every stroke is a blade that tapers to a point at each
// end, so the letters can be adjusted by moving the points below.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const n = (v) => Math.round(v * 10) / 10;

// A blade from (x1,y1) to (x2,y2). `bend` curves it, `w` is its widest point,
// `at` is how far along that widest point sits (0-1).
function blade(x1, y1, x2, y2, w, bend = 0, at = 0.5) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = x1 + dx * at + nx * bend;
  const my = y1 + dy * at + ny * bend;
  return `M${n(x1)} ${n(y1)} Q${n(mx + nx * w)} ${n(my + ny * w)} ${n(x2)} ${n(y2)} Q${n(mx - nx * w)} ${n(my - ny * w)} ${n(x1)} ${n(y1)}Z`;
}
const spark = (x, y, r) => `M${x} ${y - r} Q${x + r * 0.07} ${y - r * 0.07} ${x + r} ${y} Q${x + r * 0.07} ${y + r * 0.07} ${x} ${y + r} Q${x - r * 0.07} ${y + r * 0.07} ${x - r} ${y} Q${x - r * 0.07} ${y - r * 0.07} ${x} ${y - r}Z`;

// Each letter: its strokes, in drawing order. Letters stand between y = 100 and y = 330.
const LETTERS = [
  // K
  [blade(150, 40, 142, 392, 30), blade(146, 226, 330, 62, 22, -26, 0.4), blade(176, 190, 352, 400, 26, 18, 0.45), blade(108, 92, 206, 62, 8, -12), blade(98, 372, 196, 352, 8, 10), blade(296, 108, 392, 34, 7, 10)],
  // I
  [blade(402, 82, 396, 358, 27), blade(352, 118, 446, 100, 7, -8), blade(350, 340, 444, 326, 7, 8)],
  // A
  [blade(578, 50, 452, 372, 22, 12), blade(560, 46, 676, 378, 30, -10), blade(424, 268, 716, 250, 11, 8)],
  // R
  [blade(752, 60, 744, 378, 28), blade(700, 352, 794, 338, 8, 8), blade(884, 372, 968, 392, 7, -10), blade(720, 104, 752, 238, 24, -176, 0.48), blade(764, 216, 918, 404, 26, 16, 0.4)],
  // A
  [blade(1018, 50, 892, 372, 22, 12), blade(1000, 46, 1118, 384, 30, -10), blade(866, 270, 1290, 226, 11, 18)],
];
const SWOOSH = [
  blade(20, 330, 1180, 396, 9, 74, 0.45),
  blade(1300, 110, 640, 12, 8, 40, 0.5),
  blade(60, 130, 420, 18, 7, -30, 0.5),
];

export default function Signature({ name }) {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 88%", once: true } });
        tl.from(".sig-stroke", { scaleY: 0, opacity: 0, transformOrigin: "50% 0%", duration: 0.7, stagger: 0.06, ease: "power4.out" })
          .from(".sig-swoosh", { scaleX: 0, opacity: 0, transformOrigin: (i) => (i === 1 ? "100% 50%" : "0% 50%"), duration: 1, stagger: 0.12, ease: "power3.out" }, 0.35)
          .from(".sig-spark", { scale: 0, rotation: -90, transformOrigin: "50% 50%", duration: 0.7, stagger: 0.08, ease: "back.out(2.4)" }, 0.8);
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div className="signature" ref={root}>
      <svg viewBox="0 0 1320 430" role="img" aria-label={name}>
        <defs>
          <linearGradient id="sigChrome" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="60" y2="410">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".28" stopColor="#dccbe8" />
            <stop offset=".47" stopColor="#8f7cb6" />
            <stop offset=".52" stopColor="#f6eefa" />
            <stop offset=".68" stopColor="#c9b7dd" />
            <stop offset=".86" stopColor="#7c679e" />
            <stop offset="1" stopColor="#efe6f6" />
          </linearGradient>
        </defs>
        <g fill="url(#sigChrome)" opacity=".75">
          {SWOOSH.map((d) => <path key={d} className="sig-swoosh" d={d} />)}
        </g>
        <g fill="url(#sigChrome)" stroke="#fff" strokeOpacity=".5" strokeWidth="1" strokeLinejoin="round">
          {LETTERS.flat().map((d) => <path key={d} className="sig-stroke" d={d} />)}
        </g>
        <g fill="#f6eefa">
          {[[399, 44, 34], [1236, 150, 26], [88, 88, 20], [1180, 332, 16], [694, 60, 14]].map(([x, y, r]) => (
            <path key={x} className="sig-spark" d={spark(x, y, r)} />
          ))}
        </g>
      </svg>
      <p className="label" aria-hidden="true">Gonzalez-Layne</p>
    </div>
  );
}
