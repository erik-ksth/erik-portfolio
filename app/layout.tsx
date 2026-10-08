import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope, Outfit, Space_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SmoothScroll from "@/components/smooth-scroll";
import Preloader from "@/components/preloader";
import Cursor from "@/components/cursor";
import Header from "@/components/header";
import CommandPalette from "@/components/command-palette";
import SoundEffects from "@/components/sound-effects";

const display = Outfit({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700", "800"] });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const mono = Space_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Erik Hein — Engineer × Designer",
  description:
    "Erik Hein is a software engineer and designer in San Francisco crafting AI products and interfaces with care.",
};

export const viewport: Viewport = {
  themeColor: "#f4f4f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="paper-grain font-sans antialiased">
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
