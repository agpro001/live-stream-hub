export type ChatMessage = {
  id: string;
  streamKey: string;
  username: string;
  text: string;
  createdAt: number;
};

type ChatRoom = {
  messages: ChatMessage[];
  clients: Set<ReadableStreamDefaultController<Uint8Array>>;
};

const rooms = new Map<string, ChatRoom>();
const encoder = new TextEncoder();
const MAX_MESSAGES = 100;
const MAX_ROOMS = 200;
const MAX_MESSAGE_LENGTH = 500;
const MAX_USERNAME_LENGTH = 32;
const STREAM_KEY_PATTERN = /^[a-zA-Z0-9._-]{1,200}$/;

function roomFor(streamKey: string): ChatRoom {
  let room = rooms.get(streamKey);
  if (!room) {
    room = { messages: [], clients: new Set() };
    rooms.set(streamKey, room);
    while (rooms.size > MAX_ROOMS) {
      const oldest = rooms.keys().next().value;
      if (!oldest) break;
      const candidate = rooms.get(oldest);
      if (candidate && candidate.clients.size === 0) rooms.delete(oldest);
      else break;
    }
  }
  return room;
}

function event(name: string, data: unknown): Uint8Array {
  return encoder.encode(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
}

export function isValidChatStreamKey(streamKey: string): boolean {
  return STREAM_KEY_PATTERN.test(streamKey);
}

export function getChatMessages(streamKey: string): ChatMessage[] {
  return [...roomFor(streamKey).messages];
}

export function addChatMessage(streamKey: string, username: string, text: string): ChatMessage {
  const room = roomFor(streamKey);
  const message: ChatMessage = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    streamKey,
    username: username.trim().slice(0, MAX_USERNAME_LENGTH),
    text: text.trim().slice(0, MAX_MESSAGE_LENGTH),
    createdAt: Date.now(),
  };
  room.messages.push(message);
  if (room.messages.length > MAX_MESSAGES) room.messages.shift();

  const payload = event("message", message);
  for (const client of room.clients) {
    try {
      client.enqueue(payload);
    } catch {
      room.clients.delete(client);
    }
  }
  return message;
}

export function createChatStream(streamKey: string): ReadableStream<Uint8Array> {
  const room = roomFor(streamKey);
  let controllerRef: ReadableStreamDefaultController<Uint8Array> | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  return new ReadableStream<Uint8Array>({
    start(controller) {
      controllerRef = controller;
      room.clients.add(controller);
      controller.enqueue(event("ready", { streamKey }));
      controller.enqueue(event("history", room.messages));
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          if (heartbeat) clearInterval(heartbeat);
          room.clients.delete(controller);
        }
      }, 20_000);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      if (controllerRef) room.clients.delete(controllerRef);
    },
  });
}

export function chatLimits() {
  return {
    maxMessageLength: MAX_MESSAGE_LENGTH,
    maxUsernameLength: MAX_USERNAME_LENGTH,
  };
}
