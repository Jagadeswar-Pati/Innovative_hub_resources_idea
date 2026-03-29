"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/lib/types/user-profile";
import { Icon } from "@/components/ui/Icon";

const baseProfile: UserProfile = {
  id: "",
  profilePhoto: "",
  coverPhoto: "",
  name: "",
  email: "",
  phone: "",
  bio: "",
  role: "",
  highestEducation: "",
  institution: "",
  education: [],
  skills: [],
  socialLinks: {
    portfolio: "",
    linkedin: "",
    github: "",
    twitter: "",
    googleScholar: "",
  },
  isPublic: true,
  paidContact: false,
  walletBalance: 0,
  joinedAt: null,
};

function normalize(raw: Partial<UserProfile> | null | undefined): UserProfile {
  return {
    ...baseProfile,
    ...raw,
    education: Array.isArray(raw?.education) ? raw.education : [],
    skills: Array.isArray(raw?.skills) ? raw.skills : [],
    socialLinks: { ...baseProfile.socialLinks, ...(raw?.socialLinks ?? {}) },
  };
}

export function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(baseProfile);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile", { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          details?: string;
          profile?: UserProfile;
        };
        if (!active) return;
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          setError(data.details ? `${data.error ?? "Error"} — ${data.details}` : data.error ?? "Failed to load settings");
          return;
        }
        setProfile(normalize(data.profile));
      } catch {
        if (active) setError("Network error while loading settings.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProfile();
    return () => {
      active = false;
    };
  }, [router]);

  const walletSummary = useMemo(() => {
    const balance = Number(profile.walletBalance ?? 0);
    return {
      available: balance,
      thisMonth: balance * 0.3,
      lifetime: balance * 2.1,
    };
  }, [profile.walletBalance]);

  async function saveProfileInfo() {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          profilePhoto: profile.profilePhoto,
          coverPhoto: profile.coverPhoto,
          phone: profile.phone,
          bio: profile.bio,
          role: profile.role,
          institution: profile.institution,
          education: profile.education,
          skills: profile.skills,
          socialLinks: profile.socialLinks,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: string;
        profile?: UserProfile;
      };
      if (!res.ok) {
        setError(data.details ? `${data.error ?? "Error"} — ${data.details}` : data.error ?? "Failed to update profile info");
        return;
      }
      setProfile(normalize(data.profile));
      setSuccess("Profile info updated.");
    } catch {
      setError("Network error while saving profile info.");
    }
  }

  async function savePrivacy() {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/user/privacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublic: profile.isPublic,
          paidContact: profile.paidContact,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: string;
      };
      if (!res.ok) {
        setError(data.details ? `${data.error ?? "Error"} — ${data.details}` : data.error ?? "Failed to update privacy settings");
        return;
      }
      setSuccess("Privacy settings updated.");
    } catch {
      setError("Network error while updating privacy settings.");
    }
  }

  async function updatePassword() {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; details?: string };
      if (!res.ok) {
        setError(data.details ? `${data.error ?? "Error"} — ${data.details}` : data.error ?? "Failed to update password");
        return;
      }
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Password updated successfully.");
    } catch {
      setError("Network error while updating password.");
    }
  }

  async function deleteAccount() {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; details?: string };
      if (!res.ok) {
        setError(data.details ? `${data.error ?? "Error"} — ${data.details}` : data.error ?? "Failed to delete account");
        return;
      }
      router.push("/signup");
      router.refresh();
    } catch {
      setError("Network error while deleting account.");
    }
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto w-full max-w-[980px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/profile" className="btn-outline text-sm">
            <span className="inline-flex items-center gap-2">
              <Icon name="arrowRight" size={14} className="rotate-180" />
              Back to Profile
            </span>
          </Link>
          <h1 className="font-syne text-2xl font-extrabold">Settings</h1>
        </div>

        {loading && <div className="card p-6 text-[var(--muted)]">Loading settings...</div>}
        {!loading && (
          <div className="space-y-5">
            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
            {success && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</div>}

            <div className="card p-5">
              <h2 className="font-syne mb-4 text-lg font-bold">1. Profile Info</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input className="input-field" placeholder="Profile Photo URL" value={profile.profilePhoto} onChange={(e) => setProfile((p) => ({ ...p, profilePhoto: e.target.value }))} />
                <input className="input-field" placeholder="Cover Photo URL" value={profile.coverPhoto} onChange={(e) => setProfile((p) => ({ ...p, coverPhoto: e.target.value }))} />
                <input className="input-field md:col-span-2" placeholder="Name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="mt-4 text-right">
                <button type="button" className="btn-gold text-sm" onClick={saveProfileInfo}>
                  Save Profile Info
                </button>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-syne mb-4 text-lg font-bold">2. Privacy & Monetization</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Public Profile</div>
                    <div className="text-xs text-[var(--muted)]">Allow others to view your profile publicly.</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={profile.isPublic}
                      onChange={(e) => setProfile((p) => ({ ...p, isPublic: e.target.checked }))}
                    />
                    <span className="switch-slider" />
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Paid Profile Contact</div>
                    <div className="text-xs text-[var(--muted)]">Charge users before they contact you.</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={profile.paidContact}
                      onChange={(e) => setProfile((p) => ({ ...p, paidContact: e.target.checked }))}
                    />
                    <span className="switch-slider" />
                  </label>
                </div>
              </div>
              <div className="mt-4 text-right">
                <button type="button" className="btn-gold text-sm" onClick={savePrivacy}>
                  Save Privacy
                </button>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-syne mb-4 text-lg font-bold">3. Wallet</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="card p-4">
                  <div className="text-xs text-[var(--muted)]">Available Balance</div>
                  <div className="font-syne text-lg text-[var(--gold)]">₹{walletSummary.available.toFixed(2)}</div>
                </div>
                <div className="card p-4">
                  <div className="text-xs text-[var(--muted)]">Earnings This Month</div>
                  <div className="font-syne text-lg">₹{walletSummary.thisMonth.toFixed(2)}</div>
                </div>
                <div className="card p-4">
                  <div className="text-xs text-[var(--muted)]">Lifetime Earnings</div>
                  <div className="font-syne text-lg">₹{walletSummary.lifetime.toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-4 text-right">
                <button type="button" className="btn-outline text-sm">Withdraw (Coming Soon)</button>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-syne mb-4 text-lg font-bold">4. Change Password</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input className="input-field" type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
                <input className="input-field" type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
                <input className="input-field" type="password" placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
              </div>
              <div className="mt-4 text-right">
                <button type="button" className="btn-gold text-sm" onClick={updatePassword}>
                  Update Password
                </button>
              </div>
            </div>

            <div className="card border border-red-500/30 p-5">
              <h2 className="font-syne mb-2 text-lg font-bold text-red-300">5. Delete Account</h2>
              <p className="mb-3 text-sm text-red-200">
                This action is irreversible. Your account and your posted ideas will be permanently deleted.
              </p>
              {!deleteConfirm ? (
                <button type="button" className="btn-outline border-red-500/50 text-red-300" onClick={() => setDeleteConfirm(true)}>
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    className="input-field"
                    type="password"
                    placeholder="Enter your password to confirm"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button type="button" className="btn-outline" onClick={() => setDeleteConfirm(false)}>
                      Cancel
                    </button>
                    <button type="button" className="btn-gold bg-red-500 text-white" onClick={deleteAccount}>
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

