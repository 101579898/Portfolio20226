// Shared state between the scroll journey and the 3D star scene.
// The journey writes these values as you scroll; the scene reads them every frame.
export const space = {
  p: 0, // journey progress: 0 = hero, 1 = arrived in digi-space
  intro: 0, // 0-1: the star flying in when the page opens
  active: true, // is the journey on screen? (the 3D scene sleeps when it is not)
  mx: 0, // pointer, -1 to 1 from the middle of the screen
  my: 0,
  sx: 0, // the star on screen, in pixels, and how visible it is (0-1)
  sy: 0,
  sa: 0,
};

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
