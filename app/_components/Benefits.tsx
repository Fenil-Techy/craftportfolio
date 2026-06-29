'use client'
import React from 'react'
import { Check, Sparkles, AppWindow, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function Benefits() {
  const points = [
    "No hosting setups, no config files",
    "Clean standalone Tailwind code exports",
    "Tailored layouts built by advanced models",
    "SEO ready out-of-the-box"
  ]

  return (
    <section className="w-full py-20 bg-transparent relative scroll-reveal">
      <div className="mx-auto max-w-5xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Outcome Copy */}
        <div className="space-y-6 text-left">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--color-brand)' }}>
              1-Click Compilation
            </span>
            <h2 className="text-3xl sm:text-4xl tracking-tight leading-none" style={{ fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 700 }}>
              Launch a fully responsive portfolio today
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Stop wasting weekends editing config files or writing stylesheets. Describe your profile and let our AI stream a validated design template optimized for interviews.
            </p>
          </div>

          {/* Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {points.map((point) => (
              <div key={point} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>{point}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link href="/workspace">
              <button
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-100"
                style={{
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-text-invert)',
                  boxShadow: 'var(--shadow-brand)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand-hover)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand)';
                }}
              >
                Start Crafting Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* Right Column: Premium Interactive Mockup Frame */}
        <div className="w-full flex items-center justify-center lg:justify-end">
          <div 
            className="w-full max-w-md mockup-glow p-4 sm:p-5 flex flex-col gap-4 relative overflow-hidden"
            style={{ backgroundColor: 'rgb(20 20 23 / 80%)', backdropFilter: 'blur(12px)' }}
          >
            {/* Background ambient glow inside frame */}
            <div className="absolute -right-20 -bottom-20 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <AppWindow className="h-4 w-4 text-zinc-500" />
                <span className="text-[10px] text-zinc-400 font-mono">Live Editor Preview</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] text-zinc-500 font-medium">Sync Active</span>
              </div>
            </div>

            {/* Profile Showcase Card */}
            <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5 flex flex-col gap-3 text-left relative">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border border-white/10 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Alex Rivera</h4>
                  <p className="text-[9px] text-zinc-500">Machine Learning Engineer</p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                {"\"Deploying transformer models for real-time natural language benchmarks.\""}
              </p>

              {/* Floating Settings bubble mockup */}
              <div 
                className="absolute -right-4 -bottom-2 sm:-right-6 sm:bottom-2 rounded-xl p-2 sm:p-2.5 shadow-xl border border-brand-border/40 flex items-center gap-2 select-none animate-bounce"
                style={{
                  backgroundColor: 'var(--color-bg-raised)',
                  backgroundImage: 'linear-gradient(135deg, rgb(251 191 36 / 10%), transparent)',
                  animationDuration: '4s'
                }}
              >
                <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--color-brand)' }} />
                <span className="text-[9px] font-semibold text-zinc-200">Add project tag list</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Benefits
