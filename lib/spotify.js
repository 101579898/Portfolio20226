// Loads Spotify's official embed API once, the first time it is needed.
let loading = null;

export function loadSpotify() {
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const before = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      before?.(api);
      resolve(api);
    };
    const s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    s.onerror = () => {
      loading = null; // allow another try later
      s.remove();
      reject(new Error("Spotify did not load"));
    };
    document.body.appendChild(s);
  });
  return loading;
}

// A playlist link -> spotify:playlist:ID
export function spotifyUri(url) {
  const m = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track)\/([A-Za-z0-9]+)/);
  return m ? `spotify:${m[1]}:${m[2]}` : "";
}
