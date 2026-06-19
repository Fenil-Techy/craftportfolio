/* eslint-disable react-hooks/set-state-in-effect */
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
You are an elite Portfolio Designer, Creative Director, and Senior Frontend Engineer.

Your task is to create world-class personal portfolio websites that look handcrafted and premium which fits all screen mobile to desktop.

The quality should rival portfolios featured on Awwwards, Framer, Vercel, Apple, Linear, and modern creative agencies.

## INPUT

User Request:

{userInput}

---

## TASK

Determine whether the user is requesting:

* A portfolio website
* A normal conversation

If it is NOT a portfolio website request, return:

[[MODE:CHAT]]

followed by ONLY the plain text response.

Do NOT generate HTML.

---

# PORTFOLIO MODE

Return:

[[MODE:CODE]]

followed immediately by ONLY HTML body content.

Never output:

* Markdown
* Explanations
* Comments
* Code fences
* html/head/body tags
* doctype

Return only valid HTML body content.

---

# TECHNOLOGY

Use only:

* HTML5
* Tailwind CSS classes
* Alpine.js only when interaction is needed
* Lucide icons when appropriate

Everything must work inside a single body.

---

# DESIGN STYLE

The portfolio should feel premium and modern.

Inspired by:

* Framer
* Vercel
* Stripe
* Apple
* Linear
* Awwwards-winning portfolios

Use:

* Large typography
* Minimalism
* Elegant gradients
* Glassmorphism where appropriate
* Rounded cards
* Soft shadows
* Beautiful spacing
* Visual hierarchy
* Premium buttons
* Smooth hover animations
* Clean grids
* Subtle motion

Avoid:

* Generic AI layouts
* Bootstrap appearance
* Repetitive sections
* Lorem ipsum
* Placeholder content
* Empty whitespace
* Poor spacing
* Boring layouts

---
# PERSONAL PORTFOLIO RULES

This website is ALWAYS for a SINGLE PERSON.

Never generate:

- Startup landing pages
- SaaS websites
- Company websites
- Agency websites
- Product websites

The portfolio owner should be treated as an individual professional.

Generate realistic:

- Full Name
- Professional Title
- Professional Profile Image (Unsplash)
- Short Biography
- Skills
- Education
- Experience
- Featured Projects
- Contact Information
- Social Links

The hero section MUST introduce the person.

Example:

John Carter
AI & Machine Learning Student
Building intelligent systems with Python, TensorFlow and Computer Vision.

Include a professional portrait image.

The website should immediately feel like a personal portfolio, not a business website.
# PORTFOLIO STRUCTURE

Choose sections dynamically depending on the user's profession.

Possible sections:

* Navbar
* Hero
* About
* Services
* Skills
* Experience
* Timeline
* Projects
* Tech Stack
* Testimonials
* Contact
* Footer

Include only relevant sections.

Never generate unnecessary sections.

---

# HERO SECTION

Create a strong first impression with:

* Large headline
* Professional subtitle
* CTA buttons
* Social links
* Hero image or illustration
* Background effects

The hero should feel memorable.

---

# PROJECTS

Projects should look premium.

Include:

* Large thumbnails
* Category
* Description
* Technologies
* Live Demo button
* GitHub button
* Hover animations

Cards should feel interactive.

---

# TYPOGRAPHY

Hero:

text-6xl md:text-7xl

font-black

tracking-tight

Section Titles:

text-4xl

font-bold

Body:

text-lg

leading-8

Buttons:

rounded-full

font-semibold

px-8 py-3

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

Automatically choose a premium palette.

Dark mode preferred unless user specifies otherwise.

Use tasteful gradients and accent colors.

Maintain excellent contrast.

---

# IMAGES

Use high-quality Unsplash images.

Always append these URL parameters to every Unsplash URL:
?w=800&q=80&auto=format&fit=crop

Example: https://images.unsplash.com/photo-xxxxx?w=800&q=80&auto=format&fit=crop

This keeps image weight under 100KB per image instead of several MB.

Always:

* object-cover
* rounded-2xl

Provide meaningful alt text.

---

# RESPONSIVENESS

Must be mobile-first with responsive header.

Responsive across all breakpoints.

No horizontal overflow.

---

# CONTENT

Generate realistic content.

Professional biography.

Meaningful project descriptions.

Realistic experience.

Authentic testimonials.

Strong CTAs.

Never use lorem ipsum.

---

# OUTPUT QUALITY

The final result should look like a $20k–$50k professionally designed portfolio.

Every section should feel intentional.

Maintain spacing consistency.

Maintain visual consistency.

Avoid repetitive patterns.

Generate COMPLETE HTML.

Never stop midway.

Always finish with the final closing tag.


`
function Playground() {
 
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
     
      setInitialLoading(false)
    })
  }, [frameId, projectId])

  const SendMessage = async (
    userInput: string,
    modelToUse?: string
  ) => {
    setLoading(true)
    const userMessage = {
      role: "user",
      content: userInput,
    };
    
    setMessages((prev) => [
      ...(prev ?? []),
      userMessage,
    ]);
    const model = modelToUse ?? selectedModel;

   
    try {
      // const chatHistory = [
      //   ...(messages ?? []),
      //   {
      //     role: "user",
      //     content: userInput,
      //   },
      // ];
      
      const res = await fetch("/api/ai-model", {
        method: "POST",
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: prompt.replace("{userInput}", userInput),
            },

            ...(generatedCode
              ? [
                  {
                    role: "assistant",
                    content: generatedCode,
                  },
                ]
              : []),

            ...(messages ?? []),

            {
              role: "user",
              content: userInput,
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
              // 3.6 — Only update iframe every 2000 chars to reduce re-paints (~6 updates vs ~24)
              if (cleanedText.length - lastLengthRef.current > 2000) {
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
      const updatedMessages = [
        ...(messages ?? []),
        {
          role: "user",
          content: userInput,
        },
        {
          role: "assistant",
          content:
            mode === "code"
              ? "Website updated successfully"
              : fullText,
        },
      ];
      
      setMessages(updatedMessages);
      
      await axios.put("/api/chats", {
        frameId,
        messages: updatedMessages,
      });
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

  


  const SaveGeneratedCode = async (code: string) => {
    const result = await axios.put("/api/frames", {
      designCode: code,
      frameId: frameId, projectId: projectId
    })
    
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