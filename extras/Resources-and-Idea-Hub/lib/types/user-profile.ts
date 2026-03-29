export type UserRole =
  | ""
  | "student"
  | "mentor_guide_professor_teacher"
  | "industrialists_employee";

export type HighestEducation =
  | ""
  | "high_school"
  | "diploma"
  | "bachelor"
  | "master"
  | "doctorate"
  | "post_doctorate"
  | "other";

export type EducationItem = {
  degree: string;
  field: string;
  institution: string;
  year: string;
};

export type SocialLinks = {
  portfolio: string;
  linkedin: string;
  github: string;
  twitter: string;
  googleScholar: string;
};

export type UserProfile = {
  id: string;
  profilePhoto: string;
  coverPhoto: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  role: UserRole;
  highestEducation: HighestEducation;
  institution: string;
  education: EducationItem[];
  skills: string[];
  socialLinks: SocialLinks;
  isPublic: boolean;
  paidContact: boolean;
  walletBalance: number;
  joinedAt: string | null;
};

