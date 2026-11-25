// Builds the cards that go in the work pack, and rolls a random "pull".
// The pack holds every project in data/site.js, then the bonus cards
// (Designer, Skill, Companion).
import { projects, profile, skills, education } from "@/data/site";

function projectCard(p) {
  return {
    id: p.slug,
    symbol: p.symbol || "star", // the little mark on the back of the card
    backTone: p.backTone, // the moon on the back: 0 blush, 1 blue, 2 violet, 3 pale
    kind: "project",
    type: p.type,
    title: p.title,
    year: p.year,
    hue: p.hue,
    image: p.image,
    rows: [
      ["Role", p.role],
      ["Tools", p.tools.join(" · ")],
    ].filter(([, v]) => v),
    summary: p.summary,
    href: `/work/${p.slug}/`,
    cta: "Open case file →",
  };
}

function bonusCards() {
  const top = [...skills].sort((a, b) => b.level - a.level).slice(0, 4);
  return [
    {
      id: "designer",
      symbol: "pen",
      backTone: 2,
      kind: "designer",
      type: "Designer",
      title: profile.name,
      year: "LV ∞",
      hue: 338,
      image: profile.photo,
      rows: [
        ["Class", profile.role],
        ["Origin", profile.location],
      ],
      summary: "Interaction Design student exploring where UX meets front-end code.",
      href: "/#about",
      cta: "Read about me →",
    },
    {
      id: "skills",
      symbol: "bars",
      backTone: 1,
      kind: "skill",
      type: "Skill",
      title: "Player stats",
      year: `${skills.length} skills`,
      hue: 250,
      bars: top,
      rows: [
        ["Best stat", `${top[0].name} · LV ${top[0].level}`],
        ["Guild", education[0].title],
      ],
      summary: "The tools I use and where I am with each. Still levelling up.",
      href: "/#skills",
      cta: "See all stats →",
    },
    {
      id: "companion",
      symbol: "paw",
      backTone: 3,
      kind: "star",
      type: "Companion",
      title: profile.starName,
      year: "★",
      hue: 270,
      rows: [
        ["Type", "Kitten star"],
        ["Move", "Spin attack"],
      ],
      summary: `${profile.starName} lives in the corner of the screen. Tap her and she spins.`,
      href: "/#contact",
      cta: "Say hi to Kiara →",
    },
  ];
}

export function buildDeck() {
  return [...projects.map(projectCard), ...bonusCards()];
}

// How shiny a card is. Every pack has exactly one "cosmic" card; the rest are random.
export const RARITY_LABEL = { common: "Common", holo: "Holo", star: "Star foil", cosmic: "Cosmic" };

// Returns the deck in a random order with a random finish on each card:
//   [{ id: "cafe-finder", rarity: "holo" }, ...]
// A project is always on top, so the first thing anyone sees is real work.
export function rollPull(deck) {
  const ids = deck.map((c) => c.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const first = ids.findIndex((id) => deck.find((c) => c.id === id).kind === "project");
  ids.unshift(...ids.splice(first, 1));
  const cosmic = Math.floor(Math.random() * ids.length);
  return ids.map((id, i) => {
    if (i === cosmic) return { id, rarity: "cosmic" };
    const r = Math.random();
    return { id, rarity: r < 0.4 ? "common" : r < 0.75 ? "holo" : "star" };
  });
}
