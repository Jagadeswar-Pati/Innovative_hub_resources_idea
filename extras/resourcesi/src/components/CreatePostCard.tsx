import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { avatarPlaceholder } from "@/lib/constants";

export default function CreatePostCard({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [focused, setFocused] = useState(false);

  if (!user) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div
        className="flex gap-3 cursor-pointer"
        onClick={() => {
          setFocused(true);
          navigate("/create");
        }}
      >
        <img
          src={user.avatarUrl || avatarPlaceholder(user.name)}
          alt="You"
          className="h-10 w-10 rounded-full bg-muted"
        />
        <div className="flex-1 flex items-center">
          <span className="text-sm text-muted-foreground">
            Share an idea, project, or discovery...
          </span>
        </div>
        <Image className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
