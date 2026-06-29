import { auth, currentUser } from "@clerk/nextjs/server";
import { AI_MODELS } from "@/config/models";
import { isModelAllowed, isUpgradedTier } from "@/config/features";
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

    const { messages, model, stream, projectId } = await req.json();

    // 2.7 — Validate model against server-side allowlist
    if (!model || !ALLOWED_MODELS.has(model)) {
      return new Response(
        JSON.stringify({ error: "Invalid or unsupported model." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Gated model authorization check
    const { has } = await auth();
    const isUpgraded = has({ plan: "pro" }) || isUpgradedTier(dbUser.tier);
    if (!isModelAllowed(dbUser.tier, model) && !isUpgraded) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Upgrade to Pro to use premium models." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Basic message array validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages must be a non-empty array." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5.8 — Multi-model fallback chain: Selected Model -> Gemini 2.5 Flash -> Qwen 2.5 Coder 32B
    const fallbackChain = [model];
    if (!fallbackChain.includes("google/gemini-2.5-flash")) {
      fallbackChain.push("google/gemini-2.5-flash");
    }
    if (!fallbackChain.includes("qwen/qwen-2.5-coder-32b-instruct")) {
      fallbackChain.push("qwen/qwen-2.5-coder-32b-instruct");
    }

    let mode: "code" | "chat" = "chat";
    let classificationSuccess = false;
    const isStream = stream !== false;

    if (isStream) {
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      const classificationMessages = [
        {
          role: "system",
          content: `You are a triage assistant for a website building platform.
Analyze the user's message and determine if they want to:
1. Generate, design, update, modify, style, or edit a website portfolio, or write HTML/CSS code (response: CODE)
2. Just chat, ask a general question, explain something, or talk without modifying the website code (response: CHAT)

Output EXACTLY 'CODE' or 'CHAT' (no formatting, no markdown, no other words).`
        },
        {
          role: "user",
          content: lastUserMsg
        }
      ];

      // Try classifying using the fallback chain
      for (const currentModel of fallbackChain) {
        try {
          console.log(`[AI_CLASSIFICATION] Attempting classification with model: ${currentModel}`);
          const classResponse = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: currentModel,
                messages: classificationMessages,
                stream: false,
                max_tokens: 10,
                temperature: 0,
              }),
            }
          );

          if (classResponse.ok) {
            const data = await classResponse.json();
            const classificationText = data.choices?.[0]?.message?.content?.trim().toUpperCase() || "";
            console.log(`[AI_CLASSIFICATION] Result for "${lastUserMsg.substring(0, 40)}": ${classificationText}`);
            if (classificationText.includes("CODE")) {
              mode = "code";
              classificationSuccess = true;
              break;
            } else if (classificationText.includes("CHAT")) {
              mode = "chat";
              classificationSuccess = true;
              break;
            }
          } else {
            const errText = await classResponse.text();
            console.warn(`[AI_CLASSIFICATION_FALLBACK] Failed model ${currentModel}. Status: ${classResponse.status}, Error: ${errText}`);
          }
        } catch (err) {
          console.warn(`[AI_CLASSIFICATION_FALLBACK] Request error for ${currentModel}. Error:`, err);
        }
      }

      // Local heuristic fallback if classification failed
      if (!classificationSuccess) {
        const lastUserMessageLower = lastUserMsg.toLowerCase();
        const codeKeywords = ["create", "design", "make", "build", "update", "change", "add", "remove", "style", "color", "layout", "button", "section", "hero", "portfolio", "website", "page", "html", "css", "theme"];
        const matchesKeyword = codeKeywords.some(keyword => lastUserMessageLower.includes(keyword));
        const hasExistingCode = messages.some((m: any) => m.role === "assistant" && m.content.includes("<"));
        if (!hasExistingCode || matchesKeyword) {
          mode = "code";
        } else {
          mode = "chat";
        }
        console.log(`[AI_CLASSIFICATION_HEURISTIC] Fallback determined mode: ${mode}`);
      }

      // Modify the system prompt to apply strict output guidelines for the classified mode
      const modeDirective = mode === "code"
        ? `\n\nIMPORTANT instructions for WEBSITE DESIGN MODE:
- You MUST output ONLY the HTML body content.
- Do NOT wrap the HTML in markdown code blocks or fences (do not use \`\`\`html or \`\`\`).
- Do NOT output \`[[MODE:CODE]]\` or any other tags/markers.
- Do NOT write any explanations, comments, introduction, or text outside of the HTML code.
- Ensure the HTML is complete, clean, and starts directly with the first HTML tag (e.g. <div or <main).`
        : `\n\nIMPORTANT instructions for CHAT MODE:
- You MUST respond in plain text or markdown for a normal conversation.
- Do NOT output \`[[MODE:CHAT]]\` or any other tags/markers.
- Do NOT write or output any HTML code or website layout code.`;

      const systemPromptIndex = messages.findIndex((m: any) => m.role === "system");
      if (systemPromptIndex !== -1) {
        messages[systemPromptIndex].content += modeDirective;
      }
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
              stream_options: stream !== false ? { include_usage: true } : undefined,
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
          projectId: projectId || null,
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
    const decoder = new TextDecoder();
    let promptTokens = 0;
    let completionTokens = 0;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);

            // Decode chunk text and process lines to find token usage info
            const chunkText = decoder.decode(value, { stream: true });
            buffer += chunkText;
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data: ")) {
                const dataStr = trimmed.slice(6);
                if (dataStr === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.usage) {
                    promptTokens = parsed.usage.prompt_tokens ?? 0;
                    completionTokens = parsed.usage.completion_tokens ?? 0;
                  }
                } catch {
                  // Partial chunk or non-JSON chunk — ignore safely
                }
              }
            }
          }
        } finally {
          controller.close();
          const durationMs = Date.now() - startTime;
          try {
            await db.insert(generationLogsTable).values({
              userId: dbUser.id,
              projectId: projectId || null,
              model: usedModel,
              durationMs,
              promptTokens: promptTokens || null,
              completionTokens: completionTokens || null,
              mode: mode,
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
        "x-generation-mode": mode,
        "Access-Control-Expose-Headers": "x-generation-mode",
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