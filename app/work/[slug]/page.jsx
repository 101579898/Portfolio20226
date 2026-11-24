// A project's own page (for shared links). The case study itself is the same
// component the card opens into. One page is generated per project in data/site.js.
import Link from "next/link";
import { notFound } from "next/navigation";
import CaseStudy from "@/components/work/CaseStudy";
import RememberCard from "@/components/work/RememberCard";
import { projects } from "@/data/site";

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
    <div className="case-page" style={{ "--hue": project.hue }}>
      <RememberCard slug={slug} />
      <nav className="case-bar" aria-label="Project navigation">
        <Link className="btn" href="/#work"><span aria-hidden="true">←</span> Back to collection</Link>
        {next.slug !== slug ? (
          <Link className="btn ghost" href={`/work/${next.slug}/`}>Next project <span aria-hidden="true">→</span></Link>
        ) : null}
      </nav>
      <CaseStudy project={project} titleId="case-title" />
    </div>
  );
}
