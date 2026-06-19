'use client';
import { Button } from '@/components/ui/button'
import UserDetailContext from '@/context/UserDetailContext';
import { SignInButton, useAuth, useUser } from '@clerk/nextjs';
import axios from 'axios';
import { ArrowUp, BrainCircuit, Cloud, Code2, Database, GraduationCap, ImagePlus, Layout, LayoutDashboard, Loader2Icon, Palette, Rocket, ShoppingCart, Smartphone, Sparkles, User } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react'
import { toast } from 'sonner';
import { Loader } from '@/components/ui/loader';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AI_MODELS } from '@/config/models';
import Image from 'next/image';

function Hero() {
  const router = useRouter()
  const [userInput, setUserInput] = useState<string>()
  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(false)
  const context = useContext(UserDetailContext)
  const [selectedModel, setSelectedModel] = useState(
    "google/gemma-4-26b-a4b-it"
  );

  if (!context) {
    throw new Error("UserDetailContext not provided")
  }

  const { userDetail, setUserDetail } = context
  const { has } = useAuth()
  const hasUnlimitedAcess = has({ plan: 'pro' })

  const CreateNewProject = async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    if (!hasUnlimitedAcess && userDetail?.credits! <= 0) {
      toast.error("You have no credits left. Please upgrade to unlimited")
      return;
    }

    if (!userInput?.trim()) {
      toast.error("Please describe your portfolio first.")
      return;
    }

    setLoading(true)
    const messages = [{
      role: "user",
      content: userInput
    }]
    try {
      // 2.5 — IDs are now generated server-side; we read them from the response
      const result = await axios.post("/api/projects", {
        messages: messages,
        credits: userDetail?.credits,
        model: selectedModel
      })

      toast.success('Project created')
      if (!hasUnlimitedAcess && userDetail) {
        setUserDetail({
          ...userDetail,
          credits: userDetail.credits - 1
        })
      }
      // Use the IDs the server generated and returned
      const { projectId, frameId } = result.data
      router.push(`/playground/${projectId}?frameId=${frameId}`)
      setLoading(false)
    } catch (error) {
      toast.error("Internal server error")
      console.log(error)
      setLoading(false)
    }
  }

  const suggestions = [
    {
      label: "AI Engineer",
      prompt:
        "Create a premium personal portfolio for an AI Engineer with hero, profile image, about, skills, AI projects, experience, certifications and contact section using a modern dark theme.",
      icon: BrainCircuit,
    },
    {
      label: "Student",
      prompt:
        "Create a modern personal portfolio for a Computer Science student with hero, education, skills, projects, achievements, certifications and contact section.",
      icon: GraduationCap,
    },
    {
      label: "Full Stack Developer",
      prompt:
        "Create a premium portfolio for a Full Stack Developer showcasing experience, tech stack, featured projects, GitHub links and contact section.",
      icon: Code2,
    },
    {
      label: "UI/UX Designer",
      prompt:
        "Create a creative portfolio for a UI/UX Designer with hero, about, case studies, selected work, design process and contact section.",
      icon: Palette,
    },
    {
      label: "Mobile Developer",
      prompt:
        "Create a modern portfolio for a Mobile App Developer showcasing Flutter and React Native projects, skills and experience.",
      icon: Smartphone,
    },
    {
      label: "Data Scientist",
      prompt:
        "Create a premium portfolio for a Data Scientist with machine learning projects, research, skills, education and contact information.",
      icon: Database,
    },
    {
      label: "DevOps Engineer",
      prompt:
        "Create a professional portfolio for a DevOps Engineer highlighting cloud infrastructure, Kubernetes, CI/CD projects and certifications.",
      icon: Cloud,
    },
    {
      label: "Startup Founder",
      prompt:
        "Create a personal portfolio for a Startup Founder highlighting journey, startups, products, achievements and contact section.",
      icon: Rocket,
    },
  ];

  if (!isLoaded) {
    return <div className='flex items-center justify-center h-[80vh]'><Loader /></div>
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[calc(100dvh-4rem)] lg:min-h-[80vh] px-4 sm:px-6 py-8 sm:py-12 text-center">

      {/* Background Gradient */}
      <div className="absolute -top-32 sm:-top-48 lg:-top-60 left-1/2 -translate-x-1/2 h-[320px] w-[320px] sm:h-[500px] sm:w-[500px] lg:h-[800px] lg:w-[800px] rounded-full bg-blue-500 opacity-20 blur-3xl -z-10 pointer-events-none" />

      {/* Bottom left blob */}
      <div className="absolute -bottom-20 -left-20 sm:bottom-0 sm:left-10 lg:left-20 h-[240px] w-[240px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px] rounded-full bg-purple-500 opacity-20 blur-3xl -z-10 pointer-events-none" />

      {/* header & description */}
      <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight">
        Create a Portfolio That
        <span className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
          {" "}Gets You Hired
        </span>
      </h2>

      <p className="text-sm sm:text-base md:text-xl text-gray-300 mt-5 max-w-2xl mx-auto">
        Instantly generate a beautiful, professional portfolio with AI and impress recruiters, clients, and hiring managers.
      </p>

      {/* Input box */}
      <div className="w-full max-w-2xl border mt-5 sm:mt-6 p-4 sm:p-5 rounded-2xl bg-black mx-auto">
        <textarea
          placeholder="Describe how your dream website should look like"
          className="min-h-20 sm:min-h-24 w-full focus:outline-none focus:ring-0 resize-none text-white text-sm sm:text-base"
          onChange={(e) => {
            // 4.9 — Enforce max 2000 chars
            if (e.target.value.length <= 2000) {
              setUserInput(e.target.value)
            }
          }}
          value={userInput}
          maxLength={2000}
        />
        {/* 4.9 — Character counter */}
        <div className="flex justify-between items-center gap-2 mt-1 mb-1">
          <span className={`text-xs tabular-nums ${
            (userInput?.length ?? 0) >= 1800 ? 'text-red-400' : 'text-zinc-500'
          }`}>
            {userInput?.length ?? 0}/2000
          </span>
          {userInput && (userInput.trim().length < 10) && (
            <span className="text-xs text-amber-400">Please add a few more details (min 10 characters)</span>
          )}
        </div>
        <div className="flex justify-between items-center gap-2 mt-2">
          {/* Model Selector */}
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
          >
            <SelectTrigger
              aria-label="Select AI Model"
              className="
                w-[220px]
                h-11
                rounded-xl
                border border-white/10
                bg-zinc-900/80
                backdrop-blur-md
                text-white
                shadow-lg
                hover:bg-zinc-800
                transition-all
                duration-200
                focus:ring-2
                focus:ring-blue-500
              "
            >
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>

            <SelectContent className="rounded-xl bg-zinc-900 border border-white/10">
              {AI_MODELS.map((model) => (
                <SelectItem
                  key={model.id}
                  value={model.id}
                  className="cursor-pointer py-2 rounded-lg data-highlighted:bg-blue-500/20"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={model.logo}
                      alt={`${model.name} logo`}
                      width={20}
                      height={20}
                    />
                    <span>{model.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!user ? (
            <SignInButton mode="modal" forceRedirectUrl="/workspace">
              <Button
                disabled={!userInput || (userInput?.trim().length ?? 0) < 10}
                className="shrink-0"
                aria-label="Sign in to generate project"
              >
                <ArrowUp />
              </Button>
            </SignInButton>
          ) : (
            <Button
              disabled={!userInput || loading || (userInput?.trim().length ?? 0) < 10}
              onClick={CreateNewProject}
              className="shrink-0"
              aria-label="Generate AI Project"
            >
              {loading ? <Loader2Icon className="animate-spin" /> : <ArrowUp />}
            </Button>
          )}
        </div>
      </div>
      <div className="w-full max-w-4xl mx-auto mt-6">
        <div className="flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-2.5 overflow-x-auto sm:overflow-x-visible px-4 sm:px-0 scrollbar-none pb-2 sm:pb-0">
          {suggestions.map((sug, index) => (
            <Button
              key={index}
              variant="heroButton"
              size="sm"
              onClick={() => setUserInput(sug.prompt)}
              className="
                rounded-full
                h-9 sm:h-10
                px-3.5 sm:px-4
                text-xs sm:text-sm
                whitespace-nowrap
                shrink-0
                transition-all duration-200
                hover:scale-105
                active:scale-98
              "
            >
              <sug.icon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              {sug.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Hero