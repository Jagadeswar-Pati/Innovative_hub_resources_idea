import { TRENDING_TAGS } from "@/lib/constants";
import { TrendingUp } from "lucide-react";

export default function RightSidebar() {
  return (
    <aside className="hidden xl:block xl:w-[300px] xl:flex-shrink-0">
      <div className="sticky top-6 space-y-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Trending Topics
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING_TAGS.map((tag) => (
              <a
                key={tag}
                href={`/explore?tag=${tag}`}
                className="cursor-pointer rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                #{tag}
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
