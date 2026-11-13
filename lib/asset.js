// Prefixes a file in /public with the site's base path (needed on GitHub Pages).
export const asset = (path) => (process.env.NEXT_PUBLIC_BASE_PATH || "") + path;
