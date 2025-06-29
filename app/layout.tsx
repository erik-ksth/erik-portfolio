import Header from "@/components/header";
import "./globals.css";
import { Inter } from "next/font/google";
import ActiveSectionContextProvider from "@/context/active-section-context";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/footer";
import ThemeSwitch from "@/components/theme-switch";
import ThemeContextProvider from "@/context/theme-context";

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
        className={`${inter.className} bg-white text-gray-900 relative dark:bg-gray-950 dark:text-gray-100 antialiased`}
      >
        {/* Subtle gradient background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"></div>
          <div className="absolute top-0 left-1/2 w-[800px] h-[600px] bg-gradient-radial from-blue-100/20 to-transparent dark:from-blue-900/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/2 w-[600px] h-[400px] bg-gradient-radial from-purple-100/20 to-transparent dark:from-purple-900/10 rounded-full blur-3xl"></div>
        </div>

        <ThemeContextProvider>
          <ActiveSectionContextProvider>
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
