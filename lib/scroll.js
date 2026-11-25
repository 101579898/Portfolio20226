// The one smooth-scroll instance, so any component can pause it (e.g. while a
// card is zoomed in) or scroll to a chapter.
let lenis = null;
export const setLenis = (l) => {
  lenis = l;
};
export const pauseScroll = () => lenis?.stop();
export const resumeScroll = () => lenis?.start();

export function scrollToId(id) {
  let el = document.getElementById(id);
  if (!el) return false;
  // The skills marker is hidden in the one-column layout; go to the stats themselves.
  if (!el.getClientRects().length) el = document.querySelector(`[data-anchor="${id}"]`) || el;
  if (lenis) lenis.scrollTo(el, { offset: id === "intro" ? 0 : -40, duration: 1.3 });
  else el.scrollIntoView();
  return true;
}
