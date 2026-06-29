'use client';
import UserDetailContext from '@/context/UserDetailContext';
import { SignInButton, useAuth, useUser } from '@clerk/nextjs';
import axios from 'axios';
import {
  ArrowUp, BrainCircuit, Cloud, Code2, Database,
  GraduationCap, Loader2Icon, Palette, Rocket, Smartphone,
  Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react'
import { toast } from 'sonner';
import { Loader } from '@/components/ui/loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AI_MODELS } from '@/config/models';
import { isUpgradedTier } from '@/config/features';
import Image from 'next/image';

function Hero() {
  const router = useRouter()
  const [userInput, setUserInput] = useState<string>()
  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(false)
  const [enhanceLoading, setEnhanceLoading] = useState(false)
  const context = useContext(UserDetailContext)
  const [selectedModel, setSelectedModel] = useState("google/gemma-4-26b-a4b-it");

  if (!context) throw new Error("UserDetailContext not provided")

  const { userDetail, setUserDetail } = context
  const { has } = useAuth()
  const hasUnlimitedAcess = has ? has({ plan: 'pro' }) : false
  const isPro = hasUnlimitedAcess || isUpgradedTier(userDetail?.tier);

  const CreateNewProject = async () => {
    const modelConfig = AI_MODELS.find(m => m.id === selectedModel);
    if (modelConfig?.premium && !isPro) {
      toast.error(`${modelConfig.name} is a Pro feature. Please upgrade to continue.`);
      router.push("/pricing");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    if (!isPro && userDetail?.credits! <= 0) {
      toast.error("You've used all your credits. Upgrade to keep building.")
      router.push("/pricing");
      return;
    }
    if (!userInput?.trim()) {
      toast.error("Tell us about yourself first.")
      return;
    }
    setLoading(true)
    try {
      const result = await axios.post("/api/projects", {
        messages: [{ role: "user", content: userInput }],
        credits: userDetail?.credits,
        model: selectedModel
      })
      toast.success('Your portfolio is being crafted ✨')
      if (!isPro && userDetail) {
        setUserDetail({ ...userDetail, credits: userDetail.credits - 1 })
      }
      const { projectId, frameId } = result.data
      router.push(`/playground/${projectId}?frameId=${frameId}`)
      setLoading(false)
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      console.log(error)
      setLoading(false)
    }
  }

  const handleEnhancePrompt = async () => {
    if (!userInput?.trim()) {
      toast.error("Add some details first, then we'll enhance them.");
      return;
    }
    setEnhanceLoading(true);
    try {
      const result = await axios.post("/api/enhance-prompt", {
        prompt: userInput,
        model: selectedModel,
      });
      setUserInput(result.data.enhancedPrompt);
      toast.success("Prompt polished!");
    } catch (error: unknown) {
      const err = error as { response?: { status: number } };
      if (err.response?.status === 429) {
        toast.error("Too many requests. Please slow down.");
      } else {
        toast.error("Couldn't enhance prompt right now.");
      }
      console.log(error);
    } finally {
      setEnhanceLoading(false);
    }
  };

  const suggestions = [
    { label: "AI Engineer",        prompt: "Create a premium personal portfolio for an AI Engineer with hero, profile image, about, skills, AI projects, experience, certifications and contact section using a modern dark theme.", icon: BrainCircuit },
    { label: "Student",            prompt: "Create a modern personal portfolio for a Computer Science student with hero, education, skills, projects, achievements, certifications and contact section.", icon: GraduationCap },
    { label: "Full Stack Dev",     prompt: "Create a premium portfolio for a Full Stack Developer showcasing experience, tech stack, featured projects, GitHub links and contact section.", icon: Code2 },
    { label: "UI/UX Designer",     prompt: "Create a creative portfolio for a UI/UX Designer with hero, about, case studies, selected work, design process and contact section.", icon: Palette },
    { label: "Mobile Developer",   prompt: "Create a modern portfolio for a Mobile App Developer showcasing Flutter and React Native projects, skills and experience.", icon: Smartphone },
    { label: "Data Scientist",     prompt: "Create a premium portfolio for a Data Scientist with machine learning projects, research, skills, education and contact information.", icon: Database },
    { label: "DevOps Engineer",    prompt: "Create a professional portfolio for a DevOps Engineer highlighting cloud infrastructure, Kubernetes, CI/CD projects and certifications.", icon: Cloud },
    { label: "Startup Founder",   prompt: "Create a personal portfolio for a Startup Founder highlighting journey, startups, products, achievements and contact section.", icon: Rocket },
  ];



  const inputCharCount = userInput?.length ?? 0;
  const inputValid = (userInput?.trim().length ?? 0) >= 10;

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full min-h-[calc(100dvh-4rem)] lg:min-h-[82vh] px-4 sm:px-6 py-12 sm:py-16 text-center"
    >
      {/* Hero Headline */}
      <h1
        className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] max-w-4xl leading-[1.1] tracking-tight animate-fade-up"
        style={{
          fontFamily: 'var(--font-inter, system-ui, sans-serif)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.03em',
          animationDelay: '0ms',
        }}
      >
        {isLoaded && user ? (
          <>
            Welcome back,{' '}
            <span style={{ color: 'var(--color-brand)' }}>
              {user.firstName || 'Creator'}
            </span>
          </>
        ) : (
          <>
            Build a Portfolio That Gets You{' '}
            <span style={{ color: 'var(--color-brand)' }}>
              Hired.
            </span>
          </>
        )}
      </h1>

      {/* Sub-headline */}
      <p
        className="mt-5 max-w-lg text-base sm:text-lg leading-relaxed animate-fade-up text-center"
        style={{
          color: 'var(--color-text-secondary)',
          fontWeight: 400,
          animationDelay: '60ms',
        }}
      >
        {isLoaded && user
          ? "Let's build your next professional portfolio site."
          : "Describe your background. Our AI crafts a stunning, professional portfolio in under 60 seconds — no design skills needed."
        }
      </p>

      {/* Main Input Card */}
      <div
        className="w-full max-w-2xl mt-8 sm:mt-10 animate-fade-up"
        style={{ animationDelay: '120ms' }}
      >
        <div
          className="rounded-3xl p-4 sm:p-5 transition-all duration-300"
          style={{
            backgroundColor: 'rgb(20 20 23 / 70%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgb(255 255 255 / 0.08)',
            boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.5), inset 0 1px 1px rgb(255 255 255 / 0.05)',
          }}
          id="prompt-input-container"
        >
          <textarea
            placeholder="Ask CraftPortfolio to create a portfolio that..."
            className="w-full resize-none text-sm sm:text-base leading-relaxed bg-transparent placeholder:text-zinc-500"
            style={{
              minHeight: '84px',
              color: 'var(--color-text-primary)',
              caretColor: 'var(--color-brand)',
              outline: 'none',
              border: 'none',
            }}
            onFocus={() => {
              const el = document.getElementById("prompt-input-container")
              if (el) {
                el.style.borderColor = 'rgb(251 191 36 / 35%)'
                el.style.boxShadow = '0 20px 50px -12px rgb(0 0 0 / 0.5), 0 0 0 4px rgb(251 191 36 / 4%), inset 0 1px 1px rgb(255 255 255 / 0.05)'
              }
            }}
            onBlur={() => {
              const el = document.getElementById("prompt-input-container")
              if (el) {
                el.style.borderColor = 'rgb(255 255 255 / 0.08)'
                el.style.boxShadow = '0 20px 50px -12px rgb(0 0 0 / 0.5), inset 0 1px 1px rgb(255 255 255 / 0.05)'
              }
            }}
            onChange={(e) => {
              if (e.target.value.length <= 2000) setUserInput(e.target.value)
            }}
            value={userInput}
            maxLength={2000}
          />

          {/* Character count */}
          <div className="flex items-center justify-between gap-2 mt-1 mb-3">
            <span
              className="text-xs tabular-nums transition-colors duration-100"
              style={{ color: inputCharCount >= 1800 ? 'var(--color-error)' : 'var(--color-text-tertiary)' }}
            >
              {inputCharCount}/2000
            </span>
            {userInput && !inputValid && (
              <span className="text-xs" style={{ color: 'var(--color-warning)' }}>
                Add a few more details
              </span>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3">
            {/* Model Selector */}
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger
                aria-label="Select AI Model"
                className="h-10 w-auto min-w-[180px] text-sm rounded-lg transition-all duration-100"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border-base)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <SelectValue placeholder="Select AI Model" />
              </SelectTrigger>
              <SelectContent
                className="rounded-xl text-sm"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border-strong)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {AI_MODELS.map((model) => (
                  <SelectItem
                    key={model.id}
                    value={model.id}
                    className="cursor-pointer py-2 rounded-lg"
                  >
                    <div className="flex items-center justify-between w-full min-w-[160px]">
                      <div className="flex items-center gap-2.5">
                        <Image src={model.logo} alt={`${model.name} logo`} width={18} height={18} className="rounded" />
                        <span>{model.name}</span>
                      </div>
                      {model.premium && (
                        <span
                          className="ml-3 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: 'var(--color-brand-subtle)',
                            color: 'var(--color-brand)',
                            border: '1px solid var(--color-brand-border)',
                          }}
                        >
                          Pro
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action Buttons */}
            {!user ? (
              <div className="flex gap-2 shrink-0">
                <SignInButton mode="modal" forceRedirectUrl="/workspace">
                  <button
                    disabled={!inputValid}
                    aria-label="Sign in to enhance prompt"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-base)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Enhance</span>
                  </button>
                </SignInButton>
                <SignInButton mode="modal" forceRedirectUrl="/workspace">
                  <button
                    disabled={!inputValid}
                    aria-label="Sign in to generate portfolio"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--color-brand)',
                      color: 'var(--color-text-invert)',
                      boxShadow: 'var(--shadow-brand)',
                    }}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </SignInButton>
              </div>
            ) : (
              <div className="flex gap-2 shrink-0">
                <button
                  disabled={!inputValid || enhanceLoading || loading}
                  onClick={handleEnhancePrompt}
                  aria-label="Enhance Prompt"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border-base)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {enhanceLoading
                    ? <Loader2Icon className="h-4 w-4 animate-spin" />
                    : <Sparkles className="h-4 w-4" />
                  }
                  <span className="hidden sm:inline">Enhance</span>
                </button>
                <button
                  disabled={!inputValid || loading || enhanceLoading}
                  onClick={CreateNewProject}
                  aria-label="Generate Portfolio"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-text-invert)',
                    boxShadow: 'var(--shadow-brand)',
                  }}
                >
                  {loading
                    ? <Loader2Icon className="h-4 w-4 animate-spin" />
                    : <ArrowUp className="h-4 w-4" />
                  }
                  <span className="hidden sm:inline">Generate</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div
        className="w-full max-w-3xl mt-6 animate-fade-up"
        style={{ animationDelay: '240ms' }}
      >
        <div className="flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-2 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 px-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {suggestions.map((sug, index) => (
            <button
              key={index}
              onClick={() => setUserInput(sug.prompt)}
              className="inline-flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-100"
              style={{
                backgroundColor: 'var(--color-bg-raised)',
                border: '1px solid var(--color-border-base)',
                color: 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-brand-border)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-brand)';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand-subtle)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-base)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg-raised)';
              }}
            >
              <sug.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {sug.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Hero