import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.auth.forgotPassword(email.trim());
      if (res.resetUrl) setResetUrl(res.resetUrl);
      toast.success("Reset link generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-md rounded-xl border border-border bg-card p-6">
      <h1 className="font-display text-xl font-bold text-foreground">Forgot Password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we will send you a password reset link.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      {resetUrl && (
        <div className="mt-4 rounded-lg bg-muted p-3 text-xs">
          Development reset link:{" "}
          <a href={resetUrl} className="break-all text-primary underline">
            {resetUrl}
          </a>
        </div>
      )}
      <Link to="/auth" className="mt-4 inline-block text-sm text-primary hover:underline">
        Back to login
      </Link>
    </div>
  );
}
