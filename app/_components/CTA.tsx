'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

function CTA() {
  return (
    <section className="w-full py-16 bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        
        {/* Glowing Gradient Banner Container */}
        <div 
          className="w-full rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-6 relative overflow-hidden border border-white/5 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgb(251 191 36 / 15%) 0%, rgb(217 119 6 / 6%) 50%, rgb(20 20 23 / 95%) 100%)',
          }}
        >
          {/* Inner ambient glows */}
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-yellow-600/5 blur-3xl pointer-events-none" />

          {/* Heading */}
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight max-w-2xl font-bold text-white z-10"
            style={{ fontFamily: 'var(--font-inter, sans-serif)' }}
          >
            Ready to turn your professional story into a stunning site?
          </h2>

          {/* Action button */}
          <div className="z-10 mt-2">
            <Link href="/workspace">
              <button 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-100 shadow-xl"
                style={{
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-text-invert)',
                  boxShadow: 'var(--shadow-brand)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand-hover)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px rgb(251 191 36 / 0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-brand)';
                }}
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Sub-label */}
          <p className="text-xs text-zinc-400 z-10">
            No credit card required. Generate in under 60 seconds.
          </p>

        </div>
      </div>
    </section>
  )
}

export default CTA
