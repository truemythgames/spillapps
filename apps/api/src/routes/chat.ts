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

const chat = new Hono<{ Bindings: Env }>();

async function getChatContext(c: {
  req: { header: (n: string) => string | undefined };
  env: Env;
}): Promise<{ userId: string; appId: string }> {
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ") && c.env.JWT_SECRET?.trim()) {
    try {
      const token = authHeader.slice(7);
      const { userId, appId } = await verifySessionPayload(
        token,
        c.env.JWT_SECRET
      );
      if (parseAllowedAppIds(c.env).includes(appId)) {
        return { userId, appId };
      }
    } catch {
      /* fall through to public app id */
    }
  }
  return { userId: "anon", appId: resolvePublicAppId(c as any) };
}

const sendMessageSchema = z.object({
  conversation_id: z.string().optional(),
  topic: z
    .enum(["verse", "advice", "explain", "story", "free"])
    .default("free"),
  message: z.string().min(1).max(2000),
});

const listSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// Send a message and get AI response
chat.post("/", zValidator("json", sendMessageSchema), async (c) => {
  const { userId, appId } = await getChatContext(c);
  const { conversation_id, topic, message } = c.req.valid("json");

  if (!c.env.OPENAI_API_KEY) {
    return c.json({ error: "Chat is not configured" }, 503);
  }

  let convId = conversation_id;
  let isNew = false;

  // Create or fetch conversation
  if (!convId) {
    convId = crypto.randomUUID();
    isNew = true;

    await c.env.DB.prepare(
      "INSERT INTO chat_conversations (id, user_id, topic, title, app_id) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(convId, userId, topic, message.slice(0, 100), appId)
      .run();

    // Insert system prompt as first message
    const systemPrompt = await resolveChatSystemPrompt(c.env.DB, appId, topic);
    await c.env.DB.prepare(
      "INSERT INTO chat_messages (id, conversation_id, role, content) VALUES (?, ?, 'system', ?)",
    )
      .bind(crypto.randomUUID(), convId, systemPrompt)
      .run();
  } else {
    const conv = await c.env.DB.prepare(
      "SELECT id FROM chat_conversations WHERE id = ? AND user_id = ? AND app_id = ?",
    )
      .bind(convId, userId, appId)
      .first();

    if (!conv) {
      return c.json({ error: "Conversation not found" }, 404);
    }
  }

  // Store user message
  await c.env.DB.prepare(
    "INSERT INTO chat_messages (id, conversation_id, role, content) VALUES (?, ?, 'user', ?)",
  )
    .bind(crypto.randomUUID(), convId, message)
    .run();

  // Fetch conversation history for context
  const history = await c.env.DB.prepare(
    "SELECT role, content FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC",
  )
    .bind(convId)
    .all();

  const messages = history.results.map((m: any) => ({
    role: m.role as string,
    content: m.content as string,
  }));

  // Call OpenAI
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-nano",
      messages,
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

  // Store assistant message
  const replyId = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO chat_messages (id, conversation_id, role, content) VALUES (?, ?, 'assistant', ?)",
  )
    .bind(replyId, convId, reply)
    .run();

  // Update conversation timestamp
  await c.env.DB.prepare(
    "UPDATE chat_conversations SET updated_at = datetime('now') WHERE id = ?",
  )
    .bind(convId)
    .run();

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
  const { userId, appId } = await getChatContext(c);
  const { conversation_id, topic, message } = c.req.valid("json");

  if (!c.env.OPENAI_API_KEY) {
    return c.json({ error: "Chat is not configured" }, 503);
  }

  let convId = conversation_id;
  let isNew = false;

  if (!convId) {
    convId = crypto.randomUUID();
    isNew = true;

    await c.env.DB.prepare(
      "INSERT INTO chat_conversations (id, user_id, topic, title, app_id) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(convId, userId, topic, message.slice(0, 100), appId)
      .run();

    const systemPrompt = await resolveChatSystemPrompt(c.env.DB, appId, topic);
    await c.env.DB.prepare(
      "INSERT INTO chat_messages (id, conversation_id, role, content) VALUES (?, ?, 'system', ?)",
    )
      .bind(crypto.randomUUID(), convId, systemPrompt)
      .run();
  } else {
    const conv = await c.env.DB.prepare(
      "SELECT id FROM chat_conversations WHERE id = ? AND user_id = ? AND app_id = ?",
    )
      .bind(convId, userId, appId)
      .first();

    if (!conv) {
      return c.json({ error: "Conversation not found" }, 404);
    }
  }

  await c.env.DB.prepare(
    "INSERT INTO chat_messages (id, conversation_id, role, content) VALUES (?, ?, 'user', ?)",
  )
    .bind(crypto.randomUUID(), convId, message)
    .run();

  const history = await c.env.DB.prepare(
    "SELECT role, content FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC",
  )
    .bind(convId)
    .all();

  const messages = history.results.map((m: any) => ({
    role: m.role as string,
    content: m.content as string,
  }));

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-nano",
      messages,
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

      // Store complete reply
      await c.env.DB.prepare(
        "INSERT INTO chat_messages (id, conversation_id, role, content) VALUES (?, ?, 'assistant', ?)",
      )
        .bind(replyId, convId!, fullReply)
        .run();

      await c.env.DB.prepare(
        "UPDATE chat_conversations SET updated_at = datetime('now') WHERE id = ?",
      )
        .bind(convId!)
        .run();

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

// List conversations
chat.get("/conversations", zValidator("query", listSchema), async (c) => {
  const { userId, appId } = await getChatContext(c);
  const { limit, offset } = c.req.valid("query");

  const rows = await c.env.DB.prepare(
    `SELECT c.id, c.topic, c.title, c.created_at, c.updated_at,
            (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = c.id AND role != 'system') as message_count
     FROM chat_conversations c
     WHERE c.user_id = ? AND c.app_id = ?
     ORDER BY c.updated_at DESC
     LIMIT ? OFFSET ?`,
  )
    .bind(userId, appId, limit, offset)
    .all();

  return c.json({ conversations: rows.results });
});

// Get conversation with messages
chat.get("/conversations/:id", async (c) => {
  const { userId, appId } = await getChatContext(c);
  const id = c.req.param("id");

  const conv = await c.env.DB.prepare(
    "SELECT * FROM chat_conversations WHERE id = ? AND user_id = ? AND app_id = ?",
  )
    .bind(id, userId, appId)
    .first();

  if (!conv) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  const messages = await c.env.DB.prepare(
    "SELECT id, role, content, created_at FROM chat_messages WHERE conversation_id = ? AND role != 'system' ORDER BY created_at ASC",
  )
    .bind(id)
    .all();

  return c.json({ conversation: conv, messages: messages.results });
});

// Delete conversation
chat.delete("/conversations/:id", async (c) => {
  const { userId, appId } = await getChatContext(c);
  const id = c.req.param("id");

  const conv = await c.env.DB.prepare(
    "SELECT id FROM chat_conversations WHERE id = ? AND user_id = ? AND app_id = ?",
  )
    .bind(id, userId, appId)
    .first();

  if (!conv) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM chat_messages WHERE conversation_id = ?").bind(id),
    c.env.DB.prepare("DELETE FROM chat_conversations WHERE id = ?").bind(id),
  ]);

  return c.json({ success: true });
});

export { chat as chatRoutes };
