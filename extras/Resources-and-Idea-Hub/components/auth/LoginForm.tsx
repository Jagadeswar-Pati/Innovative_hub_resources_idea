"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";

type LoginFormProps = {
  bannerRegistered?: boolean;
};

export function LoginForm({ bannerRegistered = false }: LoginFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; details?: string };
      if (!res.ok) {
        const msg =
          data.details != null && data.error != null
            ? `${data.error} — ${data.details}`
            : (data.error ?? data.details ?? "Something went wrong");
        setError(msg);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden lg:flex-row">
      <div
        className="orb"
        style={{
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(245,166,35,0.1), transparent)",
          top: "-20%",
          left: "-10%",
        }}
      />
      <div
        className="orb"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(255,107,107,0.07), transparent)",
          bottom: "10%",
          right: "-5%",
        }}
      />

      <div className="relative z-[1] flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="animate-fadeUp w-full max-w-[440px]">
          <Link
            href="/"
            className="mb-10 flex items-center gap-2 border-0 bg-transparent text-sm text-[var(--muted)] transition-colors hover:text-[var(--gold)]"
          >
            ← Back to home
          </Link>
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#F5A623] to-[#FF8C42]">
              <Icon name="lightbulb" size={20} className="text-[#0A0A0F]" />
            </div>
            <span className="font-syne text-[22px] font-extrabold">
              Idea<span className="text-[var(--gold)]">Hub</span>
            </span>
          </div>
          <h1 className="font-syne mb-2 text-[32px] font-extrabold">Welcome back</h1>
          <p className="mb-9 text-[15px] text-[var(--muted)]">Log in to your account</p>

          {bannerRegistered && (
            <p
              className="mb-6 rounded-lg border border-[rgba(76,175,80,0.35)] bg-[rgba(76,175,80,0.12)] px-4 py-3 text-center text-sm text-[#a5d6a7]"
              role="status"
            >
              Account created successfully. Sign in with your email and password.
            </p>
          )}

          <button
            type="button"
            className="glass mb-6 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[var(--border)] py-3.5 pl-5 pr-5 transition-colors hover:border-[rgba(245,166,35,0.3)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-[15px]">Continue with Google</span>
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-[13px] text-[var(--muted)]">or</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-[13px] text-[var(--muted)]">
                Email Address
              </label>
              <input
                id="login-email"
                name="email"
                className="input-field"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-[13px] text-[var(--muted)]">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                className="input-field"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="mt-1 text-right">
              <span className="cursor-pointer text-[13px] text-[var(--gold)]">Forgot password?</span>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn-gold mt-2 w-full py-3.5 text-base" disabled={loading}>
              {loading ? "Signing in…" : "Log In"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="cursor-pointer text-[var(--gold)] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <AuthSidePanel />
    </div>
  );
}
