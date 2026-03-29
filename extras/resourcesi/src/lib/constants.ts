export const TRENDING_TAGS = [
  "Startup",
  "Innovation",
  "SemesterProject",
  "Robotics",
  "AI",
  "IoT",
  "Research",
  "Quantum",
  "Web3",
  "CleanTech",
  "NLP",
  "OpenSource",
  "ML",
  "React",
  "Python",
  "TypeScript",
  "Embedded",
];

export const PREDEFINED_SKILLS = [
  "AI",
  "Machine Learning",
  "IoT",
  "Robotics",
  "Web Development",
  "App Development",
  "Embedded Systems",
  "Research",
  "UI/UX",
  "Data Science",
];

export const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", description: "Just getting started" },
  { value: "intermediate", label: "Intermediate", description: "Some hands-on experience" },
  { value: "advanced", label: "Advanced", description: "Deep expertise" },
];

export const INTERESTS = ["Collaboration", "Internship", "Funding", "Research"];

export const avatarPlaceholder = (name: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
