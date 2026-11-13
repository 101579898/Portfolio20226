"use client";

// One collectible project card. With `tilt`, it leans toward the pointer
// and a holographic sheen follows it ("3D, but not really").
import { useRef } from "react";
import { asset } from "@/lib/asset";

export default function ProjectCard({ project, index, total, tilt = false, badge }) {
  const ref = useRef(null);

  function onMove(e) {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    if (tilt && e.pointerType === "mouse") {
      el.style.setProperty("--ry", `${(x - 0.5) * 16}deg`);
      el.style.setProperty("--rx", `${(0.5 - y) * 16}deg`);
    }
  }
  function onLeave() {
    const el = ref.current;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  }

  return (
    <article
      ref={ref}
      className="card"
      style={{ "--hue": project.hue }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <header className="card-head">
        <span className="card-type">{project.type}</span>
        <span className="card-no">
          {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
      </header>
      <h3 className="card-title">{project.title}</h3>
      <div className="card-art">
        {project.image ? (
          <img src={asset(project.image)} alt="" draggable="false" />
        ) : (
          <div className="card-art-empty" aria-hidden="true">
            <span />
          </div>
        )}
        {badge ? <span className="card-badge">{badge}</span> : null}
      </div>
      <dl className="card-rows">
        <div><dt>Role</dt><dd>{project.role}</dd></div>
        <div><dt>Tools</dt><dd>{project.tools.join(" · ")}</dd></div>
      </dl>
      <p className="card-text">{project.summary}</p>
      <footer className="card-foot">
        <span>{project.year}</span>
        <span>KGL · VOL.01</span>
      </footer>
      <span className="card-sheen" aria-hidden="true" />
    </article>
  );
}
