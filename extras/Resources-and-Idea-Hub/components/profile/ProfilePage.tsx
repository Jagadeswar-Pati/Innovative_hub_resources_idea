"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { IdeaCard } from "@/components/dashboard/IdeaCard";
import type { Idea } from "@/lib/types/idea";
import type { EducationItem, UserProfile, UserRole } from "@/lib/types/user-profile";
import { SKILL_OPTIONS } from "@/lib/data/skills";

const emptyProfile: UserProfile = {
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

function normalizeProfile(raw: Partial<UserProfile> | null | undefined): UserProfile {
  return {
    ...emptyProfile,
    ...raw,
    education: Array.isArray(raw?.education) ? raw.education : [],
    skills: Array.isArray(raw?.skills) ? raw.skills : [],
    socialLinks: { ...emptyProfile.socialLinks, ...(raw?.socialLinks ?? {}) },
  };
}

export function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [posts, setPosts] = useState<Idea[]>([]);
  const [skillsInput, setSkillsInput] = useState("");

  useEffect(() => {
    let active = true;
    async function loadAll() {
      try {
        const [profileRes, postsRes] = await Promise.all([
          fetch("/api/user/profile", { method: "GET", cache: "no-store" }),
          fetch("/api/user/posts", { method: "GET", cache: "no-store" }),
        ]);
        const profileData = (await profileRes.json().catch(() => ({}))) as {
          error?: string;
          details?: string;
          profile?: UserProfile;
        };
        const postsData = (await postsRes.json().catch(() => ({}))) as {
          posts?: Idea[];
        };

        if (!active) return;
        if (!profileRes.ok) {
          if (profileRes.status === 401) {
            router.push("/login");
            return;
          }
          const msg = profileData.details
            ? `${profileData.error ?? "Error"} — ${profileData.details}`
            : profileData.error ?? "Failed to load profile";
          setError(msg);
          return;
        }

        setProfile(normalizeProfile(profileData.profile));
        setPosts(Array.isArray(postsData.posts) ? postsData.posts : []);
      } catch {
        if (active) setError("Network error while loading profile.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadAll();
    return () => {
      active = false;
    };
  }, [router]);

  const initials = useMemo(() => {
    if (!profile.name) return "YO";
    return (
      profile.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "YO"
    );
  }, [profile.name]);

  const joined = useMemo(() => {
    if (!profile.joinedAt) return "Unknown";
    const d = new Date(profile.joinedAt);
    if (Number.isNaN(d.getTime())) return "Unknown";
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }, [profile.joinedAt]);

  const bioWords = useMemo(
    () => profile.bio.trim().split(/\s+/).filter(Boolean).length,
    [profile.bio]
  );

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore network errors and navigate */
    }
    router.push("/login");
    router.refresh();
  }

  function addSkill() {
    const value = skillsInput.trim();
    if (!value || profile.skills.includes(value)) return;
    setProfile((p) => ({ ...p, skills: [...p.skills, value] }));
    setSkillsInput("");
  }

  function addSkillFromPreset(skill: string) {
    if (!skill || profile.skills.includes(skill)) return;
    setProfile((p) => ({ ...p, skills: [...p.skills, skill] }));
  }

  function removeSkill(skill: string) {
    setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
  }

  function addEducation() {
    const next: EducationItem = { degree: "", field: "", institution: "", year: "" };
    setProfile((p) => ({ ...p, education: [...p.education, next] }));
  }

  function removeEducation(index: number) {
    setProfile((p) => ({ ...p, education: p.education.filter((_, i) => i !== index) }));
  }

  async function saveProfile() {
    setError(null);
    setSuccess(null);
    if (!profile.name.trim()) return setError("Name is required");
    if (bioWords > 100) return setError("Bio must be at most 100 words");

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: string;
        profile?: UserProfile;
      };
      if (!res.ok) {
        setError(data.details ? `${data.error ?? "Error"} — ${data.details}` : data.error ?? "Failed to save profile");
        return;
      }
      setProfile(normalizeProfile(data.profile));
      setSuccess("Profile updated successfully");
      setEditing(false);
    } catch {
      setError("Network error while saving profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto w-full max-w-[980px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="btn-outline text-sm">
            <span className="inline-flex items-center gap-2">
              <Icon name="arrowRight" size={14} className="rotate-180" />
              Back to Dashboard
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/settings" className="btn-outline text-sm">
              Settings
            </Link>
            <button type="button" onClick={handleLogout} className="btn-outline text-sm">
              Log Out
            </button>
          </div>
        </div>

        <div className="card p-6">
          {loading && (
            <div className="py-12 text-center text-[var(--muted)]">
              <div className="mb-2 inline-flex animate-pulse">Loading profile...</div>
            </div>
          )}
          {!loading && error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {!loading && success && (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {success}
            </div>
          )}

          {!loading && (
            <>
              <div className="mb-6 overflow-hidden rounded-xl border border-[var(--border)]">
                <div
                  className="h-44 w-full bg-cover bg-center"
                  style={{
                    backgroundImage: profile.coverPhoto
                      ? `url("${profile.coverPhoto}")`
                      : "linear-gradient(120deg, rgba(245,166,35,0.25), rgba(255,107,107,0.2), rgba(33,150,243,0.2))",
                  }}
                />
                <div className="px-6 pb-5">
                  <div className="-mt-10 flex items-end justify-between gap-4">
                    <div className="flex items-end gap-4">
                      {profile.profilePhoto ? (
                        <Image
                          src={profile.profilePhoto}
                          alt="Profile"
                          width={80}
                          height={80}
                          unoptimized
                          className="h-20 w-20 rounded-full border-4 border-[var(--bg)] object-cover"
                        />
                      ) : (
                        <div className="rounded-full border-4 border-[var(--bg)]">
                          <Avatar initials={initials} size={80} />
                        </div>
                      )}
                      <div className="pb-1">
                        <h1 className="font-syne text-3xl font-extrabold">{profile.name || "Your Name"}</h1>
                        <p className="text-sm text-[var(--muted)]">{profile.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-outline text-sm"
                      onClick={() => {
                        setSuccess(null);
                        if (editing) {
                          void saveProfile();
                        } else {
                          setEditing(true);
                        }
                      }}
                    >
                      {editing ? "Save Profile" : "Edit Profile"}
                    </button>
                  </div>
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="card p-4">
                  <div className="mb-1 text-xs text-[var(--muted)]">Name</div>
                  <input className="input-field" disabled={!editing} value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="card p-4">
                  <div className="mb-1 text-xs text-[var(--muted)]">Email</div>
                  <input className="input-field opacity-80" disabled value={profile.email} />
                </div>
                <div className="card p-4">
                  <div className="mb-1 text-xs text-[var(--muted)]">Phone</div>
                  <input className="input-field" disabled={!editing} value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="card p-4">
                  <div className="mb-1 text-xs text-[var(--muted)]">Role</div>
                  <select className="input-field" disabled={!editing} value={profile.role} onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value as UserRole }))}>
                    <option value="">Select role</option>
                    <option value="student">Student</option>
                    <option value="mentor_guide_professor_teacher">Mentor / Guide / Professor / Teacher</option>
                    <option value="industrialists_employee">Industrialists / Employee</option>
                  </select>
                </div>
                <div className="card p-4">
                  <div className="mb-1 text-xs text-[var(--muted)]">Highest Education</div>
                  <select
                    className="input-field"
                    disabled={!editing}
                    value={profile.highestEducation}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, highestEducation: e.target.value as UserProfile["highestEducation"] }))
                    }
                  >
                    <option value="">Select highest education</option>
                    <option value="high_school">High School</option>
                    <option value="diploma">Diploma</option>
                    <option value="bachelor">Bachelor&apos;s Degree</option>
                    <option value="master">Master&apos;s Degree</option>
                    <option value="doctorate">Doctorate (PhD)</option>
                    <option value="post_doctorate">Post-Doctorate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="card p-4 md:col-span-2">
                  <div className="mb-1 text-xs text-[var(--muted)]">Institution</div>
                  <input className="input-field" disabled={!editing} value={profile.institution} onChange={(e) => setProfile((p) => ({ ...p, institution: e.target.value }))} />
                </div>
                <div className="card p-4 md:col-span-2">
                  <div className="mb-1 text-xs text-[var(--muted)]">Bio ({bioWords}/100 words)</div>
                  <textarea className="input-field min-h-[110px]" disabled={!editing} value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} />
                </div>
                <div className="card p-4">
                  <div className="mb-1 text-xs text-[var(--muted)]">Profile Photo URL</div>
                  <input className="input-field" disabled={!editing} value={profile.profilePhoto} onChange={(e) => setProfile((p) => ({ ...p, profilePhoto: e.target.value }))} />
                </div>
                <div className="card p-4">
                  <div className="mb-1 text-xs text-[var(--muted)]">Cover Photo URL</div>
                  <input className="input-field" disabled={!editing} value={profile.coverPhoto} onChange={(e) => setProfile((p) => ({ ...p, coverPhoto: e.target.value }))} />
                </div>
              </motion.div>

              <div className="mb-6 card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-syne text-lg font-bold">Education</h2>
                  {editing && <button type="button" className="btn-outline text-xs" onClick={addEducation}>Add Education</button>}
                </div>
                {profile.education.length === 0 && <p className="text-sm text-[var(--muted)]">No education details added yet.</p>}
                <div className="space-y-3">
                  {profile.education.map((edu, idx) => (
                    <div key={idx} className="rounded-lg border border-[var(--border)] p-3">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <input className="input-field" placeholder="Degree" disabled={!editing} value={edu.degree} onChange={(e) => setProfile((p) => ({ ...p, education: p.education.map((x, i) => (i === idx ? { ...x, degree: e.target.value } : x)) }))} />
                        <input className="input-field" placeholder="Field" disabled={!editing} value={edu.field} onChange={(e) => setProfile((p) => ({ ...p, education: p.education.map((x, i) => (i === idx ? { ...x, field: e.target.value } : x)) }))} />
                        <input className="input-field" placeholder="Institution" disabled={!editing} value={edu.institution} onChange={(e) => setProfile((p) => ({ ...p, education: p.education.map((x, i) => (i === idx ? { ...x, institution: e.target.value } : x)) }))} />
                        <input className="input-field" placeholder="Year" disabled={!editing} value={edu.year} onChange={(e) => setProfile((p) => ({ ...p, education: p.education.map((x, i) => (i === idx ? { ...x, year: e.target.value } : x)) }))} />
                      </div>
                      {editing && <div className="mt-2 text-right"><button type="button" className="text-xs text-red-300 hover:underline" onClick={() => removeEducation(idx)}>Remove</button></div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 card p-4">
                <h2 className="font-syne mb-3 text-lg font-bold">Skills</h2>
                <div className="mb-3 flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="tag-gold inline-flex items-center gap-2">
                      {skill}
                      {editing && <button type="button" className="text-xs" onClick={() => removeSkill(skill)}>×</button>}
                    </span>
                  ))}
                </div>
                {editing && (
                  <div className="space-y-2">
                    <select
                      className="input-field"
                      defaultValue=""
                      onChange={(e) => {
                        addSkillFromPreset(e.target.value);
                        e.currentTarget.value = "";
                      }}
                    >
                      <option value="">Choose from 100+ skills</option>
                      {SKILL_OPTIONS.map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                    <input className="input-field" placeholder="Add skill" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                    <button type="button" className="btn-outline text-sm" onClick={addSkill}>Add</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6 card p-4">
                <h2 className="font-syne mb-3 text-lg font-bold">Social Links</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {(
                    [
                      ["portfolio", "Portfolio"],
                      ["linkedin", "LinkedIn"],
                      ["github", "GitHub"],
                      ["twitter", "Twitter / X"],
                      ["googleScholar", "Google Scholar"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <div className="mb-1 text-xs text-[var(--muted)]">{label}</div>
                      <input className="input-field" disabled={!editing} value={profile.socialLinks[key]} onChange={(e) => setProfile((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: e.target.value } }))} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="card p-4"><div className="mb-1 text-xs text-[var(--muted)]">User ID</div><div className="break-all font-syne text-sm">{profile.id || "-"}</div></div>
                <div className="card p-4"><div className="mb-1 text-xs text-[var(--muted)]">Joined</div><div className="font-syne text-sm">{joined}</div></div>
                <div className="card p-4"><div className="mb-1 text-xs text-[var(--muted)]">Wallet</div><div className="font-syne text-sm text-[var(--gold)]">₹{profile.walletBalance.toFixed(2)}</div></div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-syne text-xl font-bold">Your Posts</h2>
                <span className="text-xs text-[var(--muted)]">{posts.length} total</span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {posts.map((post) => <IdeaCard key={String(post.id)} idea={post} />)}
                {posts.length === 0 && <div className="card col-span-full p-8 text-center text-[var(--muted)]">No ideas posted yet.</div>}
              </div>

              <div className="mt-8 flex justify-end">
                <button type="button" className="btn-gold text-sm" onClick={saveProfile} disabled={!editing || saving}>
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

