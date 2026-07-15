import { createFileRoute } from "@tanstack/react-router";

const ALLOWED = new Set(["netmirror.global", "www.netmirror.global"]);

function pick(html: string, prop: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`,
    "i",
  );
  const m = html.match(re);
  return m?.[1];
}
function pickAlt(html: string, prop: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`,
    "i",
  );
  return html.match(re)?.[1];
}
function getMeta(html: string, prop: string) {
  return pick(html, prop) ?? pickAlt(html, prop);
}

export const Route = createFileRoute("/api/netmirror/preview")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url).searchParams.get("url") ?? "";
        let target: URL;
        try { target = new URL(url); } catch {
          return Response.json({ error: "invalid_url" }, { status: 400 });
        }
        if (target.protocol !== "https:" || !ALLOWED.has(target.hostname)) {
          return Response.json({ error: "forbidden_host" }, { status: 403 });
        }
        try {
          const ctl = new AbortController();
          const t = setTimeout(() => ctl.abort(), 8000);
          const res = await fetch(target.toString(), {
            headers: { "user-agent": "Mozilla/5.0 StreamHubPreview/1.0" },
            signal: ctl.signal,
          });
          clearTimeout(t);
          const html = await res.text();
          const title =
            getMeta(html, "og:title") ??
            html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ??
            target.hostname;
          const image = getMeta(html, "og:image");
          const description =
            getMeta(html, "og:description") ?? getMeta(html, "description") ?? "";
          const video = getMeta(html, "og:video") ?? getMeta(html, "og:video:url");
          return Response.json(
            {
              title: title.trim().slice(0, 240),
              image,
              description: description.trim().slice(0, 400),
              video,
              source: target.toString(),
            },
            { headers: { "Cache-Control": "public, max-age=1800" } },
          );
        } catch (e) {
          return Response.json(
            { error: "fetch_failed", detail: (e as Error).message },
            { status: 502 },
          );
        }
      },
    },
  },
});
