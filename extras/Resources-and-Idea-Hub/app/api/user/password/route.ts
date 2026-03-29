import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB, hintFromMongoError } from "@/lib/db";
import { getMongoUriSetupError } from "@/lib/env";
import { getSessionUserId } from "@/lib/auth/request-auth";
import { User } from "@/models/User";

export async function PUT(request: Request) {
  const mongoSetup = getMongoUriSetupError();
  if (mongoSetup) return NextResponse.json({ error: mongoSetup }, { status: 503 });

  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: {
    currentPassword?: unknown;
    newPassword?: unknown;
    confirmPassword?: unknown;
  };
  try {
    body = (await request.json()) as {
      currentPassword?: unknown;
      newPassword?: unknown;
      confirmPassword?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const currentPassword = String(body?.currentPassword ?? "");
  const newPassword = String(body?.newPassword ?? "");
  const confirmPassword = String(body?.confirmPassword ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "All password fields are required" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "New password and confirm password do not match" }, { status: 400 });
  }

  try {
    await connectDB();
  } catch (e) {
    const payload: { error: string; details?: string } = { error: "Could not connect to database" };
    if (process.env.NODE_ENV === "development") payload.details = hintFromMongoError(e);
    return NextResponse.json(payload, { status: 503 });
  }

  const user = await User.findById(userId).select("+password").exec();
  if (!user?.password) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  return NextResponse.json({ ok: true });
}

