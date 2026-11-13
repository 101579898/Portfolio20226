import { Hanken_Grotesk, Instrument_Serif, JetBrains_Mono, VT323 } from "next/font/google";
import "./globals.css";
import Starfield from "@/components/Starfield";
import Nav from "@/components/Nav";
import StarPal from "@/components/StarPal";
import Scanlines from "@/components/Scanlines";
import { profile } from "@/data/site";

const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const pixel = VT323({ subsets: ["latin"], weight: "400", variable: "--font-pixel", display: "swap" });

// Runs before the page paints: if the boot screen was already seen this session, skip it.
const bootCheck = 'try{if(sessionStorage.getItem("booted"))document.documentElement.dataset.booted="1"}catch(e){}';

export const metadata = {
  title: `${profile.name} — ${profile.role}`,
  description: profile.bio,
};

export const viewport = { themeColor: "#04050c" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable} ${pixel.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootCheck }} />
        <noscript><style>{`.boot{display:none}.reveal{opacity:1;transform:none}`}</style></noscript>
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Starfield />
        <Nav />
        <main id="main">{children}</main>
        <StarPal />
        <Scanlines />
      </body>
    </html>
  );
}
