"use client";

// On a project's own page: remember it, so going back lands on that card in the
// collection instead of a sealed pack. Also skips the boot screen on the way back.
import { useEffect } from "react";

export default function RememberCard({ slug }) {
  useEffect(() => {
    try {
      sessionStorage.setItem("packFocus", JSON.stringify(slug));
      sessionStorage.setItem("booted", "1");
      document.documentElement.dataset.booted = "1";
    } catch {}
  }, [slug]);
  return null;
}
