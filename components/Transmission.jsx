"use client";

// A small pixel message box floating in the opening scene. Click it and it
// flickers into a song card; click again to go back. The words come from
// `transmission` in data/site.js. It never plays any sound.
import { useEffect, useRef, useState } from "react";
import { transmission } from "@/data/site";

export default function Transmission() {
  const [open, setOpen] = useState(false);
  const [flicker, setFlicker] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function toggle() {
    if (flicker) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setOpen((o) => !o);
      return;
    }
    setFlicker(true);
    timers.current = [setTimeout(() => setOpen((o) => !o), 260), setTimeout(() => setFlicker(false), 520)];
  }

  return (
    <button
      type="button"
      className={`transmission hero-fade ${open ? "is-open" : ""} ${flicker ? "is-flicker" : ""}`}
      onClick={toggle}
      aria-expanded={open}
      aria-label={open ? "Close the song message" : "Open the message"}
    >
      <span className="transmission-body" aria-live="polite">
        {open ? (
          <>
            <span className="transmission-disc" aria-hidden="true" />
            <span className="transmission-song">
              <strong>{transmission.song}</strong>
              <span>{transmission.artist}</span>
            </span>
          </>
        ) : (
          <span className="transmission-text">{transmission.text || "1 new message"}</span>
        )}
      </span>
      <span className="transmission-caret" aria-hidden="true" />
    </button>
  );
}
