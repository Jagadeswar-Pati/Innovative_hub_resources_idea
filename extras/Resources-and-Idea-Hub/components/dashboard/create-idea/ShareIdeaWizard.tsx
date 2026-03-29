"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ENGINEERING_DOMAINS } from "@/lib/data/engineering-domains";
import type { IdeaType } from "@/lib/types/idea";

const STEPS = ["Type & Domain", "Details", "Pricing & Publish"] as const;

const TYPE_CARDS: {
  display: string;
  db: IdeaType;
  emoji: string;
}[] = [
  { display: "Startup", db: "Startup Idea", emoji: "🚀" },
  { display: "Project", db: "Project", emoji: "🔧" },
  { display: "Research", db: "Research", emoji: "🔬" },
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

const TITLE_MAX = 120;
const DESC_MAX = 5000;
const TAG_MAX = 8;
const MIN_PRICE = 49;

type Branch = (typeof ENGINEERING_DOMAINS)[number]["value"];

function normalizeTag(raw: string): string {
  return raw.replace(/^#+/, "").trim();
}

export function ShareIdeaWizard() {
  const [step, setStep] = useState(0);
  const [ideaType, setIdeaType] = useState<IdeaType>("Startup Idea");
  const [branch, setBranch] = useState<Branch>("ECE");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("Beginner");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [shareMode, setShareMode] = useState<"free" | "premium">("free");
  const [price, setPrice] = useState("99");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const domainLabel = useMemo(
    () => ENGINEERING_DOMAINS.find((d) => d.value === branch)?.label ?? branch,
    [branch]
  );

  const typeDisplay = useMemo(
    () => TYPE_CARDS.find((t) => t.db === ideaType)?.display ?? ideaType,
    [ideaType]
  );

  const addTag = useCallback(() => {
    const t = normalizeTag(tagInput);
    if (!t || tags.length >= TAG_MAX) return;
    if (tags.includes(t)) {
      setTagInput("");
      return;
    }
    setTags((prev) => [...prev, t]);
    setTagInput("");
  }, [tagInput, tags]);

  const removeTag = useCallback((t: string) => {
    setTags((prev) => prev.filter((x) => x !== t));
  }, []);

  const canAdvance1 = Boolean(ideaType && branch && level);
  const canAdvance2 =
    title.trim().length > 0 &&
    title.length <= TITLE_MAX &&
    description.trim().length > 0 &&
    description.length <= DESC_MAX &&
    tags.length <= TAG_MAX;

  const priceNum = Number.parseFloat(price) || 0;
  const step3Valid =
    shareMode === "free" || (shareMode === "premium" && Number.isFinite(priceNum) && priceNum >= MIN_PRICE);

  const goNext = () => {
    setError(null);
    if (step === 0 && !canAdvance1) return;
    if (step === 1 && !canAdvance2) return;
    setStep((s) => Math.min(s + 1, 2));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const publish = async () => {
    if (!step3Valid) return;
    setSubmitting(true);
    setError(null);
    const isPaid = shareMode === "premium";
    const body = {
      title: title.trim(),
      description: description.trim(),
      type: ideaType,
      tags,
      branch,
      level,
      isPaid,
      price: isPaid ? priceNum : 0,
    };
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string; details?: string };
      if (!res.ok) {
        setError(data.details ? `${data.error ?? "Failed"} — ${data.details}` : data.error ?? "Could not publish");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error — try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="animate-fadeUp mx-auto max-w-[500px] px-6 py-10 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[rgba(245,166,35,0.3)] bg-[rgba(245,166,35,0.12)] text-[var(--gold)]">
          <Icon name="check" size={40} />
        </div>
        <h2 className="font-syne mb-3 text-[28px] font-extrabold">Idea Published!</h2>
        <p className="mb-7 leading-relaxed text-[var(--muted)]">
          Your idea is live on IdeaHub. The community can discover it from Explore.
        </p>
        <button
          type="button"
          className="btn-gold px-7 py-3 text-[15px]"
          onClick={() => {
            setDone(false);
            setStep(0);
            setIdeaType("Startup Idea");
            setBranch(ENGINEERING_DOMAINS[4].value);
            setLevel("Beginner");
            setTitle("");
            setDescription("");
            setTags([]);
            setTagInput("");
            setShareMode("free");
            setPrice("99");
            setError(null);
          }}
        >
          Share another idea
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-6">
      <div className="mb-8">
        <h1 className="font-syne mb-1 text-[28px] font-extrabold tracking-tight">Share Your Idea</h1>
        <p className="text-sm text-[var(--muted)]">Post a startup idea, project, or research concept</p>
      </div>

      <Stepper step={step} />

      <div className="card relative mt-8 overflow-hidden p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-syne mb-4 text-[15px] font-bold text-[var(--text)]">What type of idea is this?</p>
              <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {TYPE_CARDS.map((card) => {
                  const active = ideaType === card.db;
                  return (
                    <button
                      key={card.db}
                      type="button"
                      onClick={() => setIdeaType(card.db)}
                      className="flex min-h-[140px] flex-col items-center justify-center rounded-xl border-2 px-4 py-5 text-center transition-all"
                      style={{
                        borderColor: active ? "var(--gold)" : "var(--border)",
                        background: active ? "rgba(245,166,35,0.08)" : "rgba(255,255,255,0.02)",
                        boxShadow: active ? "0 0 0 1px rgba(245,166,35,0.15)" : undefined,
                      }}
                    >
                      <span className="mb-2 text-2xl opacity-90">{card.emoji}</span>
                      <span
                        className="font-syne text-sm font-bold"
                        style={{ color: active ? "var(--gold)" : "var(--muted)" }}
                      >
                        {card.display}
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="mb-2 block text-[13px] text-[var(--muted)]">Engineering domain</label>
              <select
                className="input-field mb-8 w-full cursor-pointer text-base"
                value={branch}
                onChange={(e) => setBranch(e.target.value as Branch)}
              >
                {ENGINEERING_DOMAINS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>

              <p className="font-syne mb-3 text-[15px] font-bold text-[var(--text)]">Difficulty level</p>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((lv) => {
                  const active = level === lv;
                  return (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => setLevel(lv)}
                      className="rounded-full border px-4 py-2 font-syne text-[13px] font-semibold transition-all"
                      style={{
                        borderColor: active ? "rgb(34 197 94)" : "var(--border)",
                        color: active ? "rgb(34 197 94)" : "var(--muted)",
                        background: active ? "rgba(34,197,94,0.08)" : "transparent",
                      }}
                    >
                      {lv}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <label className="mb-2 block text-[13px] text-[var(--muted)]">
                Idea title ({title.length}/{TITLE_MAX})
              </label>
              <input
                className="input-field mb-2 text-base"
                placeholder="e.g. AI resume screener for Indian companies"
                value={title}
                maxLength={TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="mb-6 text-xs leading-relaxed text-[var(--muted)]">
                Make it specific and intriguing. &quot;AI resume screener for Indian companies&quot; beats &quot;Resume
                tool&quot;.
              </p>

              <label className="mb-2 block text-[13px] text-[var(--muted)]">
                Description ({description.length}/{DESC_MAX})
              </label>
              <textarea
                className="input-field mb-8 min-h-[180px] resize-y leading-relaxed"
                placeholder="Describe the problem, your approach, and impact..."
                value={description}
                maxLength={DESC_MAX}
                onChange={(e) => setDescription(e.target.value)}
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              />

              <div className="mb-2 flex items-center gap-2 text-[13px] text-[var(--muted)]">
                <Icon name="lightbulb" size={16} />
                <span>
                  Tags ({tags.length}/{TAG_MAX})
                </span>
              </div>
              <div className="mb-3 flex gap-2">
                <input
                  className="input-field flex-1 text-base"
                  placeholder="Add tag and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button type="button" className="btn-gold shrink-0 px-5 py-2.5 text-sm" onClick={addTag}>
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(245,166,35,0.35)] bg-[rgba(245,166,35,0.1)] px-3 py-1 text-sm text-[var(--gold)]"
                    >
                      #{t}
                      <button
                        type="button"
                        className="text-[var(--muted)] hover:text-[var(--text)]"
                        onClick={() => removeTag(t)}
                        aria-label={`Remove ${t}`}
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-syne mb-4 text-[15px] font-bold text-[var(--text)]">How do you want to share this idea?</p>
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setShareMode("free")}
                  className="rounded-xl border-2 p-4 text-left transition-all"
                  style={{
                    borderColor: shareMode === "free" ? "rgb(34 197 94)" : "var(--border)",
                    background: shareMode === "free" ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)",
                  }}
                >
                  <div className="mb-2 flex items-center gap-2 text-[rgb(34,197,94)]">
                    <Icon name="globe" size={22} />
                    <span className="font-syne font-bold">Free &amp; open</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-[var(--muted)]">
                    Anyone can view your full idea. Great for open-source and community projects.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setShareMode("premium")}
                  className="rounded-xl border-2 p-4 text-left transition-all"
                  style={{
                    borderColor: shareMode === "premium" ? "var(--gold)" : "var(--border)",
                    background: shareMode === "premium" ? "rgba(245,166,35,0.08)" : "rgba(255,255,255,0.02)",
                  }}
                >
                  <div className="mb-2 flex items-center gap-2 text-[var(--gold)]">
                    <Icon name="dollar" size={22} />
                    <span className="font-syne font-bold">Premium</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-[var(--muted)]">
                    Set a price to share full details. Earn from your ideas and connect with serious buyers.
                  </p>
                </button>
              </div>

              {shareMode === "premium" && (
                <div className="mb-6">
                  <label className="mb-2 block text-[13px] text-[var(--muted)]">Price (₹)</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={MIN_PRICE}
                      step={1}
                      className="input-field pl-9 text-base"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--muted)]">
                    Minimum ₹{MIN_PRICE} · Suggested: ₹99—₹999 for projects, ₹299—₹4999 for startup ideas.
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <Icon name="zap" size={16} className="text-[var(--gold)]" />
                  Preview summary
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--muted)]">Type</dt>
                    <dd className="text-right font-medium text-[var(--text)]">{typeDisplay}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--muted)]">Domain</dt>
                    <dd className="text-right font-medium text-[var(--text)]">{domainLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--muted)]">Level</dt>
                    <dd className="text-right font-medium text-[var(--text)]">{level}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--muted)]">Price</dt>
                    <dd className="text-right font-medium text-[var(--text)]">
                      {shareMode === "free" ? "Free" : `₹${priceNum}`}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-[var(--border)] pt-2">
                    <dt className="text-[var(--muted)]">Title</dt>
                    <dd className="max-w-[65%] text-right font-medium text-[var(--text)]">
                      {title.trim() || "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 font-syne text-sm font-semibold text-[var(--muted)] transition-colors hover:border-[var(--gold)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Icon name="arrowLeft" size={18} />
            Back
          </button>
          {step < 2 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={step === 0 ? !canAdvance1 : !canAdvance2}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f5a623] to-[#ff8c42] px-6 py-2.5 font-syne text-sm font-bold text-[#0a0a0f] shadow-lg shadow-black/20 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
              <Icon name="arrowRight" size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={publish}
              disabled={!step3Valid || submitting}
              className="btn-gold inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[15px] disabled:cursor-not-allowed disabled:opacity-35"
            >
              {submitting ? (
                "Publishing…"
              ) : (
                <>
                  <Icon name="rocket" size={20} />
                  Publish idea
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="w-full overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-[min(100%,560px)] items-center sm:min-w-0">
        {STEPS.map((label, i) => {
          const isDone = i < step;
          const isActive = i === step;
          return (
            <Fragment key={label}>
              {i > 0 && (
                <div
                  className="mx-1 h-0.5 min-w-[8px] flex-1 sm:mx-2"
                  style={{
                    backgroundColor: step >= i ? "rgb(34 197 94)" : "var(--border)",
                  }}
                />
              )}
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    background: isDone
                      ? "rgb(34 197 94)"
                      : isActive
                        ? "linear-gradient(135deg, #f5a623, #ff8c42)"
                        : "var(--bg2)",
                    color: isDone || isActive ? "#0a0a0f" : "var(--muted)",
                    border: !isDone && !isActive ? "1px solid var(--border)" : "none",
                  }}
                >
                  {isDone ? <Icon name="check" size={18} /> : i + 1}
                </div>
                <span
                  className="max-w-[120px] truncate font-syne text-[11px] font-semibold leading-tight sm:max-w-none sm:text-[13px]"
                  style={{ color: isActive ? "var(--text)" : "var(--muted)" }}
                >
                  {label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
