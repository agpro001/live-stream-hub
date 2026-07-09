import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

export function FavoriteButton({ streamKey }: { streamKey: string }) {
  const { has, toggle, hydrated } = useFavorites();
  const active = hydrated && has(streamKey);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(streamKey);
      }}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <Heart className={cn("h-4 w-4", active && "fill-destructive text-destructive")} />
    </button>
  );
}