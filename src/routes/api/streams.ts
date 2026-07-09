import { createFileRoute } from "@tanstack/react-router";
import { fetchCached } from "@/lib/streamfree.server";

export const Route = createFileRoute("/api/streams")({
  server: {
    handlers: {
      GET: async () => {
        const { status, data } = await fetchCached("/streams", 180);
        return new Response(JSON.stringify(data), {
          status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=60, s-maxage=180",
          },
        });
      },
    },
  },
});