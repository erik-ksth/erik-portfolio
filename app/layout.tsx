import Header from "@/components/header";
import "./globals.css";
import { Inter } from "next/font/google";
import ActiveSectionContextProvider from "@/context/active-section-context";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/footer";
import ThemeSwitch from "@/components/theme-switch";
import ThemeContextProvider from "@/context/theme-context";
import Cursor from "@/components/cursor";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Erik | Personal Portfolio",
  description: "Erik is a CS Student at SJSU and Front-end Developer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="!scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body
        className={`${inter.className} bg-white text-black dark:bg-black dark:text-white antialiased`}
      >
        {/* Flat background - no gradients */}
        <div className="fixed inset-0 -z-10 bg-white dark:bg-black"></div>

        <ThemeContextProvider>
          <ActiveSectionContextProvider>
            <Cursor />
            <Header />
            {children}
            <Footer />
            <Toaster position="top-right" />
            <ThemeSwitch />
          </ActiveSectionContextProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
