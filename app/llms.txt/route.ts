import { email, experiencesData, projectsData, skillsDataCategorized, socials } from "@/lib/data";

// A plain-text profile for AI agents and LLM crawlers (the llms.txt convention).
// Built from the same data as the site, so it never drifts.
export const dynamic = "force-static";

export function GET() {
  const lines = [
    "# Erik Hein",
    "",
    "> Product engineer in San Francisco building AI products and creative, interactive interfaces. Software Engineer at Iditor Inc. and founder of Solariz Studio LLC. B.S. Computer Science, San José State University.",
    "",
    "## Skills",
    ...skillsDataCategorized.map((g) => `- ${g.category}: ${g.skills.join(", ")}`),
    "",
    "## Projects",
    ...projectsData.map((p) => `- [${p.title}](${p.link}): ${p.subtitle}. ${p.description} (${p.tags.join(", ")})`),
    "",
    "## Experience and education",
    ...experiencesData.map((e) => `- ${e.title}, ${e.location} (${e.date})`),
    "",
    "## Contact",
    `- Email: ${email}`,
    ...socials.map((s) => `- ${s.name}: ${s.href}`),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
