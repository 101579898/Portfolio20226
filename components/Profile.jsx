"use client";

// Chapter 02: About and Skills on one page. On wide screens the profile stays in
// place on the left; as you scroll past your story on the right, the portrait
// shrinks and the stats unfold underneath "Origin". On phones it is one column.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Reveal from "./Reveal";
import Decode from "./Decode";
import PixelArt from "./PixelArt";
import { profile, education, experience, awards, skills } from "@/data/site";
import { asset } from "@/lib/asset";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MAX = 10;

function Window({ title, className = "", children }) {
  return (
    <div className={`win lit ${className}`}>
      <div className="win-bar" aria-hidden="true">
        <span>{title}</span>
        <i /><i /><i />
      </div>
      <div className="win-body">{children}</div>
    </div>
  );
}

function Timeline({ items }) {
  return (
    <ul className="timeline">
      {items.map((item) => (
        <li key={item.title}>
          <div>
            <strong>{item.title}</strong>
            {item.detail ? <span>{item.detail}</span> : null}
          </div>
          <span className="pill">{item.date}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Profile() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const bars = gsap.utils.toArray(".xp-fill");
      const rows = gsap.utils.toArray(".xp-row");

      // Wide screens: scrolling the right column drives the left one.
      mm.add("(min-width: 901px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ".profile-story", start: "top 12%", end: "bottom 92%", scrub: 0.4 },
        });
        tl.fromTo(".id-portrait", { height: "min(38vh, 330px)" }, { height: "96px", duration: 0.34, ease: "power1.inOut" }, 0.04)
          .fromTo(".stats", { opacity: 0, clipPath: "inset(0 0 100% 0)" }, { opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 0.34, ease: "power1.out" }, 0.16)
          .fromTo(rows, { x: -14, opacity: 0.1 }, { x: 0, opacity: 1, duration: 0.16, stagger: 0.04 }, 0.24)
          .fromTo(bars, { scaleX: 0 }, { scaleX: (i, el) => Number(el.dataset.level) / MAX, duration: 0.2, stagger: 0.04, ease: "power2.out" }, 0.28)
          .to({}, { duration: 0.12 });
      });

      // Small screens: the bars fill when you reach them.
      mm.add("(max-width: 900px) and (prefers-reduced-motion: no-preference), (max-height: 699px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          bars,
          { scaleX: 0 },
          {
            scaleX: (i, el) => Number(el.dataset.level) / MAX,
            duration: 1,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: ".stats", start: "top 78%", once: true },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section className="chapter profile" id="about" ref={root} aria-labelledby="about-title">
      <div className="chapter-head">
        <Decode text="About / Profile" />
        <Decode text="Chapter 02" />
      </div>

      <div className="profile-grid">
        <div className="profile-story">
          <Reveal as="h2" id="about-title" className="display">
            Hello, I'm {profile.shortName}.
            <br />A designer from {profile.location}.
          </Reveal>
          <Reveal as="p" className="lede" delay={80}>{profile.bio}</Reveal>
          <Reveal className="panel lit">
            <h3 className="deco">Education</h3>
            <Timeline items={education} />
          </Reveal>
          {/* The Skills link lands here: by this point the stats are open on the left. */}
          <span id="skills" className="skills-anchor" aria-hidden="true" />
          <Reveal className="panel lit">
            <h3 className="deco">Work experience</h3>
            <Timeline items={experience} />
          </Reveal>
          {awards.length ? (
            <Reveal className="panel lit">
              <h3 className="deco">Awards</h3>
              <Timeline items={awards} />
            </Reveal>
          ) : null}
          <Reveal>
            <Window title="quest.log" className="quest">
              <p>{profile.seeking}</p>
              <a className="btn primary" href="#contact">Start a conversation</a>
            </Window>
          </Reveal>
        </div>

        <div className="profile-side">
          <div className="id-card">
            <Window title="kiara.profile">
              <div className="id-portrait">
                {profile.photo ? (
                  <>
                    <img src={asset(profile.photo)} alt={profile.photoAlt || `Portrait of ${profile.name}`} draggable="false" />
                    <span className="tag" style={{ top: "8px", left: "8px" }} aria-hidden="true">kiara_01 0.99</span>
                  </>
                ) : (
                  <PixelArt
                    src="/img/lily.svg"
                    className="portrait-art"
                    tags={[{ text: "kiara_01 0.99", style: { top: "8px", left: "8px" } }]}
                  />
                )}
              </div>
              <dl className="callouts">
                <div><dt>[ Designer ]</dt><dd>{profile.name}</dd></div>
                <div><dt>[ Class ]</dt><dd>{profile.role}</dd></div>
                <div><dt>[ Origin ]</dt><dd>{profile.location}</dd></div>
              </dl>
            </Window>
          </div>

          <div className="stats" data-anchor="skills" role="group" aria-labelledby="skills-title">
            <div className="stats-head">
              <h3 id="skills-title" className="deco">Skills</h3>
              <span className="label">Player stats</span>
            </div>
            <ul className="xp-list">
              {skills.map((skill) => (
                <li key={skill.name} className="xp-row" title={skill.note}>
                  <span className="xp-tile" aria-hidden="true">{skill.short}</span>
                  <div className="xp-main">
                    <div className="xp-top">
                      <strong>{skill.name}</strong>
                      <span className="xp-level" aria-hidden="true">LV {String(skill.level).padStart(2, "0")}</span>
                    </div>
                    <div className="xp-bar" role="img" aria-label={`${skill.name}: level ${skill.level} of ${MAX}`}>
                      <span className="xp-fill" data-level={skill.level} style={{ transform: `scaleX(${skill.level / MAX})` }} />
                    </div>
                    <small>{skill.note}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
