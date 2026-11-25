"use client";

// A small pixel message box floating in the opening scene. Click it and it
// flickers into a song card, whose title opens the song in Spotify; click again to
// go back. The words come from `transmission` in data/site.js. It never plays sound.
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
    <div className={`transmission hero-fade ${open ? "is-open" : ""} ${flicker ? "is-flicker" : ""}`}>
      <button
        type="button"
        className="transmission-flip"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Back to the message" : "See which song this is from"}
      />
      <div className="transmission-body" aria-live="polite">
        {open ? (
          <>
            <span className="transmission-disc" aria-hidden="true" />
            <span className="transmission-song">
              <a href={transmission.url} target="_blank" rel="noreferrer" aria-label={`${transmission.song} by ${transmission.artist}, open in Spotify`}>
                {transmission.song} <span aria-hidden="true">↗</span>
              </a>
              <span>{transmission.artist}</span>
            </span>
          </>
        ) : (
          <span className="transmission-text">{transmission.text || "1 new message"}</span>
        )}
      </div>
      <span className="transmission-caret" aria-hidden="true" />
    </div>
  );
}
