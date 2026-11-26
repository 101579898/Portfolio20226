// Keeps track of what the opening needs before it can be shown smoothly, so the boot
// screen can wait for it: the pictures (the browser's load event), the fonts, and the
// 3D star (ready once its graphics are prepared, or straight away when it is not used).
const parts = { page: false, fonts: false, star: false };
export const PART_NAMES = { page: "cosmos images", fonts: "fonts", star: "shooting star" };

export function markReady(name) {
  if (parts[name]) return;
  parts[name] = true;
  window.dispatchEvent(new CustomEvent("portfolio:progress", { detail: name }));
}

export const isReady = (name) => parts[name];
export const allReady = () => Object.values(parts).every(Boolean);
export const readyShare = () => Object.values(parts).filter(Boolean).length / Object.keys(parts).length;

// Starts watching the page and the fonts (the star reports in from Journey.jsx).
export function watchReady() {
  if (document.readyState === "complete") markReady("page");
  else window.addEventListener("load", () => markReady("page"), { once: true });
  if (document.fonts?.ready) document.fonts.ready.then(() => markReady("fonts"), () => markReady("fonts"));
  else markReady("fonts");
}
