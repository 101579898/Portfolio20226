import Reveal from "./Reveal";
import { profile, education, experience } from "@/data/site";
import { asset } from "@/lib/asset";

function Timeline({ items }) {
  return (
    <ul className="timeline">
      {items.map((item) => (
        <li key={item.title}>
          <div>
            <strong>{item.title}</strong>
            <span>{item.detail}</span>
          </div>
          <span className="pill">{item.date}</span>
        </li>
      ))}
    </ul>
  );
}

export default function About() {
  return (
    <section className="chapter" id="about" aria-labelledby="about-title">
      <Reveal className="chapter-head">
        <p className="label">About <span aria-hidden="true">/</span> Profile</p>
        <p className="label">Chapter 01</p>
      </Reveal>

      <div className="about-grid">
        <Reveal className="portrait">
          <div className="portrait-frame">
            {profile.photo ? (
              <img src={asset(profile.photo)} alt={`Portrait of ${profile.name}`} />
            ) : (
              <div className="portrait-empty" aria-hidden="true">
                <span>KGL</span>
                <small>add your photo in data/site.js</small>
              </div>
            )}
            <span className="corner tl" aria-hidden="true" />
            <span className="corner br" aria-hidden="true" />
          </div>
          <dl className="callouts">
            <div><dt>[ DESIGNER ]</dt><dd>{profile.name}</dd></div>
            <div><dt>[ CLASS ]</dt><dd>{profile.role}</dd></div>
            <div><dt>[ ORIGIN ]</dt><dd>{profile.location}</dd></div>
          </dl>
        </Reveal>

        <div className="about-copy">
          <Reveal as="h2" id="about-title" className="display">
            <span className="serif">Hello,</span> I'm {profile.shortName}.
            <br />A designer from {profile.location}.
          </Reveal>
          <Reveal as="p" className="lede" delay={80}>{profile.bio}</Reveal>

          <div className="panels">
            <Reveal className="glass" delay={120}>
              <h3 className="label">[ EDUCATION ]</h3>
              <Timeline items={education} />
            </Reveal>
            <Reveal className="glass" delay={200}>
              <h3 className="label">[ WORK_EXPERIENCE ]</h3>
              <Timeline items={experience} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
