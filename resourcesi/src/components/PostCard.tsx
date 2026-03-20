import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, MessagesSquare, Users, DollarSign, MoreHorizontal, Lightbulb, Rocket, BookOpen, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { api, type ResourcesPost } from "@/lib/api";
import { avatarPlaceholder } from "@/lib/constants";
import RichTextContent from "./RichTextContent";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/sonner";

const collabLabels: Record<string, string> = {
  free: "Free Collaboration",
  paid: "Paid Project",
};

export default function PostCard({
  post,
  index = 0,
  onUpdate,
}: {
  post: ResourcesPost;
  index?: number;
  onUpdate?: () => void;
}) {
  const { user } = useAuth();
  const author = post.createdBy;
  const authorId = author?.id || author?._id;
  const authorHandle = author?.username || authorId;
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);

  const toggleLike = async () => {
    if (!user) {
      toast.error("Sign in to like");
      return;
    }
    try {
      const res = await api.likes.toggle(post._id);
      setLiked(res.liked);
      setLikeCount((c) => (res.liked ? c + 1 : c - 1));
    } catch {
      toast.error("Failed to update like");
    }
  };

  const createdAt = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : "";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`overflow-hidden rounded-xl border bg-card shadow-card transition-shadow hover:shadow-card-hover ${
        post.collaborationType === "paid"
          ? "border-amber-500/30 ring-1 ring-amber-500/10"
          : "border-border"
      }`}
    >
      <div className="flex items-center gap-3 p-4 pb-2">
        {authorHandle ? (
          <Link to={`/profile/${authorHandle}`}>
            <img
              src={author?.avatarUrl || avatarPlaceholder(author?.name ?? "user")}
              alt={author?.name ?? ""}
              className="h-10 w-10 rounded-full bg-muted"
            />
          </Link>
        ) : (
          <img
            src={author?.avatarUrl || avatarPlaceholder(author?.name ?? "user")}
            alt={author?.name ?? ""}
            className="h-10 w-10 rounded-full bg-muted"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {authorHandle ? (
              <Link to={`/profile/${authorHandle}`} className="text-sm font-semibold text-foreground truncate hover:underline">
                {author?.name ?? "Unknown"}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-foreground truncate">
                {author?.name ?? "Unknown"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{author?.role ?? "user"}</span>
            <span>·</span>
            <span>{createdAt}</span>
          </div>
        </div>
        <button className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pb-2 flex flex-wrap gap-1.5 items-center">
        {post.postType && post.postType !== "general" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize">
            {post.postType === "idea" && <Lightbulb className="h-3 w-3" />}
            {post.postType === "startup" && <Rocket className="h-3 w-3" />}
            {post.postType === "resource" && <BookOpen className="h-3 w-3" />}
            {post.postType === "general" && <MessageSquare className="h-3 w-3" />}
            {post.postType}
          </span>
        )}
        {post.featuredPaid && (
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            Featured
          </span>
        )}
        {post.collaborationType && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              post.collaborationType === "paid"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-primary/10 text-primary"
            }`}
          >
            {post.collaborationType === "paid" ? (
              <DollarSign className="h-3.5 w-3.5" />
            ) : (
              <Users className="h-3.5 w-3.5" />
            )}
            {collabLabels[post.collaborationType]}
            {post.budget && (
              <span>
                · ₹{post.budget.toLocaleString("en-IN")}
                {post.totalAmount && ` total`}
              </span>
            )}
          </span>
        )}
      </div>

      <div className="px-4 pb-3">
        <h3 className="font-semibold text-foreground mb-1">{post.title}</h3>
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
          <RichTextContent text={post.description} />
        </p>
      </div>

      {post.mediaUrl && (
        <div className="px-4 pb-3">
          <img
            src={post.mediaUrl}
            alt="Post"
            className="w-full rounded-lg object-cover"
            style={{ maxHeight: 400 }}
          />
        </div>
      )}

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/explore?tag=${encodeURIComponent(tag)}`}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/10"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLike}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                liked ? "fill-destructive text-destructive" : ""
              }`}
            />
            <span>{likeCount}</span>
          </button>
          <Link
            to={`/post/${post._id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.comments ?? 0}</span>
          </Link>
          {user && authorId !== user.id && (
            <Link
              to={`/messages?post=${post._id}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              title={post.collaborationType === "paid" ? "Message (₹5 for paid posts)" : "Message for free"}
            >
              <MessagesSquare className="h-5 w-5" />
              <span>Message</span>
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}
