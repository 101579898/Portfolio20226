import Link from "next/link";
import { profile } from "@/data/site";

const links = [
  { n: "01", label: "About", href: "/#about" },
  { n: "02", label: "Skills", href: "/#skills" },
  { n: "03", label: "Work", href: "/#work" },
  { n: "04", label: "Contact", href: "/#contact" },
];

export default function Nav() {
  return (
    <header className="nav">
      <Link className="nav-brand" href="/">
        {profile.shortName.toUpperCase()}<span className="nav-brand-extra"> <span aria-hidden="true">//</span> INDEX</span>
      </Link>
      <nav aria-label="Sections">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <span className="nav-n" aria-hidden="true">{l.n}.</span>
            {l.label}
          </Link>
        ))}
      </nav>
      <p className="nav-status">
        STATUS: <span>{profile.status.toUpperCase().replaceAll(" ", "_")}</span>
      </p>
    </header>
  );
}
