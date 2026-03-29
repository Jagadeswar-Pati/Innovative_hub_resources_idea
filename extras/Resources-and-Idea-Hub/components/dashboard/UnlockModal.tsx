"use client";

import type { Idea } from "@/lib/types/idea";
import { Icon } from "@/components/ui/Icon";

type UnlockModalProps = {
  idea: Idea;
  onClose: () => void;
};

export function UnlockModal({ idea, onClose }: UnlockModalProps) {
  if (!idea.locked || idea.price == null) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unlock-title"
        className="card animate-popIn w-full max-w-[400px] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(245,166,35,0.3)] bg-[rgba(245,166,35,0.12)] text-[var(--gold)]">
            <Icon name="lock" size={28} />
          </div>
          <h2 id="unlock-title" className="font-syne mb-2 text-[22px] font-extrabold">
            Unlock This Idea
          </h2>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Get full access to <strong>{idea.title}</strong> by {idea.creator}
          </p>
        </div>
        <div className="glass-gold mb-5 rounded-xl p-4 text-center">
          <div className="font-syne text-4xl font-extrabold text-[var(--gold)]">₹{idea.price}</div>
          <div className="text-[13px] text-[var(--muted)]">One-time payment · Lifetime access</div>
        </div>
        <div className="mb-5 flex flex-col gap-2.5">
          {[
            "Full idea documentation",
            "Source files & resources",
            "Direct message with creator",
            "Collaboration request",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[rgba(245,166,35,0.3)] bg-[rgba(245,166,35,0.1)] text-[var(--gold)]">
                <Icon name="check" size={12} />
              </div>
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
        <button type="button" className="btn-gold w-full py-3.5 text-base" onClick={onClose}>
          Proceed to Payment
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2.5 w-full cursor-pointer border-0 bg-transparent py-2 text-sm text-[var(--muted)]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
