export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();
   
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          max_tokens: 12000,
        }),
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.log(error);
    
      return new Response(error, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    
    // ONLY if response.ok
    const reader = response.body!.getReader();
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          controller.enqueue(value);
        }

        controller.close();
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
    console.error(error);
    return new Response("Error", { status: 500 });
  }
}