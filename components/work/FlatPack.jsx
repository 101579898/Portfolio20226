"use client";

// The pack without WebGL: the same print, cut into a strip and a body with CSS
// clip paths. Used when 3D is unavailable or reduced motion is on.
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { asset } from "@/lib/asset";
import { PACK } from "./machine";

export default function FlatPack({ fx, scale }) {
  const root = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    const draw = () => {
      const f = fx.current;
      const set = (k, v) => el.style.setProperty(k, v);
      set("--ry", `${f.mx * 14 * f.hover}deg`);
      set("--rx", `${f.my * 8 * f.hover}deg`);
      set("--tear", f.tear);
      set("--dir", f.dir);
      set("--strip", f.strip);
      set("--light", f.light);
      set("--drop", Math.max(f.drop, f.rise * 0.3));
    };
    gsap.ticker.add(draw);
    return () => gsap.ticker.remove(draw);
  }, [fx]);

  const src = { backgroundImage: `url(${asset("/work/pack-front.webp")})` };
  return (
    <div className="flat-pack" ref={root} style={{ width: PACK.w * scale, height: PACK.h * scale }} aria-hidden="true">
      <div className="flat-body" style={src} />
      <div className="flat-light" />
      <div className="flat-strip" style={src} />
    </div>
  );
}
