"use client";

import { useState } from "react";
import type { Idea } from "@/lib/types/idea";
import { IDEAS } from "@/lib/data/ideas";
import { IdeaCard } from "@/components/dashboard/IdeaCard";
import { Icon } from "@/components/ui/Icon";

type ExploreSectionProps = {
  searchQ: string;
  onUnlock: (idea: Idea) => void;
};

const tabs = ["All", "Startup Idea", "Project", "Research"] as const;

export function ExploreSection({ searchQ, onUnlock }: ExploreSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("All");

  const filtered = IDEAS.filter((i) => {
    const matchTab = activeTab === "All" || i.type === activeTab;
    const q = searchQ.toLowerCase();
    const matchSearch =
      !searchQ ||
      i.title.toLowerCase().includes(q) ||
      i.creator.toLowerCase().includes(q) ||
      i.tags.some((t) => t.toLowerCase().includes(q));
    return matchTab && matchSearch;
  });

  return (
    <div className="mx-auto max-w-[1100px] p-6">
      <div className="mb-6">
        <h1 className="font-syne mb-1 text-[28px] font-extrabold">Explore Ideas</h1>
        <p className="text-sm text-[var(--muted)]">Discover innovations from creators worldwide</p>
      </div>

      <div className="mb-7 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
        {(
          [
            ["trending", "Trending Today", "1,240"],
            ["rocket", "New Startups", "89"],
            ["code", "Projects", "340"],
            ["zap", "Research", "127"],
          ] as const
        ).map(([icon, label, count]) => (
          <div key={label} className="card flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(245,166,35,0.15)] bg-[rgba(245,166,35,0.1)] text-[var(--gold)]">
              <Icon name={icon} size={18} />
            </div>
            <div>
              <div className="font-syne text-lg font-bold">{count}</div>
              <div className="text-[11px] text-[var(--muted)]">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className="rounded-full border px-[18px] py-1.5 font-syne text-[13px] transition-all"
            style={{
              borderColor: activeTab === t ? "var(--gold)" : "var(--border)",
              background: activeTab === t ? "rgba(245,166,35,0.1)" : "transparent",
              color: activeTab === t ? "var(--gold)" : "var(--muted)",
              fontWeight: activeTab === t ? 600 : 400,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
        {filtered.map((idea, i) => (
          <div key={idea.id} style={{ animationDelay: `${i * 0.05}s` }}>
            <IdeaCard idea={idea} onUnlock={onUnlock} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-[var(--muted)]">
            <Icon name="explore" size={48} />
            <br />
            <br />
            No ideas found for &quot;{searchQ}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
