import { SignJWT, jwtVerify, type JWTPayload } from "jose";

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET must be set (min 16 characters)");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = JWTPayload & {
  email?: string;
  name?: string;
};

export async function signSessionToken(user: {
  id: string;
  email: string;
  name: string;
}): Promise<string> {
  const key = getSecretKey();
  return new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifySessionToken(token: string): Promise<SessionPayload> {
  const key = getSecretKey();
  const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
  return payload;
}
