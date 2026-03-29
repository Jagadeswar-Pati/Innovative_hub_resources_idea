"use client";

import { useState } from "react";
import { COMMUNITIES } from "@/lib/data/communities";
import type { Community } from "@/lib/types/community";
import { Icon } from "@/components/ui/Icon";

export function CommunitiesSection() {
  const [communities, setCommunities] = useState<Community[]>(COMMUNITIES);

  return (
    <div className="mx-auto max-w-[1100px] p-6">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-syne mb-1 text-[28px] font-extrabold">Communities</h1>
          <p className="text-sm text-[var(--muted)]">
            Find your tribe and collaborate with like-minded innovators
          </p>
        </div>
        <button type="button" className="btn-gold text-sm">
          + Create Community
        </button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
        {communities.map((c, i) => (
          <div
            key={c.id}
            className="card p-6 opacity-0"
            style={{ animation: `fadeUp 0.5s ease ${i * 0.05}s forwards` }}
          >
            <div className="mb-4 flex items-start gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border"
                style={{
                  background: `${c.color}18`,
                  borderColor: `${c.color}33`,
                  color: c.color,
                }}
              >
                <Icon name="community" size={22} />
              </div>
              <div>
                <h3 className="font-syne mb-0.5 text-base font-bold">{c.name}</h3>
                <div className="text-xs text-[var(--muted)]">{c.members.toLocaleString()} members</div>
              </div>
            </div>
            <p className="mb-4 text-[13px] leading-relaxed text-[var(--muted)]">{c.desc}</p>
            <button
              type="button"
              onClick={() =>
                setCommunities((prev) =>
                  prev.map((x) => (x.id === c.id ? { ...x, joined: !x.joined } : x))
                )
              }
              className="rounded-lg px-5 py-2 font-syne text-[13px] font-semibold transition-all"
              style={{
                border: `1px solid ${c.joined ? "rgba(245,166,35,0.3)" : "var(--border)"}`,
                background: c.joined ? "rgba(245,166,35,0.1)" : "transparent",
                color: c.joined ? "var(--gold)" : "var(--text)",
              }}
            >
              {c.joined ? "✓ Joined" : "Join Community"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
