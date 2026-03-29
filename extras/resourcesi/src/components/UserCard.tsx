import { BadgeCheck } from "lucide-react";
import type { User } from "@/lib/mock-data";

export default function UserCard({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-card">
      <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full bg-muted" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-foreground truncate">{user.name}</span>
          {user.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground truncate">{user.institution} · {user.role}</p>
      </div>
      <button className="rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
        Follow
      </button>
    </div>
  );
}
