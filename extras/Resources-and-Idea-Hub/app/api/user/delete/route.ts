import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB, hintFromMongoError } from "@/lib/db";
import { getMongoUriSetupError } from "@/lib/env";
import { getSessionUserId } from "@/lib/auth/request-auth";
import { User } from "@/models/User";
import { Idea } from "@/models/Idea";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export async function DELETE(request: Request) {
  const mongoSetup = getMongoUriSetupError();
  if (mongoSetup) return NextResponse.json({ error: mongoSetup }, { status: 503 });

  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { password?: unknown };
  try {
    body = (await request.json()) as { password?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const password = String(body?.password ?? "");
  if (!password) return NextResponse.json({ error: "Password is required" }, { status: 400 });

  try {
    await connectDB();
  } catch (e) {
    const payload: { error: string; details?: string } = { error: "Could not connect to database" };
    if (process.env.NODE_ENV === "development") payload.details = hintFromMongoError(e);
    return NextResponse.json(payload, { status: 503 });
  }

  const user = await User.findById(userId).select("+password").exec();
  if (!user?.password) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: "Password is incorrect" }, { status: 401 });

  await Promise.all([
    Idea.deleteMany({ userId: user._id }),
    User.deleteOne({ _id: user._id }),
  ]);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

