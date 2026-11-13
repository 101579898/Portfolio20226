"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import PixelArt from "./PixelArt";
import { profile } from "@/data/site";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  return (
    <section className="chapter contact" id="contact" aria-labelledby="contact-title">
      <Reveal className="chapter-head">
        <p className="label">Contact <span aria-hidden="true">/</span> Transmission</p>
        <p className="label">Chapter 04</p>
      </Reveal>

      <Reveal as="h2" id="contact-title" className="display huge">
        <span className="swash">L</span>et's work <span className="serif">together.</span>
      </Reveal>
      <div className="contact-row">
        <div className="contact-main">
          <Reveal as="p" className="lede" delay={80}>{profile.seeking}</Reveal>
          <Reveal className="contact-actions" delay={140}>
            <a className="btn primary" href={`mailto:${profile.email}`}>✦ Email me</a>
            <button className="btn" onClick={copyEmail}>
              {copied ? "Copied!" : "Copy email address"}
            </button>
            <span className="sr-only" role="status">{copied ? "Email address copied" : ""}</span>
          </Reveal>
        </div>
        <Reveal className="contact-art" delay={200}>
          <PixelArt src="/img/lotus.svg" tags={[{ text: "bloom_09 0.96", style: { top: "8%", left: "8%" } }]} />
        </Reveal>
      </div>

      <Reveal as="dl" className="contact-links" delay={200}>
        <div>
          <dt>[ EMAIL ]</dt>
          <dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd>
        </div>
        <div>
          <dt>[ INSTAGRAM ]</dt>
          <dd><a href={profile.instagram.url} target="_blank" rel="noreferrer">{profile.instagram.label}</a></dd>
        </div>
        <div>
          <dt>[ GITHUB ]</dt>
          <dd><a href={profile.github.url} target="_blank" rel="noreferrer">{profile.github.label}</a></dd>
        </div>
      </Reveal>

      <footer className="footer">
        <span>© 2026 {profile.name}</span>
        <span>Designed and built in digi-space</span>
      </footer>
    </section>
  );
}
