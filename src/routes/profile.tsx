import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { UserRound, Heart, History, Film, Save } from "lucide-react";
import { useLocalStorage, useFavorites, useRecent } from "@/hooks/useLocalStorage";
import { useState, useEffect } from "react";

type Profile = { name: string; handle: string; avatar: string; bio: string };

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — StreamHub" },
      { name: "description", content: "Your StreamHub profile, favorites and recently viewed." },
      { property: "og:title", content: "Profile — StreamHub" },
      { property: "og:description", content: "Personalize your cinematic streaming experience." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile, hydrated] = useLocalStorage<Profile>("streamhub:profile", {
    name: "Guest", handle: "@guest", avatar: "", bio: "Cinematic sports fan.",
  });
  const [movies] = useLocalStorage<unknown[]>("streamhub:movies", []);
  const { ids: favIds } = useFavorites();
  const { ids: recentIds } = useRecent();
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (hydrated) setDraft(profile); }, [hydrated, profile]);

  const save = () => {
    setProfile(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="font-mono-tag text-[color:var(--color-brand)]">ACCOUNT · LOCAL</div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Profile</h1>
      </motion.header>

      <section className="grid gap-6 md:grid-cols-[280px_1fr]">
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
        >
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--color-brand)] to-[color:var(--color-brand-2)] p-[3px]">
            <div className="h-full w-full overflow-hidden rounded-full bg-background">
              {draft.avatar ? (
                <img src={draft.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/60">
                  <UserRound className="h-10 w-10" />
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="font-display text-lg font-semibold">{profile.name}</div>
            <div className="font-mono-tag text-xs text-white/50">{profile.handle}</div>
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">{profile.bio}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
        >
          <h2 className="mb-4 font-display text-xl font-semibold">Edit profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
            <Field label="Handle" value={draft.handle} onChange={(v) => setDraft({ ...draft, handle: v })} />
            <Field label="Avatar URL" value={draft.avatar} onChange={(v) => setDraft({ ...draft, avatar: v })} full />
            <Field label="Bio" value={draft.bio} onChange={(v) => setDraft({ ...draft, bio: v })} full />
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={save} className="neon-btn inline-flex items-center gap-2 px-5 py-2.5">
              <Save className="h-4 w-4" /> Save
            </button>
            {saved && <span className="font-mono-tag text-xs text-[color:var(--color-brand)]">SAVED</span>}
          </div>
        </motion.div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Heart className="h-5 w-5" />} label="Favorites" value={favIds.length} to="/favorites" />
        <Stat icon={<History className="h-5 w-5" />} label="Recently viewed" value={recentIds.length} to="/recent" />
        <Stat icon={<Film className="h-5 w-5" />} label="Movies & shows" value={movies.length} to="/movies" />
      </section>
    </div>
  );
}

function Field({ label, value, onChange, full }: { label: string; value: string; onChange: (v: string) => void; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block font-mono-tag text-xs text-white/60">{label.toUpperCase()}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-brand)]"
      />
    </label>
  );
}

function Stat({ icon, label, value, to }: { icon: React.ReactNode; label: string; value: number; to: string }) {
  return (
    <Link to={to} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-[color:var(--color-brand)]/50">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--color-brand)]/15 text-[color:var(--color-brand)]">{icon}</span>
      <div>
        <div className="font-display text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </Link>
  );
}
