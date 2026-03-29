/**
 * Reads MONGODB_URI and fixes common .env mistakes (quotes, whitespace).
 * Optional MONGODB_PASSWORD + __PASSWORD__ or <password> in URI avoids manual URL-encoding.
 */

function trimAndUnquote(raw: string): string {
  let s = raw.trim();
  if (s.length === 0) return s;
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/** Atlas / Mongo connection string after resolving password placeholders */
export type MongoResolved =
  | { ok: true; uri: string }
  | { ok: false; error: string };

function diagnoseUriShape(uri: string): string | null {
  const rest = uri.replace(/^mongodb(\+srv)?:\/\//i, "");
  const segments = rest.split("@");
  if (segments.length > 2) {
    return "Your MONGODB_URI has more than one unencoded @ before the hostname. Put the raw database password in MONGODB_PASSWORD and use __PASSWORD__ in the URI (see .env.example), or encode every special character in the password (e.g. @ → %40).";
  }

  const userInfo = segments[0] ?? "";
  const colonIdx = userInfo.indexOf(":");
  if (colonIdx !== -1) {
    const password = userInfo.slice(colonIdx + 1);
    if (password.length === 0) {
      return "Your connection string has an empty password (user:@host). Add the database user password after the colon, or use MONGODB_PASSWORD with __PASSWORD__ in MONGODB_URI.";
    }
  }

  return null;
}

/**
 * Resolves MONGODB_URI with optional MONGODB_PASSWORD substitution.
 */
export function resolveMongoUri(): MongoResolved {
  const raw = process.env.MONGODB_URI;
  if (raw == null || typeof raw !== "string") {
    return { ok: false, error: "MONGODB_URI is not set in .env.local" };
  }

  let s = trimAndUnquote(raw);
  if (s.length === 0) {
    return { ok: false, error: "MONGODB_URI is empty" };
  }

  const plainPw = process.env.MONGODB_PASSWORD?.trim();

  if (plainPw) {
    if (s.includes("__PASSWORD__")) {
      s = s.split("__PASSWORD__").join(encodeURIComponent(plainPw));
    }
    s = s.replace(/<password>/gi, encodeURIComponent(plainPw));
  }

  // Common mistake: leaving placeholder like <your_password_here> in the URI.
  // Your current logs show exactly this scenario (e.g. `...: <Gopalresume2005>@...`).
  if (/[<][^>]*[>]/.test(s)) {
    return {
      ok: false,
      error:
        "MONGODB_URI contains a literal <...> placeholder inside the password/URI. Remove the angle brackets and put the real DB user password, OR use MONGODB_PASSWORD + __PASSWORD__ in the URI (recommended).",
    };
  }

  if (s.includes("__PASSWORD__")) {
    return {
      ok: false,
      error:
        "MONGODB_URI still contains __PASSWORD__. Add MONGODB_PASSWORD=your_atlas_db_user_password to .env.local (plain text; do not wrap in quotes).",
    };
  }

  if (/<password>/i.test(s)) {
    return {
      ok: false,
      error:
        "Replace <password> in MONGODB_URI, or add MONGODB_PASSWORD and use __PASSWORD__ where the password goes in the URI. Example: mongodb+srv://user:__PASSWORD__@cluster0.xxx.mongodb.net/ideahub",
    };
  }

  const shape = diagnoseUriShape(s);
  if (shape) {
    return { ok: false, error: shape };
  }

  return { ok: true, uri: s };
}

/** @deprecated use resolveMongoUri — kept for callers that only need string | null */
export function getMongoUri(): string | null {
  const r = resolveMongoUri();
  return r.ok ? r.uri : null;
}

export function getMongoUriSetupError(): string | null {
  const r = resolveMongoUri();
  return r.ok ? null : r.error;
}
