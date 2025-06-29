import About from "@/components/about";
import Contact from "@/components/contact";
import Experience from "@/components/experience";
import Intro from "@/components/intro";
import Projects from "@/components/projects";
import Skills from "@/components/skills";

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      {/* Hero Section */}
      <Intro />

      {/* Projects Section */}
      <section className="w-full max-w-7xl px-4 py-20">
        <Projects />
      </section>

      {/* About Section */}
      <section className="w-full max-w-7xl px-4 py-20">
        <About />
      </section>

      {/* Skills Section */}
      <section className="w-full max-w-7xl px-4 py-20">
        <Skills />
      </section>

      {/* Experience Section */}
      <section className="w-full max-w-7xl px-4 py-20">
        <Experience />
      </section>

      {/* Contact Section */}
      <section className="w-full max-w-7xl px-4 py-20">
        <Contact />
      </section>
    </main>
  )
}
