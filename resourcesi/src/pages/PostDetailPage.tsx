import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, ArrowLeft, Send, DollarSign, Users, MessagesSquare, Check, X } from "lucide-react";
import { useState } from "react";
import { api, type ResourcesPost } from "@/lib/api";
import RichTextContent from "@/components/RichTextContent";
import { useAuth } from "@/contexts/AuthContext";
import { avatarPlaceholder } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/sonner";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [collabMessage, setCollabMessage] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["resources-post", id],
    queryFn: () => api.posts.get(id!),
    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: () => api.likes.toggle(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources-post", id] }),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => api.comments.create(id!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources-post", id] });
      setCommentText("");
    },
  });

  const applyMutation = useMutation({
    mutationFn: (msg?: string) => api.collaborations.apply(id!, msg),
    onSuccess: () => {
      toast.success("Application sent!");
      setCollabMessage("");
      queryClient.invalidateQueries({ queryKey: ["resources-post", id] });
    },
  });

  const post = data?.post;
  const author = post?.createdBy;
  const authorHandle = author?.username || author?.id || author?._id;

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (error || !post) return <div className="text-center py-12 text-destructive">Post not found</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <article className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          {authorHandle ? (
            <Link to={`/profile/${authorHandle}`}>
              <img
                src={author?.avatarUrl || avatarPlaceholder(author?.name ?? "")}
                alt={author?.name ?? ""}
                className="h-12 w-12 rounded-full bg-muted"
              />
            </Link>
          ) : (
            <img
              src={author?.avatarUrl || avatarPlaceholder(author?.name ?? "")}
              alt={author?.name ?? ""}
              className="h-12 w-12 rounded-full bg-muted"
            />
          )}
          <div>
            {authorHandle ? (
              <Link to={`/profile/${authorHandle}`} className="font-semibold text-foreground hover:underline">
                {author?.name}
              </Link>
            ) : (
              <p className="font-semibold text-foreground">{author?.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {author?.role} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {post.collaborationType && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-4 ${
              post.collaborationType === "paid"
                ? "bg-amber-500/10 text-amber-600"
                : "bg-primary/10 text-primary"
            }`}
          >
            {post.collaborationType === "paid" ? (
              <DollarSign className="h-3.5 w-3.5" />
            ) : (
              <Users className="h-3.5 w-3.5" />
            )}
            {post.collaborationType === "paid" ? "Paid Project" : "Free Collaboration"}
            {post.budget && ` · ₹${post.budget.toLocaleString("en-IN")}`}
          </span>
        )}

        <h1 className="text-xl font-bold text-foreground mb-2">{post.title}</h1>
        <p className="whitespace-pre-line text-foreground mb-4">
          <RichTextContent text={post.description} />
        </p>

        {post.mediaUrl && (
          <img
            src={post.mediaUrl}
            alt="Post"
            className="w-full rounded-lg object-cover mb-4"
            style={{ maxHeight: 400 }}
          />
        )}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/explore?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 border-t border-border pt-4">
          <button
            onClick={() => user && likeMutation.mutate()}
            disabled={!user}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <Heart
              className={`h-5 w-5 ${post.liked ? "fill-destructive text-destructive" : ""}`}
            />
            <span>{post.likes ?? 0}</span>
          </button>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            <span>{post.comments ?? 0}</span>
          </span>
        </div>
      </article>

      {user && author?.id === user.id && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground mb-3">Collaboration requests</h3>
          <ApplicationsList postId={post._id} />
        </div>
      )}

      {user && author?.id !== user.id && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Link
            to={`/messages?post=${post._id}`}
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
          >
            <MessagesSquare className="h-4 w-4" />
            {post.collaborationType === "paid"
              ? "Message for discussion (₹5)"
              : "Message for free discussion"}
          </Link>
          <div className="space-y-2">
            <textarea
              value={collabMessage}
              onChange={(e) => setCollabMessage(e.target.value)}
              placeholder="Add a short message (optional)"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
            />
            <button
              onClick={() => applyMutation.mutate(collabMessage)}
              disabled={applyMutation.isPending}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {applyMutation.isPending ? "Applying..." : "Collaborate"}
            </button>
          </div>
          {post.collaborationType === "paid" && post.totalAmount && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Total: ₹{post.totalAmount.toLocaleString("en-IN")} (includes platform fee & GST)
            </p>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground mb-3">Comments</h3>
        {user && (
          <div className="flex gap-2 mb-4">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && commentText.trim()) {
                  commentMutation.mutate(commentText.trim());
                }
              }}
            />
            <button
              onClick={() => commentText.trim() && commentMutation.mutate(commentText.trim())}
              disabled={!commentText.trim() || commentMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="space-y-3">
          <CommentsList postId={id!} />
        </div>
      </div>
    </div>
  );
}

function ApplicationsList({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["collaborations-post", postId],
    queryFn: () => api.collaborations.postApplications(postId),
  });
  const applications = data?.applications ?? [];

  const acceptMutation = useMutation({
    mutationFn: (collabId: string) => api.collaborations.accept(collabId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborations-post", postId] });
      toast.success("Application accepted");
    },
  });
  const rejectMutation = useMutation({
    mutationFn: (collabId: string) => api.collaborations.reject(collabId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborations-post", postId] });
      toast.success("Application rejected");
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (applications.length === 0) return <p className="text-sm text-muted-foreground">No applications yet</p>;

  return (
    <div className="space-y-3">
      {applications.filter((a) => a.status === "applied").map((app) => (
        <div key={app._id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50">
          <div className="flex gap-3 min-w-0">
            <img
              src={app.applicantId?.avatarUrl || avatarPlaceholder(app.applicantId?.name ?? "")}
              alt=""
              className="h-10 w-10 rounded-full flex-shrink-0"
            />
            <div>
              <Link to={`/profile/${app.applicantId?.username || app.applicantId?.id || app.applicantId?._id}`} className="font-medium text-foreground hover:underline">
                {app.applicantId?.name}
              </Link>
              {app.applicantMessage && (
                <p className="text-sm text-muted-foreground mt-0.5">{app.applicantMessage}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => acceptMutation.mutate(app._id)}
              disabled={acceptMutation.isPending}
              className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              title="Accept"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => rejectMutation.mutate(app._id)}
              disabled={rejectMutation.isPending}
              className="rounded-lg border border-destructive p-2 text-destructive hover:bg-destructive/10 disabled:opacity-50"
              title="Reject"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentsList({ postId }: { postId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["resources-comments", postId],
    queryFn: () => api.comments.list(postId),
  });
  const comments = data?.comments ?? [];

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading comments...</p>;
  if (comments.length === 0) return <p className="text-sm text-muted-foreground">No comments yet</p>;

  return (
    <>
      {comments.map((c) => (
        <div key={c._id} className="flex gap-3 p-2 rounded-lg bg-muted/50">
          <img
            src={c.userId?.avatarUrl || avatarPlaceholder(c.userId?.name ?? "")}
            alt=""
            className="h-8 w-8 rounded-full flex-shrink-0"
          />
          <div>
            <p className="text-xs font-medium text-foreground">
              <Link to={`/profile/${c.userId?.username || c.userId?.id || c.userId?._id}`} className="hover:underline">
                {c.userId?.name}
              </Link>
              <span className="text-muted-foreground font-normal ml-1">
                · {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
              </span>
            </p>
            <p className="text-sm text-foreground">{c.content}</p>
          </div>
        </div>
      ))}
    </>
  );
}
