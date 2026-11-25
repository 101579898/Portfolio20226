// Kiwi on screen. Her pixels come from lib/kiwi.js.
//   eyesRef – lets StarPal move her eyes toward the pointer
//   aura    – the scattered pixels of light around her
import { N, EYES, ASLEEP, NOSE, MOUTH, SMILE, kiwiPixel, auraPixel } from "@/lib/kiwi";

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
for (let y = -6; y < N + 6; y++)
  for (let x = -6; x < N + 6; x++) {
    const a = auraPixel(x, y);
    if (a) glow.push({ x, y, fill: a[0], o: Math.round(a[1] * 100) / 100 });
  }
const draw = (list) => list.map(([x, y, w, h, fill], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />);

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
        {EYES.map((eye, i) => <g key={i} className="pal-eye">{draw(eye)}</g>)}
      </g>
      <g className="pal-asleep">
        {ASLEEP.map((eye, i) => <g key={i}>{draw(eye)}</g>)}
      </g>
      {draw(NOSE)}
      <g className="pal-mouth">{draw(MOUTH)}</g>
      <g className="pal-smile">{draw(SMILE)}</g>
    </svg>
  );
}
