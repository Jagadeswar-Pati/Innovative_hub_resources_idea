import { NextResponse } from "next/server";
import { connectDB, hintFromMongoError } from "@/lib/db";
import { getMongoUriSetupError } from "@/lib/env";
import { getSessionUserId } from "@/lib/auth/request-auth";
import { User } from "@/models/User";

export async function PUT(request: Request) {
  const mongoSetup = getMongoUriSetupError();
  if (mongoSetup) return NextResponse.json({ error: mongoSetup }, { status: 503 });

  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { isPublic?: unknown; paidContact?: unknown };
  try {
    body = (await request.json()) as { isPublic?: unknown; paidContact?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const isPublic = Boolean(body?.isPublic);
  const paidContact = Boolean(body?.paidContact);

  try {
    await connectDB();
  } catch (e) {
    const payload: { error: string; details?: string } = { error: "Could not connect to database" };
    if (process.env.NODE_ENV === "development") payload.details = hintFromMongoError(e);
    return NextResponse.json(payload, { status: 503 });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { isPublic, paidContact } },
    { new: true }
  ).lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    privacy: {
      isPublic: Boolean(user.isPublic),
      paidContact: Boolean(user.paidContact),
    },
  });
}

