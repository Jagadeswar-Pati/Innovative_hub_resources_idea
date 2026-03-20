import { useState } from "react";
import {
  Image,
  Hash,
  Users,
  X,
  Send,
  IndianRupee,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { TRENDING_TAGS } from "@/lib/constants";
import { avatarPlaceholder } from "@/lib/constants";
import { toast } from "@/components/ui/sonner";

const CreatePostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [postType, setPostType] = useState<"idea" | "startup" | "resource" | "general">("general");
  const [featuredPaid, setFeaturedPaid] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [collabType, setCollabType] = useState<"free" | "paid" | null>(null);
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const budgetNum = parseFloat(budget) || 0;
  const platformFee = budgetNum * 0.2;
  const gst = platformFee * 0.18;
  const totalCharged = budgetNum + gst;
  const creatorReceives = budgetNum - platformFee;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only images allowed. Video uploads are disabled.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description required");
      return;
    }
    if (collabType === "paid" && budgetNum < 5) {
      toast.error("Minimum budget is ₹5 for paid posts");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("collaborationType", collabType || "free");
      formData.append("postType", postType);
      formData.append("featuredPaid", String(featuredPaid));
      formData.append("tags", JSON.stringify(selectedTags));
      if (collabType === "paid") {
        formData.append("budget", String(budgetNum));
        if (deadline) formData.append("deadline", deadline);
      }
      if (imageFile) formData.append("image", imageFile);

      await api.posts.create(formData);
      toast.success("Post published!");
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground">Create Post</h1>
        <button
          onClick={() => navigate("/")}
          className="rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex gap-3 mb-4">
          <img
            src={user.avatarUrl || avatarPlaceholder(user.name)}
            alt="You"
            className="h-10 w-10 rounded-full bg-muted"
          />
          <div>
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user.role} · {user.experienceLevel || "—"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">Title</Label>
            <Input
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Post Type</Label>
            <div className="flex flex-wrap gap-2">
              {(["idea", "startup", "resource", "general"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPostType(t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                    postType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Share your innovation, research finding, or project idea... Use #hashtags for discoverability."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-lg border border-input bg-transparent p-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[120px]"
          />
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Add tags</p>
          <div className="flex flex-wrap gap-2">
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Featured Paid (optional)</p>
            <button
              type="button"
              onClick={() => setFeaturedPaid(!featuredPaid)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                featuredPaid ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {featuredPaid ? "Yes" : "No"}
            </button>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Collaboration type
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCollabType(collabType === "free" ? null : "free")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                collabType === "free"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              🤝 Free Collaboration
            </button>
            <button
              onClick={() => setCollabType(collabType === "paid" ? null : "paid")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                collabType === "paid"
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              💰 Paid Collaboration
            </button>
          </div>
        </div>

        {collabType === "paid" && (
          <div className="mt-4 space-y-4 rounded-lg border border-accent/30 bg-accent/5 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Project Budget (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="number"
                    min="500"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Min ₹5"
                    className="pl-8 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Deadline</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="pl-8 text-sm"
                  />
                </div>
              </div>
            </div>

            {budgetNum >= 5 && (
              <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                <p className="text-xs font-semibold text-foreground">Payment Breakdown</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Project Budget</span>
                    <span>₹{budgetNum.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform Fee (20%)</span>
                    <span>₹{platformFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (18% on fee)</span>
                    <span>₹{gst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t border-border my-1" />
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total Charged</span>
                    <span>₹{totalCharged.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-primary font-medium">
                    <span>Creator Receives</span>
                    <span>₹{creatorReceives.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Platform Fee Included · Escrow Protected
                </p>
              </div>
            )}

            {budgetNum > 0 && budgetNum < 5 && (
              <p className="text-xs text-destructive">Minimum budget is ₹5</p>
            )}

            {/* Paid-post preview placeholder (no payment gateway integration yet). */}
            {budgetNum >= 5 && (
              <div className="relative overflow-hidden rounded-lg border border-border bg-card">
                <div className="pointer-events-none blur-[2px] p-4">
                  <p className="text-xs text-muted-foreground">Paid Post Preview</p>
                  <h4 className="font-semibold text-foreground">{title || "Your paid idea title"}</h4>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {description || "Your paid idea description preview will appear here."}
                  </p>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70">
                  <p className="text-sm font-semibold text-foreground">Unlock this idea for ₹{budgetNum.toLocaleString("en-IN")}</p>
                  <button
                    type="button"
                    className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground"
                  >
                    Pay &amp; Unlock
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <Label className="text-xs">Image (optional, images only, max 5MB)</Label>
          <div className="flex gap-2 mt-2">
            <label className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted cursor-pointer border border-border">
              <Image className="h-4 w-4" /> Photo
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Video feature coming soon.</p>
        </div>

        <div className="mt-6 flex items-center justify-end border-t border-border pt-4">
          <button
            onClick={handleSubmit}
            disabled={
              !title.trim() ||
              !description.trim() ||
              (collabType === "paid" && budgetNum < 5) ||
              submitting
            }
            className="flex items-center gap-1.5 rounded-lg bg-gradient-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
