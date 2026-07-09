import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoriesQuery, categoryMeta } from "@/lib/streamfree";
import { cn } from "@/lib/utils";

export function CategoryTabs() {
  const { data } = useQuery(categoriesQuery());
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const cats = data?.categories ?? [];

  return (
    <nav aria-label="Sports categories" className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          to="/browse"
          className={cn(
            "shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium transition",
            pathname === "/browse"
              ? "bg-primary text-primary-foreground border-transparent"
              : "bg-secondary/40 hover:bg-secondary text-foreground",
          )}
        >
          All
        </Link>
        {cats.map((c) => {
          const m = categoryMeta(c);
          const active = pathname === `/category/${c}`;
          return (
            <Link
              key={c}
              to="/category/$category"
              params={{ category: c }}
              className={cn(
                "shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-secondary/40 hover:bg-secondary text-foreground",
              )}
            >
              <span className="mr-1.5" aria-hidden>{m.emoji}</span>
              {m.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}