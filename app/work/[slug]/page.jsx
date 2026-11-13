// A project's "case file": floating glass panels over a glowing backdrop.
// One of these pages is generated for every project in data/site.js.
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/site";
import { asset } from "@/lib/asset";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return project ? { title: `${project.title} — Case file`, description: project.summary } : {};
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="case" style={{ "--hue": project.hue }}>
      <div className="case-aura" aria-hidden="true" />

      <nav className="case-nav" aria-label="Project navigation">
        <Link className="btn ghost" href="/#work">← Back to the pack</Link>
        <span className="label">
          Case file {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </span>
      </nav>

      <div className="case-board">
        <header className="case-title">
          <p className="pill">{project.type} · {project.year}</p>
          <h1 className="display glitch">
            {project.title} <span className="serif">overview</span>
          </h1>
        </header>

        <section className="case-panel case-summary" aria-labelledby="case-summary">
          <h2 id="case-summary">The project</h2>
          <p>{project.summary}</p>
          <ul className="chips" aria-label="Tools used">
            {project.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
          {project.link ? (
            <a className="btn primary" href={asset(project.link)} target="_blank" rel="noreferrer">
              {project.linkLabel || "View the full project"}
            </a>
          ) : null}
        </section>

        <figure className="case-hero scan">
          {project.image ? (
            <img src={asset(project.image)} alt={`${project.title} cover`} />
          ) : (
            <div className="card-art-empty" aria-hidden="true"><span /></div>
          )}
          <figcaption className="case-float pill">{project.role}</figcaption>
        </figure>

        <section className="case-panel case-stats" aria-labelledby="case-stats">
          <h2 id="case-stats">At a glance</h2>
          <dl>
            {project.stats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="case-panel case-did" aria-labelledby="case-did">
          <h2 id="case-did">What I did</h2>
          <ol>
            {project.did.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="case-panel case-outcome" aria-labelledby="case-outcome">
          <h2 id="case-outcome">The outcome</h2>
          <p>{project.outcome}</p>
        </section>
      </div>

      <Link className="case-next" href={`/work/${next.slug}/`}>
        <span className="label">Next card</span>
        <strong>{next.title} →</strong>
      </Link>
    </article>
  );
}
