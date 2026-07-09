import { createFileRoute } from "@tanstack/react-router";
import { fetchCached } from "@/lib/streamfree.server";

export const Route = createFileRoute("/api/categories")({
  server: {
    handlers: {
      GET: async () => {
        const { status, data } = await fetchCached("/categories", 1800);
        return new Response(JSON.stringify(data), {
          status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=600, s-maxage=1800",
          },
        });
      },
    },
  },
});