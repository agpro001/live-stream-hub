import { createFileRoute } from "@tanstack/react-router";
import { fetchCached } from "@/lib/streamfree.server";
import { streamsResponseSchema } from "@/lib/streamfree";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const urls = new Set<string>([
          `${origin}/`,
          `${origin}/browse`,
          `${origin}/favorites`,
          `${origin}/recent`,
        ]);
        try {
          const { data } = await fetchCached("/streams", 300);
          const parsed = streamsResponseSchema.safeParse(data);
          if (parsed.success) {
            for (const s of parsed.data.streams) {
              urls.add(`${origin}/live/${s.category}/${s.stream_key}`);
              urls.add(`${origin}/category/${s.category}`);
            }
          }
        } catch { /* ignore */ }

        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls]
          .map((u) => `  <url><loc>${u}</loc></url>`)
          .join("\n")}\n</urlset>`;

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=600",
          },
        });
      },
    },
  },
});