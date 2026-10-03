import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";

type ChatMessage = {
  id: string;
  streamKey: string;
  username: string;
  text: string;
  createdAt: number;
};

const MAX_MESSAGE_LENGTH = 500;

function guestName() {
  const saved = window.localStorage.getItem("streamhub:chat-name");
  if (saved) return saved;
  const name = `Guest ${Math.floor(1000 + Math.random() * 9000)}`;
  window.localStorage.setItem("streamhub:chat-name", name);
  return name;
}

export function StreamChat({ streamKey }: { streamKey: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState("");
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsername(guestName());
    const source = new EventSource(`/api/chat?stream=${encodeURIComponent(streamKey)}`);

    const scrollToLatest = () => {
      requestAnimationFrame(() => {
        const list = listRef.current;
        if (list) list.scrollTop = list.scrollHeight;
      });
    };
    const onReady = () => {
      setConnected(true);
      setError(null);
    };
    const onHistory = (event: MessageEvent<string>) => {
      try {
        setMessages(JSON.parse(event.data) as ChatMessage[]);
        scrollToLatest();
      } catch {
        setError("Could not read chat history.");
      }
    };
    const onMessage = (event: MessageEvent<string>) => {
      try {
        const message = JSON.parse(event.data) as ChatMessage;
        setMessages((current) => [...current, message].slice(-100));
        scrollToLatest();
      } catch {
        setError("Could not read a chat message.");
      }
    };
    const onError = () => {
      setConnected(false);
      setError("Chat reconnecting…");
    };

    source.addEventListener("ready", onReady);
    source.addEventListener("history", onHistory);
    source.addEventListener("message", onMessage);
    source.addEventListener("error", onError);
    return () => {
      source.removeEventListener("ready", onReady);
      source.removeEventListener("history", onHistory);
      source.removeEventListener("message", onMessage);
      source.removeEventListener("error", onError);
      source.close();
    };
  }, [streamKey]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = username.trim().slice(0, 32);
    const cleanText = text.trim();
    if (!cleanName || !cleanText || cleanText.length > MAX_MESSAGE_LENGTH || sending) return;

    setSending(true);
    setError(null);
    window.localStorage.setItem("streamhub:chat-name", cleanName);
    try {
      const response = await fetch(`/api/chat?stream=${encodeURIComponent(streamKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanName, text: cleanText }),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Message could not be sent.");
      }
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      className="overflow-hidden rounded-2xl border border-border bg-card/60"
      aria-label="Live chat"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 font-display font-semibold">
          <MessageCircle className="h-4 w-4 text-[color:var(--color-brand)]" aria-hidden />
          Live chat
        </div>
        <span
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
          aria-live="polite"
        >
          <span
            className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400"}`}
          />
          {connected ? "Connected" : "Connecting"}
        </span>
      </div>

      <div ref={listRef} className="h-64 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            Be the first to say something.
          </p>
        ) : (
          messages.map((message) => (
            <article key={message.id} className="text-sm">
              <div className="flex items-baseline gap-2">
                <strong className="font-medium text-[color:var(--color-brand)]">
                  {message.username}
                </strong>
                <time
                  className="text-[10px] text-muted-foreground"
                  dateTime={new Date(message.createdAt).toISOString()}
                >
                  {new Date(message.createdAt).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p className="mt-0.5 break-words text-foreground/90">{message.text}</p>
            </article>
          ))
        )}
      </div>

      <form onSubmit={submit} className="border-t border-border p-3">
        <div className="mb-2 flex gap-2">
          <label className="sr-only" htmlFor={`chat-name-${streamKey}`}>
            Your name
          </label>
          <input
            id={`chat-name-${streamKey}`}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            maxLength={32}
            placeholder="Name"
            className="w-28 rounded-lg border border-border bg-background/50 px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
          />
          <label className="sr-only" htmlFor={`chat-message-${streamKey}`}>
            Chat message
          </label>
          <input
            id={`chat-message-${streamKey}`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Join the conversation…"
            className="min-w-0 flex-1 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={sending || !username.trim() || !text.trim()}
            aria-label="Send message"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{error ?? "Messages are visible to viewers of this stream."}</span>
          <span>
            {text.length}/{MAX_MESSAGE_LENGTH}
          </span>
        </div>
      </form>
    </section>
  );
}
