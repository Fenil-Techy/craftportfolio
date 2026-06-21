/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useRef, useState, useContext } from 'react'
import PlaygroundHeader from '../_components/PlaygroundHeader'
import ChatSection from '../_components/ChatSection'
import WebsiteDesign from '../_components/WebsiteDesign'
// import SettingSection from '../_components/SettingSection'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import { Sparkles, X } from 'lucide-react'
import { Loader } from '@/components/ui/loader'
import { buildSystemPrompt } from '@/config/prompts'
import { buildContextWindow } from '@/lib/context-manager'
import UserDetailContext from '@/context/UserDetailContext'
import { useAuth } from '@clerk/nextjs'

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

function Playground() {
  const context = useContext(UserDetailContext)
  const userDetail = context?.userDetail
  const { has } = useAuth()
  const hasUnlimitedAccess = has ? has({ plan: 'pro' }) : false
  const isPro = hasUnlimitedAccess || userDetail?.tier === 'pro'
 
  const lastLengthRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
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

    return () => {
      // Intentionally not aborting to prevent React StrictMode double-mount race conditions
    };
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

    // 5.2 — We use a local AbortController to avoid ref mutation issues
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // 5.4 — Abort request after 5 minutes
    const timeoutId = setTimeout(() => {
      abortController.abort();
      toast.error("Generation is taking too long. Please try again.");
    }, 300000);
   
    try {
      const currentHistory = [
        ...(messages ?? []),
        userMessage,
      ];

      // 5.3 — Dynamic Context Window: Keep last 6 and summarize older messages
      const { recentMessages, summaryMessage } = await buildContextWindow(currentHistory, 6);

      const apiMessages = [
        {
          role: "system",
          content: buildSystemPrompt(userInput, undefined, isPro),
        },
        ...(summaryMessage ? [summaryMessage] : []),
        ...(generatedCode
          ? [
              {
                role: "assistant",
                content: generatedCode,
              },
            ]
          : []),
        ...recentMessages,
      ];
      
      const res = await fetch("/api/ai-model", {
        method: "POST",
        signal: abortController.signal,
        body: JSON.stringify({
          model,
          messages: apiMessages,
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      

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

      clearTimeout(timeoutId);

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
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        console.log("Request aborted.");
        return;
      }
      console.error("Error:", error);
      // 4.12 — Surface the failure visually with a toast, not just a chat message
      toast.error("Generation failed. Please try again.");
      setMessages((prev: any) => [
        ...(prev || []),
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
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
        code={generatedCode}
        isPro={isPro} />
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
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setChatOpen(false)}
              />

              {/* 4.5 — Chat Widget with slide-up animation */}
              <div
                className="
                  fixed bottom-6 right-4 z-50
                  flex h-[80dvh] w-[92vw] max-w-md flex-col
                  overflow-hidden rounded-3xl
                  border border-white/10
                  bg-zinc-900/95
                  backdrop-blur-xl
                  shadow-[0_20px_80px_rgba(0,0,0,0.45)]
                  animate-in slide-in-from-bottom-6 fade-in duration-300
                "
              >
                <div className="flex shrink-0 items-center justify-between border-b p-3">
                  <h2 className="font-semibold">Chat</h2>
                  <button
                    onClick={() => setChatOpen(false)}
                    aria-label="Close chat"
                    className="rounded-full p-1 hover:bg-zinc-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
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
          <WebsiteDesign generatedCode={generatedCode} screenSize={screenSize} isPro={isPro} />

          {/* Initial DB fetch overlay */}
          {initialLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <Loader />
            </div>
          )}

          {/* 4.3 — Generating overlay: shown when AI is streaming and no code exists yet */}
          {loading && !generatedCode && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-zinc-950/90 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader size={48} />
                <p className="text-lg font-semibold text-white">Generating your portfolio…</p>
                <p className="text-sm text-zinc-400">This usually takes 20–40 seconds</p>
              </div>
              {/* Pulsing skeleton preview */}
              <div className="w-full max-w-sm space-y-3 px-4">
                <div className="h-4 w-3/4 animate-pulse rounded-full bg-zinc-700" />
                <div className="h-4 w-full animate-pulse rounded-full bg-zinc-700" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-zinc-700" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-zinc-700" />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Playground