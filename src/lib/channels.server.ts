import type { Stream } from "@/lib/streamfree";

const CHANNELS: ReadonlyArray<{
  stream_key: string;
  name: string;
  embed_url: string;
}> = [
  {
    stream_key: "sony-ten-3",
    name: "Sony Sports Ten 3 (Hindi)",
    embed_url: "https://ctvlive.pages.dev/2?id=s3",
  },
  {
    stream_key: "sony-ten-2",
    name: "Sony Sports Ten 2",
    embed_url: "https://ctvlive.pages.dev/2?id=s2",
  },
];

export function getLinearChannel(key: string): Stream | undefined {
  const channel = CHANNELS.find((item) => item.stream_key === key);
  if (!channel) return undefined;

  return {
    id: channel.stream_key,
    name: channel.name,
    category: "cricket",
    league: null,
    stream_key: channel.stream_key,
    match_timestamp: Math.floor(Date.now() / 1000) - 60,
    viewers: 0,
    is_external: false,
    thumbnail_url: null,
    embed_url: channel.embed_url,
    sources: [],
    team1: null,
    team2: null,
  };
}

export function injectLinearChannels(data: unknown): unknown {
  if (
    typeof data !== "object" ||
    data === null ||
    !Array.isArray((data as { streams?: unknown }).streams)
  ) {
    return {
      count: CHANNELS.length,
      streams: CHANNELS.map((channel) => getLinearChannel(channel.stream_key)),
    };
  }

  const payload = data as { streams: unknown[]; count?: unknown };
  const streams = [...payload.streams];
  const keys = new Set(
    streams.flatMap((stream) =>
      typeof stream === "object" && stream !== null &&
      typeof (stream as { stream_key?: unknown }).stream_key === "string"
        ? [(stream as { stream_key: string }).stream_key]
        : [],
    ),
  );

  for (const channel of CHANNELS) {
    if (!keys.has(channel.stream_key)) {
      const stream = getLinearChannel(channel.stream_key);
      if (stream) streams.push(stream);
    }
  }

  return {
    ...payload,
    ...(typeof payload.count === "number" ? { count: streams.length } : {}),
    streams,
  };
}

export function injectChannelCategories(data: unknown): unknown {
  if (
    typeof data !== "object" ||
    data === null ||
    !Array.isArray((data as { categories?: unknown }).categories)
  ) {
    return { categories: ["cricket"] };
  }

  const payload = data as { categories: unknown[] };
  const categories = payload.categories.filter(
    (category): category is string => typeof category === "string",
  );
  if (!categories.includes("cricket")) categories.push("cricket");
  return { ...payload, categories };
}