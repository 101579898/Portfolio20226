"use client";

// The original TV boot sequence: NO SIGNAL -> Start -> boot log -> BOOTING...
// then the screen goes dark and the portfolio fades in. It only finishes once the
// site is really ready (lib/ready.js): until then it shows "Setting up assets" with
// a progress bar. It plays once per browser session; Skip skips the animation.

import { useEffect, useRef, useState } from "react";
import { pauseScroll, resumeScroll } from "@/lib/scroll";
import { watchReady, allReady, readyShare, isReady, PART_NAMES } from "@/lib/ready";

const GIVE_UP_MS = 20000; // after this long, open anyway rather than keep anyone waiting

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
  const [waiting, setWaiting] = useState(false); // the boot log is done; assets are still setting up
  const [share, setShare] = useState(0);
  const [loaded, setLoaded] = useState([]);
  const wantsFinish = useRef(false);
  // The page arrives before its code does. Until the code is running the buttons would
  // do nothing, so the screen says it is tuning in instead of showing them.
  const [live, setLive] = useState(false);
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
    setLive(true);
    setSiteInert(true);
    pauseScroll();
    watchReady();
    const onProgress = (e) => {
      setShare(readyShare());
      setLoaded((all) => (all.includes(e.detail) ? all : [...all, e.detail]));
      if (allReady() && wantsFinish.current) {
        wantsFinish.current = false;
        timers.current.push(setTimeout(finish, 900));
      }
    };
    window.addEventListener("portfolio:progress", onProgress);
    setShare(readyShare());
    setLoaded(Object.keys(PART_NAMES).filter(isReady));
    requestAnimationFrame(() => startBtn.current?.focus({ preventScroll: true }));
    return () => {
      window.removeEventListener("portfolio:progress", onProgress);
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

  // The boot log has finished: open now if everything is ready, otherwise wait for it.
  function whenReady() {
    if (allReady()) {
      finish();
      return;
    }
    setWaiting(true);
    wantsFinish.current = true;
    timers.current.push(
      setTimeout(() => {
        wantsFinish.current = false;
        finish();
      }, GIVE_UP_MS)
    );
  }

  // Skip: jump past the animation, but still only open once the site is ready.
  function skip() {
    if (leaving) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (phase === "start") setPhase("boot");
    setLines(bootLines);
    setShowTitle(true);
    whenReady();
  }

  function start() {
    setPhase("boot");
    // Print one line every 130ms, then the big BOOTING... title.
    bootLines.forEach((line, i) => {
      timers.current.push(setTimeout(() => setLines((all) => [...all, line]), LINE_MS * (i + 1)));
    });
    const end = LINE_MS * (bootLines.length + 1);
    timers.current.push(setTimeout(() => setShowTitle(true), end));
    timers.current.push(setTimeout(whenReady, end + 1100));
  }

  if (phase === "done") return null;

  return (
    <div className={`boot ${leaving ? "is-leaving" : ""}`} role="dialog" aria-modal="true" aria-label="Portfolio start screen">
      <div className="boot-tv">
        {phase === "start" ? (
          <div className="boot-start">
            <p className="boot-blink">{live ? "NO SIGNAL" : "TUNING IN..."}</p>
            {live ? (
              <button ref={startBtn} className="boot-btn" onClick={start}>Start</button>
            ) : (
              <div className="boot-bar is-tuning" aria-hidden="true"><span /></div>
            )}
          </div>
        ) : (
          <div className="boot-run">
            <pre className="boot-log" aria-live="polite">{lines.join("\n")}</pre>
            {showTitle && !waiting ? <p className="boot-title">BOOTING...</p> : null}
            {waiting ? (
              <div className="boot-wait">
                <p className="boot-title is-small">SETTING UP ASSETS</p>
                <div className="boot-bar" role="progressbar" aria-label="Setting up the portfolio" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(share * 100)}>
                  <span style={{ "--share": share }} />
                </div>
                <ul className="boot-parts">
                  {Object.entries(PART_NAMES).map(([key, name]) => (
                    <li key={key} className={loaded.includes(key) ? "is-done" : ""}>
                      {name} {".".repeat(Math.max(2, 18 - name.length))} <span>{loaded.includes(key) ? "ok" : "loading"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
        {live ? <button className="boot-skip" onClick={skip}>Skip &gt;</button> : null}
      </div>
    </div>
  );
}
