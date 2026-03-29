import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB, hintFromMongoError } from "@/lib/db";
import { getMongoUriSetupError } from "@/lib/env";
import { User } from "@/models/User";
import { validateLoginBody } from "@/lib/validate/auth";
import { signSessionToken } from "@/lib/auth/session-token";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "@/lib/auth/constants";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateLoginBody(json);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: 400 });
  }

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

  try {
    await connectDB();
  } catch (e) {
    console.error("MongoDB connection error:", e);
    const payload: { error: string; details?: string } = {
      error: "Could not connect to database",
    };
    if (process.env.NODE_ENV === "development") {
      payload.details = hintFromMongoError(e);
    }
    return NextResponse.json(payload, { status: 503 });
  }

  const user = await User.findOne({ email: parsed.email }).select("+password").exec();
  if (!user?.password) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const match = await bcrypt.compare(parsed.password, user.password);
  if (!match) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  let token: string;
  try {
    token = await signSessionToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });
  } catch (e) {
    console.error("JWT sign error:", e);
    return NextResponse.json(
      { error: "Auth configuration error. Ensure JWT_SECRET is at least 16 characters." },
      { status: 503 }
    );
  }

  const res = NextResponse.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  });

  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });

  return res;
}
