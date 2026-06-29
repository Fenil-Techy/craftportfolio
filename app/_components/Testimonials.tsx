'use client'
import React from 'react'
import { Quote } from 'lucide-react'

function Testimonials() {
  const reviews = [
    {
      quote: "I described my projects in 3 sentences, and the AI rendered a gorgeous portfolio. Sent the link to a hiring manager and got the interview the next day.",
      name: "Alex Rivera",
      role: "AI Software Engineer"
    },
    {
      quote: "Creating a portfolio used to take me a full weekend. With CraftPortfolio, I generated the layout in 60 seconds and fine-tuned it using the chat assistant.",
      name: "Sarah Chen",
      role: "UI/UX Designer"
    },
    {
      quote: "The ability to export clean standalone HTML code with Tailwind styling is incredible. I hosted it on Vercel under my own domain in minutes.",
      name: "Marcus Vance",
      role: "Full Stack Developer"
    }
  ]

  return (
    <section className="w-full py-20 bg-transparent scroll-reveal">
      <div className="mx-auto max-w-5xl px-6 flex flex-col items-center text-center gap-12">
        
        {/* Header */}
        <div className="space-y-3 max-w-lg">
          <h2 className="text-3xl sm:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 700 }}>
            Loved by creators
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            See how developers and designers use CraftPortfolio to stand out.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-6 rounded-2xl border relative"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-base)',
                boxShadow: 'var(--shadow-sm), var(--shadow-inner)'
              }}
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 opacity-5 select-none" style={{ color: 'var(--color-text-primary)' }} />
              
              <p className="text-xs leading-relaxed italic z-10" style={{ color: 'var(--color-text-secondary)' }}>
                &quot;{rev.quote}&quot;
              </p>

              <div className="mt-6 pt-3" style={{ borderTop: '1px solid var(--color-border-base)' }}>
                <h4 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {rev.name}
                </h4>
                <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                  {rev.role}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Testimonials
