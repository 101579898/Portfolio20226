"use client";

// Draws a picture from public/img as chunky purple pixels inside a frame,
// with little "tracking" tags on top. Purely decorative.
//   <PixelArt src="/img/planet.svg" tags={[{ text: "orbit_12 0.97", style: { top: "10%", left: "8%" } }]} />
import { useEffect, useRef } from "react";
import { asset } from "@/lib/asset";

export default function PixelArt({ src, tags = [], className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const picture = new Image();
    picture.onload = () => {
      const w = picture.width;
      const h = picture.height;
      const block = Math.max(1, Math.round(w / 50)); // bigger number = smaller pixels

      // 1. Shrink the picture onto a tiny hidden canvas
      const small = document.createElement("canvas");
      small.width = Math.ceil(w / block);
      small.height = Math.ceil(h / block);
      small.getContext("2d").drawImage(picture, 0, 0, small.width, small.height);

      // 2. Stretch it back up without smoothing = chunky pixels, in grey
      const p = canvas.getContext("2d");
      canvas.width = w;
      canvas.height = h;
      p.imageSmoothingEnabled = false;
      p.filter = "grayscale(1) brightness(1.3)";
      p.drawImage(small, 0, 0, w, h);
      p.filter = "none";

      // 3. Tint it purple
      p.globalCompositeOperation = "multiply";
      p.fillStyle = "#b98cff";
      p.fillRect(0, 0, w, h);

      // 4. Keep see-through parts of the picture see-through
      p.globalCompositeOperation = "destination-in";
      p.drawImage(small, 0, 0, w, h);
    };
    picture.src = asset(src);
  }, [src]);

  return (
    <div className={`frame ${className}`} aria-hidden="true">
      <canvas ref={ref} className="pixel" />
      {tags.map((tag) => (
        <span key={tag.text} className="tag" style={tag.style}>{tag.text}</span>
      ))}
    </div>
  );
}
