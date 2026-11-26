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
  photo: "/img/kiara.webp",
  photoAlt: "Kiara's picture: a pixel-art kitten inside a glowing star",
  email: "kiaraglayne@gmail.com",
  instagram: { label: "@Kiwish1", url: "https://instagram.com/Kiwish1" },
  github: { label: "101579898", url: "https://github.com/101579898" },
  // The little star in the corner. Rename her to whatever you like.
  starName: "Kiwi",
};

// The little pixel message in the opening scene.
// text: your lyric, exactly as you want it shown ("" shows "1 new message").
// url: where the song's name links to. previewId: the song's number on Apple Music,
// for the 30-second preview ("" for no preview).
export const transmission = {
  text: "Me, I wasn't taught to share, but care",
  song: "PRIDE.",
  artist: "Kendrick Lamar",
  url: "https://open.spotify.com/track/6IZvVAP7VPPnsGX6bvgkqg",
  previewId: "1440882161",
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
  { title: "Blockchain Futurist Conference", detail: "Volunteer, Toronto", date: "Jul 19 — 20, 2026" },
  { title: "TechTO", detail: "Volunteer contract", date: "Jul 2024" },
];

// AWARDS
// detail is optional.
export const awards = [
  { title: "Sunday Afolabi Scholarship Grant", date: "Jun 2026" },
  { title: "Dotty Nicholas Sickle Cell Scholarship", date: "Jun 2026" },
];

// SKILL BARS
// level: 1-10, halves allowed (fills the bar). Change the numbers any time.
// short: the letters shown in the tile.
export const skills = [
  { name: "Adobe", short: "Ad", level: 8, note: "Photoshop, Illustrator and After Effects" },
  { name: "Figma", short: "Fg", level: 7, note: "Wireframes, prototypes, design systems" },
  { name: "JavaScript", short: "Js", level: 7, note: "Interactions and animation" },
  { name: "Code / HTML / CSS", short: "</>", level: 7.5, note: "Responsive, accessible layouts, with VS Code and GitHub" },
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
//   results  a list of what you did (shown as "What I did")
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
  // Placeholders from Kiara's project slides (school projects); fuller case studies to come.
  {
    slug: "ar-cultural-salon",
    title: "Educational AR Cultural Salon",
    type: "AR / XR concept",
    year: "GBC",
    tools: ["AR", "ModiFace API"],
    summary: "An AR mirror that lets you try on makeup, hair and accessories from different cultures and eras, and learn the story behind each look.",
    intro:
      "An AR mirror concept that lets users try on makeup, hairstyles, and accessories from different cultures and time periods, with historical and cultural context for each look. It's designed to broaden how people see beauty and to teach through the experience.",
    objectiveTitle: "The goal",
    objective:
      "To challenge narrow, Eurocentric beauty standards by turning beauty into a cultural learning experience that supports healthy self identity, especially for teens and young adults.",
    results: [
      "Researched how social media and filter culture shape beauty standards and affect wellbeing, and defined the problem and three user groups (teens, young adults, students and educators).",
      "Planned a 15-week Agile process (research, prototype, test, refine) with an accessibility and ethics review built in.",
      "Designed lo-fi mirror screens covering cultural browsing, live face tracking with step-by-step explanations, and a \"Learn More\" panel with historical context, cultural significance, and modern influence.",
      "Defined five deliverables, including an AR prototype powered by the ModiFace API and a curated cultural content database.",
    ],
    image: "/work/ar-salon.webp",
    alt: "A phone showing the Han Dynasty Rouge look, with its historical context, cultural significance and modern influence",
    hue: 345,
  },
  {
    slug: "bennys-aac-redesign",
    title: "Benny's AAC Redesign",
    type: "Accessibility redesign",
    year: "2026",
    role: "Team project with Doyun and Julia, for Physical Interfaces",
    summary: "A redesign of an AAC communication board for head-switch users, focused on usability, clarity and error prevention.",
    intro:
      "A redesign of the Foundation board in Benny's Access Hub, an AAC (Augmentative and Alternative Communication) system. It's built for Benny, who uses AAC daily, and the caregivers who support them, and it works with a head switch: move left to scan, right to select.",
    objectiveTitle: "The goal",
    objective:
      "Make the system more intuitive and less physically and mentally demanding, so users can communicate more independently. The redesign focused on usability, clarity, and error prevention.",
    results: [
      "Researched the problem: existing AAC interfaces can be inefficient, hard to use, and not suited to individual users' needs.",
      "Redesigned the phrase board with clearer categories (Core Phrases, Needs & Wants, Feelings, People, Actions, Places) and consistent navigation.",
    ],
    process: [
      {
        title: "The problem",
        text: "Existing alternative communication systems can be unaccommodating, difficult to use, and require high mental or physical demand. Many interfaces are inefficient and aren't suited to users' needs.",
        image: "/work/benny/problem.webp",
        alt: "The redesigned phrase board, with an illustrated caregiver and an AAC user in a wheelchair",
      },
      {
        title: "To empower",
        text: "We targeted individuals and caregivers who rely on AAC tools daily. The goal is to make systems intuitive and effective, supporting user independence for a higher quality of life.",
      },
      {
        title: "Design focus",
        text: "Using Benny's Access Hub as the foundation, we redesigned the phrase board, improving usability, clarity and error prevention.",
        image: "/work/benny/design-focus.webp",
        alt: "The phrase board with Questions and Time open, showing who, what, when, where and why around it",
      },
      {
        title: "Try it yourself",
        text: "Using the head switch, move your head left to scan (or press space) and right to select (or press return), then use the device to build phrases and communicate.",
      },
    ],
    galleryTitle: "The posters",
    gallery: [
      { src: "/work/benny/poster-cover.webp", alt: "Poster: Benny's Redesign cover, with the original AAC boards on tablets" },
      { src: "/work/benny/poster-info.webp", alt: "Poster: what AAC systems are, our changes, and how it works" },
      { src: "/work/benny/poster-process.webp", alt: "Poster: redesigning for better communication, from the problem to trying it yourself" },
    ],
    image: "/work/bennys-aac.webp",
    alt: "Cover of the Benny's Redesign project, with the old and new AAC phrase boards on tablets",
    hue: 200,
  },
  {
    slug: "rehab-hci-home",
    title: "Rehabilitation HCI Systems for Home Use",
    type: "HCI research",
    year: "GBC",
    summary: "A research-based proposal for how rehab centres could use motion-sensing technology so patients can keep up rehabilitation at home.",
    intro:
      "A research based proposal on how UHN rehab centres could use motion-sensing technology so patients can continue rehabilitation at home. It uses BDRehab, a Kinect-based balance rehab system from researchers in Spain, as a case study, and looks at what UHN should consider before adopting a similar system.",
    objectiveTitle: "The goal",
    objective:
      "Help rehab centres reduce waitlists and travel barriers by supporting at-home therapy that is safe, motivating, and easy for patients to use, and make sure it is tested in real conditions before rollout.",
    results: [
      "Researched how HCI and movement-based systems are used in rehab, including evidence that video-game-style exercises improve motivation and outcomes.",
      "Analyzed the BDRehab case: a home PC and Kinect camera with nothing to wear, where the therapist sets how strict the posture checks are and receives attempts, errors, and time data to adjust the exercise remotely.",
      "Identified the risk that clinic-tested results may not hold in real homes, which have clutter, different lighting, pets, and family.",
      "Recommended testing with five real patients and a therapist present, followed by a small pilot, before any full rollout.",
    ],
    image: "/work/rehab-hci.webp",
    alt: "Illustration on a phone of a patient and a therapist shaking hands",
    hue: 210,
  },
];
