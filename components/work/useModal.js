"use client";

// While a modal is open: hold the page still and switch off everything behind it.
import { useEffect } from "react";
import { pauseScroll, resumeScroll } from "@/lib/scroll";

const BEHIND = "#main, .nav, .pal, .static-switch, .star-rail, .skip";

export default function useModal() {
  useEffect(() => {
    const behind = document.querySelectorAll(BEHIND);
    behind.forEach((el) => el.setAttribute("inert", ""));
    pauseScroll();
    return () => {
      behind.forEach((el) => el.removeAttribute("inert"));
      resumeScroll();
    };
  }, []);
}
