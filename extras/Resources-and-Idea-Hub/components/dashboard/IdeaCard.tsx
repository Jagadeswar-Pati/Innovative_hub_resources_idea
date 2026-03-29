"use client";

import { useState } from "react";
import type { Idea } from "@/lib/types/idea";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";

type IdeaCardProps = {
  idea: Idea;
  onUnlock?: (idea: Idea) => void;
};

const typeColors: Record<string, string> = {
  "Startup Idea": "#F5A623",
  Research: "#9C27B0",
  Project: "#2196F3",
};

export function IdeaCard({ idea, onUnlock }: IdeaCardProps) {
  const [liked, setLiked] = useState(false);
  const color = typeColors[idea.type] ?? "#F5A623";

  return (
    <div className="card p-5 opacity-0" style={{ animation: "fadeUp 0.5s ease forwards" }}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex flex-wrap gap-2">
          <span
            className="tag-gold rounded-md border px-2.5 py-0.5 text-[11px]"
            style={{
              background: `${color}18`,
              borderColor: `${color}33`,
              color,
            }}
          >
            {idea.type}
          </span>
          <span className="tag">{idea.branch}</span>
          <span className="tag">{idea.level}</span>
        </div>
        {idea.locked && (
          <div className="opacity-70" style={{ color: "#F5A623" }}>
            <Icon name="lock" size={16} />
          </div>
        )}
      </div>
      <h3 className="font-syne mb-2 text-base font-bold leading-snug">{idea.title}</h3>
      <p className="mb-3.5 text-[13px] leading-relaxed text-[var(--muted)]">{idea.desc}</p>
      <div className="mb-4 flex items-center gap-2">
        <Avatar initials={idea.avatar} size={28} color={color} />
        <span className="text-[13px] text-[var(--muted)]">{idea.creator}</span>
      </div>
      <div className="mb-4 flex flex-wrap gap-1">
        {idea.tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <Icon name="eye" size={13} />
            {idea.views.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={() => setLiked(!liked)}
            className="flex cursor-pointer items-center gap-1 border-0 bg-transparent transition-colors"
            style={{ color: liked ? "#F5A623" : "var(--muted)" }}
          >
            <Icon name="heart" size={13} />
            {idea.likes + (liked ? 1 : 0)}
          </button>
        </div>
        {idea.locked ? (
          <button
            type="button"
            className="btn-gold px-3.5 py-1.5 text-xs"
            onClick={() => onUnlock?.(idea)}
          >
            Unlock ₹{idea.price}
          </button>
        ) : (
          <button type="button" className="btn-outline px-3.5 py-1.5 text-xs">
            View Idea
          </button>
        )}
      </div>
    </div>
  );
}
