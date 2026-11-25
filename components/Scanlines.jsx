"use client";

// The little switch in the corner. On: the site is seen through an old digital TV
// (fine lines, light static, a soft roll, colour edges and a thin screen border).
// Off: clean. It starts on, and the choice is remembered on this device.
// The look itself is in app/tv.css.
import { useEffect, useRef, useState } from "react";

// A square of TV snow, drawn once.
function snow() {
  const c = document.createElement("canvas");
  c.width = c.height = 192;
  const g = c.getContext("2d");
  const im = g.createImageData(192, 192);
  for (let i = 0; i < im.data.length; i += 4) {
    const v = Math.random();
    im.data[i] = v * 225;
    im.data[i + 1] = v * 228;
    im.data[i + 2] = 60 + v * 195;
    im.data[i + 3] = Math.random() * 255;
  }
  g.putImageData(im, 0, 0);
  return `url(${c.toDataURL()})`;
}

export default function Scanlines() {
  const tv = useRef(null);
  const [on, setOn] = useState(true);
  const [burst, setBurst] = useState(0);

  // layout.jsx has already put the remembered choice on <html>, before the first paint.
  useEffect(() => {
    setOn(document.documentElement.dataset.static !== "off");
    tv.current.style.setProperty("--snow", snow());
  }, []);

  function toggle() {
    const next = document.documentElement.dataset.static === "off";
    setOn(next);
    document.documentElement.dataset.static = next ? "on" : "off";
    if (next) setBurst((n) => n + 1);
    try {
      localStorage.setItem("static", next ? "on" : "off");
    } catch {}
  }

  return (
    <>
      <div className="scanlines" aria-hidden="true" />
      <div className="tv" ref={tv} aria-hidden="true">
        <span className="tv-snow" />
        <span className="tv-roll" />
        <span className="tv-lines" />
        <span className="tv-frame-glass" />
        <span className="tv-frame" />
        {burst ? (
          <span className="tv-burst" key={burst}>
            <span className="tv-osd">CH 03</span>
          </span>
        ) : null}
      </div>
      <button className={`static-switch ${on ? "" : "off"}`} onClick={toggle} aria-pressed={on}>
        <span className="static-word">STATIC</span> <span className="slot"><span className="knob" /></span>
      </button>
    </>
  );
}
