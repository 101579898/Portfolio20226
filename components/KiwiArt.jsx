// Kiwi: a little pixel kitten living inside a glowing star. Drawn from maths on a
// 30 x 30 grid, so she stays crisp at any size.
//   eyesRef – lets StarPal move her eyes toward the pointer
const N = 30;
const C = {
  tip: "#fffaf0",
  glow: "#eee6c4",
  edge: "#c8c793",
  rim: "#dcb1c2",
  fur: "#a88bb0",
  furDark: "#7c5f8c",
  stripe: "#523560",
  muzzle: "#ecd3de",
  ear: "#dcb1c2",
  ink: "#17101f",
};

const star = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
  const r = i % 2 ? 7.6 : 14;
  return [15 + Math.cos(a) * r, 15.8 + Math.sin(a) * r];
});

// Signed distance to the star's outline: negative = inside.
function toStar(x, y) {
  let inside = false;
  let d = 99;
  for (let i = 0, j = 9; i < 10; j = i++) {
    const [ax, ay] = star[i];
    const [bx, by] = star[j];
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
    const t = Math.min(1, Math.max(0, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
    d = Math.min(d, Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)));
  }
  return inside ? -d : d;
}

function pixel(px, py) {
  const x = px + 0.5;
  const y = py + 0.5;
  const face = Math.hypot((x - 15) / 6.9, (y - 16.6) / 5.9);
  // ears
  const ex = Math.abs(x - 15);
  const ear = y >= 8 && y < 13 && ex > 2.4 && ex < 6.8 && ex - 4.7 < (y - 8) * 0.55 && 4.7 - ex < (y - 8) * 0.62;
  if (ear && face > 0.86) return y > 10 && Math.abs(ex - 4.7) < 0.9 ? C.ear : C.furDark;
  if (face < 1) {
    if (Math.hypot((x - 15) / 3, (y - 19.3) / 2.1) < 1) return C.muzzle;
    if (y < 14 && (Math.abs(x - 15) < 0.6 || (Math.abs(ex - 2.5) < 0.6 && y < 13))) return C.stripe; // forehead
    if (ex > 5.2 && (py === 17 || py === 19)) return C.stripe; // cheeks
    return face > 0.86 ? C.furDark : C.fur;
  }
  const d = toStar(x, y) - 0.9; // rounded outline
  if (d > 0) return null;
  if (d > -1) return C.rim;
  if (d > -2) return C.edge;
  return Math.hypot(x - 15, y - 15.8) > 9.5 ? C.tip : C.glow;
}

// Merge neighbouring pixels into rows of rectangles.
const rows = [];
for (let y = 0; y < N; y++) {
  for (let x = 0; x < N; ) {
    const fill = pixel(x, y);
    let w = 1;
    while (x + w < N && pixel(x + w, y) === fill) w++;
    if (fill) rows.push({ x, y, w, fill });
    x += w;
  }
}

export default function KiwiArt({ eyesRef, ...props }) {
  return (
    <svg viewBox="0 0 30 30" shapeRendering="crispEdges" aria-hidden="true" {...props}>
      {rows.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w + 0.02} height={1.02} fill={r.fill} />
      ))}
      <g className="pal-awake" ref={eyesRef}>
        {[10, 17].map((x) => (
          <g key={x} className="pal-eye">
            <rect x={x} y={15} width={3} height={3} fill={C.ink} />
            <rect x={x + 1} y={14} width={1} height={1} fill={C.ink} />
            <rect x={x + 1} y={15} width={1} height={1} fill="#fff" />
          </g>
        ))}
      </g>
      <g className="pal-asleep" fill={C.ink}>
        {[10, 17].map((x) => (
          <g key={x}>
            <rect x={x} y={16} width={1} height={1} />
            <rect x={x + 1} y={15} width={1} height={1} />
            <rect x={x + 2} y={16} width={1} height={1} />
          </g>
        ))}
      </g>
      <rect x={14.5} y={18} width={1} height={1} fill="#b8728f" />
      <g className="pal-mouth" fill={C.ink}>
        <rect x={13.5} y={19.5} width={1} height={0.8} />
        <rect x={14.5} y={19} width={1} height={0.8} />
        <rect x={15.5} y={19.5} width={1} height={0.8} />
      </g>
      <g className="pal-smile">
        <rect x={13.5} y={19} width={3} height={1} fill={C.ink} />
        <rect x={14} y={20} width={2} height={1} fill="#b8728f" />
      </g>
    </svg>
  );
}
