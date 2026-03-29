import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function LandingNavbar() {
  return (
    <nav
      className="glass fixed left-0 right-0 top-0 z-[100] flex h-16 items-center justify-between px-6"
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#F5A623] to-[#FF8C42]">
          <Icon name="lightbulb" size={18} className="text-[#0A0A0F]" />
        </div>
        <span className="font-syne text-xl font-extrabold">
          Idea<span className="text-[var(--gold)]">Hub</span>
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/login" className="btn-outline px-[18px] py-2 text-sm">
          Log In
        </Link>
        <Link href="/signup" className="btn-gold px-[18px] py-2 text-sm">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
