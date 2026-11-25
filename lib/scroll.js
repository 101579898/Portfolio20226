// The one smooth-scroll instance, so any component can pause it (e.g. while a
// card is zoomed in) or scroll to a chapter.
let lenis = null;
let flight = null; // the glide happening right now: { to, began, ends }
export const setLenis = (l) => {
  lenis = l;
  flight = null;
};
export const pauseScroll = () => lenis?.stop();
export const resumeScroll = () => lenis?.start();

// The glide that follows the star. It never locks the page: if anything interrupts it,
// it simply counts as over when its time is up.
export function gliding() {
  if (flight && performance.now() > flight.ends) flight = null;
  return flight;
}
export function glide(to, duration = 3.2) {
  if (!lenis || lenis.isStopped) return false;
  const now = performance.now();
  const mine = { to, began: now, ends: now + duration * 1000 + 250 };
  flight = mine;
  lenis.scrollTo(to, {
    duration,
    easing: (t) => (1 - Math.cos(Math.PI * t)) / 2,
    force: true,
    onComplete: () => {
      if (flight === mine) flight = null;
    },
  });
  return true;
}

export function scrollToId(id) {
  let el = document.getElementById(id);
  if (!el) return false;
  // The skills marker is hidden in the one-column layout; go to the stats themselves.
  if (!el.getClientRects().length) el = document.querySelector(`[data-anchor="${id}"]`) || el;
  flight = null;
  if (lenis) lenis.scrollTo(el, { offset: id === "intro" ? 0 : -40, duration: 1.7, force: true });
  else el.scrollIntoView();
  return true;
}
