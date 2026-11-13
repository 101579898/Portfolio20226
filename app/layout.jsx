import { Hanken_Grotesk, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Starfield from "@/components/Starfield";
import Nav from "@/components/Nav";
import StarPal from "@/components/StarPal";
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

export const metadata = {
  title: `${profile.name} — ${profile.role}`,
  description: profile.bio,
};

export const viewport = { themeColor: "#04050c" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Starfield />
        <Nav />
        <main id="main">{children}</main>
        <StarPal />
      </body>
    </html>
  );
}
