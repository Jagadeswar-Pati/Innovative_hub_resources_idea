import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/session-token";

function escapeRegExp(value: string): string {
  return value.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}

export async function getSessionUserId(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const pattern = new RegExp(`(?:^|; )${escapeRegExp(SESSION_COOKIE_NAME)}=([^;]*)`);
  const token = pattern.exec(cookieHeader)?.[1];
  if (!token) return null;

  try {
    const payload = await verifySessionToken(decodeURIComponent(token));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

