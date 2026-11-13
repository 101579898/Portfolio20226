// ─────────────────────────────────────────────────────────────
// ALL THE WORDS ON THE SITE LIVE HERE.
// Change text, skill levels and projects in this file — you don't
// need to touch the components to update your content.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: "Kiara Gonzalez-Layne",
  shortName: "Kiara",
  role: "Interaction Designer",
  location: "Canada",
  school: "George Brown College",
  status: "Open to work",
  seeking: "I'm looking for a junior or internship-level Experience / Interaction Design role.",
  bio: "I'm an Interaction Design student at George Brown College. I'm exploring the intersection of UX and front-end development, learning CSS and JavaScript while building prototypes that are clear, accessible, and friendly to real people. I'm also into branding and visual design and love creating visuals that support the story a product is trying to tell.",
  // Put a photo in public/img/ and write its path here, e.g. "/img/kiara.jpg".
  photo: "",
  email: "kiaraglayne@gmail.com",
  instagram: { label: "@Kiwish1", url: "https://instagram.com/Kiwish1" },
  github: { label: "101579898", url: "https://github.com/101579898" },
  // The little star in the corner. Rename her to whatever you like.
  starName: "Nova",
};

export const education = [
  {
    title: "George Brown College",
    detail: "Interaction Design — Ontario College Advanced Diploma",
    date: "2025 — Present",
  },
  {
    title: "ADaPT",
    detail: "Advanced Digital and Professional Training for Black Youth",
    date: "May 2024",
  },
];

export const experience = [
  { title: "Sephora", detail: "Operations Consultant", date: "2024 — Present" },
  { title: "O'Grady's on Church", detail: "Part-time Busser", date: "Apr — Jul 2024" },
  { title: "TechTO", detail: "Volunteer contract", date: "Jul 2024" },
];

// SKILL BARS
// level: 1-10 (fills the bar). These numbers are PLACEHOLDERS — set your own.
// short: the two letters shown in the tile.
export const skills = [
  { name: "Figma", short: "Fg", level: 7, note: "Wireframes, prototypes, design systems" },
  { name: "Photoshop", short: "Ps", level: 6, note: "Image editing and compositing" },
  { name: "Illustrator", short: "Ai", level: 6, note: "Logos, icons and vector illustration" },
  { name: "HTML / CSS", short: "</>", level: 5, note: "Responsive, accessible layouts" },
  { name: "JavaScript", short: "Js", level: 4, note: "Interactions and animation" },
  { name: "GitHub", short: "Gh", level: 5, note: "Version control and publishing" },
  { name: "VS Code", short: "Vs", level: 6, note: "My everyday editor" },
  { name: "Maya", short: "My", level: 3, note: "3D modelling basics" },
];

// PROJECT CARDS
// Each object is one card in the work pack and one case-file page.
// image: a file in public/work/ (leave "" to show the placeholder art).
// link:  optional file or URL for a "view full project" button.
// hue:   0-360, the glow colour of the card and its page.
export const projects = [
  {
    slug: "myro-rebrand",
    title: "Myro Rebrand",
    type: "Branding",
    year: "2025",
    role: "Brand & visual designer",
    tools: ["Illustrator", "Photoshop", "Figma"],
    summary: "A rebrand concept for Myro. Replace this with one or two sentences about the problem and your idea.",
    did: [
      "Replace with what you researched or audited first.",
      "Replace with the design decisions you made (logo, colour, type).",
      "Replace with what you delivered at the end.",
    ],
    stats: [
      { label: "Timeline", value: "— weeks" },
      { label: "Team", value: "Solo" },
      { label: "Deliverable", value: "Brand deck" },
    ],
    outcome: "Replace with the result: what changed, what you learned, or the feedback you got.",
    image: "/work/myro-rebrand.jpg",
    link: "/work/myro-rebrand.pdf",
    linkLabel: "View the full deck (PDF)",
    hue: 268,
    placeholder: false,
  },
  {
    slug: "project-02",
    title: "Project Slot 02",
    type: "UX / UI",
    year: "20—",
    role: "Your role",
    tools: ["Figma"],
    summary: "Placeholder card. Swap in a UX case study: the problem, who it was for, and what you designed.",
    did: ["What you researched.", "What you designed.", "What you tested or shipped."],
    stats: [
      { label: "Timeline", value: "—" },
      { label: "Team", value: "—" },
      { label: "Deliverable", value: "—" },
    ],
    outcome: "Placeholder outcome.",
    image: "",
    link: "",
    hue: 300,
    placeholder: true,
  },
  {
    slug: "project-03",
    title: "Project Slot 03",
    type: "Interaction",
    year: "20—",
    role: "Your role",
    tools: ["HTML / CSS", "JavaScript"],
    summary: "Placeholder card. Swap in an interactive prototype or coded build and say what makes it feel good to use.",
    did: ["What you researched.", "What you designed.", "What you tested or shipped."],
    stats: [
      { label: "Timeline", value: "—" },
      { label: "Team", value: "—" },
      { label: "Deliverable", value: "—" },
    ],
    outcome: "Placeholder outcome.",
    image: "",
    link: "",
    hue: 325,
    placeholder: true,
  },
  {
    slug: "project-04",
    title: "Project Slot 04",
    type: "Visual design",
    year: "20—",
    role: "Your role",
    tools: ["Photoshop", "Illustrator"],
    summary: "Placeholder card. Swap in a poster, illustration or motion piece and the story it supports.",
    did: ["What you researched.", "What you designed.", "What you tested or shipped."],
    stats: [
      { label: "Timeline", value: "—" },
      { label: "Team", value: "—" },
      { label: "Deliverable", value: "—" },
    ],
    outcome: "Placeholder outcome.",
    image: "",
    link: "",
    hue: 284,
    placeholder: true,
  },
];
