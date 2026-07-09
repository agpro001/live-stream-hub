import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this right now.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-border bg-card/60 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm hover:bg-secondary/70"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border p-10 text-center">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}