# Digi-Space: what's left

Updated 24 November 2026. Branch: `digi-space-redesign`.
See it with `npm run dev`, then open http://localhost:3000

Everything on the original list is built: opening, 3D star, layered space, About and Skills, Kiwi,
work pack, Cafe Finder case study, message box with song link, Spotify chapter, Contact signature,
accessibility, loading and testing. Myro has been removed.

## Before publishing

- [ ] Kiara reviews it, including on a real phone
- [ ] Publish: merge into `main` and push (this replaces the live site, which is still the old version)

## Whenever you like (all in `data/site.js`)

- [ ] Skill levels (`skills`)
- [ ] Bio still says "I'm also into branding and visual design": keep or change? (`profile.bio`)
- [ ] Cafe Finder: how it ended up (`outcome`), hidden until filled in
- [ ] More projects: each one is a new entry in `projects`
- [ ] A photo for About (`profile.photo`); the pixel lily is there for now

## Worth fixing on the Cafe Finder site itself

- [ ] The filter buttons call `filterCafes`, which does not exist, so they do nothing
- [ ] The bottom bar's profile button goes to `profile.html`, which does not exist
- [ ] The browser tab says "Bootstrap demo"
- [ ] A cleaner export of the Illustrator screen (the current one was cleaned up from a screenshot)
