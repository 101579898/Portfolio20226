// A project's case study, drawn entirely from its entry in data/site.js.
// Used both when a card opens into a project and on the project's own page.
// Any part with no content is left out.
import { asset } from "@/lib/asset";

const url = (href) => (/^https?:/.test(href) ? href : asset(href));
const id = (p, s) => `${p.slug}-${s}`;

function Links({ project }) {
  if (!project.links?.length) return null;
  return (
    <div className="case-links">
      {project.links.map((l, i) => (
        <a key={l.href} className={`btn ${i ? "" : "primary"}`} href={url(l.href)} target="_blank" rel="noreferrer">
          {l.label} <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}

export default function CaseStudy({ project: p, titleId }) {
  return (
    <article className="case" style={{ "--hue": p.hue }}>
      <header className="case-top">
        <p className="pill">{[p.type, p.year].filter(Boolean).join(" · ")}</p>
        <h1 className="display" id={titleId}>{p.title}</h1>
        <p className="lede">{p.intro || p.summary}</p>
      </header>

      <div className="case-scene">
        <figure className="case-hero" data-hero>
          <img src={asset(p.image)} alt={p.alt || ""} />
        </figure>
        <div className="case-side left">
          {p.role ? (
            <section className="case-panel lit" data-in aria-labelledby={id(p, "role")}>
              <h2 id={id(p, "role")}>My role</h2>
              <p>{p.role}</p>
            </section>
          ) : null}
          {p.responsibilities?.length ? (
            <section className="case-panel lit" data-in aria-labelledby={id(p, "resp")}>
              <h2 id={id(p, "resp")}>What I did</h2>
              <ul className="case-list">
                {p.responsibilities.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </section>
          ) : null}
        </div>
        <div className="case-side right">
          {p.objective ? (
            <section className="case-panel lit" data-in aria-labelledby={id(p, "goal")}>
              <h2 id={id(p, "goal")}>{p.objectiveTitle || "The problem"}</h2>
              <p>{p.objective}</p>
            </section>
          ) : null}
          {p.tools?.length ? (
            <section className="case-panel lit" data-in aria-labelledby={id(p, "tools")}>
              <h2 id={id(p, "tools")}>Tools</h2>
              <ul className="chips">{p.tools.map((t) => <li key={t}>{t}</li>)}</ul>
            </section>
          ) : null}
          <div data-in><Links project={p} /></div>
        </div>
      </div>

      {p.process?.length ? (
        <section className="case-block" aria-labelledby={id(p, "process")}>
          <h2 className="case-h" id={id(p, "process")}>{p.processTitle || "The process"}</h2>
          <ol className="case-steps">
            {p.process.map((s, i) => (
              <li key={s.title} className={!s.image ? "no-image" : s.tall ? "is-tall" : undefined}>
                <div>
                  <span className="case-step-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
                {s.image ? <img src={asset(s.image)} alt={s.alt || ""} loading="lazy" /> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {p.palette ? (
        <section className="case-block case-palette" aria-labelledby={id(p, "pal")}>
          <div>
            <h2 className="case-h" id={id(p, "pal")}>{p.palette.title}</h2>
            <p>{p.palette.text}</p>
            {p.palette.credit ? <small>{p.palette.credit}</small> : null}
          </div>
          <ul>
            {p.palette.colors.map((c) => (
              <li key={c.hex}>
                <span style={{ background: c.hex }} aria-hidden="true" />
                <strong>{c.name}</strong>
                <code>{c.hex}</code>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {p.screens?.items?.length ? (
        <section className="case-block" aria-labelledby={id(p, "scr")}>
          <h2 className="case-h" id={id(p, "scr")}>{p.screens.title}</h2>
          <ul className="case-screens">
            {p.screens.items.map((x) => (
              <li key={x.title}>
                <img src={asset(x.image)} alt={x.alt} loading="lazy" />
                <h3>{x.title}</h3>
                <p>{x.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {p.decisions?.length ? (
        <section className="case-block" aria-labelledby={id(p, "dec")}>
          <h2 className="case-h" id={id(p, "dec")}>Design decisions</h2>
          <ul className="case-decisions">
            {p.decisions.map((d) => (
              <li key={d.title} className="lit">
                <h3 className="deco">{d.title}</h3>
                <p>{d.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {p.gallery?.length ? (
        <section className="case-block" aria-labelledby={id(p, "gal")}>
          <h2 className="case-h" id={id(p, "gal")}>Gallery</h2>
          <ul className="case-gallery">
            {p.gallery.map((g) => (
              <li key={g.src}><img src={asset(g.src)} alt={g.alt} loading="lazy" /></li>
            ))}
          </ul>
        </section>
      ) : null}

      {p.outcome ? (
        <section className="case-outcome" aria-labelledby={id(p, "out")}>
          <h2 className="case-h" id={id(p, "out")}>The outcome</h2>
          <p>{p.outcome}</p>
          <Links project={p} />
        </section>
      ) : null}
    </article>
  );
}
