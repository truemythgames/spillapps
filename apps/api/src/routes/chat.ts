import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Env } from "../types";
import {
  parseAllowedAppIds,
  verifySessionPayload,
} from "../middleware/auth";
import { resolvePublicAppId } from "../lib/request-app";
import { resolveChatSystemPrompt } from "../lib/chat-prompts";
import { resolveLocale } from "../lib/locale";

const chat = new Hono<{ Bindings: Env }>();

/**
 * Conversations are never written to the database. A thread lives in KV only
 * long enough for follow-up questions to stay coherent, then expires.
 */
const CONTEXT_TTL_SECONDS = 60 * 60 * 6;
/** Turns kept for context; older ones are dropped so payloads stay bounded. */
const MAX_CONTEXT_MESSAGES = 21;

type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

/** Chat is public; only the app scope is resolved, never a per-user identity. */
async function resolveAppId(c: {
  req: { header: (n: string) => string | undefined };
  env: Env;
}): Promise<string> {
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ") && c.env.JWT_SECRET?.trim()) {
    try {
      const { appId } = await verifySessionPayload(
        authHeader.slice(7),
        c.env.JWT_SECRET
      );
      if (parseAllowedAppIds(c.env).includes(appId)) return appId;
    } catch {
      /* fall through to the public app id */
    }
  }
  return resolvePublicAppId(c as any);
}

function contextKey(appId: string, conversationId: string): string {
  return `chat-context:${appId}:${conversationId}`;
}

async function loadContext(
  env: Env,
  appId: string,
  conversationId: string
): Promise<ChatTurn[] | null> {
  try {
    const raw = await env.CACHE.get(contextKey(appId, conversationId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatTurn[]) : null;
  } catch {
    return null;
  }
}

async function saveContext(
  env: Env,
  appId: string,
  conversationId: string,
  turns: ChatTurn[]
): Promise<void> {
  // Keep the system prompt plus the most recent turns.
  const system = turns.filter((t) => t.role === "system").slice(0, 1);
  const rest = turns.filter((t) => t.role !== "system");
  const trimmed = [...system, ...rest.slice(-MAX_CONTEXT_MESSAGES)];

  try {
    await env.CACHE.put(
      contextKey(appId, conversationId),
      JSON.stringify(trimmed),
      { expirationTtl: CONTEXT_TTL_SECONDS }
    );
  } catch (e) {
    console.error("Chat context write failed:", e);
  }
}

/**
 * Resolves the turns to send to the model. An unknown or expired
 * conversation id starts a fresh thread rather than failing, so clients
 * holding an old id keep working.
 */
async function buildTurns(
  c: { env: Env },
  appId: string,
  conversationId: string | undefined,
  topic: string,
  locale: string,
  message: string
): Promise<{ convId: string; isNew: boolean; turns: ChatTurn[] }> {
  const existing = conversationId
    ? await loadContext(c.env, appId, conversationId)
    : null;

  if (existing?.length) {
    return {
      convId: conversationId!,
      isNew: false,
      turns: [...existing, { role: "user", content: message }],
    };
  }

  const systemPrompt = await resolveChatSystemPrompt(
    c.env.DB,
    appId,
    topic,
    locale
  );

  return {
    convId: conversationId ?? crypto.randomUUID(),
    isNew: !conversationId,
    turns: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
  };
}

const sendMessageSchema = z.object({
  conversation_id: z.string().optional(),
  topic: z
    .enum(["verse", "advice", "explain", "story", "free", "prayer"])
    .default("free"),
  message: z.string().min(1).max(2000),
});

// Send a message and get AI response
chat.post("/", zValidator("json", sendMessageSchema), async (c) => {
  const appId = await resolveAppId(c);
  const locale = resolveLocale(c);
  const { conversation_id, topic, message } = c.req.valid("json");

  if (!c.env.OPENAI_API_KEY) {
    return c.json({ error: "Chat is not configured" }, 503);
  }

  const { convId, isNew, turns } = await buildTurns(
    c,
    appId,
    conversation_id,
    topic,
    locale,
    message
  );

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-nano",
      messages: turns,
      max_tokens: 1024,
      temperature: 0.8,
    }),
  });

  if (!openaiRes.ok) {
    const err = await openaiRes.text();
    console.error("OpenAI error:", err);
    return c.json({ error: "AI service unavailable" }, 502);
  }

  const completion: any = await openaiRes.json();
  const reply = completion.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
  const replyId = crypto.randomUUID();

  await saveContext(c.env, appId, convId, [
    ...turns,
    { role: "assistant", content: reply },
  ]);

  return c.json({
    conversation_id: convId,
    is_new: isNew,
    message: {
      id: replyId,
      role: "assistant",
      content: reply,
    },
  });
});

// Stream a message (SSE)
chat.post("/stream", zValidator("json", sendMessageSchema), async (c) => {
  const appId = await resolveAppId(c);
  const locale = resolveLocale(c);
  const { conversation_id, topic, message } = c.req.valid("json");

  if (!c.env.OPENAI_API_KEY) {
    return c.json({ error: "Chat is not configured" }, 503);
  }

  const { convId, isNew, turns } = await buildTurns(
    c,
    appId,
    conversation_id,
    topic,
    locale,
    message
  );

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-nano",
      messages: turns,
      max_tokens: 1024,
      temperature: 0.8,
      stream: true,
    }),
  });

  if (!openaiRes.ok || !openaiRes.body) {
    return c.json({ error: "AI service unavailable" }, 502);
  }

  const replyId = crypto.randomUUID();
  let fullReply = "";

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Send initial metadata
  const meta = JSON.stringify({ conversation_id: convId, is_new: isNew, message_id: replyId });
  writer.write(encoder.encode(`data: ${meta}\n\n`));

  // Process the OpenAI stream
  const reader = openaiRes.body.getReader();
  const decoder = new TextDecoder();

  (async () => {
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;

          try {
            const chunk = JSON.parse(data);
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) {
              fullReply += delta;
              writer.write(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      if (fullReply) {
        await saveContext(c.env, appId, convId, [
          ...turns,
          { role: "assistant", content: fullReply },
        ]);
      }

      writer.write(encoder.encode("data: [DONE]\n\n"));
    } catch (err) {
      console.error("Stream error:", err);
    } finally {
      writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});

export { chat as chatRoutes };
