import { Hanken_Grotesk, Playfair_Display, Great_Vibes, VT323, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import "./digispace.css";
import "./work.css";
import Cosmos from "@/components/Cosmos";
import SmoothScroll from "@/components/SmoothScroll";
import StarRail from "@/components/StarRail";
import Nav from "@/components/Nav";
import StarPal from "@/components/StarPal";
import Scanlines from "@/components/Scanlines";
import CursorTrail from "@/components/CursorTrail";
import { profile } from "@/data/site";

const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// Headings: an elegant high-contrast serif. Hero word and signature capitals: a script.
const serif = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });
// Rounded pixel letters, for the message box and Kiwi's speech.
const message = Pixelify_Sans({ subsets: ["latin"], weight: "400", variable: "--font-message", display: "swap" });

const pixel = VT323({ subsets: ["latin"], weight: "400", variable: "--font-pixel", display: "swap" });

// Runs before the page paints: if the boot screen was already seen this session, skip it.
const bootCheck = 'try{if(sessionStorage.getItem("booted"))document.documentElement.dataset.booted="1"}catch(e){}';

export const metadata = {
  title: `${profile.name} — ${profile.role}`,
  description: profile.bio,
  metadataBase: new URL("https://101579898.github.io"),
  openGraph: {
    title: `${profile.name} — ${profile.role}`,
    description: "Digi-Space: a digital universe where every project is something to discover.",
    images: [{ url: "https://101579898.github.io/Portfolio20226/og.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport = { themeColor: "#07060b" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${script.variable} ${message.variable} ${pixel.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootCheck }} />
        <noscript><style>{`.boot{display:none}.reveal{opacity:1;transform:none}`}</style></noscript>
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <SmoothScroll />
        <Cosmos />
        <Nav />
        <StarRail />
        <main id="main">{children}</main>
        <StarPal />
        <CursorTrail />
        <Scanlines />
      </body>
    </html>
  );
}
