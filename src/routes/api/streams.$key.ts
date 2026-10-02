import { createFileRoute } from "@tanstack/react-router";
import { fetchCached } from "@/lib/streamfree.server";

const FORBIDDEN = /[/\\?#%&=\s]|\.\./;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export const Route = createFileRoute("/api/streams/$key")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = String(params.key).normalize("NFC");
        if (
          !key ||
          key.length > 200 ||
          FORBIDDEN.test(key) ||
          CONTROL_CHARS.test(key)
        ) {
          return new Response(JSON.stringify({ error: "invalid_key" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        const { status, data } = await fetchCached(
          `/streams/${encodeURIComponent(key)}`,
          30,
        );
        return new Response(JSON.stringify(data), {
          status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=30",
          },
        });
      },
    },
  },
});