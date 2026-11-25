"use client";

// The original TV boot sequence: NO SIGNAL -> Start -> boot log -> BOOTING...
// then the screen goes dark and the portfolio fades in.
// It plays once per browser session and can be skipped.
import { useEffect, useRef, useState } from "react";
import { pauseScroll, resumeScroll } from "@/lib/scroll";

// The text that "types" during boot. Edit these however you like.
const bootLines = [
  "system check ............ ok",
  "loading memory .......... ok",
  "loading example work .... ok",
  "data restoration in progress",
  "booting, please wait...",
];

const LINE_MS = 210; // lower = faster boot

export default function BootScreen() {
  const [phase, setPhase] = useState("start"); // start | boot | done
  const [lines, setLines] = useState([]);
  const [showTitle, setShowTitle] = useState(false);
  const [leaving, setLeaving] = useState(false); // the TV is expanding to full screen
  const startBtn = useRef(null);
  const timers = useRef([]);

  // Everything behind the boot screen is switched off while it shows.
  function setSiteInert(on) {
    document.querySelectorAll("#main > *:not(.boot), .nav, .pal, .static-switch, .star-rail").forEach((el) => {
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
    pauseScroll();
    startBtn.current?.focus({ preventScroll: true });
    return () => {
      timers.current.forEach(clearTimeout);
      setSiteInert(false);
      resumeScroll();
    };
  }, []);

  // Step 1: the TV screen grows out to the edges of the window and goes dark.
  function finish() {
    if (leaving) return;
    timers.current.forEach(clearTimeout);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLeaving(true);
    if (reduce) {
      prepare();
      reveal(true);
      return;
    }
    timers.current = [setTimeout(prepare, 1000), setTimeout(() => reveal(false), 2100)];
  }

  // Step 2: while the screen is black, get the whole page ready underneath.
  function prepare() {
    const root = document.documentElement;
    root.classList.add("boot-hold");
    root.dataset.booted = "1";
    setSiteInert(false);
    window.scrollTo(0, 0);
    try {
      sessionStorage.setItem("booted", "1");
    } catch {}
    window.dispatchEvent(new Event("portfolio:rehearse"));
  }

  // Step 3: the black fades away and the opening begins.
  function reveal(atOnce) {
    document.documentElement.classList.replace("boot-hold", "boot-fade");
    requestAnimationFrame(() => requestAnimationFrame(() => window.dispatchEvent(new Event("portfolio:booted"))));
    timers.current = [
      setTimeout(() => {
        resumeScroll();
        setPhase("done");
      }, atOnce ? 60 : 1700),
    ];
  }

  function start() {
    setPhase("boot");
    // Print one line every 130ms, then the big BOOTING... title.
    bootLines.forEach((line, i) => {
      timers.current.push(setTimeout(() => setLines((all) => [...all, line]), LINE_MS * (i + 1)));
    });
    const end = LINE_MS * (bootLines.length + 1);
    timers.current.push(setTimeout(() => setShowTitle(true), end));
    timers.current.push(setTimeout(finish, end + 1100));
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
