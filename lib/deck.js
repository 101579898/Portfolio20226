// Builds the cards that go in the work pack, and rolls a random "pull".
//
// The pack holds: every real project, then the bonus cards (Designer, Skill,
// Companion), then placeholder project slots until there are at least 5 cards.
// As you add real projects in data/site.js the placeholders drop out by themselves.
import { projects, profile, skills, education } from "@/data/site";

const PACK_MIN = 5;

function projectCard(p) {
  return {
    id: p.slug,
    kind: "project",
    type: p.type,
    title: p.title,
    year: p.year,
    hue: p.hue,
    image: p.image,
    rows: [
      ["Role", p.role],
      ["Tools", p.tools.join(" · ")],
    ],
    summary: p.summary,
    list: p.did.slice(0, 3),
    href: `/work/${p.slug}/`,
    cta: "Open case file →",
    placeholder: p.placeholder,
  };
}

function bonusCards() {
  const top = [...skills].sort((a, b) => b.level - a.level).slice(0, 4);
  return [
    {
      id: "designer",
      kind: "designer",
      type: "Designer",
      title: profile.name,
      year: "LV ∞",
      hue: 312,
      image: profile.photo,
      rows: [
        ["Class", profile.role],
        ["Origin", profile.location],
      ],
      summary: "Interaction Design student exploring where UX meets front-end code.",
      list: [profile.bio],
      href: "/#about",
      cta: "Read about me →",
    },
    {
      id: "skills",
      kind: "skill",
      type: "Skill",
      title: "Player stats",
      year: `${skills.length} skills`,
      hue: 276,
      bars: top,
      rows: [
        ["Best stat", `${top[0].name} · LV ${top[0].level}`],
        ["Guild", education[0].title],
      ],
      summary: "The tools I use, rated honestly out of 10. Still levelling up.",
      list: skills.map((s) => `${s.name} — LV ${s.level}`).slice(0, 6),
      href: "/#skills",
      cta: "See all stats →",
    },
    {
      id: "companion",
      kind: "star",
      type: "Companion",
      title: profile.starName,
      year: "★",
      hue: 330,
      rows: [
        ["Type", "Star friend"],
        ["Move", "Spin attack"],
      ],
      summary: `${profile.starName} lives in the corner of the screen. Tap her and she spins.`,
      list: ["Watches your pointer.", "Dodges twice if you chase her.", "Knows every section by heart."],
      href: "/#contact",
      cta: "Say hi to Kiara →",
    },
  ];
}

export function buildDeck() {
  const real = projects.filter((p) => !p.placeholder).map(projectCard);
  const slots = projects.filter((p) => p.placeholder).map(projectCard);
  const deck = [...real, ...bonusCards()];
  for (const slot of slots) {
    if (deck.length >= PACK_MIN) break;
    deck.push(slot);
  }
  return deck;
}

// How shiny a card is. Every pack has exactly one "cosmic" card; the rest are random.
export const RARITY_LABEL = { common: "Common", holo: "Holo", star: "Star foil", cosmic: "Cosmic" };

// Returns the deck in a random order with a random finish on each card:
//   [{ id: "myro-rebrand", rarity: "holo" }, ...]
export function rollPull(deck) {
  const ids = deck.map((c) => c.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const cosmic = Math.floor(Math.random() * ids.length);
  return ids.map((id, i) => {
    if (i === cosmic) return { id, rarity: "cosmic" };
    const r = Math.random();
    return { id, rarity: r < 0.45 ? "common" : r < 0.78 ? "holo" : "star" };
  });
}
