"use client";

// Chapter 04: the playlist. A turntable drawn in CSS, driven by Spotify's official
// player: its play button really plays, the record turns only while music plays,
// and the ring shows the real position in the track. Skipping songs is done in the
// Spotify panel itself, because Spotify does not offer that to web pages.
// Nothing plays on its own, and nothing loads from Spotify until you are near.
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import Decode from "./Decode";
import Waves from "./Waves";
import { loadSpotify, spotifyUri } from "@/lib/spotify";
import { music } from "@/data/site";

const clock = (ms) => {
  const s = Math.max(0, Math.floor((ms || 0) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function Music() {
  const root = useRef(null);
  const host = useRef(null);
  const controller = useRef(null);
  const energy = useRef(0);
  const ring = useRef(null);
  const time = useRef(null);
  const [status, setStatus] = useState("waiting"); // waiting | loading | ready | failed
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  // Load the player when the section is close.
  useEffect(() => {
    let gone = false;
    let timer = 0;

    function setUp() {
      setStatus("loading");
      timer = setTimeout(() => !gone && setStatus((s) => (s === "loading" ? "failed" : s)), 12000);
      loadSpotify()
        .then((api) => {
          if (gone || !host.current) return;
          // Spotify replaces this element with its player, so it must not belong to React.
          const slot = document.createElement("div");
          host.current.replaceChildren(slot);
          api.createController(slot, { uri: spotifyUri(music.url), width: "100%", height: 352 }, (c) => {
            if (gone) {
              c.destroy();
              return;
            }
            controller.current = c;
            const frame = host.current.querySelector("iframe");
            if (frame) frame.title = `Spotify playlist: ${music.title}`;
            c.addListener("ready", () => {
              clearTimeout(timer);
              if (!gone) setStatus("ready");
            });
            c.addListener("playback_update", ({ data }) => {
              if (gone) return;
              const on = !data.isPaused && !data.isBuffering;
              energy.current = on ? 1 : 0;
              setPlaying(!data.isPaused);
              if (!data.isPaused) setStarted(true);
              const part = data.duration ? data.position / data.duration : 0;
              ring.current?.style.setProperty("--p", part.toFixed(4));
              if (time.current) time.current.textContent = data.duration ? `${clock(data.position)} / ${clock(data.duration)}` : "";
            });
          });
        })
        .catch(() => {
          clearTimeout(timer);
          if (!gone) setStatus("failed");
        });
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setUp();
      },
      { rootMargin: "500px 0px" }
    );
    io.observe(root.current);
    return () => {
      gone = true;
      clearTimeout(timer);
      io.disconnect();
      energy.current = 0;
      try {
        controller.current?.destroy();
      } catch {}
      controller.current = null;
    };
  }, []);

  function toggle() {
    const c = controller.current;
    if (!c) return;
    if (playing) c.pause();
    else if (started) c.resume();
    else c.play();
  }

  const said =
    status === "failed"
      ? "The player could not load here."
      : status !== "ready"
        ? "Tuning in…"
        : playing
          ? "Now playing"
          : started
            ? "Paused"
            : "Ready when you are";

  return (
    <section className="music" id="music" ref={root} aria-labelledby="music-title">
      <Waves energy={energy} />
      <div className="chapter">
        <div className="chapter-head">
          <Decode text="Music / Playlist" />
        <Decode text="Chapter 04" />
        </div>
        <Reveal as="h2" id="music-title" className="display center">What I listen to.</Reveal>

        <div className={`deck ${playing ? "is-playing" : ""} is-${status}`}>
          <div className="turntable lit">
            <div className="platter" ref={ring}>
              <svg className="platter-ring" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="48.4" />
                <circle className="on" cx="50" cy="50" r="48.4" pathLength="1" />
              </svg>
              <div className="record" aria-hidden="true">
                <span className="record-label">
                  <svg viewBox="0 0 100 100"><path d="M50 4 Q52 48 96 50 Q52 52 50 96 Q48 52 4 50 Q48 48 50 4 Z" /></svg>
                </span>
              </div>
              <span className="record-shine" aria-hidden="true" />
            </div>
            <span className="arm" aria-hidden="true"><i /></span>
            <div className="turntable-bar">
              <button className="play" onClick={toggle} disabled={status !== "ready"} aria-label={playing ? "Pause the playlist" : "Play the playlist"}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 4.5v15l12-7.5z" />}
                </svg>
              </button>
              <div>
                <strong>{music.title}</strong>
                <p role="status">{said}</p>
              </div>
              <span className="turntable-time" ref={time} aria-hidden="true" />
            </div>
          </div>

          <div className="win playlist-win">
            <div className="win-bar" aria-hidden="true"><span>{music.title.toLowerCase()}.playlist</span><i /><i /><i /></div>
            <div className="playlist-body">
              <div className="playlist-host" ref={host} />
              {status === "failed" ? (
                <div className="playlist-fallback">
                  <p>Spotify didn't load here. You can still hear it there.</p>
                  <a className="btn primary" href={music.url} target="_blank" rel="noreferrer">Open the playlist <span aria-hidden="true">↗</span></a>
                </div>
              ) : status !== "ready" ? (
                <p className="playlist-loading label">Loading playlist…</p>
              ) : null}
            </div>
          </div>
        </div>

        <p className="music-note">
          Plays only when you press play. Choose songs in the list, or{" "}
          <a href={music.url} target="_blank" rel="noreferrer">open it in Spotify</a>.
        </p>
      </div>
    </section>
  );
}
