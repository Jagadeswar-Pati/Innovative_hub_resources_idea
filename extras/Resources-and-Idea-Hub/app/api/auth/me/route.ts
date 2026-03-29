import { NextResponse } from "next/server";
import { connectDB, hintFromMongoError } from "@/lib/db";
import { getMongoUriSetupError } from "@/lib/env";
import { getSessionUserId } from "@/lib/auth/request-auth";
import { User } from "@/models/User";

export async function GET(request: Request) {
  const mongoSetup = getMongoUriSetupError();
  if (mongoSetup) {
    return NextResponse.json({ error: mongoSetup }, { status: 503 });
  }

  if (!process.env.JWT_SECRET) {
    return NextResponse.json(
      { error: "Auth is not configured. Set JWT_SECRET in .env.local" },
      { status: 503 }
    );
  }

  const userId = await getSessionUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectDB();
  } catch (e) {
    const body: { error: string; details?: string } = { error: "Could not connect to database" };
    if (process.env.NODE_ENV === "development") {
      body.details = hintFromMongoError(e);
    }
    return NextResponse.json(body, { status: 503 });
  }

  const user = await User.findById(userId).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      joinedAt: user.createdAt ?? null,
    },
  });
}

