import { NextResponse } from "next/server";
import { connectDB, hintFromMongoError } from "@/lib/db";
import { getMongoUriSetupError } from "@/lib/env";
import { getSessionUserId } from "@/lib/auth/request-auth";
import { User } from "@/models/User";
import { Idea } from "@/models/Idea";
import type { Idea as IdeaCardType } from "@/lib/types/idea";

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

  const user = await User.findById(userId).lean() as { _id: unknown; name?: string } | null;
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const initials = String(user.name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  const ideas = await Idea.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
  const posts: IdeaCardType[] = ideas.map((idea: Record<string, unknown>) => ({
    id: String(idea._id),
    title: String(idea.title ?? ""),
    desc: String(idea.description ?? ""),
    creator: String(user.name ?? ""),
    avatar: initials || "YO",
    tags: Array.isArray(idea.tags) ? idea.tags.map((t) => String(t)) : [],
    type: (idea.type === "Startup Idea" || idea.type === "Project" || idea.type === "Research"
      ? idea.type
      : "Project"),
    locked: Boolean(idea.isPaid) || Number(idea.price ?? 0) > 0,
    price: Number(idea.price ?? 0),
    views: Number(idea.views ?? 0),
    likes: Number(idea.likes ?? 0),
    branch: String(idea.branch ?? ""),
    level: String(idea.level ?? ""),
  }));

  return NextResponse.json({ posts });
}

