import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB, hintFromMongoError } from "@/lib/db";
import { getMongoUriSetupError } from "@/lib/env";
import { User } from "@/models/User";
import { validateSignupBody } from "@/lib/validate/auth";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateSignupBody(json);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: 400 });
  }

  const mongoSetup = getMongoUriSetupError();
  if (mongoSetup) {
    return NextResponse.json({ error: mongoSetup }, { status: 503 });
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

  const existing = await User.findOne({ email: parsed.email }).lean();
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(parsed.password, 12);

  try {
    const user = await User.create({
      name: parsed.name,
      email: parsed.email,
      password: hashed,
    });

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: number }).code === 11000) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    console.error("Signup error:", e);
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }
}
