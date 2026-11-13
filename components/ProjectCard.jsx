"use client";

// One collectible project card.
//   tilt     – the card leans toward the pointer in 3D and a shine slides across it
//   withBack – the card has a back face with the write-up
//   flipped  – show the back face (the card turns over in 3D)
import { useRef } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";

export default function ProjectCard({ project, index, total, tilt = false, withBack = false, flipped = false, badge }) {
  const ref = useRef(null);
  const number = `${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`;

  function onMove(e) {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    if (tilt && e.pointerType === "mouse") {
      el.style.setProperty("--ry", `${(x - 0.5) * 20}deg`);
      el.style.setProperty("--rx", `${(0.5 - y) * 20}deg`);
    }
  }
  function onLeave() {
    const el = ref.current;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  }

  return (
    <div
      ref={ref}
      className={`card3d ${flipped ? "is-flipped" : ""}`}
      style={{ "--hue": project.hue }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="card3d-inner">
        {/* FRONT */}
        <article className="card card-front" inert={withBack && flipped}>
          <header className="card-head">
            <span className="card-type">{project.type}</span>
            <span className="card-no">{number}</span>
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
            <span>{withBack ? "Tap to flip" : "KGL · VOL.01"}</span>
          </footer>
          <span className="card-sheen" aria-hidden="true" />
        </article>

        {/* BACK */}
        {withBack ? (
          <div className="card card-back" inert={!flipped}>
            <header className="card-head">
              <span className="card-type">Case file</span>
              <span className="card-no">{number}</span>
            </header>
            <h3 className="card-title">{project.title}</h3>
            <p className="card-back-text">{project.summary}</p>
            <ol className="card-back-list">
              {project.did.slice(0, 3).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <Link className="btn primary" href={`/work/${project.slug}/`}>
              Open case file →
            </Link>
            <footer className="card-foot">
              <span>{project.year}</span>
              <span>Tap to flip back</span>
            </footer>
          </div>
        ) : null}
      </div>
    </div>
  );
}
