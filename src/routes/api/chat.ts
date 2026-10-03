import { createFileRoute } from "@tanstack/react-router";
import {
  addChatMessage,
  chatLimits,
  createChatStream,
  getChatMessages,
  isValidChatStreamKey,
} from "@/lib/chat.server";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function streamKeyFrom(request: Request) {
  return new URL(request.url).searchParams.get("stream")?.trim() ?? "";
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const streamKey = streamKeyFrom(request);
        if (!isValidChatStreamKey(streamKey)) {
          return json({ error: "invalid_stream" }, 400);
        }

        const wantsEvents = request.headers.get("accept")?.includes("text/event-stream");
        if (!wantsEvents) {
          return json({ messages: getChatMessages(streamKey) });
        }

        return new Response(createChatStream(streamKey), {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
          },
        });
      },
      POST: async ({ request }) => {
        const streamKey = streamKeyFrom(request);
        if (!isValidChatStreamKey(streamKey)) {
          return json({ error: "invalid_stream" }, 400);
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ error: "invalid_json" }, 400);
        }

        if (typeof body !== "object" || body === null) {
          return json({ error: "invalid_body" }, 400);
        }
        const input = body as { username?: unknown; text?: unknown };
        const username = typeof input.username === "string" ? input.username.trim() : "";
        const text = typeof input.text === "string" ? input.text.trim() : "";
        const limits = chatLimits();

        if (!username || username.length > limits.maxUsernameLength) {
          return json({ error: "invalid_username" }, 400);
        }
        if (!text || text.length > limits.maxMessageLength) {
          return json({ error: "invalid_message" }, 400);
        }

        const message = addChatMessage(streamKey, username, text);
        return json({ message }, 201);
      },
    },
  },
});
