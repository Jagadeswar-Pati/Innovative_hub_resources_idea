/** Engineering domain options for create-idea flow (value stored on Idea.branch). */
export const ENGINEERING_DOMAINS = [
  { value: "CSE-Core", label: "Computer Science & Engineering (Core)" },
  { value: "CSE-AI/ML", label: "Computer Science — AI & ML" },
  { value: "CST", label: "Computer Science & Technology" },
  { value: "IT", label: "Information Technology" },
  { value: "ECE", label: "Electronics & Communication" },
  { value: "ECS", label: "Electronics & Computer Science" },
  { value: "EEE", label: "Electrical & Electronics" },
  { value: "EE", label: "Electrical Engineering" },
  { value: "Civil", label: "Civil Engineering" },
  { value: "Mechanical", label: "Mechanical Engineering" },
] as const;

export type EngineeringDomainValue = (typeof ENGINEERING_DOMAINS)[number]["value"];
