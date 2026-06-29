'use client'
import React from 'react'
import { Sparkles, Check } from 'lucide-react'

function HowItWorks() {
  return (
    <section id="features" className="w-full py-20 bg-transparent relative scroll-reveal">
      
      {/* Meet Section / Split Feature Layout */}
      <div className="mx-auto max-w-5xl px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Visual Mockup Container (Lovable style) */}
        <div className="w-full flex items-center justify-center lg:justify-start">
          <div 
            className="w-full max-w-md mockup-glow p-4 sm:p-5 flex flex-col gap-4"
            style={{ backgroundColor: 'rgb(20 20 23 / 80%)', backdropFilter: 'blur(12px)' }}
          >
            {/* Window control dots */}
            <div className="flex items-center gap-1.5 pb-2 border-b border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
            
            {/* Prompt Input Bubble */}
            <div className="rounded-xl p-3.5 text-xs text-left" style={{ backgroundColor: 'var(--color-bg-raised)', border: '1px solid var(--color-border-base)' }}>
              <p className="font-semibold text-zinc-400 mb-1">USER INPUT</p>
              <p className="text-zinc-200 leading-relaxed font-mono">
                {"\"Create a responsive dark portfolio for a Machine Learning engineer. Add key skill bars, recent papers, and an earthy orange brand theme.\""}
              </p>
            </div>

            {/* AI Output Stream Simulation */}
            <div className="flex items-start gap-2 text-left">
              <div 
                className="flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5"
                style={{ backgroundColor: 'var(--color-brand-subtle)', border: '1px solid var(--color-brand-border)' }}
              >
                <Sparkles className="h-3 w-3" style={{ color: 'var(--color-brand)' }} />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold text-zinc-300">AI Assistant</p>
                <div className="space-y-1.5">
                  <div className="h-2 w-3/4 bg-zinc-700/60 rounded animate-pulse" />
                  <div className="h-2 w-full bg-zinc-700/60 rounded animate-pulse" />
                  <div className="h-2 w-5/6 bg-zinc-700/60 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Live Visual Success State */}
            <div className="mt-2 flex items-center justify-between p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" /> HTML template compiled in 24.3s
              </span>
              <span className="text-[10px] text-zinc-500">v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Right Column: Key Copy Pillars */}
        <div className="space-y-10 text-left">
          
          <div>
            <h2 className="text-3xl sm:text-4xl tracking-tight leading-none mb-3" style={{ fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 700 }}>
              Meet CraftPortfolio
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              A developer-focused site generator. Turn simple text prompts into clean, deployable portfolio websites in minutes.
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand)', border: '1px solid var(--color-brand-border)' }}>
                  1
                </div>
                <div className="w-px h-10 bg-zinc-800 mt-2" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Start with an idea</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Describe your role, projects, and style. Our system parses layout frameworks to assemble standard components.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand)', border: '1px solid var(--color-brand-border)' }}>
                  2
                </div>
                <div className="w-px h-10 bg-zinc-800 mt-2" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Watch it come to life</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  See your site assemble in real-time in the live browser preview frame. Fast streaming keeps compilation clean.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand)', border: '1px solid var(--color-brand-border)' }}>
                  3
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Polished visual control</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Need modifications? Chat with the assistant to add timelines, links, or grids instantly. Drag and drop text values as you go.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

export default HowItWorks
