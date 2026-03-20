import { Link, useParams } from "react-router-dom";
import { Settings } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { avatarPlaceholder } from "@/lib/constants";
import { toast } from "@/components/ui/sonner";

const ProfilePage = () => {
  const { handle } = useParams<{ handle: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwnProfile = !handle || handle === user?.username || handle === user?.id || handle === user?._id;

  const { data: profileData } = useQuery({
    queryKey: ["resources-profile", handle || "me"],
    queryFn: () => (handle ? api.profile.getByHandle(handle) : api.profile.get()),
    enabled: !!user,
  });

  const { data } = useQuery({
    queryKey: ["resources-posts", "profile", handle || "me"],
    queryFn: () => api.posts.list(),
  });

  const profileUser = profileData?.user ?? user;
  const allPosts = data?.posts ?? [];
  const userPosts = profileUser
    ? allPosts.filter(
        (p) =>
          p.createdBy?.id === profileUser.id ||
          p.createdBy?._id === profileUser.id ||
          p.createdBy?.id === profileUser._id ||
          p.createdBy?.username === profileUser.username
      )
    : [];
  const postsCount = userPosts.length;
  const followersCount = profileUser?.followersCount ?? profileUser?.followers?.length ?? 0;
  const followingCount = profileUser?.followingCount ?? profileUser?.following?.length ?? 0;

  const followMutation = useMutation({
    mutationFn: () =>
      profileUser?.isFollowing
        ? api.profile.unfollow(profileUser.id || profileUser._id || "")
        : api.profile.follow(profileUser!.id || profileUser!._id || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources-profile", handle || "me"] });
      toast.success(profileUser?.isFollowing ? "Unfollowed user" : "Following user");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!profileUser) return null;

  return (
    <div className="space-y-6">
      <div className="relative">
        <div
          className="h-40 rounded-xl sm:h-52 bg-cover bg-center"
          style={{
            backgroundImage: profileUser.coverPhotoUrl
              ? `url(${profileUser.coverPhotoUrl})`
              : "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)",
          }}
        />
        <div className="absolute -bottom-12 left-4 sm:left-6">
          <img
            src={profileUser.avatarUrl || avatarPlaceholder(profileUser.name)}
            alt={profileUser.name}
            className="h-24 w-24 rounded-full border-4 border-card bg-muted shadow-lg"
          />
        </div>
      </div>

      <div className="pt-8 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">{profileUser.name}</h1>
            </div>
            {profileUser.username && <p className="text-sm text-muted-foreground">@{profileUser.username}</p>}
            <p className="text-sm text-muted-foreground">
              {profileUser.role && <span className="capitalize">{profileUser.role}</span>}
              {profileUser.role && profileUser.experienceLevel && " · "}
              {profileUser.experienceLevel}
            </p>
          </div>
          <div className="flex gap-2">
            {isOwnProfile ? (
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Settings className="h-4 w-4" />
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {profileUser.isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-6 text-sm">
          <span><strong>{postsCount}</strong> posts</span>
          <span><strong>{followersCount}</strong> followers</span>
          <span><strong>{followingCount}</strong> following</span>
        </div>

        {profileUser.walletBalance !== undefined && profileUser.walletBalance > 0 && (
          <div className="mt-3 text-sm text-muted-foreground">
            Wallet: ₹{profileUser.walletBalance.toLocaleString("en-IN")}
          </div>
        )}

        {profileUser.bio && (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-foreground">About</h3>
            <p className="text-sm text-muted-foreground">{profileUser.bio}</p>
          </div>
        )}

        {profileUser.skills?.length ? (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profileUser.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {(profileUser.links?.linkedin ||
          profileUser.links?.github ||
          profileUser.links?.portfolio ||
          profileUser.links?.personalWebsite ||
          profileUser.links?.website ||
          profileUser.links?.other) && (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Links</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(profileUser.links || {})
                .filter(([, value]) => !!value)
                .map(([key, value]) => (
                  <a
                    key={key}
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border px-3 py-1 hover:bg-muted"
                  >
                    {key}
                  </a>
                ))}
            </div>
          </div>
        )}

        {(profileUser.education || profileUser.experience || profileUser.interests?.length) && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {profileUser.education && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Education</h3>
                <p className="text-sm text-muted-foreground">{profileUser.education}</p>
              </div>
            )}
            {profileUser.experience && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Experience</h3>
                <p className="text-sm text-muted-foreground">{profileUser.experience}</p>
              </div>
            )}
            {profileUser.interests?.length ? (
              <div className="sm:col-span-2">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profileUser.interests.map((interest) => (
                    <span key={interest} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

      </div>

      <div>
        <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Posts</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {userPosts.map((post) => (
            <Link key={post._id} to={`/post/${post._id}`} className="group overflow-hidden rounded-xl border border-border bg-card">
              {post.mediaUrl ? (
                <img src={post.mediaUrl} alt={post.title} className="h-40 w-full object-cover transition-transform group-hover:scale-[1.02]" />
              ) : (
                <div className="flex h-40 items-center justify-center p-3 text-center text-sm text-muted-foreground">
                  {post.title}
                </div>
              )}
            </Link>
          ))}
        </div>
        {userPosts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground rounded-xl border border-dashed border-border">
            No posts yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
