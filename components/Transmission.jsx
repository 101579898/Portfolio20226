"use client";

// A small pixel message box floating in the opening scene. Click it and it
// flickers into a song card: the record plays and pauses a short preview (no account
// needed) with its own volume, the title opens the song in Spotify; click elsewhere on it to go back.
// Nothing plays until the record is pressed, and it stops when you close the card,
// scroll on or start the playlist. The words come from `transmission` in data/site.js.
import { useEffect, useRef, useState } from "react";
import { transmission } from "@/data/site";

export default function Transmission() {
  const root = useRef(null);
  const audio = useRef(null);
  const [open, setOpen] = useState(false);
  const [flicker, setFlicker] = useState(false);
  const [sound, setSound] = useState("none"); // none | ready | playing
  const [volume, setVolume] = useState(0.25);
  const timers = useRef([]);

  useEffect(() => {
    try {
      const v = parseFloat(localStorage.getItem("volume"));
      if (v >= 0 && v <= 1) setVolume(v);
    } catch {}
    const stop = () => audio.current?.pause();
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && stop());
    io.observe(root.current);
    window.addEventListener("music:start", stop);
    return () => {
      timers.current.forEach(clearTimeout);
      io.disconnect();
      window.removeEventListener("music:start", stop);
      stop();
      audio.current = null;
    };
  }, []);

  // The first time the card opens, find the song's preview.
  function load() {
    if (audio.current || !transmission.previewId) return;
    const a = new Audio();
    a.preload = "auto";
    a.volume = volume;
    const still = () => audio.current === a;
    a.addEventListener("loadedmetadata", () => still() && setSound("ready"));
    a.addEventListener("playing", () => still() && setSound("playing"));
    a.addEventListener("pause", () => still() && setSound("ready"));
    a.addEventListener("error", () => still() && setSound("none"));
    audio.current = a;
    fetch(`https://itunes.apple.com/lookup?id=${transmission.previewId}&country=CA`)
      .then((r) => r.json())
      .then((j) => {
        const src = j.results?.[0]?.previewUrl;
        if (src && still()) a.src = src;
      })
      .catch(() => still() && (audio.current = null)); // try again next time
  }

  function play() {
    const a = audio.current;
    if (!a) return;
    if (!a.paused) {
      a.pause();
      return;
    }
    window.dispatchEvent(new Event("quote:start"));
    a.play().catch(() => {});
  }

  function changeVolume(e) {
    const v = Number(e.target.value) / 100;
    setVolume(v);
    if (audio.current) audio.current.volume = v;
    try {
      localStorage.setItem("volume", String(v));
    } catch {}
  }

  function toggle() {
    if (flicker) return;
    if (open) audio.current?.pause();
    else load();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setOpen((o) => !o);
      return;
    }
    setFlicker(true);
    timers.current = [setTimeout(() => setOpen((o) => !o), 260), setTimeout(() => setFlicker(false), 520)];
  }

  const playing = sound === "playing";
  return (
    <div ref={root} className={`transmission hero-fade ${open ? "is-open" : ""} ${flicker ? "is-flicker" : ""} ${playing ? "is-playing" : ""}`}>
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
            <button
              type="button"
              className="transmission-play"
              onClick={play}
              disabled={sound === "none"}
              aria-label={`${playing ? "Pause" : "Play"} a preview of ${transmission.song}`}
            >
              <span className="transmission-disc" aria-hidden="true" />
              {sound === "none" ? null : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 4.5v15l12-7.5z" />}
                </svg>
              )}
            </button>
            <span className="transmission-song">
              <a href={transmission.url} target="_blank" rel="noreferrer" aria-label={`${transmission.song} by ${transmission.artist}, open in Spotify`}>
                {transmission.song} <span aria-hidden="true">↗</span>
              </a>
              <span>{transmission.artist}</span>
              {sound === "none" ? null : (
                <>
                  <span className="transmission-volume">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9z" />{volume > 0 ? <path d="M14.5 8.2a5 5 0 0 1 0 7.6l1.2 1.4a7 7 0 0 0 0-10.4z" /> : null}</svg>
                    <input type="range" min="0" max="100" step="1" value={Math.round(volume * 100)} onChange={changeVolume} style={{ "--v": `${Math.round(volume * 100)}%` }} aria-label="Volume" />
                  </span>
                  <small>Preview courtesy of iTunes</small>
                </>
              )}
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
