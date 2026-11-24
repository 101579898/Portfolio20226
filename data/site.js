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
  starName: "Kiwi",
};

// The little pixel message in the opening scene.
// text: paste your lyric here, exactly as you want it shown ("" shows "1 new message").
export const transmission = {
  text: "Me, I wasn't taught to share, but care",
  song: "PRIDE.",
  artist: "Kendrick Lamar",
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

// PROJECTS
// Each object becomes one card in the work pack AND one case study. Nothing else
// needs to change. Leave a field out (or empty) and that part is simply not shown.
//
//   summary  one or two sentences, on the card        intro     the opening paragraph
//   role, responsibilities, tools                     objective the problem you set out to solve
//   process  steps: { title, text, image, alt }       decisions { title, text }
//   outcome  how it ended                             gallery   { src, alt }
//   image    the main picture (public/work/...)       links     { label, href }
//   hue      0-360, the tint of the card
export const projects = [
  {
    slug: "myro-rebrand",
    title: "Myro → Aurea",
    type: "Branding",
    year: "2026",
    role: "Brand strategy, identity & web design",
    tools: ["Canva"],
    summary: "Rebranding a natural fragrance and essential oil company as Aurea: quiet luxury that people can trust.",
    intro:
      "Myro is a fragrance and essential oil brand built on 100% natural ingredients. I rebranded it as Aurea, a natural fragrance brand dedicated to clean, sustainable scents, designed for everyday rituals that offer moments of calm, clarity and authenticity.",
    objective:
      "Today's fragrance market is split between synthetic luxury brands and natural wellness brands that often lack true credibility or sophistication. People looking for clean, high-quality scents struggle to find options that feel both trustworthy and luxurious. Aurea fills that gap.",
    responsibilities: [
      "Competitor and audience research",
      "Persona and customer journey map",
      "Logo, colour and type system",
      "User flows, lo-fi and hi-fi website screens",
      "Social content plan and brand partnerships",
    ],
    process: [
      {
        title: "Read the market",
        text: "I compared Myro with PHLUR, NEST New York and doTERRA, then built a persona and a customer journey map from what those brands' customers say in reviews.",
        image: "/work/myro/persona.webp",
        alt: "User persona slide with a radar chart and profile",
      },
      {
        title: "Map the journey",
        text: "From awareness to loyalty: what people think, do and feel at each step, and where the brand can do better.",
        image: "/work/myro/journey-map.webp",
        alt: "Customer journey map from awareness to loyalty",
      },
      {
        title: "Set the mood",
        text: "High-quality, natural, gold, rich, golden, luxury. The keywords became a palette and a set of images.",
        image: "/work/myro/moodboard.webp",
        alt: "Moodboard of amber bottles and gold textures with five colour swatches",
      },
      {
        title: "Plan the site",
        text: "User flows for shopping, value sets, support and the brand story, then paper wireframes.",
        image: "/work/myro/wireframes.webp",
        alt: "Two pages of hand-drawn website wireframes",
      },
      {
        title: "Design the screens",
        text: "Hi-fi website screens that put the product first: shop, product page, value sets and the Aurea story.",
        image: "/work/myro/hi-fi.webp",
        alt: "Aurea website shown on a laptop beside a column of page designs",
      },
    ],
    decisions: [
      { title: "A golden palette", text: "#462407, #9f691e, #daa754 and #f1dfaa: rich browns and golds for natural luxury." },
      { title: "Two typefaces", text: "Cormorant Garamond for headings and Inter for body text." },
      { title: "A clear audience", text: "Made for all genders aged 25–39, mostly women who value beauty, wellness and authenticity." },
      { title: "Instagram and TikTok", text: "Instagram for a consistent, visual brand identity; TikTok for short stories about mood, rituals and wellness." },
    ],
    gallery: [
      { src: "/work/myro/before-after.webp", alt: "The original Myro site, before becoming Aurea" },
      { src: "/work/myro/identity.webp", alt: "Aurea brand identity: logo, tagline, colours and fonts" },
      { src: "/work/myro/user-flows.webp", alt: "User flow diagram" },
      { src: "/work/myro/instagram.webp", alt: "Aurea Instagram profile on two phones" },
      { src: "/work/myro/posts.webp", alt: "Aurea Instagram stories and posts" },
      { src: "/work/myro/schedule.webp", alt: "Weekly social posting schedule" },
    ],
    outcome:
      "A full rebrand: a new name, identity and voice, a website design, and a social launch plan with a weekly posting schedule, engagement strategy, brand partnerships and the numbers to track once it is live.",
    image: "/work/myro/website.webp",
    alt: "The Aurea website on a laptop, with a perfume bottle and rose",
    links: [{ label: "View the full deck (PDF, 15 MB)", href: "/work/myro-rebrand.pdf" }],
    hue: 335,
  },
  {
    slug: "cafe-finder",
    title: "Cafe Finder",
    type: "Web / UI",
    year: "2025",
    role: "Design & front-end build",
    tools: ["HTML", "CSS", "Bootstrap 5"],
    summary: "A mobile-first site for finding cafes in Toronto, with a map, nearby picks and a page for each cafe.",
    intro:
      "Cafe Finder is a mobile-first site for finding somewhere to sit down in Toronto. It opens on a map with nearby cafes underneath, and each cafe has its own page with a rating, address, story, hours and photos.",
    objective: "",
    responsibilities: ["Screen design", "HTML and CSS build", "Publishing on GitHub Pages"],
    process: [
      {
        title: "Home",
        text: "Your location, a search bar and a map, with nearby cafes in a sheet you can reach with a thumb.",
        image: "/work/cafe/homepage.webp",
        alt: "Cafe Finder home screen with a map and two nearby cafes",
      },
      {
        title: "Find a cafe",
        text: "A larger map with pins, and the nearby list directly under it.",
        image: "/work/cafe/findcafe.webp",
        alt: "Find Cafe screen with four map pins",
      },
      {
        title: "Cafe page",
        text: "A big photo first, then rating, address, the cafe's story, opening hours and photos.",
        image: "/work/cafe/cafe.webp",
        alt: "Cafe page for ICHA TEA with a photo, rating, address and hours",
      },
    ],
    processTitle: "Screen by screen",
    portrait: true, // the pictures above are tall phone screens
    decisions: [
      { title: "Phone first", text: "The layout is capped at phone width, with a fixed bottom bar for the main pages." },
      { title: "Warm colours", text: "Coffee browns and creams, so the interface feels like the places it lists." },
    ],
    gallery: [],
    outcome: "",
    image: "/work/cafe-finder.webp",
    alt: "Three Cafe Finder screens on phones",
    links: [
      { label: "Open the site", href: "https://101579898.github.io/Cafefind/homepage.html" },
      { label: "See the code", href: "https://github.com/101579898/Cafefind" },
    ],
    hue: 20,
  },
];
