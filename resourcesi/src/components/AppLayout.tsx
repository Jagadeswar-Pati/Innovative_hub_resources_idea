import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  Search,
  BookOpen,
  Users,
  PlusSquare,
  Bell,
  MessageCircle,
  User,
  Lightbulb,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const navItems = [
  { path: "/", icon: Home, label: "Feed" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/explore", icon: BookOpen, label: "Explore" },
  { path: "/engineering", icon: BookOpen, label: "Engineering" },
  { path: "/communities", icon: Users, label: "Communities" },
  { path: "/create", icon: PlusSquare, label: "Create" },
  { path: "/messages", icon: MessageCircle, label: "Messages" },
  { path: "/notifications", icon: Bell, label: "Notifications" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { data: notifData } = useQuery({
    queryKey: ["resources-notifications-badge"],
    queryFn: () => api.notifications.list(),
    refetchInterval: 12000,
  });
  const unreadCount = notifData?.unreadCount ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-[220px] border-r border-border bg-card p-4 lg:flex lg:flex-col">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <Lightbulb className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">InnoHub</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {item.path === "/notifications" && unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={signOut}
          className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-xl lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Lightbulb className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-base font-bold text-foreground">InnoHub</span>
        </Link>
      </header>

      <main className="pt-14 lg:pl-[220px] lg:pt-0">
        <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card/90 backdrop-blur-xl lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 text-xs ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.path === "/notifications" && unreadCount > 0 && (
                <span className="absolute -mt-4 ml-4 rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
