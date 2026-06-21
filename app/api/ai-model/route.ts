import { currentUser } from "@clerk/nextjs/server";
import { AI_MODELS } from "@/config/models";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";
import { getOrCreateUser } from "@/lib/user-helper";
import { db } from "@/config/db";
import { generationLogsTable } from "@/config/schema";

const ALLOWED_MODELS = new Set(AI_MODELS.map((m) => m.id));

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    // 2.1 — Auth guard: every caller must have a valid Clerk session
    const user = await currentUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const dbUser = await getOrCreateUser(user);
    if (!dbUser) {
      return new Response(
        JSON.stringify({ error: "User profile not found." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2.4 — Rate limit: 10 AI generations per 60 seconds per user
    const limited = await checkRateLimit(req, dbUser.email, "aiGeneration");
    if (limited) return limited;

    const { messages, model, stream } = await req.json();

    // 2.7 — Validate model against server-side allowlist
    if (!model || !ALLOWED_MODELS.has(model)) {
      return new Response(
        JSON.stringify({ error: "Invalid or unsupported model." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Basic message array validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages must be a non-empty array." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5.8 — Multi-model fallback chain: Selected Model -> Gemma 4 26B -> Qwen 3 235B
    const fallbackChain = [model];
    if (!fallbackChain.includes("google/gemma-4-26b-a4b-it")) {
      fallbackChain.push("google/gemma-4-26b-a4b-it");
    }
    if (!fallbackChain.includes("qwen/qwen3-235b-a22b-2507")) {
      fallbackChain.push("qwen/qwen3-235b-a22b-2507");
    }

    let response: Response | null = null;
    let lastError: any = null;
    let usedModel = model;

    for (const currentModel of fallbackChain) {
      usedModel = currentModel;
      try {
        console.log(`[AI_MODEL] Attempting generation with model: ${currentModel}`);
        response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: currentModel,
              messages,
              stream: stream !== false,
              max_tokens: stream === false ? 1000 : 12000,
            }),
          }
        );

        if (response.ok) {
          console.log(`[AI_MODEL] Generation succeeded with model: ${currentModel}`);
          break;
        } else {
          const errText = await response.text();
          lastError = new Error(`Status ${response.status}: ${errText}`);
          console.warn(`[AI_MODEL_FALLBACK] Failed model ${currentModel}. Error: ${errText}`);
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI_MODEL_FALLBACK] Request error for ${currentModel}. Error:`, err);
      }
    }

    if (!response || !response.ok) {
      console.error("[AI_MODEL_ALL_FALLBACKS_FAILED]", lastError);
      return new Response(
        JSON.stringify({ error: lastError?.message || "All models in fallback chain failed." }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Handle non-streaming response for utility endpoints (like summarization)
    if (stream === false) {
      const data = await response.json();
      const durationMs = Date.now() - startTime;
      const usage = data.usage;
      try {
        await db.insert(generationLogsTable).values({
          userId: dbUser.id,
          model: usedModel,
          durationMs,
          promptTokens: usage?.prompt_tokens,
          completionTokens: usage?.completion_tokens,
          mode: "chat",
        });
      } catch (logErr) {
        console.error("[ANALYTICS_ERROR] Failed to log generation:", logErr);
      }
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Proxy the SSE stream back to the client
    const reader = response.body!.getReader();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } finally {
          controller.close();
          const durationMs = Date.now() - startTime;
          try {
            await db.insert(generationLogsTable).values({
              userId: dbUser.id,
              model: usedModel,
              durationMs,
              mode: "stream",
            });
          } catch (logErr) {
            console.error("[ANALYTICS_ERROR] Failed to log generation:", logErr);
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[AI_MODEL_ROUTE_ERROR]", error);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}