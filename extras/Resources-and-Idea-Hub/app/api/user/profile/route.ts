import { NextResponse } from "next/server";
import { connectDB, hintFromMongoError } from "@/lib/db";
import { getMongoUriSetupError } from "@/lib/env";
import { getSessionUserId } from "@/lib/auth/request-auth";
import { User } from "@/models/User";
import type {
  EducationItem,
  HighestEducation,
  SocialLinks,
  UserProfile,
  UserRole,
} from "@/lib/types/user-profile";

type ProfileInput = Partial<UserProfile> & {
  education?: Partial<EducationItem>[];
  socialLinks?: Partial<SocialLinks>;
};

type ProfileUpdate = {
  profilePhoto: string;
  coverPhoto: string;
  name: string;
  phone: string;
  bio: string;
  role: UserRole;
  highestEducation: HighestEducation;
  institution: string;
  education: EducationItem[];
  skills: string[];
  socialLinks: SocialLinks;
};

function toProfile(user: Record<string, unknown>) {
  return {
    id: String(user._id),
    profilePhoto: user.profilePhoto ?? "",
    coverPhoto: user.coverPhoto ?? "",
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    bio: user.bio ?? "",
    role: user.role ?? "",
    highestEducation: user.highestEducation ?? "",
    institution: user.institution ?? "",
    education: Array.isArray(user.education) ? user.education : [],
    skills: Array.isArray(user.skills) ? user.skills : [],
    socialLinks: user.socialLinks ?? {
      portfolio: "",
      linkedin: "",
      github: "",
      twitter: "",
      googleScholar: "",
    },
    isPublic: Boolean(user.isPublic),
    paidContact: Boolean(user.paidContact),
    walletBalance: Number(user.walletBalance ?? 0),
    joinedAt: user.createdAt ?? null,
  };
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function GET(request: Request) {
  const mongoSetup = getMongoUriSetupError();
  if (mongoSetup) return NextResponse.json({ error: mongoSetup }, { status: 503 });

  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    await connectDB();
  } catch (e) {
    const payload: { error: string; details?: string } = { error: "Could not connect to database" };
    if (process.env.NODE_ENV === "development") payload.details = hintFromMongoError(e);
    return NextResponse.json(payload, { status: 503 });
  }

  const user = await User.findById(userId).lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ profile: toProfile(user) });
}

export async function PUT(request: Request) {
  const mongoSetup = getMongoUriSetupError();
  if (mongoSetup) return NextResponse.json({ error: mongoSetup }, { status: 503 });

  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: ProfileInput;
  try {
    body = (await request.json()) as ProfileInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update: ProfileUpdate = {
    profilePhoto: String(body.profilePhoto ?? "").trim(),
    coverPhoto: String(body.coverPhoto ?? "").trim(),
    name: String(body.name ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    bio: String(body.bio ?? "").trim(),
    role: String(body.role ?? "").trim() as UserRole,
    highestEducation: String(body.highestEducation ?? "").trim() as HighestEducation,
    institution: String(body.institution ?? "").trim(),
    education: Array.isArray(body.education)
      ? body.education.map((e: Partial<EducationItem>) => ({
          degree: String(e?.degree ?? "").trim(),
          field: String(e?.field ?? "").trim(),
          institution: String(e?.institution ?? "").trim(),
          year: String(e?.year ?? "").trim(),
        }))
      : [],
    skills: Array.isArray(body.skills)
      ? body.skills.map((s: unknown) => String(s).trim()).filter(Boolean)
      : [],
    socialLinks: {
      portfolio: String(body?.socialLinks?.portfolio ?? "").trim(),
      linkedin: String(body?.socialLinks?.linkedin ?? "").trim(),
      github: String(body?.socialLinks?.github ?? "").trim(),
      twitter: String(body?.socialLinks?.twitter ?? "").trim(),
      googleScholar: String(body?.socialLinks?.googleScholar ?? "").trim(),
    },
  };

  if (!update.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (update.bio && countWords(update.bio) > 100) {
    return NextResponse.json({ error: "Bio must be at most 100 words" }, { status: 400 });
  }
  if (
    update.role &&
    !["student", "mentor_guide_professor_teacher", "industrialists_employee"].includes(update.role)
  ) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (
    update.highestEducation &&
    ![
      "high_school",
      "diploma",
      "bachelor",
      "master",
      "doctorate",
      "post_doctorate",
      "other",
    ].includes(update.highestEducation)
  ) {
    return NextResponse.json({ error: "Invalid highest education value" }, { status: 400 });
  }

  try {
    await connectDB();
  } catch (e) {
    const payload: { error: string; details?: string } = { error: "Could not connect to database" };
    if (process.env.NODE_ENV === "development") payload.details = hintFromMongoError(e);
    return NextResponse.json(payload, { status: 503 });
  }

  const updated = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).lean();
  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ profile: toProfile(updated) });
}

