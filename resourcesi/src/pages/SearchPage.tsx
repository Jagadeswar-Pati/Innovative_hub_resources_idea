import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { avatarPlaceholder } from "@/lib/constants";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ["search-users-page", debounced],
    queryFn: () => api.search.users(debounced, 30),
    enabled: debounced.length >= 1,
  });

  const users = data?.users ?? [];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-bold text-foreground">Search</h1>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search profiles by username or full name"
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {debounced.length < 1 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Start typing to find profiles.
        </div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">Searching...</div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No matching profiles found.
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Link
              key={u.id || u._id}
              to={`/profile/${u.username || u.id || u._id}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted/40"
            >
              <img src={u.avatarUrl || avatarPlaceholder(u.name)} alt="" className="h-12 w-12 rounded-full bg-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{u.username || "user"}</p>
                {u.bio && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{u.bio}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
