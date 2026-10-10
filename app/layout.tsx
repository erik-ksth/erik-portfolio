import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope, Outfit, Space_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SmoothScroll from "@/components/smooth-scroll";
import Preloader from "@/components/preloader";
import Cursor from "@/components/cursor";
import Header from "@/components/header";
import CommandPalette from "@/components/command-palette";
import { email, experiencesData, skillsData, socials } from "@/lib/data";
import SoundEffects from "@/components/sound-effects";

const display = Outfit({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700", "800"] });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const mono = Space_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Erik Hein — Product Engineer",
  description:
    "Erik Hein is a product engineer in San Francisco building AI products and creative, interactive interfaces.",
};

// Who Erik is, in schema.org terms, for search engines and AI agents.
const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Erik Hein",
  jobTitle: "Product Engineer",
  description: metadata.description,
  email: `mailto:${email}`,
  address: { "@type": "PostalAddress", addressLocality: "San Francisco", addressRegion: "CA", addressCountry: "US" },
  worksFor: [
    { "@type": "Organization", name: "Iditor Inc." },
    { "@type": "Organization", name: "Solariz Studio LLC" },
  ],
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "San José State University" },
    { "@type": "CollegeOrUniversity", name: "De Anza College" },
  ],
  hasOccupation: experiencesData
    .filter((e) => !/degree/i.test(e.title))
    .map((e) => ({ "@type": "Occupation", name: e.title, description: `${e.location}, ${e.date}` })),
  knowsAbout: skillsData,
  sameAs: socials.map((s) => s.href),
};

export const viewport: Viewport = {
  themeColor: "#f4f4f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="paper-grain font-sans antialiased">
        <script
          type="application/ld+json"
          // Static data from lib/data, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
        />
        <SmoothScroll>
          <Preloader />
          <Cursor />
          <Header />
          <CommandPalette />
          <SoundEffects />
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                borderRadius: 10,
                background: "#0a0a0a",
                color: "#f4f4f1",
                fontSize: 14,
                fontFamily: "var(--font-mono)",
              },
              iconTheme: { primary: "#ffd60a", secondary: "#0a0a0a" },
            }}
          />
        </SmoothScroll>
      </body>
    </html>
  );
}
