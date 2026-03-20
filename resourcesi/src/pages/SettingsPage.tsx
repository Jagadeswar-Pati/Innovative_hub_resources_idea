import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Shield, Wallet, Lock, Trash2, Camera, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { PREDEFINED_SKILLS, EXPERIENCE_LEVELS, avatarPlaceholder } from "@/lib/constants";

type AppRole = "student" | "mentor" | "professor";

const roles: { value: AppRole; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "mentor", label: "Mentor" },
  { value: "professor", label: "Professor" },
];

export default function SettingsPage() {
  const { user, refreshUser, signOut } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<AppRole | "">("");
  const [institution, setInstitution] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [profileVisibility, setProfileVisibility] = useState<"public" | "private">("public");
  const [paidProfile, setPaidProfile] = useState(false);
  const [links, setLinks] = useState({ website: "", linkedin: "", twitter: "", github: "" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setRole((user.role as AppRole) || "");
      setInstitution(user.institution || "");
      setExperienceLevel(user.experienceLevel || "");
      setSkills(user.skills || []);
      setProfileVisibility(user.profileVisibility || "public");
      setPaidProfile(user.paidProfile || false);
      setLinks({
        website: user.links?.website || "",
        linkedin: user.links?.linkedin || "",
        twitter: user.links?.twitter || "",
        github: user.links?.github || "",
      });
    }
  }, [user]);

  if (!user) return null;

  const toggleSkill = (skill: string) => {
    setSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { user: u } = await api.profile.update({
        name,
        username: username || undefined,
        bio,
        role: role || undefined,
        institution,
        experienceLevel: experienceLevel || undefined,
        skills,
        profileVisibility,
        paidProfile,
        links,
      });
      refreshUser();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image (JPEG, PNG, WebP, GIF)");
      return;
    }
    try {
      const { user: u } = await api.profile.uploadAvatar(file);
      refreshUser();
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
    e.target.value = "";
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image (JPEG, PNG, WebP, GIF)");
      return;
    }
    try {
      const { user: u } = await api.profile.uploadCover(file);
      refreshUser();
      toast.success("Cover photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
    e.target.value = "";
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error('Type DELETE to confirm');
      return;
    }
    try {
      await api.auth.deleteAccount(deletePassword, deleteConfirm);
      signOut();
      toast.success("Account deleted");
      window.location.href = "/auth";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-bold text-foreground">Settings</h1>

      {/* Profile edit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-border bg-card p-5 shadow-card"
      >
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Edit Profile</h2>
        </div>

        <div className="space-y-4">
          {/* Cover & Avatar */}
          <div className="space-y-3">
            <Label>Cover Photo</Label>
            <div
              className="relative h-32 rounded-lg overflow-hidden bg-gradient-to-br from-primary/80 to-primary bg-cover bg-center"
              style={user.coverPhotoUrl ? { backgroundImage: `url(${user.coverPhotoUrl})` } : undefined}
            >
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4 mr-1" /> Change Cover
                </Button>
              </div>
            </div>
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={user.avatarUrl || avatarPlaceholder(user.name)}
                  alt={user.name}
                  className="h-20 w-20 rounded-full border-2 border-border object-cover"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">Click to upload (JPEG, PNG, WebP, GIF, max 5MB)</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(role === r.value ? "" : r.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    role === r.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="School or company" />
            </div>
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setExperienceLevel(experienceLevel === level.value ? "" : level.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      experienceLevel === level.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    skills.includes(skill) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Social Links</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Website"
                value={links.website}
                onChange={(e) => setLinks((l) => ({ ...l, website: e.target.value }))}
              />
              <Input
                placeholder="LinkedIn"
                value={links.linkedin}
                onChange={(e) => setLinks((l) => ({ ...l, linkedin: e.target.value }))}
              />
              <Input
                placeholder="Twitter"
                value={links.twitter}
                onChange={(e) => setLinks((l) => ({ ...l, twitter: e.target.value }))}
              />
              <Input
                placeholder="GitHub"
                value={links.github}
                onChange={(e) => setLinks((l) => ({ ...l, github: e.target.value }))}
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </motion.div>

      {/* Privacy & Paid Profile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-border bg-card p-5 shadow-card"
      >
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Privacy & Monetization</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Public profile</p>
              <p className="text-xs text-muted-foreground">Your profile is visible to everyone</p>
            </div>
            <Switch
              checked={profileVisibility === "public"}
              onCheckedChange={(v) => setProfileVisibility(v ? "public" : "private")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Paid Profile Contact</p>
              <p className="text-xs text-muted-foreground">Others must pay to message you</p>
            </div>
            <Switch checked={paidProfile} onCheckedChange={setPaidProfile} />
          </div>
          <Button onClick={handleSaveProfile} variant="outline" disabled={saving}>
            Save Privacy Settings
          </Button>
        </div>
      </motion.div>

      {/* Wallet */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-border bg-card p-5 shadow-card"
      >
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Wallet</h2>
        </div>
        <p className="text-2xl font-bold text-foreground">₹{(user.walletBalance ?? 0).toLocaleString("en-IN")}</p>
        <p className="text-xs text-muted-foreground mt-1">Earnings from completed collaborations</p>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-border bg-card p-5 shadow-card"
      >
        <div className="flex items-center gap-3 mb-4">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Change Password</h2>
        </div>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6} />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button onClick={handleChangePassword} variant="outline" disabled={saving}>
            Update Password
          </Button>
        </div>
      </motion.div>

      {/* Delete Account */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-destructive/50 bg-destructive/5 p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="h-5 w-5 text-destructive" />
          <h2 className="font-semibold text-destructive">Delete Account</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">This action cannot be undone. All your data will be permanently removed.</p>
        <Button variant="destructive" onClick={() => setDeleteDialog(true)}>
          Delete Account
        </Button>
      </motion.div>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Type DELETE below and enter your password to confirm. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
              />
            </div>
            <div className="space-y-2">
              <Label>Type DELETE to confirm</Label>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="uppercase"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
