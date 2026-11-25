// The one smooth-scroll instance, so any component can pause it (e.g. while a
// card is zoomed in) or scroll to a chapter.
let lenis = null;
let gliding = false;
export const setLenis = (l) => {
  lenis = l;
  gliding = false;
};
export const pauseScroll = () => lenis?.stop();
export const resumeScroll = () => lenis?.start();

// One scroll gesture follows the star: glides between the opening and About, and
// ignores further scrolling until it lands.
export const isGliding = () => gliding;
export function glide(target, offset = 0) {
  if (!lenis || lenis.isStopped) return false;
  gliding = true;
  setTimeout(() => (gliding = false), 2500); // in case it is interrupted
  lenis.scrollTo(target, {
    offset,
    duration: 2.1,
    easing: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
    lock: true,
    force: true,
    onComplete: () => (gliding = false),
  });
  return true;
}

export function scrollToId(id) {
  let el = document.getElementById(id);
  if (!el) return false;
  // The skills marker is hidden in the one-column layout; go to the stats themselves.
  if (!el.getClientRects().length) el = document.querySelector(`[data-anchor="${id}"]`) || el;
  if (lenis) lenis.scrollTo(el, { offset: id === "intro" ? 0 : -40, duration: 1.3, force: gliding, onComplete: () => (gliding = false) });
  else el.scrollIntoView();
  return true;
}
