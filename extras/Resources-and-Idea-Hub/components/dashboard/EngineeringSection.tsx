"use client";

import { useState } from "react";
import type { Idea } from "@/lib/types/idea";
import { IDEAS } from "@/lib/data/ideas";
import { BRANCHES, LEVELS } from "@/lib/data/filters";
import { IdeaCard } from "@/components/dashboard/IdeaCard";
import { Icon } from "@/components/ui/Icon";

type EngineeringSectionProps = {
  onUnlock: (idea: Idea) => void;
};

export function EngineeringSection({ onUnlock }: EngineeringSectionProps) {
  const [branch, setBranch] = useState<string>("All");
  const [level, setLevel] = useState<string>("All");

  const filtered = IDEAS.filter(
    (i) => (branch === "All" || i.branch === branch) && (level === "All" || i.level === level)
  );

  return (
    <div className="mx-auto max-w-[1100px] p-6">
      <div className="mb-6">
        <h1 className="font-syne mb-1 text-[28px] font-extrabold">Engineering Domains</h1>
        <p className="text-sm text-[var(--muted)]">Filter ideas by branch and complexity level</p>
      </div>

      <div className="card mb-6 p-5">
        <div className="mb-3 flex items-center gap-2 text-[13px] text-[var(--muted)]">
          <Icon name="filter" size={14} />
          Branch
        </div>
        <div className="flex flex-wrap gap-2">
          {BRANCHES.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBranch(b)}
              className="rounded-full border px-3.5 py-1.5 font-syne text-xs transition-all"
              style={{
                borderColor: branch === b ? "var(--gold)" : "var(--border)",
                background: branch === b ? "rgba(245,166,35,0.1)" : "transparent",
                color: branch === b ? "var(--gold)" : "var(--muted)",
                fontWeight: branch === b ? 700 : 400,
              }}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="mb-3 mt-4 flex items-center gap-2 text-[13px] text-[var(--muted)]">
          <Icon name="trending" size={14} />
          Level
        </div>
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className="rounded-full border px-4 py-1.5 font-syne text-xs transition-all"
              style={{
                borderColor: level === l ? "var(--gold)" : "var(--border)",
                background: level === l ? "rgba(245,166,35,0.1)" : "transparent",
                color: level === l ? "var(--gold)" : "var(--muted)",
                fontWeight: level === l ? 700 : 400,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 text-[13px] text-[var(--muted)]">{filtered.length} ideas found</div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
        {filtered.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} onUnlock={onUnlock} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-[var(--muted)]">
            <Icon name="cpu" size={48} />
            <br />
            <br />
            No ideas for this filter combination.
          </div>
        )}
      </div>
    </div>
  );
}
