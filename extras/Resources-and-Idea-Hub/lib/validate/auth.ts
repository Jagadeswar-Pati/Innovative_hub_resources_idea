const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignupBody(body: unknown): { ok: true; name: string; email: string; password: string } | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Invalid JSON body" };
  }
  const { name, email, password } = body as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim()) {
    return { ok: false, message: "Name is required" };
  }
  const n = name.trim();
  if (n.length > 120) {
    return { ok: false, message: "Name is too long" };
  }

  if (typeof email !== "string" || !email.trim()) {
    return { ok: false, message: "Email is required" };
  }
  const e = email.trim().toLowerCase();
  if (!EMAIL_RE.test(e)) {
    return { ok: false, message: "Invalid email address" };
  }

  if (typeof password !== "string") {
    return { ok: false, message: "Password is required" };
  }
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters" };
  }
  if (password.length > 128) {
    return { ok: false, message: "Password is too long" };
  }

  return { ok: true, name: n, email: e, password };
}

export function validateLoginBody(
  body: unknown
): { ok: true; email: string; password: string } | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Invalid JSON body" };
  }
  const { email, password } = body as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim()) {
    return { ok: false, message: "Email is required" };
  }
  const e = email.trim().toLowerCase();
  if (!EMAIL_RE.test(e)) {
    return { ok: false, message: "Invalid email address" };
  }

  if (typeof password !== "string" || !password) {
    return { ok: false, message: "Password is required" };
  }
  if (password.length > 128) {
    return { ok: false, message: "Invalid credentials" };
  }

  return { ok: true, email: e, password };
}
