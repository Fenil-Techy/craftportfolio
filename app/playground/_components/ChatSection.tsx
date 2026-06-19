'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Messages } from '../[projectId]/page'
import { ArrowUp, Check, Copy, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'

type Props = {
  messages: Messages[]
  onSend: (input: string) => void
  loading: boolean
}

// 4.6 — Animated typing indicator shown while AI is streaming
function TypingIndicator() {
  return (
    <div className="flex justify-start items-center gap-2 px-1 py-2">
      <Loader size={20} />
      <div className="flex items-center gap-1">
        <span
          className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  )
}

// 4.14 — Copy button for assistant messages
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy message"
      className="mt-1 ml-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-200"
    >
      {copied
        ? <Check className="h-3.5 w-3.5 text-green-400" />
        : <Copy className="h-3.5 w-3.5" />
      }
    </button>
  )
}

function ChatSection({ messages, onSend, loading }: Props) {
  const [input, setInput] = useState<string>('')
  // 4.1 — Scroll anchor ref at the bottom of the message list
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSend = () => {
    if (!input?.trim()) return
    onSend(input)
    setInput('')
  }

  // 4.1 — Auto-scroll to latest message whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex h-full w-full min-h-0 flex-col border-t border-border shadow lg:h-full lg:w-96 lg:min-w-72 lg:max-w-120 lg:border-r lg:border-t-0 xl:w-120">
      <div className="flex min-h-0 flex-1 flex-col space-y-3 overflow-y-auto p-1 sm:p-2 lg:p-5">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center">No Messages Yet!</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* 4.14 — Group wrapper so copy button shows on hover */}
              <div className={`group flex items-start gap-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-[90%]`}>
                <div
                  className={`rounded-lg p-3 font-normal text-sm sm:text-base wrap-break-word ${
                    msg.role === 'user'
                      ? 'bg-zinc-800 text-gray-200'
                      : 'text-white w-full'
                  }`}
                >
                  {msg.content}
                </div>
                {/* Only show copy button on assistant messages */}
                {msg.role === 'assistant' && <CopyButton text={msg.content} />}
              </div>
            </div>
          ))
        )}

        {/* 4.6 — Animated typing indicator replaces static "Thinking..." */}
        {loading && <TypingIndicator />}

        {/* 4.1 — Invisible anchor that we scroll into view */}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 flex items-end gap-2 border-t p-2 sm:p-3">
        <textarea
          className="min-h-10 max-h-28 flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 sm:text-base"
          // 4.2 — Updated placeholder to hint at keyboard shortcut
          placeholder="Describe your changes… (Ctrl+Enter to send)"
          rows={2}
          onChange={(e) => setInput(e.target.value)}
          value={input}
          // 4.2 — Ctrl+Enter / Cmd+Enter to send
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <Button
          className="shrink-0"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          {loading ? <Loader2Icon className="animate-spin" /> : <ArrowUp />}
        </Button>
      </div>
    </div>
  )
}

export default ChatSection