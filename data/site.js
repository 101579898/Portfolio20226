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
  bio: "I'm an Interaction Design student at George Brown College. I'm exploring the intersection of UX and front-end development, learning CSS and JavaScript while building prototypes that are clear, accessible, and friendly to real people. I'm also into visual design and love creating visuals that support the story a product is trying to tell.",
  // Put a photo in public/img/ and write its path here, e.g. "/img/kiara.jpg".
  photo: "",
  email: "kiaraglayne@gmail.com",
  instagram: { label: "@Kiwish1", url: "https://instagram.com/Kiwish1" },
  github: { label: "101579898", url: "https://github.com/101579898" },
  // The little star in the corner. Rename her to whatever you like.
  starName: "Kiwi",
};

// The little pixel message in the opening scene.
// text: your lyric, exactly as you want it shown ("" shows "1 new message").
// url: where the song's name links to.
export const transmission = {
  text: "Me, I wasn't taught to share, but care",
  song: "PRIDE.",
  artist: "Kendrick Lamar",
  url: "https://open.spotify.com/track/6IZvVAP7VPPnsGX6bvgkqg",
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
// level: 1-10 (fills the bar). Change the numbers any time.
// short: the letters shown in the tile.
export const skills = [
  { name: "Adobe", short: "Ad", level: 8, note: "Photoshop, Illustrator and After Effects" },
  { name: "Figma", short: "Fg", level: 7, note: "Wireframes, prototypes, design systems" },
  { name: "JavaScript", short: "Js", level: 7, note: "Interactions and animation" },
  { name: "Code / HTML / CSS", short: "</>", level: 6, note: "Responsive, accessible layouts, with VS Code and GitHub" },
  { name: "Maya", short: "My", level: 4, note: "3D modelling" },
];

// MUSIC
// Paste any public Spotify playlist link. It never plays until someone presses play.
export const music = {
  title: "Kiwi",
  url: "https://open.spotify.com/playlist/6NH9ex9OHieBgUEpKYUKab",
};

// PROJECTS
// Each object becomes one card in the work pack AND one case study. Nothing else
// needs to change. Leave a field out (or empty) and that part is simply not shown.
//
//   summary  one or two sentences, on the card        intro     the opening paragraph
//   role, responsibilities, tools                     objective what you set out to do
//   process  steps: { title, text, image, alt, tall } (tall: true for phone screens)
//   palette  { title, text, colors: [{ name, hex }] } decisions { title, text }
//   screens  { title, items: [{ title, text, image, alt }] }  a row of phone screens
//   outcome  how it ended                             gallery   { src, alt }
//   image    the main picture (public/work/...)       links     { label, href }
//   hue      0-360, the tint of the card
export const projects = [
  {
    slug: "cafe-finder",
    title: "Cafe Finder",
    type: "UX / UI + Code",
    year: "2025",
    role: "Everything: ideation, interface design and front-end code",
    tools: ["Adobe Illustrator", "HTML", "CSS", "Bootstrap 5"],
    summary: "A minimal guide to local cafes nearby. I planned it, designed it in Illustrator, then built it in code.",
    intro:
      "Cafe Finder is a simple guide to the cafes around you in Toronto. I took it from the first idea to a working site: the ideation, the interface design in Adobe Illustrator, and then the code.",
    objectiveTitle: "The goal",
    objective:
      "Keep the interface super minimal and simple, without overcomplicating the idea. The app should be a guide that keeps information about different local cafes in the nearby area.",
    responsibilities: [
      "Ideation and design goals",
      "Site map",
      "Interface design in Illustrator",
      "HTML and CSS build",
      "Publishing on GitHub Pages",
    ],
    process: [
      {
        title: "Set the goals",
        text: "I started by writing down what the app had to do: a homepage split between a map and a scrollable list of nearby cafes, simple toggle filters, a detail page for each cafe, and a bottom menu for home, favourites and profile.",
      },
      {
        title: "Map the app",
        text: "Everything branches from Home: Profile, Search & Filters, the Cafe Detail Page and Favourites. Filters cover what people look for, like open now, Wi-Fi, outlets and a quiet space.",
        image: "/work/cafe/sitemap.webp",
        alt: "Site map: Home leads to Profile, Search and Filters, Cafe Detail Page and Favourites, each with its own list",
      },
      {
        title: "Design it in Illustrator",
        text: "The base design came first: a big rounded photo, then the name, rating, address, tags, the cafe's story, hours and more photos, on a calm cream background.",
        image: "/work/cafe/illustrator.webp",
        alt: "Illustrator design of the ICHA TEA cafe page",
        tall: true,
      },
      {
        title: "Turn it into code",
        text: "Then I rebuilt the design as a phone-sized site with HTML, CSS and Bootstrap, and published it on GitHub Pages.",
        image: "/work/cafe/cafe.webp",
        alt: "The coded ICHA TEA cafe page",
        tall: true,
      },
    ],
    palette: {
      title: "A warm, simple palette",
      text: "Deep berry red and warm brown for accents and headers, for coffee and cafe vibes. Beige and cream for a soft, neutral background that feels calm. Bolder reds highlight important things, like \"open now\".",
      colors: [
        { name: "Berry Brown", hex: "#66281f" },
        { name: "Rosewood Red", hex: "#994d47" },
        { name: "Warm Brown", hex: "#9d8361" },
        { name: "Almond Cream", hex: "#bfb9a3" },
        { name: "Sweet Beige", hex: "#e6e5d5" },
      ],
      credit: "Palette inspired by @o8lux_design",
    },
    screens: {
      title: "The coded screens",
      items: [
        { title: "Home", text: "Your location, search and a map, with nearby cafes below.", image: "/work/cafe/homepage.webp", alt: "Cafe Finder home screen with a map and two nearby cafes" },
        { title: "Find a cafe", text: "A larger map with pins and the nearby list under it.", image: "/work/cafe/findcafe.webp", alt: "Find Cafe screen with four map pins" },
        { title: "Cafe page", text: "Photo, rating, address, story, hours and photos.", image: "/work/cafe/cafe.webp", alt: "Cafe page for ICHA TEA" },
      ],
    },
    decisions: [
      { title: "Minimal first", text: "Only what helps someone choose a cafe quickly." },
      { title: "Map and list together", text: "The map gives a quick visual; the list gives the details." },
      { title: "Simple cards", text: "Each cafe is a card for quick looking, with the full story one tap away." },
    ],
    gallery: [],
    outcome: "",
    image: "/work/cafe-finder.webp",
    alt: "Three Cafe Finder screens on phones",
    links: [
      { label: "Open the site", href: "https://101579898.github.io/Cafefind/homepage.html" },
      { label: "See the code", href: "https://github.com/101579898/Cafefind" },
    ],
    hue: 8,
  },
];
