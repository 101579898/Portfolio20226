"use client";

// Skills shown like a video-game character sheet: each tool has a level
// and an XP bar that fills up when the section scrolls into view.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Reveal from "./Reveal";
import PixelArt from "./PixelArt";
import { profile, skills } from "@/data/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MAX = 10;

export default function Skills() {
  const root = useRef(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fills = gsap.utils.toArray(".xp-fill");
      const numbers = gsap.utils.toArray(".xp-num");
      if (reduce) return;

      gsap.set(fills, { scaleX: 0 });
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 70%",
        once: true,
        onEnter: () => {
          fills.forEach((el, i) => {
            const level = Number(el.dataset.level);
            gsap.to(el, { scaleX: level / MAX, duration: 1.1, delay: i * 0.08, ease: "power3.out" });
            const counter = { v: 0 };
            gsap.to(counter, {
              v: level,
              duration: 1.1,
              delay: i * 0.08,
              ease: "power3.out",
              onUpdate: () => {
                numbers[i].textContent = String(Math.round(counter.v)).padStart(2, "0");
              },
            });
          });
        },
      });
    },
    { scope: root }
  );

  return (
    <section className="chapter" id="skills" ref={root} aria-labelledby="skills-title">
      <Reveal className="chapter-head">
        <p className="label">Skills <span aria-hidden="true">/</span> Player stats</p>
        <p className="label">Chapter 02</p>
      </Reveal>

      <div className="skills-grid">
        <Reveal className="player glass">
          <PixelArt
            src="/img/computer.svg"
            tags={[
              { text: "cursor_01 0.94", style: { top: "10%", left: "6%" } },
              { text: "window_07 0.88", style: { bottom: "8%", right: "6%" } },
            ]}
          />
          <p className="label">[ PLAYER_01 ]</p>
          <h2 id="skills-title" className="display small">
            <span className="serif">Level</span> check.
          </h2>
          <p className="muted">
            The tools I use, rated honestly out of {MAX}. Still levelling up every semester.
          </p>
          <dl className="player-stats">
            <div><dt>Class</dt><dd>{profile.role}</dd></div>
            <div><dt>Guild</dt><dd>{profile.school}</dd></div>
            <div><dt>Region</dt><dd>{profile.location}</dd></div>
            <div><dt>Quest</dt><dd>Junior / internship role</dd></div>
          </dl>
        </Reveal>

        <ul className="xp-list">
          {skills.map((skill) => (
            <li key={skill.name} className="xp-row">
              <span className="xp-tile" aria-hidden="true">{skill.short}</span>
              <div className="xp-main">
                <div className="xp-top">
                  <strong>{skill.name}</strong>
                  <span className="xp-level" aria-hidden="true">
                    LV <span className="xp-num">{String(skill.level).padStart(2, "0")}</span>
                  </span>
                </div>
                <div
                  className="xp-bar"
                  role="img"
                  aria-label={`${skill.name}: level ${skill.level} of ${MAX}`}
                >
                  <span
                    className="xp-fill"
                    data-level={skill.level}
                    style={{ transform: `scaleX(${skill.level / MAX})` }}
                  />
                </div>
                <small>{skill.note}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
