// The work pack is always in exactly one of these states. `next` lists where each
// state may go, so a double click or a stray drag can never start a second animation.
//
//   sealed → interacting → opening → revealing → collection ⇄ detail
//
export const NEXT = {
  sealed: ["interacting", "opening", "collection"],
  interacting: ["sealed", "opening"],
  opening: ["revealing", "collection"],
  revealing: ["collection"],
  collection: ["detail", "sealed"],
  detail: ["collection"],
};

export const canGo = (from, to) => NEXT[from].includes(to);
export const phaseReducer = (state, to) => (canGo(state, to) ? to : state);

// How the cards fan out as they leave the pack. The 3D scene and the HTML cards
// both use this, so one can hand over to the other without a visible jump.
// Values are in CSS pixels / degrees, from the middle of the stage.
export function fanPose(i, total) {
  const m = i - (total - 1) / 2;
  return { x: m * 30, y: Math.abs(m) * 9, rotation: m * 7 };
}

// Size of a card while it is in the pack (CSS pixels at full scale).
export const PACK = { w: 290, h: 459, cardW: 252, cardH: 353 };
