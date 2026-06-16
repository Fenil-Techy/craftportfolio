/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useRef, useState } from 'react'
import PlaygroundHeader from '../_components/PlaygroundHeader'
import ChatSection from '../_components/ChatSection'
import WebsiteDesign from '../_components/WebsiteDesign'
// import SettingSection from '../_components/SettingSection'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import { Loader } from '@/components/ui/loader'

export type Messages = {
  role: string,
  content: string
}
export type Frame = {
  projectId: string,
  frameId: string,
  designCode: string,
  chatMessages: Messages[]
}

const prompt = `
You are an elite Product Designer, Senior Frontend Engineer, and UI Architect.

Your goal is to generate production-quality websites that rival designs from Stripe, Vercel, Linear, Framer, Apple, Notion, Raycast, and Airbnb.


## INPUT

User Request:

{userInput}

TASK

Determine whether the user wants:

* A website/UI
* A normal conversation

If it is NOT a website/UI request:

Return:

[[MODE:CHAT]]

followed by ONLY the plain text response.

Do not generate HTML.

---

# WEBSITE MODE

If the request is for any:

* Landing Page
* SaaS
* Dashboard
* Admin Panel
* Portfolio
* Ecommerce
* Blog
* Agency
* Startup
* AI Product
* Mobile App Landing
* Documentation
* Marketing Site

Return:

[[MODE:CODE]]

followed immediately by ONLY HTML body content.

Do NOT output:

* markdown
* explanations
* comments
* blocks
* html/head/body tags
* doctype

---

# TECH

Use only:

* HTML5
* Tailwind CSS classes
* Alpine.js only if interaction is necessary
* Chart.js only for charts
* Lucide icons when appropriate

Everything must work inside one body.

---

# DESIGN LANGUAGE

The website should feel handcrafted by a senior designer.

Inspired by:

* Stripe
* Vercel
* Linear
* Framer
* Apple

Use:

* generous whitespace
* balanced layouts
* premium typography
* large sections
* elegant gradients
* rounded cards
* subtle shadows
* glass effects where suitable
* soft animations
* visual hierarchy
* modern buttons
* modern forms
* consistent spacing
* clean grids

Avoid:

* generic AI layouts
* bootstrap look
* tailwind examples
* repeated sections
* placeholder content
* lorem ipsum
* empty whitespace
* uneven spacing

---

# TYPOGRAPHY

Hero:

* text-6xl md:text-7xl
* font-black
* tracking-tight

Section titles:

* text-4xl
* font-bold

Body:

* text-lg
* leading-8

Buttons:

* rounded-full
* font-semibold
* px-8 py-3

---

# LAYOUT

Adapt automatically.

Landing:

Navbar
Hero
Features
Stats
Logo Cloud
Pricing
Testimonials
FAQ
CTA
Footer

Dashboard:

Sidebar
Navbar
Cards
Charts
Tables
Analytics
Activity Feed

Portfolio:

Hero
About
Skills
Projects
Experience
Contact
Footer

Ecommerce:

Hero
Categories
Featured Products
Filters
Product Grid
Reviews
CTA
Footer

Blog:

Hero
Categories
Posts
Newsletter
Footer

Generate COMPLETE pages.

---

# CARDS

Use:

rounded-2xl

border

shadow-xl

backdrop-blur

transition-all duration-300

hover:scale-[1.02]

hover:shadow-2xl

---

# COLORS

Choose a premium palette automatically.

Dark:

bg-zinc-950

text-white

text-zinc-400

Light:

bg-white

bg-slate-50

text-slate-900

Use tasteful gradients where appropriate.

---

# IMAGES

Use high-quality Unsplash images.

Always:

* object-cover
* rounded-2xl

Provide meaningful alt text.

---

# RESPONSIVE

Must be mobile-first.

Use proper breakpoints.

No horizontal overflow.

---

# CONTENT

Generate realistic content.

Compelling headlines.

Professional copywriting.

Realistic testimonials.

Believable pricing.

Meaningful CTAs.

No lorem ipsum.

---

# OUTPUT QUALITY

The result should feel like a handcrafted $30k startup website.

Every section should look intentional.

Maintain spacing consistency.

Maintain design consistency.

Avoid repetitive patterns.

Generate COMPLETE HTML.

Never stop midway.

Always finish with the final closing tag.

`
function Playground() {
  console.log("Playground render");
  const lastLengthRef = useRef(0);
  const [chatOpen, setChatOpen] = useState(false);
  const { projectId } = useParams()
  const params = useSearchParams()
  const frameId = params.get('frameId')
  const [frameDetail, setFrameDetail] = useState<Frame>()
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string>("")
  const [screenSize, setScreenSize] = useState("desktop");
  const [selectedModel, setSelectedModel] = useState("google/gemma-4-26b-a4b-it");
  const [messages, setMessages] = useState<Messages[]>()
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    if (!frameId) return
    setInitialLoading(true);
    void axios.get(`/api/frames?frameId=${frameId}&projectId=${projectId}`).then((result) => {
      console.log(result.data)
      setFrameDetail(result.data)
      const designCode = result.data?.designCode;
      const hasStoredDesignCode =
        typeof designCode === "string" && designCode.trim().length > 0;
      if (hasStoredDesignCode) {
        const codeFence = "```html";
        const index = designCode.indexOf(codeFence);
        const formattedCode =
          index >= 0
            ? designCode.slice(index + codeFence.length).trimStart()
            : designCode;
            setGeneratedCode(() => formattedCode);
      } else {
        setGeneratedCode("");
      }
      setMessages(result.data?.chatMessages ?? []);
      setSelectedModel(
        result.data?.selectedModel || "openai/gpt-4o-mini"
      );
      if (result.data?.chatMessages?.length === 1 && !hasStoredDesignCode) {
        const userMsg = result.data?.chatMessages[0].content
        // eslint-disable-next-line react-hooks/immutability
        SendMessage(
          userMsg,
          result.data.selectedModel
        );
      }
      console.log("Loaded model:", result.data.selectedModel);
      setInitialLoading(false)
    })
  }, [frameId, projectId])

  const SendMessage = async (
    userInput: string,
    modelToUse?: string
  ) => {
    setLoading(true)
    const model = modelToUse ?? selectedModel;

    console.log("Using model:", model);
    try {
      const res = await fetch("/api/ai-model", {
        method: "POST",
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: prompt.replace("{userInput}", userInput),
            },
          ],
        }),
      });

      // ...


      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      let fullText = "";
      let rawResponse = "";
      let eventBuffer = "";
      let mode: "code" | "chat" | null = null;

      // reset previous code
      setGeneratedCode("");

      while (true) {
        const { done, value }: any = await reader?.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        eventBuffer += chunk;
        const lines = eventBuffer.split("\n");
        eventBuffer = lines.pop() ?? "";

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line) continue;
          if (!line.startsWith("data: ")) continue;

          const data = line.replace("data: ", "");

          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices[0]?.delta?.content;

            if (!text) continue;

            rawResponse += text;

            if (!mode) {
              const modeMatch = rawResponse.match(/^\s*\[\[MODE:(CODE|CHAT)\]\]/);
              if (modeMatch) {
                mode = modeMatch[1] === "CODE" ? "code" : "chat";
              }
            }

            const cleanedText = rawResponse
              .replace(/^\s*\[\[MODE:(?:CODE|CHAT)\]\]\s*/, "");
            fullText = cleanedText;



            if (mode === "code") {
              if (cleanedText.length - lastLengthRef.current > 500) {
                lastLengthRef.current = cleanedText.length;
                setGeneratedCode(cleanedText);
              }
            }
          } catch { }
        }
      }
      if (mode === "code") {
        setGeneratedCode(fullText);
      }

      // fallback when model misses marker
      if (!mode) {
        const htmlSignal = /<(main|section|div|header|footer|nav|article|aside|form|body)\b/i;
        mode = htmlSignal.test(fullText) ? "code" : "chat";
      }

      // ✅ final message depends on type
      setMessages((prev: any) => [
        ...(prev || []),
        {
          role: "assistant",
          content: mode === "code"
            ? "Your beautiful website code is ready"
            : fullText,
        },
      ]);
      if (mode === "code") {
        await SaveGeneratedCode(fullText);
      }
    } catch (error) {
      console.error("Error:", error);

      setMessages((prev: any) => [
        ...(prev || []),
        {
          role: "assistant",
          content: "Something went wrong",
        },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {

    if (messages && messages.length > 0 && !loading) {
      // eslint-disable-next-line react-hooks/immutability
      SaveMessages()
    }
  }, [messages])

  const SaveMessages = async () => {
    const result = await axios.put("/api/chats", {
      messages: messages,
      frameId: frameId
    })
  }


  const SaveGeneratedCode = async (code: string) => {
    const result = await axios.put("/api/frames", {
      designCode: code,
      frameId: frameId, projectId: projectId
    })
    console.log(result.data)
    toast.success("website is ready")
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <PlaygroundHeader screenSize={screenSize}
        setScreenSize={(v: string) => setScreenSize(v)}
        code={generatedCode} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Desktop */}
        <div className="hidden lg:flex">
          <ChatSection
            messages={messages ?? []}
            onSend={(input: string) => SendMessage(input)}
            loading={loading}
          />
        </div>

        {/* Mobile Floating Widget */}
        <div className="lg:hidden">
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              className="
      fixed bottom-6 right-6
      z-50
      flex h-16 w-16 items-center justify-center
      rounded-full
      bg-black
      border-white
      border
      shadow-2xl
      transition
      hover:scale-110
      active:scale-95
      "
            ><Sparkles size={24} />
            </button>

          )}

          {chatOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => setChatOpen(false)} // optional: close on outside click
              />

              {/* Chat Widget */}
              <div className="
fixed bottom-6 right-4 z-50
flex h-[80dvh] w-[92vw] max-w-md flex-col
overflow-hidden rounded-3xl
border border-white/10
bg-zinc-900/95
backdrop-blur-xl
shadow-[0_20px_80px_rgba(0,0,0,0.45)]
">
                <div className="flex shrink-0 items-center justify-between border-b p-3">
                  <h2 className="font-semibold">Chat Section</h2>

                  <button onClick={() => setChatOpen(false)}>
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-hidden">
                  <ChatSection
                    messages={messages ?? []}
                    onSend={(input: string) => SendMessage(input)}
                    loading={loading}
                  />
                  
                </div>
              </div>
            </>
          )}
        </div>
        <main className="relative order-1 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:order-2 lg:h-full">
          <WebsiteDesign generatedCode={generatedCode} screenSize={screenSize} />
            {initialLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <Loader />
              </div>
            )}
          
        </main>
      </div>
    </div>
  )
}

export default Playground