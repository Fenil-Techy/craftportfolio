'use client'
import React, { useState } from 'react'
import Header from '../_components/Header'
import { Check, Crown, Loader2, Sparkles, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useUser, SignInButton } from '@clerk/nextjs'
import Script from 'next/script'

// Test plan intentionally excluded from the public PLANS array
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    period: "forever",
    description: "Try it — no card needed.",
    credits: 2,
    icon: Zap,
    features: [
      "2 portfolio generations",
      "All design templates",
      "Basic AI model",
      "Instant preview",
    ],
    excluded: [
      "Live editor",
      "Watermark-free output",
      "Priority support",
    ],
    buttonText: "Current Plan",
    isFree: true,
    isPopular: false,
    accentClass: 'free',
  },
  {
    id: "pro",
    name: "Pro",
    price: "799",
    period: "one-time",
    description: "For creators who ship regularly.",
    credits: 50,
    icon: Sparkles,
    features: [
      "50 portfolio generations",
      "All AI models",
      "Live editor",
      "Priority support",
    ],
    excluded: [
      "Watermark-free output",
    ],
    buttonText: "Get Pro",
    isFree: false,
    isPopular: false,
    accentClass: 'pro',
  },
  {
    id: "elite",
    name: "Elite",
    price: "2,499",
    period: "one-time",
    description: "White-label quality. Zero compromise.",
    credits: 200,
    icon: Crown,
    features: [
      "200 portfolio generations",
      "Watermark-free output",
      "All AI models",
      "Live editor",
      "Priority support",
    ],
    excluded: [],
    buttonText: "Get Elite",
    isFree: false,
    isPopular: true,
    accentClass: 'elite',
  },
]

declare global {
  interface Window { Razorpay: any; }
}

function Pricing() {
  const { user, isLoaded } = useUser()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleCheckout = async (planId: string) => {
    if (planId === "free") return
    if (!user) {
      toast.error("Please sign in to continue.")
      return
    }
    if (!window.Razorpay) {
      toast.error("Payment SDK not loaded. Please refresh and try again.")
      return
    }
    try {
      setLoadingId(planId)
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create order")
      }
      const { order_id, amount, currency } = await res.json()
      const plan = PLANS.find((p) => p.id === planId)!
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id, amount, currency,
        name: "CraftPortfolio",
        description: `${plan.name} Plan — ${plan.credits} Credits`,
        prefill: {
          name: user.fullName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
        },
        theme: { color: '#fbbf24' },
        handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
          try {
            setLoadingId(planId)
            toast.loading("Verifying payment…", { id: "verify" })
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan: planId,
              }),
            })
            toast.dismiss("verify")
            if (!verifyRes.ok) {
              const err = await verifyRes.json()
              throw new Error(err.error || "Verification failed")
            }
            toast.success(`🎉 ${plan.name} plan activated! ${plan.credits} credits added.`)
            setTimeout(() => { window.location.href = "/workspace" }, 1500)
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed.")
            setLoadingId(null)
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled.")
            setLoadingId(null)
          },
        },
      }
      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`)
        setLoadingId(null)
      })
      rzp.open()
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.")
      setLoadingId(null)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== "undefined" && window.Razorpay) {
            try {
              const prefetchInstance = new window.Razorpay({ key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID })
              if (typeof prefetchInstance.prefetch === "function") prefetchInstance.prefetch()
            } catch { /* silent */ }
          }
        }}
      />
      <Header />

      <main className="relative flex flex-col items-center w-full px-4 sm:px-6 pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden">
        {/* Ambient glows — Saffron */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full -z-10"
          style={{ background: 'radial-gradient(ellipse, rgb(251 191 36 / 8%) 0%, transparent 70%)', filter: 'blur(48px)' }}
        />

        <div className="max-w-5xl w-full mx-auto space-y-14">

          {/* Page heading */}
          <div className="text-center space-y-3">
            <h1
              className="text-4xl sm:text-5xl tracking-tight"
              style={{
                fontFamily: 'var(--font-inter, system-ui, sans-serif)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--color-text-primary)',
              }}
            >
              Simple pricing,{' '}
              <span style={{ color: 'var(--color-brand)' }}>
                no surprises.
              </span>
            </h1>
            <p className="text-base max-w-sm mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Pay once. Credits never expire. No subscriptions.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const Icon = plan.icon
              const isElite = plan.id === 'elite'
              return (
                <div
                  key={plan.id}
                  className="relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-200"
                  style={{
                    backgroundColor: isElite ? 'var(--color-bg-raised)' : 'var(--color-bg-surface)',
                    border: isElite ? '1px solid var(--color-brand-border)' : '1px solid var(--color-border-base)',
                    boxShadow: isElite
                      ? 'var(--shadow-brand-lg), var(--shadow-md), var(--shadow-inner)'
                      : 'var(--shadow-md), var(--shadow-inner)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Popular badge */}
                  {plan.isPopular && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                      style={{
                        backgroundColor: 'var(--color-brand)',
                        color: 'var(--color-text-invert)',
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Plan icon + name */}
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                        style={{
                          backgroundColor: isElite ? 'var(--color-brand-subtle)' : 'var(--color-bg-overlay)',
                          border: isElite ? '1px solid var(--color-brand-border)' : '1px solid var(--color-border-base)',
                        }}
                      >
                        <Icon className="h-5 w-5" style={{ color: isElite ? 'var(--color-brand)' : 'var(--color-text-secondary)' }} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>{plan.name}</h2>
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{plan.description}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold" style={{ fontFamily: 'var(--font-inter, sans-serif)', color: 'var(--color-text-primary)' }}>
                          ₹{plan.price}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>/ {plan.period}</span>
                      </div>
                      <div
                        className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{
                          backgroundColor: isElite ? 'var(--color-brand-subtle)' : 'var(--color-bg-overlay)',
                          color: isElite ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                          border: isElite ? '1px solid var(--color-brand-border)' : '1px solid var(--color-border-base)',
                        }}
                      >
                        <Zap className="h-3 w-3" />
                        {plan.credits} Credits
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          <Check className="h-4 w-4 shrink-0" style={{ color: 'var(--color-success)' }} />
                          {feature}
                        </li>
                      ))}
                      {plan.excluded.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm line-through" style={{ color: 'var(--color-text-tertiary)' }}>
                          <div className="h-4 w-4 shrink-0 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--color-border-base)' }}>
                            <div className="h-1 w-2 rounded" style={{ backgroundColor: 'var(--color-border-strong)' }} />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="mt-8">
                    {plan.isFree ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-lg text-sm font-semibold cursor-default"
                        style={{
                          backgroundColor: 'var(--color-bg-overlay)',
                          color: 'var(--color-text-tertiary)',
                          border: '1px solid var(--color-border-base)',
                        }}
                      >
                        {plan.buttonText}
                      </button>
                    ) : !isLoaded ? (
                      <button disabled className="w-full py-2.5 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-overlay)' }}>
                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--color-text-secondary)' }} />
                      </button>
                    ) : !user ? (
                      <SignInButton mode="modal" forceRedirectUrl="/pricing">
                        <button
                          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-100"
                          style={{
                            backgroundColor: isElite ? 'var(--color-brand)' : 'var(--color-bg-overlay)',
                            color: isElite ? 'var(--color-text-invert)' : 'var(--color-text-primary)',
                            border: isElite ? 'none' : '1px solid var(--color-border-strong)',
                            boxShadow: isElite ? 'var(--shadow-brand)' : 'none',
                          }}
                        >
                          Sign in to purchase
                        </button>
                      </SignInButton>
                    ) : (
                      <button
                        onClick={() => handleCheckout(plan.id)}
                        disabled={loadingId !== null}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-100 disabled:opacity-50"
                        style={{
                          backgroundColor: isElite ? 'var(--color-brand)' : 'var(--color-bg-overlay)',
                          color: isElite ? 'var(--color-text-invert)' : 'var(--color-text-primary)',
                          border: isElite ? 'none' : '1px solid var(--color-border-strong)',
                          boxShadow: isElite ? 'var(--shadow-brand)' : 'none',
                        }}
                        onMouseEnter={e => {
                          if (isElite) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand-hover)';
                        }}
                        onMouseLeave={e => {
                          if (isElite) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand)';
                        }}
                      >
                        {loadingId === plan.id
                          ? <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          : plan.buttonText
                        }
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {[
              '🔒 Secure payments via Razorpay',
              '⚡ Credits never expire',
              '🎯 No subscription traps',
              '📞 Priority support for paid plans',
            ].map((item) => (
              <span key={item} className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Pricing