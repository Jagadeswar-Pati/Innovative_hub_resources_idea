"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Idea } from "@/lib/types/idea";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { ExploreSection } from "@/components/dashboard/ExploreSection";
import { CommunitiesSection } from "@/components/dashboard/CommunitiesSection";
import { NotificationsSection } from "@/components/dashboard/NotificationsSection";
import { EngineeringSection } from "@/components/dashboard/EngineeringSection";
import { CreatePostSection } from "@/components/dashboard/CreatePostSection";
import { UnlockModal } from "@/components/dashboard/UnlockModal";

type SectionId = "explore" | "communities" | "notifications" | "engineering" | "create";

const navItems: {
  id: SectionId;
  icon: "explore" | "community" | "bell" | "cpu" | "plus";
  label: string;
  badge?: number;
}[] = [
  { id: "explore", icon: "explore", label: "Explore" },
  { id: "communities", icon: "community", label: "Communities" },
  { id: "notifications", icon: "bell", label: "Notifications", badge: 3 },
  { id: "engineering", icon: "cpu", label: "Engineering" },
  { id: "create", icon: "plus", label: "Create Post" },
];

const chatReplies = [
  "That's a fascinating idea! I'd suggest refining your value proposition and identifying your target market first.",
  "Great question! Consider adding more technical details to your idea post to attract the right collaborators.",
  "IdeaHub connects you with 10,000+ innovators. Have you checked the Engineering Domains section?",
  "You can unlock monetization by setting a price on your idea and enabling the Featured Collaboration toggle.",
];

type ChatMessage = { role: "user" | "ai"; text: string };

function DashboardSidebarContent({
  sidebarOpen,
  section,
  onSelectSection,
}: {
  sidebarOpen: boolean;
  section: SectionId;
  onSelectSection: (id: SectionId) => void;
}) {
  return (
    <>
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#F5A623] to-[#FF8C42]">
          <Icon name="lightbulb" size={18} className="text-[#0A0A0F]" />
        </div>
        {sidebarOpen && (
          <span className="font-syne text-xl font-extrabold">
            Idea<span className="text-[var(--gold)]">Hub</span>
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-link ${section === item.id ? "active" : ""}`}
            style={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}
            onClick={() => onSelectSection(item.id)}
          >
            <div className="relative">
              <Icon name={item.icon} size={20} />
              {item.badge != null && (
                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--gold)] text-[9px] font-bold text-black">
                  {item.badge}
                </div>
              )}
            </div>
            {sidebarOpen && <span className="text-sm">{item.label}</span>}
          </button>
        ))}
      </div>
      {sidebarOpen && (
        <div className="mt-auto pt-6">
          <div className="glass-gold rounded-xl p-3.5">
            <div className="font-syne mb-1 text-[13px] font-bold">Upgrade to Pro</div>
            <p className="mb-3 text-xs leading-snug text-[var(--muted)]">
              Unlock analytics, priority listing & more.
            </p>
            <button type="button" className="btn-gold w-full py-2 text-xs">
              Go Pro ✦
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function Dashboard({ initialSection = "explore" }: { initialSection?: SectionId }) {
  const router = useRouter();
  const [section, setSection] = useState<SectionId>(initialSection);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Hi! I'm IdeaHub AI. Ask me anything about ideas, collaborations, or how to improve your posts!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [unlockModal, setUnlockModal] = useState<Idea | null>(null);

  const sendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages((p) => [...p, { role: "user", text: msg }]);
    setChatInput("");
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setChatMessages((p) => [
        ...p,
        { role: "ai", text: chatReplies[Math.floor(Math.random() * chatReplies.length)] },
      ]);
    }, 1500);
  }, [chatInput]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* still navigate */
    }
    router.push("/login");
    router.refresh();
  }

  const selectSection = useCallback((id: SectionId) => {
    setSection(id);
    setMobileSidebar(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {mobileSidebar && (
        <button
          type="button"
          className="sidebar-overlay z-40 border-0 p-0 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      <aside
        className="sidebar relative z-10 hidden shrink-0 flex-col overflow-x-hidden overflow-y-auto px-3 py-6 transition-[width] duration-300 ease-out lg:flex"
        style={{ width: sidebarOpen ? 240 : 68 }}
      >
        <DashboardSidebarContent
          sidebarOpen={sidebarOpen}
          section={section}
          onSelectSection={selectSection}
        />
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute right-[-12px] top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg3)] text-[var(--muted)]"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <span className={sidebarOpen ? "inline-block rotate-90" : "inline-block -rotate-90"}>
            <Icon name="chevronDown" size={14} />
          </span>
        </button>
      </aside>

      <aside
        className={`sidebar animate-slideIn fixed bottom-0 left-0 top-0 z-50 w-[260px] flex-col overflow-y-auto px-3 py-6 lg:hidden ${
          mobileSidebar ? "flex" : "hidden"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileSidebar(false)}
          className="mb-4 self-end border-0 bg-transparent text-[var(--muted)]"
          aria-label="Close"
        >
          <Icon name="x" />
        </button>
        <DashboardSidebarContent
          sidebarOpen={true}
          section={section}
          onSelectSection={selectSection}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="glass flex h-16 shrink-0 items-center gap-3 border-b border-[var(--border)] px-5">
          <button
            type="button"
            className="flex border-0 bg-transparent text-[var(--muted)] lg:hidden"
            onClick={() => setMobileSidebar(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" />
          </button>
          <div className="relative max-w-[480px] flex-1">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <Icon name="explore" size={16} />
            </div>
            <input
              className="input-field py-2 pl-9 text-sm"
              placeholder="Search ideas, creators, tags..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--bg3)] text-[var(--muted)]"
              aria-label="Notifications"
            >
              <Icon name="bell" size={18} />
              <div className="notif-dot absolute right-1.5 top-1.5" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg3)] py-1.5 pl-1.5 pr-3"
              >
                <Avatar initials="YO" size={28} />
                <span className="hidden text-sm">You</span>
                <Icon name="chevronDown" size={14} className="text-[var(--muted)]" />
              </button>
              {profileOpen && (
                <div className="card animate-popIn absolute right-0 top-[calc(100%+8px)] z-[100] w-[200px] overflow-hidden">
                  {(
                    [
                      ["user", "Profile"],
                      ["plus", "Create Post"],
                      ["settings", "Settings"],
                      ["logout", "Log Out"],
                    ] as const
                  ).map(([icon, label]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        if (label === "Profile") router.push("/profile");
                        if (label === "Create Post") setSection("create");
                        if (label === "Settings") router.push("/settings");
                        if (label === "Log Out") void handleLogout();
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 border-0 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.04]"
                      style={{ color: label === "Log Out" ? "#FF5252" : "var(--text)" }}
                    >
                      <Icon name={icon} size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--bg)]">
          {section === "explore" && (
            <ExploreSection searchQ={searchQ} onUnlock={setUnlockModal} />
          )}
          {section === "communities" && <CommunitiesSection />}
          {section === "notifications" && <NotificationsSection />}
          {section === "engineering" && <EngineeringSection onUnlock={setUnlockModal} />}
          {section === "create" && <CreatePostSection />}
        </main>
      </div>

      <div className="fixed bottom-6 right-6 z-[200]">
        {chatOpen && (
          <div className="card animate-popIn mb-3 flex max-h-[440px] w-[320px] flex-col overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-[var(--border)] bg-gradient-to-br from-[rgba(245,166,35,0.15)] to-[rgba(255,107,107,0.1)] px-4 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#F5A623] to-[#FF8C42]">
                <Icon name="bot" size={18} className="text-[#0A0A0F]" />
              </div>
              <div>
                <div className="font-syne text-sm font-bold">IdeaHub AI</div>
                <div className="text-[11px] text-[var(--gold)]">● Online</div>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="ml-auto border-0 bg-transparent text-[var(--muted)]"
                aria-label="Close chat"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="flex max-h-[280px] flex-1 flex-col gap-2.5 overflow-y-auto p-3.5">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={m.role === "user" ? "bubble-user" : "bubble-ai"}
                    style={{ fontSize: 13, lineHeight: 1.6 }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex">
                  <div className="bubble-ai text-[13px]">
                    <span className="inline-flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--muted)]"
                          style={{
                            animation: `blink 1s ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 border-t border-[var(--border)] px-3 py-2.5">
              <input
                className="input-field flex-1 py-2 pl-3 pr-3 text-[13px]"
                placeholder="Ask anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
              />
              <button type="button" className="btn-gold px-3 py-2" onClick={sendChat} aria-label="Send">
                <Icon name="send" size={16} />
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          className="btn-gold animate-pulse-gold ml-auto flex h-[52px] w-[52px] items-center justify-center rounded-full text-2xl shadow-[0_8px_32px_rgba(245,166,35,0.3)]"
          onClick={() => setChatOpen(!chatOpen)}
          aria-label={chatOpen ? "Close assistant" : "Open assistant"}
        >
          {chatOpen ? <Icon name="x" size={22} /> : <Icon name="bot" size={22} />}
        </button>
      </div>

      {unlockModal && <UnlockModal idea={unlockModal} onClose={() => setUnlockModal(null)} />}
    </div>
  );
}
