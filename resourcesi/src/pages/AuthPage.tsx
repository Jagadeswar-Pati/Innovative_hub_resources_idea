import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Mail, Lock, User, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, type SignUpPayload } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { PREDEFINED_SKILLS, EXPERIENCE_LEVELS } from "@/lib/constants";

type AppRole = "student" | "mentor" | "professor";

const roles: { value: AppRole; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "mentor", label: "Mentor" },
  { value: "professor", label: "Professor" },
];

export default function AuthPage() {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");
  const [institution, setInstitution] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [verifyScreen, setVerifyScreen] = useState<{ url: string } | null>(null);

  const { signIn, signUp } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      if (!bio || bio.trim().length < 20) {
        toast.error("Bio is required (minimum 20 characters)");
        return;
      }
    }

    setSubmitting(true);

    if (isSignUp) {
      const payload: SignUpPayload = {
        email,
        password,
        bio: bio.trim(),
      };
      if (name.trim()) payload.name = name.trim();
      if (username.trim()) payload.username = username.trim();
      if (selectedRole) payload.role = selectedRole;
      if (institution.trim()) payload.institution = institution.trim();
      if (experienceLevel) payload.experienceLevel = experienceLevel;
      if (selectedSkills.length) payload.skills = selectedSkills;

      const result = await signUp(payload);
      setSubmitting(false);

      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      if (result.needsVerification && result.verificationUrl) {
        setVerifyScreen({ url: result.verificationUrl });
        toast.info("Please verify your email to complete registration.");
      } else {
        toast.success("Account created successfully!");
      }
    } else {
      const { error } = await signIn(email, password);
      setSubmitting(false);
      if (error) {
        toast.error(error.message);
      }
    }
  };

  if (verifyScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-4 text-center"
        >
          <h2 className="text-xl font-semibold">Verify your email</h2>
          <p className="text-sm text-muted-foreground">
            In development mode, use the link below to verify. In production, you will receive this link via email.
          </p>
          <div className="rounded-lg bg-muted p-3 break-all text-xs font-mono">
            {verifyScreen.url}
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(verifyScreen.url);
                toast.success("Link copied!");
              }}
            >
              Copy link
            </Button>
            <Button onClick={() => window.open(verifyScreen.url, "_blank")}>
              Open link
            </Button>
          </div>
          <Button variant="ghost" onClick={() => setVerifyScreen(null)}>
            Back to sign up
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left hero */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-primary p-12">
        <div className="max-w-md text-primary-foreground">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
              <Lightbulb className="h-7 w-7" />
            </div>
            <span className="font-display text-3xl font-bold">InnoHub</span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight mb-4">
            Where Innovation Meets Collaboration
          </h1>
          <p className="text-lg opacity-90 leading-relaxed">
            Connect with students, professors, and mentors. Share research, build projects, and grow your network.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="flex items-center gap-2 lg:hidden mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
              <Lightbulb className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">InnoHub</span>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {!isSignUp ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {!isSignUp ? "Sign in to continue" : "Email, password and a short bio are required. Everything else is optional."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself (minimum 20 characters)"
                    required
                    minLength={20}
                  />
                  <p className="text-xs text-muted-foreground">{bio.length}/20 min characters</p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" required minLength={6} />
              </div>
              {!isSignUp && (
                <div className="text-right">
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              )}
            </div>

            {isSignUp && (
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {showOptional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showOptional ? "Hide optional details" : "Add optional details (name, role, institution, etc.)"}
              </button>
            )}

            <AnimatePresence>
              {isSignUp && showOptional && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="pl-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setSelectedRole(selectedRole === r.value ? "" : r.value)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            selectedRole === r.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

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

                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_SKILLS.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            selectedSkills.includes(skill) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => { setIsSignUp(!isSignUp); setShowOptional(false); }} className="font-semibold text-primary hover:underline">
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
