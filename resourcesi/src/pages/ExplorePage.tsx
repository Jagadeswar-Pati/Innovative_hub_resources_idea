import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Lightbulb, Rocket, Users, Hash } from "lucide-react";
import PostCard from "@/components/PostCard";
import { api } from "@/lib/api";
import { TRENDING_TAGS } from "@/lib/constants";

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const tagFromUrl = searchParams.get("tag");
  const [activeTag, setActiveTag] = useState<string | null>(tagFromUrl || null);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setActiveTag(tagFromUrl || null);
  }, [tagFromUrl]);

  const { data: trendingData } = useQuery({
    queryKey: ["explore-trending"],
    queryFn: () => api.explore.trending(),
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => api.search.search(searchQuery, 8),
    enabled: searchQuery.length >= 2,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["resources-posts", activeTag ?? "all"],
    queryFn: () => api.posts.list(activeTag ? { tag: activeTag } : undefined),
  });

  const posts = data?.posts ?? [];
  const showSearchResults = searchQuery.length >= 2;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users, posts, hashtags, projects, communities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setSearchQuery(query.trim())}
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={() => setSearchQuery(query.trim())}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-primary"
        >
          Search
        </button>
      </div>

      {showSearchResults ? (
        <div className="space-y-6">
          {searchLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : searchData ? (
            <>
              {searchData.users?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Users</h3>
                  <div className="flex flex-wrap gap-2">
                    {searchData.users.map((u) => (
                      <Link
                        key={u.id || u._id}
                        to={`/profile/${u.username || u.id || u._id}`}
                        className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-muted/80"
                      >
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-primary/20" />
                        )}
                        {u.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {searchData.posts?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Posts</h3>
                  <div className="space-y-4">
                    {searchData.posts.map((post, i) => (
                      <PostCard key={post._id} post={post} index={i} />
                    ))}
                  </div>
                </div>
              )}
              {searchData.projects?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Engineering Projects</h3>
                  <div className="space-y-2">
                    {searchData.projects.map((p) => (
                      <Link
                        key={p._id}
                        to="/engineering"
                        className="block rounded-lg border border-border p-3 hover:bg-muted/50"
                      >
                        <span className="font-medium">{p.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">({p.category})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {searchData.communities?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Communities</h3>
                  <div className="space-y-2">
                    {searchData.communities.map((c) => (
                      <Link
                        key={c._id}
                        to={`/community/${c._id}`}
                        className="block rounded-lg border border-border p-3 hover:bg-muted/50"
                      >
                        {c.name} · {c.memberIds?.length ?? 0} members
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {searchData.hashtags?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Hashtags</h3>
                  <div className="flex flex-wrap gap-2">
                    {searchData.hashtags.map((h) => (
                      <Link
                        key={h.tag}
                        to={`/explore?tag=${encodeURIComponent(h.tag)}`}
                        onClick={() => setSearchQuery("")}
                        className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/20"
                      >
                        #{h.tag} ({h.count})
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {!searchData?.users?.length &&
                !searchData?.posts?.length &&
                !searchData?.projects?.length &&
                !searchData?.communities?.length &&
                !searchData?.hashtags?.length && (
                  <div className="text-center py-12 text-muted-foreground">No results found</div>
                )}
            </>
          ) : null}
          <button
            onClick={() => {
              setSearchQuery("");
              setQuery("");
            }}
            className="text-sm text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {trendingData && (
            <div className="grid gap-4 sm:grid-cols-2">
              {trendingData.trendingIdeas?.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-foreground mb-3">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Trending Ideas
                  </h3>
                  <div className="space-y-2">
                    {trendingData.trendingIdeas.slice(0, 3).map((p) => (
                      <Link
                        key={p._id}
                        to={`/post/${p._id}`}
                        className="block text-sm font-medium text-foreground hover:text-primary truncate"
                      >
                        {p.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {trendingData.trendingStartups?.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-foreground mb-3">
                    <Rocket className="h-4 w-4 text-primary" />
                    Trending Startups
                  </h3>
                  <div className="space-y-2">
                    {trendingData.trendingStartups.slice(0, 3).map((p) => (
                      <Link
                        key={p._id}
                        to={`/post/${p._id}`}
                        className="block text-sm font-medium text-foreground hover:text-primary truncate"
                      >
                        {p.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {trendingData?.popularCommunities?.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="flex items-center gap-2 font-semibold text-foreground mb-3">
                <Users className="h-4 w-4 text-primary" />
                Popular Communities
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingData.popularCommunities.slice(0, 5).map((c) => (
                  <Link
                    key={c._id}
                    to={`/community/${c._id}`}
                    className="rounded-full bg-muted px-3 py-1 text-sm hover:bg-muted/80"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {trendingData?.hashtags?.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="flex items-center gap-2 font-semibold text-foreground mb-3">
                <Hash className="h-4 w-4 text-primary" />
                Trending Hashtags
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingData.hashtags.map((h) => (
                  <button
                    key={h.tag}
                    onClick={() => setActiveTag(h.tag)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      activeTag === h.tag ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    #{h.tag} ({h.count})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setActiveTag(null)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                !activeTag ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  activeTag === tag ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          <div>
            <h3 className="mb-3 font-display text-base font-semibold text-foreground">
              {activeTag ? `#${activeTag}` : "All Posts"}
            </h3>
            {isLoading && <div className="text-center py-8 text-muted-foreground">Loading...</div>}
            {error && <div className="text-center py-8 text-destructive">Failed to load posts</div>}
            <div className="space-y-4">
              {posts.map((post, i) => (
                <PostCard key={post._id} post={post} index={i} />
              ))}
            </div>
            {!isLoading && !error && posts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground rounded-xl border border-dashed border-border">
                No posts found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
