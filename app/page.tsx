import Hero from "@/components/hero";
import About from "@/components/about";
import Work from "@/components/work";
import Skills from "@/components/skills";
import Experience from "@/components/experience";
import Contact from "@/components/contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Work />
      <Skills />
      <Experience />
      <Contact />
    </main>
  );
}
