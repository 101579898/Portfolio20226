"use client";

// CRT scanlines over the whole site, plus the little TV switch that turns
// the static on and off. The choice is remembered on this device.
import { useEffect, useState } from "react";

export default function Scanlines() {
  const [on, setOn] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem("static") === "off") setOn(false);
    } catch {}
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    try {
      localStorage.setItem("static", next ? "on" : "off");
    } catch {}
  }

  return (
    <>
      {on ? <div className="scanlines" aria-hidden="true" /> : null}
      <button className={`static-switch ${on ? "" : "off"}`} onClick={toggle} aria-pressed={on}>
        STATIC <span className="slot"><span className="knob" /></span>
      </button>
    </>
  );
}
