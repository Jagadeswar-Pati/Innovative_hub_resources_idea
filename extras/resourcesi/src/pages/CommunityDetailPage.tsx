import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, UserPlus, UserX } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { avatarPlaceholder } from "@/lib/constants";
import { toast } from "@/components/ui/sonner";

export default function CommunityDetailPage() {
  const { communityId } = useParams<{ communityId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [adminUserIdInput, setAdminUserIdInput] = useState("");

  const { data: communityData } = useQuery({
    queryKey: ["community", communityId],
    queryFn: () => api.communities.get(communityId!),
    enabled: !!communityId,
  });
  const { data: messagesData } = useQuery({
    queryKey: ["community-messages", communityId],
    queryFn: () => api.communities.messages(communityId!),
    enabled: !!communityId,
    refetchInterval: 6000,
  });

  const community = communityData?.community;
  const messages = messagesData?.messages ?? [];
  const isCreator = (community?.createdBy?.id || community?.createdBy?._id) === user?.id;
  const isAdmin = !!community?.isAdmin;
  const canPost = isCreator || isAdmin;

  const postMutation = useMutation({
    mutationFn: () => api.communities.postMessage(communityId!, { text: text.trim() }),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["community-messages", communityId] });
      toast.success("Update posted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => api.communities.deleteMessage(communityId!, messageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-messages", communityId] }),
  });

  const addAdminMutation = useMutation({
    mutationFn: () => api.communities.addAdmin(communityId!, adminUserIdInput.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
      setAdminUserIdInput("");
      toast.success("Admin added");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeAdminMutation = useMutation({
    mutationFn: (targetUserId: string) => api.communities.removeAdmin(communityId!, targetUserId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community", communityId] }),
  });

  const deleteCommunityMutation = useMutation({
    mutationFn: () => api.communities.deleteCommunity(communityId!),
    onSuccess: () => {
      toast.success("Community deleted");
      navigate("/communities");
    },
  });

  const sortedAdmins = useMemo(() => community?.adminIds ?? [], [community?.adminIds]);

  if (!community) {
    return <div className="text-sm text-muted-foreground">Loading community...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <img
            src={community.avatarUrl || community.coverImageUrl || avatarPlaceholder(community.name)}
            alt={community.name}
            className="h-16 w-16 rounded-full bg-muted object-cover"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-bold text-foreground">{community.name}</h1>
            <p className="text-sm text-muted-foreground">{community.description || "No description"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Created by{" "}
              <Link to={`/profile/${community.createdBy?.username || community.createdBy?.id || community.createdBy?._id}`} className="underline">
                {community.createdBy?.name || "Unknown"}
              </Link>{" "}
              · {community.memberIds?.length ?? 0} members
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Admins</h2>
        <div className="space-y-2">
          {sortedAdmins.map((admin) => (
            <div key={admin.id || admin._id} className="flex items-center justify-between rounded-lg bg-muted/40 p-2">
              <Link to={`/profile/${admin.username || admin.id || admin._id}`} className="text-sm hover:underline">
                {admin.name}
              </Link>
              {isCreator && (admin.id || admin._id) !== (community.createdBy?.id || community.createdBy?._id) && (
                <button
                  onClick={() => removeAdminMutation.mutate(admin.id || admin._id || "")}
                  className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                >
                  <UserX className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {isCreator && (
          <div className="mt-3 flex gap-2">
            <input
              value={adminUserIdInput}
              onChange={(e) => setAdminUserIdInput(e.target.value)}
              placeholder="Member user ID"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={() => addAdminMutation.mutate()}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              <UserPlus className="h-4 w-4" />
              Add admin
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Channel updates</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Only creator and admins can send messages. Members can only view updates.
        </p>

        {canPost && (
          <div className="mb-4 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share an update..."
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={() => postMutation.mutate()}
              disabled={!text.trim() || postMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
            >
              Send
            </button>
          </div>
        )}

        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m._id} className="rounded-lg border border-border p-3">
              <div className="mb-1 flex items-center justify-between">
                <Link to={`/profile/${m.senderId?.username || m.senderId?.id || m.senderId?._id}`} className="text-sm font-medium hover:underline">
                  {m.senderId?.name || "Admin"}
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span>
                  {canPost && (
                    <button onClick={() => deleteMessageMutation.mutate(m._id)} className="text-destructive hover:opacity-80">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {m.text && <p className="text-sm text-foreground whitespace-pre-wrap">{m.text}</p>}
              {m.imageUrl && <img src={m.imageUrl} alt="" className="mt-2 max-h-56 rounded-lg object-cover" />}
            </div>
          ))}
          {messages.length === 0 && <p className="text-sm text-muted-foreground">No updates yet.</p>}
        </div>
      </div>

      {isCreator && (
        <button
          onClick={() => deleteCommunityMutation.mutate()}
          className="rounded-lg border border-destructive px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
        >
          Delete community
        </button>
      )}
    </div>
  );
}
