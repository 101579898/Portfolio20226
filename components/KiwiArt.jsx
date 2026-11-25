// Kiwi on screen. Her pixels come from lib/kiwi.js.
//   eyesRef – lets StarPal move her eyes toward the pointer
//   aura    – the scattered pixels of light around her
import { N, K, EYES, EYE_Y, NOSE, MOUTH, kiwiPixel, auraPixel } from "@/lib/kiwi";

// Merge neighbouring pixels of one colour into rows of rectangles.
const rows = [];
for (let y = 0; y < N; y++) {
  for (let x = 0; x < N; ) {
    const fill = kiwiPixel(x, y);
    let w = 1;
    while (x + w < N && kiwiPixel(x + w, y) === fill) w++;
    if (fill) rows.push({ x, y, w, fill });
    x += w;
  }
}
const glow = [];
for (let y = -7; y < N + 7; y++)
  for (let x = -7; x < N + 7; x++) {
    const a = auraPixel(x, y);
    if (a) glow.push({ x, y, fill: a[0], o: Math.round(a[1] * 100) / 100 });
  }

export default function KiwiArt({ eyesRef, aura = false, ...props }) {
  return (
    <svg viewBox="0 0 30 30" shapeRendering="crispEdges" aria-hidden="true" {...props}>
      {aura ? (
        <g className="kiwi-aura">
          {glow.map((p) => <rect key={`${p.x}.${p.y}`} x={p.x} y={p.y} width={1} height={1} fill={p.fill} opacity={p.o} />)}
        </g>
      ) : null}
      {rows.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w + 0.02} height={1.02} fill={r.fill} />
      ))}
      <g className="pal-awake" ref={eyesRef}>
        {EYES.map((x) => (
          <g key={x} className="pal-eye">
            <rect x={x} y={EYE_Y} width={2} height={3} fill={K.ink} />
            <rect x={x} y={EYE_Y} width={1} height={1} fill="#fff" />
          </g>
        ))}
      </g>
      <g className="pal-asleep" fill={K.ink}>
        {EYES.map((x) => (
          <g key={x}>
            {[[-1, 2], [0, 1], [1, 1], [2, 2]].map(([dx, dy]) => <rect key={dx} x={x + dx} y={EYE_Y + dy} width={1} height={1} />)}
          </g>
        ))}
      </g>
      {NOSE.map(([x, y]) => <rect key={x} x={x} y={y} width={1} height={1} fill={K.nose} />)}
      <g className="pal-mouth" fill={K.ink}>
        {MOUTH.map(([x, y]) => <rect key={x} x={x} y={y} width={1} height={1} />)}
      </g>
      <g className="pal-smile">
        <rect x={13} y={19} width={4} height={1} fill={K.ink} />
        <rect x={14} y={20} width={2} height={1} fill={K.nose} />
      </g>
    </svg>
  );
}
