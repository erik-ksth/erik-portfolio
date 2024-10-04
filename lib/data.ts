import studybuddyImg from "@/public/studybuddy.png";
import recipeGeniusImg from "@/public/recipeGenius.png";
import snapClientImg from "@/public/snapClient.png";
import enstantImg from "@/public/enstant.png";
import typeInZenImg from "@/public/typeInZen.png";
import zenBoardImg from "@/public/zenBoard.png";

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
    title: "Software Engineer",
    location: "Iditor Inc.",
    date: "Sep 2024 - present",
  },
  {
    title: "Software Development Engineer Intern",
    location: "Graph Academy",
    date: "May 2024 - Sep 2024",
  },
  {
    title: "Student Ambassador",
    location: "Adobe",
    date: "Apr 2024 - present",
  },
  {
    title: "Bachelor's Degree in Computer Science",
    location: "San José State University",
    date: "2023 - 2025",
  },
  {
    title: "Front-End Developer & UI/UX Designer",
    location: "Bridge Burma",
    date: "Aug 2023 - present",
  },
  {
    title: "Web Development Intern",
    location: "Oakmead Printing Inc.",
    date: "Sep 2023 - Nov 2023",
  },
  {
    title: "Associate's Degree for Transfer in Computer Science",
    location: "De Anza College",
    date: "Jun 2023",
  },
  {
    title: "Head of Marketing",
    location: "De Anza International Students Connection",
    date: "Mar 2022 - May 2023",
  },
  {
    title: "Co-Founder and Project Leader",
    location: "Robotics Society of De Anza",
    date: "Mar 2022 - Oct 2022",
  },
] as const;

export const projectsData = [
  {
    title: "Zen Board: AI Scheduler",
    description:
      "An AI scheduling app that genereate a productive schedule for the user based on their input and the availability of the user.",
    tags: ["React", "Generative AI", "Next JS", "Typescript"],
    imageUrl: zenBoardImg,
    link: "https://zenboardai.vercel.app/",
  },
  {
    title: "Type In Zen",
    description:
      "A zen, relaxing and calming typing game. The content is generated by AI.",
    tags: ["React", "Generative AI", "JavaScript"],
    imageUrl: typeInZenImg,
    link: "https://typeinzen.vercel.app/",
  },
  {
    title: "Study Buddy",
    description:
      "A web app to boost productivity. It includes Pomodoro Timer, To-Do-List, Different kinds of ambient sounds and musics and Inspriational quotes by famouse people",
    tags: ["HTML", "CSS", "JavaScript", "JQuery"],
    imageUrl: studybuddyImg,
    link: "https://study-buddy.vercel.app/",
  },
  {
    title: "Recipe Genius",
    description:
      "An application that generate possible dishes and recipes depending on the ingredients in the fridge. A project for Object Oriented Design class at SJSU.",
    tags: ["JAVA", "JavaFX", "API", "OOP"],
    imageUrl: recipeGeniusImg,
    link: "https://github.com/erik-ksth/CS151-RecipeGenius",
  },
  {
    title: "Enstant",
    description:
      "A responsive website for business card ordering service by Oakmead Printing Inc.",
    tags: ["React", "Tailwind", "Material UI", "Email.JS"],
    imageUrl: enstantImg,
    link: "https://enstant.vercel.app/",
  },
  {
    title: "Snap Client",
    description:
      "A responsive website for a medical software company, SnapClient. Used plugins for creating the components (Contact form, map, etc.) and tracking user engagement.",
    tags: ["WordPress", "Site 5"],
    imageUrl: snapClientImg,
    link: "https://snapclient.com/",
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
  "Flutter",
  "JavaFX",
  "API",
  "Git",
  "Arduino",
  "Tailwind",
  "MySQL",
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
