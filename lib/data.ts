import studybuddyImg from "@/public/studybuddy.png";
import recipeGeniusImg from "@/public/recipeGenius.png";
import snapClientImg from "@/public/snapClient.png";
import enstantImg from "@/public/enstant.png";

export const links = [
  {
    name: "Home",
    hash: "#home",
  },
  {
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "About",
    hash: "#about",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Experience",
    hash: "#experience",
  },
  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const experiencesData = [
  {
    title: "Front-End Developer & UI/UX Designer",
    location: "Bridge Burma",
    date: "2023 - present",
  },
  {
    title: "Associate's Degree in Computer Science",
    location: "De Anza College",
    date: "2023",
  },
  {
    title: "Co-Founder and Project Leader",
    location: "Robotics Society of De Anza",
    date: "2022",
  },
] as const;

export const projectsData = [
  {
    title: "Study Buddy",
    description:
      "A web app to boost productivity. It includes Pomodoro Timer, To-Do-List, Different kinds of ambient sounds and musics and Inspriational quotes by famouse people",
    tags: ["HTML", "CSS", "JavaScript", "JQuery"],
    imageUrl: studybuddyImg,
    link: "https://study-buddy.vercel.app/"
  },
  {
    title: "Recipe Genius",
    description:
      "An application that generate possible dishes and recipes depending on the ingredients in the fridge. A project for Object Oriented Design class at SJSU.",
    tags: ["JAVA", "JavaFX", "API", "OOP"],
    imageUrl: recipeGeniusImg,
    link: "https://github.com/erik-ksth/CS151-RecipeGenius"
  },
  {
    title: "Enstant",
    description:
      "A responsive website for business card ordering service by Oakmead Printing Inc.",
    tags: ["React", "Tailwind", "Material UI", "Email.JS"],
    imageUrl: enstantImg,
    link: "https://enstant.vercel.app/"
  },
  {
    title: "Snap Client",
    description:
      "A responsive website for a medical software company, SnapClient. Used plugins for creating the components (Contact form, map, etc.) and tracking user engagement.",
    tags: ["WordPress", "Site 5"],
    imageUrl: snapClientImg,
    link: "https://snapclient.com/"
  },
] as const;

export const skillsData = [
  "C++",
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "Prisma",
  "HTML",
  "CSS",
  "Bootstrap",
  "React",
  "Next.js",
  "Node.js",
  "JavaFX",
  "API",
  "Git",
  "Arduino",
  "Tailwind",
  "MongoDB",
  "Firebase",
  "Google AI Cloud",
  "Wordpress",
  "Framer Motion",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Adobe XD",
  "Figma",
] as const;