import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, type ResourcesUser } from "@/lib/api";

export type AppRole = "student" | "mentor" | "professor";

export interface SignUpPayload {
  email: string;
  password: string;
  bio: string;
  name?: string;
  username?: string;
  role?: AppRole;
  institution?: string;
  experienceLevel?: string;
  skills?: string[];
  links?: Record<string, string>;
}

export interface SignUpResult {
  error: Error | null;
  needsVerification?: boolean;
  verificationUrl?: string;
}

interface AuthContextType {
  user: ResourcesUser | null;
  loading: boolean;
  signUp: (payload: SignUpPayload) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ResourcesUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("resources_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: u } = await api.auth.me();
      setUser(u);
    } catch {
      localStorage.removeItem("resources_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const signUp = async (payload: SignUpPayload) => {
    try {
      const { token, user: u, needsVerification, verificationUrl } = await api.auth.register({
        email: payload.email,
        password: payload.password,
        bio: payload.bio,
        name: payload.name,
        username: payload.username,
        role: payload.role,
        institution: payload.institution,
        experienceLevel: payload.experienceLevel,
        skills: payload.skills ?? [],
        links: payload.links ?? {},
      });
      if (needsVerification) {
        return { error: null, needsVerification: true, verificationUrl };
      }
      localStorage.setItem("resources_token", token);
      setUser(u);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Sign up failed") };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { token, user: u } = await api.auth.login(email, password);
      localStorage.setItem("resources_token", token);
      setUser(u);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Login failed") };
    }
  };

  const signOut = () => {
    localStorage.removeItem("resources_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
