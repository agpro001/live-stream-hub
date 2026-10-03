import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const chatMessageSchema = z.object({
  id: z.string().uuid(),
  author: z.string().min(1).max(40),
  text: z.string().min(1).max(500),
  sentAt: z.number().finite(),
});

type ChatMessage = z.infer<typeof chatMessageSchema>;
type LocalProfile = { name?: string };

const MAX_VISIBLE_MESSAGES = 100;

export function StreamChat({ streamKey }: { streamKey: string }) {
  const inputId = useId();
  const [profile] = useLocalStorage<LocalProfile>("streamhub:profile", { name: "Guest" });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"connecting" | "connected" | "offline">("connecting");
  const [notice, setNotice] = useState("");
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastSentAt = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setStatus("connecting");
    const channel = supabase
      .channel(`stream-chat:${streamKey}`, { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "chat-message" }, ({ payload }) => {
        const result = chatMessageSchema.safeParse(payload);
        if (result.success) {
          setMessages((current) => [...current, result.data].slice(-MAX_VISIBLE_MESSAGES));
        }
      })
      .subscribe((nextStatus) => {
        setStatus(nextStatus === "SUBSCRIBED" ? "connected" : "offline");
      });

    channelRef.current = channel;
    return () => {
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [streamKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    const channel = channelRef.current;
    if (!text || !channel || status !== "connected") return;
    if (Date.now() - lastSentAt.current < 1200) {
      setNotice("Please wait a moment before sending another message.");
      return;
    }

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      author: profile.name?.trim().slice(0, 40) || "Guest",
      text: text.slice(0, 500),
      sentAt: Date.now(),
    };
    lastSentAt.current = Date.now();
    setNotice("");

    const result = await channel.send({
      type: "broadcast",
      event: "chat-message",
      payload: message,
    });
    if (result === "ok") {
      setMessages((current) => [...current, message].slice(-MAX_VISIBLE_MESSAGES));
      setDraft("");
    } else {
      setNotice("Message not sent. Check your connection and try again.");
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl" aria-label="Live stream chat">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <MessageCircle className="h-4 w-4 text-[color:var(--color-brand)]" aria-hidden />
          Live chat
        </h2>
        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground" role="status">
          <span className={`h-2 w-2 rounded-full ${status === "connected" ? "bg-[color:var(--color-brand)]" : status === "connecting" ? "animate-pulse bg-amber-400" : "bg-destructive"}`} />
          {status === "connected" ? "Connected" : status === "connecting" ? "Connecting" : "Reconnecting"}
        </span>
      </header>

      <div className="flex h-72 flex-col">
        <ol className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite" aria-relevant="additions">
          {messages.length === 0 ? (
            <li className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
              {status === "connected" ? "You’re in the chat. Say hello." : "Joining the stream chat…"}
            </li>
          ) : messages.map((message) => (
            <li key={message.id} className="break-words text-sm">
              <span className="mr-2 font-semibold text-[color:var(--color-brand)]">{message.author}</span>
              <span className="text-foreground/90">{message.text}</span>
              <time className="ml-2 text-[10px] text-muted-foreground" dateTime={new Date(message.sentAt).toISOString()}>
                {new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </time>
            </li>
          ))}
          <li ref={bottomRef} aria-hidden />
        </ol>

        <form onSubmit={sendMessage} className="border-t border-white/10 p-3">
          <label htmlFor={inputId} className="sr-only">Write a chat message</label>
          <div className="flex items-end gap-2">
            <Textarea
              id={inputId}
              value={draft}
              onChange={(event) => setDraft(event.target.value.slice(0, 500))}
              placeholder="Message everyone watching…"
              maxLength={500}
              rows={1}
              disabled={status !== "connected"}
              className="min-h-10 max-h-24 resize-y"
            />
            <Button type="submit" size="icon" aria-label="Send message" disabled={status !== "connected" || !draft.trim()}>
              <Send className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span aria-live="polite">{notice}</span>
            <span>{draft.length}/500</span>
          </div>
        </form>
      </div>
    </section>
  );
}

export function SonyPopupNotice() {
  return (
    <motion.p
      role="note"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: [0, -2, 0] }}
      transition={{ opacity: { duration: 0.35 }, y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }}
      className="rounded-lg border border-[color:var(--color-brand)]/30 bg-[color:var(--color-brand)]/10 px-4 py-3 text-sm font-bold text-[color:var(--color-brand)]"
    >
      If a pop-up appears, click the “Already Joined” button.
    </motion.p>
  );
}