export function CinematicLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="relative flex h-full min-h-[220px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,color-mix(in_oklab,var(--color-brand)_18%,transparent),transparent_70%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.08)_50%,transparent_70%)] [background-size:200%_100%] animate-[shimmer_2.2s_linear_infinite]" />
      <div className="relative flex flex-col items-center gap-3">
        <div className="relative h-14 w-14">
          <span className="absolute inset-0 rounded-full border-2 border-white/10" />
          <span className="absolute inset-0 rounded-full border-2 border-t-[color:var(--color-brand)] border-transparent animate-spin" />
          <span className="absolute inset-2 rounded-full bg-[color:var(--color-brand)]/20 blur-md" />
        </div>
        <div className="font-mono-tag text-xs tracking-widest text-white/70">{label.toUpperCase()}</div>
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}
