// Shared state between the scroll journey and the starfield canvas.
// The journey writes these values as you scroll; the starfield reads them every frame.
export const space = {
  warp: 0, // 0 = calm stars, 1 = full warp streaks
  digi: 1, // 0 = normal space, 1 = "digi-space" (grid + cooler stars)
  cometP: 0, // where the shooting star is along its path (0-1)
  cometA: 0, // shooting star opacity
};

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// The shooting star spirals in from the top right toward the centre of the screen.
// Returns x and y as a fraction of the screen, plus a size multiplier.
export function cometPath(p) {
  const t = clamp(p);
  const angle = t * Math.PI * 2 * 1.1 + 0.4;
  const reach = Math.pow(1 - t, 1.2);
  return {
    x: 0.5 + 0.38 * Math.cos(angle) * reach,
    y: 0.22 + 0.28 * t + 0.16 * Math.sin(angle) * (1 - t),
    s: 1 - 0.85 * t * t,
  };
}
