import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import PostCard from "@/components/PostCard";
import CreatePostCard from "@/components/CreatePostCard";
import RightSidebar from "@/components/RightSidebar";
import { api } from "@/lib/api";
import { avatarPlaceholder } from "@/lib/constants";

const FeedPage = () => {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["resources-posts"],
    queryFn: () => api.posts.list(),
  });
  const { data: usersData } = useQuery({
    queryKey: ["feed-user-search", debouncedSearch],
    queryFn: () => api.search.users(debouncedSearch, 6),
    enabled: debouncedSearch.length >= 2,
  });

  const posts = data?.posts ?? [];
  const users = usersData?.users ?? [];

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by username or full name..."
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {debouncedSearch.length >= 2 && (
            <div className="absolute z-30 mt-2 w-full rounded-xl border border-border bg-card shadow-card">
              {users.length > 0 ? (
                <div className="max-h-72 overflow-y-auto p-1">
                  {users.map((u) => {
                    const userId = u.id || u._id;
                    const handle = u.username || userId;
                    if (!userId) return null;
                    return (
                      <Link
                        key={userId}
                        to={`/profile/${handle}`}
                        onClick={() => setSearchText("")}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/60"
                      >
                        <img src={u.avatarUrl || avatarPlaceholder(u.name)} alt="" className="h-8 w-8 rounded-full bg-muted" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                          <p className="truncate text-xs text-muted-foreground">@{u.username || "user"}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="px-3 py-2 text-sm text-muted-foreground">No profiles found</p>
              )}
            </div>
          )}
        </div>
        <CreatePostCard onSuccess={() => refetch()} />
        {isLoading && <div className="text-center py-8 text-muted-foreground">Loading posts...</div>}
        {error && <div className="text-center py-8 text-destructive">Failed to load posts</div>}
        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground rounded-xl border border-dashed border-border">
            No posts yet. Create the first one!
          </div>
        )}
        {posts.map((post, i) => (
          <PostCard key={post._id} post={post} index={i} onUpdate={() => refetch()} />
        ))}
      </div>
      <RightSidebar />
    </div>
  );
};

export default FeedPage;
