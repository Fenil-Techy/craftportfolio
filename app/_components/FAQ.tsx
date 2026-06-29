'use client'
import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: "Do I need coding skills to use CraftPortfolio?",
    answer: "No, none at all. You describe your profile in plain English, and our AI generates a completed, professional portfolio layout. You can refine text, upload images, and tweak styles using simple sidebar controls and the chat assistant."
  },
  {
    question: "Can I download my portfolio code?",
    answer: "Absolutely. With our Pro and Elite plans, you can download a standalone index.html file containing clean, readable HTML structure and Tailwind CSS styles. You can host this file anywhere for free."
  },
  {
    question: "What counts as a portfolio generation credit?",
    answer: "A credit is deducted when you create a new portfolio from scratch using the workspace input prompt. Editing, chatting with the AI assistant, or tweaking layout colors within an existing project does not cost any credits."
  },
  {
    question: "Can I host the portfolio under my own domain?",
    answer: "Yes. Since you can download the complete standalone index.html file, you can easily deploy it to Vercel, Netlify, Github Pages, or any web host and bind your custom domain."
  }
]

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section className="w-full py-20 bg-transparent relative scroll-reveal">
      <div className="mx-auto max-w-3xl px-6 flex flex-col items-center gap-12">
        
        {/* Header */}
        <div className="space-y-3 text-center">
          <h2 className="text-3xl sm:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 700 }}>
            Frequently Asked Questions
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Got questions? We have got answers.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="w-full flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={idx}
                className="rounded-xl border transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: isOpen ? 'var(--color-brand-border)' : 'var(--color-border-base)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left gap-4"
                >
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {faq.question}
                  </span>
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-md shrink-0"
                    style={{ backgroundColor: 'var(--color-bg-raised)', border: '1px solid var(--color-border-base)' }}
                  >
                    {isOpen 
                      ? <Minus className="h-3.5 w-3.5" style={{ color: 'var(--color-brand)' }} /> 
                      : <Plus className="h-3.5 w-3.5" style={{ color: 'var(--color-text-secondary)' }} />
                    }
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1" style={{ borderTop: '1px solid transparent' }}>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default FAQ
