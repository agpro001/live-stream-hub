import { createFileRoute } from "@tanstack/react-router";
import { fetchCached } from "@/lib/streamfree.server";
import { injectChannelCategories } from "@/lib/channels.server";

export const Route = createFileRoute("/api/categories")({
  server: {
    handlers: {
      GET: async () => {
        const { status, data } = await fetchCached("/categories", 1800);
        return new Response(JSON.stringify(injectChannelCategories(data)), {
          status: status >= 500 ? 200 : status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=600, s-maxage=1800",
          },
        });
      },
    },
  },
});