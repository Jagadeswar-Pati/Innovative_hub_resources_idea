import { Avatar } from "@/components/ui/Avatar";

export function AuthSidePanel() {
  return (
    <div className="relative z-[1] hidden flex-1 flex-col items-center justify-center border-l border-[var(--border)] p-10 lg:flex">
      <div className="glass flex max-w-[360px] flex-col items-stretch justify-center rounded-none border-t border-[var(--border)] p-10 lg:border-t-0">
        <div className="animate-float relative mb-8">
          <div className="card mb-4 p-5">
            <div className="mb-3 flex items-center gap-3">
              <Avatar initials="AM" size={40} />
              <div>
                <div className="font-syne text-[15px] font-bold">EcoTrack</div>
                <div className="text-xs text-[var(--muted)]">by Arjun Mehta</div>
              </div>
              <span className="tag-gold ml-auto">Startup</span>
            </div>
            <p className="text-[13px] text-[var(--muted)]">
              AI-powered carbon footprint monitor with real-time tracking...
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-[var(--muted)]">
              <span>👁 2,840</span>
              <span>❤️ 183</span>
              <span className="tag-gold ml-auto">Free</span>
            </div>
          </div>
          <div className="card absolute -bottom-5 -right-5 w-[200px] bg-[var(--bg2)] p-4">
            <div className="mb-1 text-xs text-[var(--muted)]">Earnings this week</div>
            <div className="font-syne text-2xl font-extrabold text-[var(--gold)]">₹12,450</div>
            <div className="progress-bar mt-2 w-[70%]" />
          </div>
        </div>
        <h2 className="font-syne mt-10 text-[28px] font-extrabold leading-tight">
          Your ideas deserve
          <br />
          an audience.
        </h2>
        <p className="mt-3 leading-relaxed text-[var(--muted)]">
          Join 10,000+ creators who are sharing their innovations and building the future together.
        </p>
      </div>
    </div>
  );
}
