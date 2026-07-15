import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[color:var(--color-brand)] to-[color:var(--color-brand-2)]">
              <Radio className="h-4 w-4 text-black" aria-hidden />
            </span>
            Stream<span className="text-gradient">Hub</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Where every match comes alive. Live sports, cinematic experience.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Explore</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li><Link to="/browse" className="hover:text-foreground">Browse</Link></li>
            <li><Link to="/favorites" className="hover:text-foreground">Favorites</Link></li>
            <li><Link to="/recent" className="hover:text-foreground">Recent</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Sports</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/category/$category" params={{ category: "soccer" }} className="hover:text-foreground">Soccer</Link></li>
            <li><Link to="/category/$category" params={{ category: "basketball" }} className="hover:text-foreground">Basketball</Link></li>
            <li><Link to="/category/$category" params={{ category: "tennis" }} className="hover:text-foreground">Tennis</Link></li>
            <li><Link to="/category/$category" params={{ category: "cricket" }} className="hover:text-foreground">Cricket</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Info</h3>
          <p className="text-sm text-muted-foreground">
            StreamHub aggregates publicly available live matches. All broadcasts belong
            to their respective rights holders.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center">
        <div className="font-mono-tag text-white/50">
          © {new Date().getFullYear()} STREAMHUB · ALL SIGNALS RESERVED
        </div>
        <div className="mt-2 font-display italic text-sm text-white/70">
          Made by <span className="text-gradient font-semibold not-italic">Aditya</span> in motion graphics
        </div>
        <div className="mx-auto mt-4 max-w-3xl px-4 text-[11px] leading-relaxed text-white/45">
          Disclaimer: All videos, movies and streams displayed on StreamHub are provided by
          third-party websites. We do not host, upload or stream any content ourselves; all
          media is played from its original external source.
        </div>
      </div>
    </footer>
  );
}