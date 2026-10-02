import { createFileRoute } from "@tanstack/react-router";
import { fetchCached } from "@/lib/streamfree.server";
import { injectLinearChannels } from "@/lib/channels.server";

export const Route = createFileRoute("/api/streams")({
  server: {
    handlers: {
      GET: async () => {
        const { status, data } = await fetchCached("/streams", 180);
        return new Response(JSON.stringify(injectLinearChannels(data)), {
          status: status >= 500 ? 200 : status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=60, s-maxage=180",
          },
        });
      },
    },
  },
});