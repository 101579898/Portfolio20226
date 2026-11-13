"use client";

// The original TV boot sequence: NO SIGNAL -> Start -> boot log -> BOOTING...
// then the screen "powers on" into the portfolio.
// It plays once per browser session and can be skipped.
import { useEffect, useRef, useState } from "react";

// The text that "types" during boot. Edit these however you like.
const bootLines = [
  "system check ............ ok",
  "loading memory .......... ok",
  "loading example work .... ok",
  "data restoration in progress",
  "booting, please wait...",
];

export default function BootScreen() {
  const [phase, setPhase] = useState("start"); // start | boot | done
  const [lines, setLines] = useState([]);
  const [showTitle, setShowTitle] = useState(false);
  const [leaving, setLeaving] = useState(false); // the TV is expanding to full screen
  const startBtn = useRef(null);
  const timers = useRef([]);

  // Everything behind the boot screen is switched off while it shows.
  function setSiteInert(on) {
    document.querySelectorAll("#main > *:not(.boot), .nav, .pal, .static-switch").forEach((el) => {
      if (on) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  }

  useEffect(() => {
    if (document.documentElement.dataset.booted) {
      setPhase("done");
      return;
    }
    setSiteInert(true);
    startBtn.current?.focus({ preventScroll: true });
    return () => {
      timers.current.forEach(clearTimeout);
      setSiteInert(false);
    };
  }, []);

  // Step 1: the TV screen grows out to the edges of the window.
  function finish() {
    if (leaving) return;
    timers.current.forEach(clearTimeout);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLeaving(true);
    timers.current.push(setTimeout(turnOn, reduce ? 0 : 750));
  }

  // Step 2: the picture comes on and the portfolio is revealed.
  function turnOn() {
    setSiteInert(false);
    window.scrollTo(0, 0);
    const root = document.documentElement;
    root.dataset.booted = "1";
    try {
      sessionStorage.setItem("booted", "1");
    } catch {}
    // TV turning on: the picture flashes bright and settles.
    root.classList.add("power-on");
    setTimeout(() => root.classList.remove("power-on"), 700);
    setPhase("done");
    window.dispatchEvent(new Event("portfolio:booted"));
  }

  function start() {
    setPhase("boot");
    // Print one line every 400ms, then the big BOOTING... title.
    bootLines.forEach((line, i) => {
      timers.current.push(setTimeout(() => setLines((all) => [...all, line]), 400 * (i + 1)));
    });
    const end = 400 * (bootLines.length + 1);
    timers.current.push(setTimeout(() => setShowTitle(true), end));
    timers.current.push(setTimeout(finish, end + 500));
  }

  if (phase === "done") return null;

  return (
    <div className={`boot ${leaving ? "is-leaving" : ""}`} role="dialog" aria-modal="true" aria-label="Portfolio start screen">
      <div className="boot-tv">
        {phase === "start" ? (
          <div className="boot-start">
            <p className="boot-blink">NO SIGNAL</p>
            <button ref={startBtn} className="boot-btn" onClick={start}>Start</button>
          </div>
        ) : (
          <div className="boot-run">
            <pre className="boot-log" aria-live="polite">{lines.join("\n")}</pre>
            {showTitle ? <p className="boot-title">BOOTING...</p> : null}
          </div>
        )}
        <button className="boot-skip" onClick={finish}>Skip &gt;</button>
      </div>
    </div>
  );
}
