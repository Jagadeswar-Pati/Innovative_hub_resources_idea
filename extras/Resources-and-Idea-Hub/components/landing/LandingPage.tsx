"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { IdeaCard } from "@/components/dashboard/IdeaCard";
import { IDEAS } from "@/lib/data/ideas";

const testimonials = [
  {
    name: "Shreya Nair",
    role: "Startup Founder",
    text: "IdeaHub helped me find co-founders and early investors within weeks of sharing my concept.",
    avatar: "SN",
  },
  {
    name: "Kiran Rao",
    role: "ML Researcher",
    text: "I monetized my research ideas for the first time. The community engagement is incredible.",
    avatar: "KR",
  },
  {
    name: "Aditya Kumar",
    role: "Engineering Student",
    text: "As a final-year student, IdeaHub gave my project global visibility. Got 3 job offers!",
    avatar: "AK",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActiveTestimonial((p) => (p + 1) % testimonials.length),
      4000
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <div
          className="orb"
          style={{
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(245,166,35,0.12), transparent)",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="orb"
          style={{
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(255,107,107,0.08), transparent)",
            bottom: "20%",
            right: "10%",
          }}
        />
        <div className="relative z-[1] max-w-[800px] px-6 text-center">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(245,166,35,0.2)] bg-[rgba(245,166,35,0.1)] px-4 py-1.5"
          >
            <Icon name="zap" size={14} />
            <span className="text-[13px] text-[var(--gold)]">The Future of Idea Sharing is Here</span>
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-syne mb-6 text-[clamp(40px,7vw,80px)] font-extrabold leading-[1.1]"
          >
            Share Ideas.
            <br />
            <span className="grad-text">Earn. Collaborate.</span>
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-10 max-w-[560px] text-[clamp(16px,2.5vw,20px)] leading-relaxed text-[var(--muted)]"
          >
            The platform where brilliant minds share projects, startups, and research — and get discovered,
            funded, and hired.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link href="/dashboard" className="btn-gold px-8 py-3.5 text-base">
              <span className="flex items-center gap-2">
                Explore Ideas <Icon name="arrowRight" size={18} />
              </span>
            </Link>
            <Link href="/signup" className="btn-outline px-8 py-3.5 text-base">
              Share Your Idea
            </Link>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-[60px] flex flex-wrap justify-center gap-12"
          >
            {(
              [
                ["10K+", "Ideas Shared"],
                ["3K+", "Collaborations"],
                ["₹50L+", "Earned by Creators"],
              ] as const
            ).map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="font-syne text-[28px] font-extrabold text-[var(--gold)]">{n}</div>
                <div className="text-[13px] text-[var(--muted)]">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-[1100px] px-6 py-20">
        <div className="mb-14 text-center">
          <h2 className="font-syne mb-3 text-[clamp(28px,4vw,48px)] font-extrabold">
            How It <span className="grad-text">Works</span>
          </h2>
          <p className="text-base text-[var(--muted)]">Three simple steps to share your idea with the world</p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {[
            {
              step: "01",
              icon: "lightbulb" as const,
              title: "Share Your Idea",
              desc: "Post your startup, project, or research with rich media. Set it free or monetize it.",
            },
            {
              step: "02",
              icon: "globe" as const,
              title: "Get Discovered",
              desc: "Our algorithm surfaces your idea to the right audience — investors, collaborators, employers.",
            },
            {
              step: "03",
              icon: "dollar" as const,
              title: "Earn & Collaborate",
              desc: "Get paid when people unlock your ideas. Connect with co-founders and mentors.",
            },
          ].map((s) => (
            <div key={s.step} className="card relative overflow-hidden p-6">
              <div
                className="pointer-events-none absolute right-4 top-4 font-syne text-5xl font-extrabold opacity-[0.04] text-[var(--gold)]"
              >
                {s.step}
              </div>
              <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border border-[rgba(245,166,35,0.2)] bg-[rgba(245,166,35,0.12)] text-[var(--gold)]">
                <Icon name={s.icon} size={24} />
              </div>
              <h3 className="font-syne mb-2.5 text-xl font-bold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--muted)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Ideas */}
      <section className="bg-[var(--bg2)] px-6 py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-syne text-[clamp(24px,3.5vw,40px)] font-extrabold">
              Trending <span className="grad-text">Ideas</span>
            </h2>
            <Link href="/dashboard" className="btn-outline text-sm">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
            {IDEAS.slice(0, 3).map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onUnlock={() => {}} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-[1100px] px-6 py-20">
        <div className="mb-14 text-center">
          <h2 className="font-syne text-[clamp(28px,4vw,48px)] font-extrabold">
            Explore <span className="grad-text">Categories</span>
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
          {(
            [
              { icon: "rocket" as const, title: "Startup Ideas", count: "3,200+", desc: "Next big ventures", color: "#F5A623" },
              { icon: "code" as const, title: "Projects", count: "4,800+", desc: "Open source & more", color: "#2196F3" },
              { icon: "zap" as const, title: "Research", count: "1,900+", desc: "Academic innovations", color: "#9C27B0" },
              { icon: "grid" as const, title: "Communities", count: "340+", desc: "Niche groups", color: "#4CAF50" },
            ] as const
          ).map((c) => (
            <Link
              key={c.title}
              href="/dashboard"
              className="card cursor-pointer p-6 text-center transition-colors hover:border-[rgba(245,166,35,0.3)]"
            >
              <div
                className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-2xl border"
                style={{
                  background: `${c.color}18`,
                  borderColor: `${c.color}33`,
                  color: c.color,
                }}
              >
                <Icon name={c.icon} size={28} />
              </div>
              <h3 className="font-syne mb-1.5 text-lg font-bold">{c.title}</h3>
              <div className="font-syne mb-1 text-[22px] font-bold" style={{ color: c.color }}>
                {c.count}
              </div>
              <p className="text-[13px] text-[var(--muted)]">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[var(--bg2)] px-6 py-20">
        <div className="mx-auto max-w-[700px] text-center">
          <h2 className="font-syne mb-12 text-[clamp(24px,3.5vw,40px)] font-extrabold">
            Loved by <span className="grad-text">Creators</span>
          </h2>
          <div className="card relative p-8">
            <div className="mb-4 font-serif text-5xl leading-none text-[var(--gold)] opacity-30">&ldquo;</div>
            <p className="mb-7 text-lg italic leading-relaxed">{testimonials[activeTestimonial].text}</p>
            <div className="flex items-center justify-center gap-3">
              <Avatar initials={testimonials[activeTestimonial].avatar} size={44} />
              <div className="text-left">
                <div className="font-syne font-bold">{testimonials[activeTestimonial].name}</div>
                <div className="text-[13px] text-[var(--muted)]">{testimonials[activeTestimonial].role}</div>
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveTestimonial(i)}
                  className="h-2 cursor-pointer rounded border-0 transition-all"
                  style={{
                    width: i === activeTestimonial ? 24 : 8,
                    background: i === activeTestimonial ? "var(--gold)" : "var(--border)",
                  }}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg2)] px-6 pb-6 pt-12">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-10 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-10">
            <div>
              <div className="font-syne mb-3 text-[22px] font-extrabold">
                Idea<span className="text-[var(--gold)]">Hub</span>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--muted)]">
                The marketplace for brilliant ideas. Share, discover, collaborate.
              </p>
              <div className="mt-4 flex gap-3">
                {(["twitter", "linkedin", "github"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg3)] text-[var(--muted)] transition-colors hover:text-[var(--gold)]"
                  >
                    <Icon name={s} size={16} />
                  </button>
                ))}
              </div>
            </div>
            {(
              [
                { title: "Platform", links: ["Explore Ideas", "Communities", "Notifications", "Engineering"] },
                { title: "Company", links: ["About Us", "Blog", "Careers", "Press"] },
                { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Contact"] },
              ] as const
            ).map((col) => (
              <div key={col.title}>
                <div className="font-syne mb-4 text-sm font-bold">{col.title}</div>
                {col.links.map((l) => (
                  <div key={l} className="mb-2.5 cursor-pointer text-[13px] text-[var(--muted)]">
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
            <p className="text-[13px] text-[var(--muted)]">© 2025 IdeaHub. All rights reserved.</p>
            <p className="text-[13px] text-[var(--muted)]">Made with ❤️ for innovators</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
