# Digi-Space: where we are and what's next

Saved 24 November 2026. Branch: `digi-space-redesign`. Nothing here is committed or published yet.
See it with `npm run dev`, then open http://localhost:3000

## Done (built and tested on this branch)

- Faster boot, boot flash fixed, Prev button fixed, old Patrick image removed
- New palette and lettering, one-colour hero
- One-scroll opening with the 3D shooting star
- 2.5D layered space, cursor light, star guide
- About and Skills on one page
- Pixel message box (the lyric is in `data/site.js`)
- Kiwi as a pixel kitten-star
- Work pack: 3D foil packet, tear, card reveal, collection, spin view, case studies

## Do first next time

1. **Take Myro out for now.** Kiara is fixing it up. Keep its entry and images so it can come back.
   The pack will then have 4 cards, so also change "5 CARDS" on the packet print. Check that
   "Next project" is hidden when only one project is left.
2. **Update the skill levels:** Adobe (in general) 8, JavaScript 5, Code 6, Maya 3.
   Still to ask: does "Adobe" replace Photoshop and Illustrator? Does "Code" replace HTML/CSS,
   GitHub and VS Code? What level is Figma?
3. **Rewrite the Cafe Finder case study** from the notes below.
4. **Link the message box to the song:**
   https://open.spotify.com/track/6IZvVAP7VPPnsGX6bvgkqg
   (a link only: it must never autoplay)
5. **Spotify section**, as its own chapter before Contact, using this playlist:
   https://open.spotify.com/playlist/6NH9ex9OHieBgUEpKYUKab
   - Official Spotify embed, never autoplays, with a fallback link if it does not load
   - The waves move while it plays and settle when paused. The embed does not share its sound,
     so the waves can follow play and pause but not the beat.
   - Turntable / music-window look inside Digi-Space
   - Chapters become: 01 Opening, 02 About and Skills, 03 Work, 04 Music, 05 Contact
6. **Contact:** name in the sharp Y2K-style decorative lettering from page 1 of the PDF, soft glow,
   small cosmic details. Contact details stay plain and readable.
7. **Final polish:** motion timing, loading speed, accessibility, a real phone, all sizes.
8. **Review, then publish.** Only merge to `main` (which publishes the site) when Kiara says so.

## Cafe Finder notes (from Kiara, 24 November)

Kiara did everything: the ideation, the base design in Adobe Illustrator, then the code.
So the tools are Adobe Illustrator, HTML, CSS and Bootstrap 5.

**Interface goals, in Kiara's words:** "I hope to keep the interface of this app super minimal and
simple. I don't want to overcomplicate the idea or interface. I want this app to be a guide and keep
information about different local cafes in the nearby area."

- Minimalist design
- Homepage: map + list of nearby cafes, with an "open now" highlight
  - Split between a map view and a scrollable list
  - Provides quick visual and detailed information
- Filters: simple toggle filters (open late, open early, Wi-Fi, outlets, etc.)
- Cafe detail page: hours, photos, address, ratings, pricing
  - Cards: name, hours and key amenities for quick looking
- Navigation: bottom menu with home, favourites and profile

**Visual identity:** "The app will use a warm, but simple colour palette. Keeping the warmth of cafes."

- Primary: deep berry red and warm brown for accents and headers, giving coffee and cafe vibes
- Secondary: beige and cream for the background, a soft neutral canvas that feels calm
- Usage: bold colours like a lighter red or pink for important buttons (such as "open now"),
  with lighter shades as the base for readability
- Palette reference (by @o8lux_design, so credit it or show only our own swatches):
  Berry Brown `#66281f`, Rosewood Red `#994d47`, `#9d8361`, Almond Cream `#bfb9a3`,
  Sweet Beige `#e6e5d5`

**Site map**

- Home (map + cafe list)
  - Profile: Settings, Preferences
  - Search & Filters: Open Now, Open Early, Open Late, Wi-Fi, Outlets, Quiet Space
  - Cafe Detail Page: Hours, Location/Map, Photos, Reviews, Price, Website
  - Favourites: Saved Cafes

**Illustrator design:** the ICHA TEA page. Cream background, large rounded photo, bold berry heading,
rating, italic address, four tag pills, the cafe's story, "Hours: OPEN - Monday 9AM-11pm", then photos.

**Images needed as files** (they were pasted in chat, so they are not on disk):
palette, Illustrator ICHA TEA screen (exported without the Illustrator toolbar), design goals page,
site map. Put them in `public/work/cafe/`.

## Still needed from Kiara

- The four Cafe Finder images as files
- Cafe Finder: the problem it solves and how it ended up (optional; hidden until then)
- Answers to the skill questions above
- Myro, when it is ready
- A photo for About, if wanted (the pixel lily is there for now)

## Worth fixing on the Cafe Finder site itself

- The filter buttons call `filterCafes`, which does not exist, so they do nothing
- The bottom bar's profile button goes to `profile.html`, which does not exist
- The browser tab says "Bootstrap demo"

## Good to know

- The **live site is still the old version**. It still shows the Myro "Replace this…" text and old
  skill levels until this branch is published.
- `public/work/myro-rebrand.pdf` is 15 MB; make a smaller export before Myro comes back.
- Frame rate reads 30fps on battery saver and about 52fps plugged in.
