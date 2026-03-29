import { NextResponse } from "next/server";
import { connectDB, hintFromMongoError } from "@/lib/db";
import { getMongoUriSetupError } from "@/lib/env";
import { getSessionUserId } from "@/lib/auth/request-auth";
import { Idea } from "@/models/Idea";
import type { IdeaType } from "@/lib/types/idea";

const TYPES: IdeaType[] = ["Startup Idea", "Project", "Research"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

function parseBody(raw: unknown): {
  title: string;
  description: string;
  type: IdeaType;
  tags: string[];
  branch: string;
  level: string;
  isPaid: boolean;
  price: number;
} | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "Invalid JSON body" };
  const b = raw as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim() : "";
  const description = typeof b.description === "string" ? b.description.trim() : "";
  const type = typeof b.type === "string" ? b.type.trim() : "";
  const branch = typeof b.branch === "string" ? b.branch.trim() : "";
  const level = typeof b.level === "string" ? b.level.trim() : "";
  const isPaid = Boolean(b.isPaid);
  const priceRaw = b.price;
  const price =
    typeof priceRaw === "number"
      ? priceRaw
      : typeof priceRaw === "string"
        ? Number.parseFloat(priceRaw)
        : 0;

  if (!title || title.length > 120) return { error: "Title must be 1–120 characters" };
  if (!description || description.length > 5000) return { error: "Description must be 1–5000 characters" };
  if (!TYPES.includes(type as IdeaType)) return { error: "Invalid idea type" };
  if (!branch) return { error: "Engineering domain is required" };
  if (!LEVELS.includes(level as (typeof LEVELS)[number])) return { error: "Invalid difficulty level" };

  let tags: string[] = [];
  if (Array.isArray(b.tags)) {
    tags = b.tags
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.replace(/^#+/, "").trim())
      .filter(Boolean)
      .slice(0, 8);
  }
  for (const t of tags) {
    if (t.length > 40) return { error: "Each tag must be at most 40 characters" };
  }

  if (isPaid) {
    if (!Number.isFinite(price) || price < 49) return { error: "Premium ideas require a price of at least ₹49" };
  }

  return {
    title,
    description,
    type: type as IdeaType,
    tags,
    branch,
    level,
    isPaid,
    price: isPaid ? Math.round(price * 100) / 100 : 0,
  };
}

export async function POST(request: Request) {
  const mongoSetup = getMongoUriSetupError();
  if (mongoSetup) return NextResponse.json({ error: mongoSetup }, { status: 503 });

  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseBody(json);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    await connectDB();
  } catch (e) {
    const payload: { error: string; details?: string } = { error: "Could not connect to database" };
    if (process.env.NODE_ENV === "development") payload.details = hintFromMongoError(e);
    return NextResponse.json(payload, { status: 503 });
  }

  try {
    const doc = await Idea.create({
      title: parsed.title,
      description: parsed.description,
      type: parsed.type,
      tags: parsed.tags,
      branch: parsed.branch,
      level: parsed.level,
      isPaid: parsed.isPaid,
      price: parsed.price,
      userId,
    });

    return NextResponse.json(
      {
        ok: true,
        idea: {
          id: String(doc._id),
          title: doc.title,
          type: doc.type,
          branch: doc.branch,
          level: doc.level,
          isPaid: doc.isPaid,
          price: doc.price,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    const payload: { error: string; details?: string } = { error: "Could not publish idea" };
    if (process.env.NODE_ENV === "development") payload.details = e instanceof Error ? e.message : String(e);
    return NextResponse.json(payload, { status: 500 });
  }
}
