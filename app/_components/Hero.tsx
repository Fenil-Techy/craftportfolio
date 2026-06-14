'use client';
import { Button } from '@/components/ui/button'
import UserDetailContext from '@/context/UserDetailContext';
import { SignInButton, useAuth, useUser } from '@clerk/nextjs';
import axios from 'axios';
import { ArrowUp, ImagePlus, Layout, LayoutDashboard, Loader2Icon, ShoppingCart, Sparkles, User } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react'
import { toast } from 'sonner';
import { Loader } from '@/components/ui/loader';
import { v4 as uuidv4 } from 'uuid';
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

    setLoading(true)
    const projectId = uuidv4()
    const frameId = generateRandomFrameNumber()
    const messages = [{
      role: "user",
      content: userInput
    }]
    try {
      const result = await axios.post("/api/projects", {
        projectId: projectId,
        frameId: frameId,
        messages: messages,
        credits: userDetail?.credits,
        model: selectedModel
      })
      console.log(result.data)
      toast.success('Project created')
      router.push(`/playground/${projectId}?frameId=${frameId}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUserDetail((prev: any) => ({
        ...prev,
        credits: prev?.credits - 1
      }))
      setLoading(false)
    } catch (error) {
      toast.error("Internal server error")
      console.log(error)
    }
  }

  const suggestions = [
    {
      label: "SaaS Dashboard",
      prompt:
        "Create an analytics dashboard for a SaaS product to track users, revenue, subscriptions, and key business metrics with charts and KPIs.",
      icon: LayoutDashboard,
    },
    {
      label: "Landing Page",
      prompt:
        "Create a high-converting landing page for a startup or SaaS product with hero section, features, pricing, testimonials, and CTA.",
      icon: Layout,
    },
    {
      label: "E-commerce Store",
      prompt:
        "Build a modern e-commerce website with product listings, filters, product detail pages, cart, and checkout flow.",
      icon: ShoppingCart,
    },
    {
      label: "Portfolio Website",
      prompt:
        "Create a clean personal portfolio website to showcase projects, skills, experience, and contact information.",
      icon: User,
    },
    {
      label: "AI Startup Website",
      prompt:
        "Build a futuristic AI startup website explaining the product, features, use cases, pricing, and include a strong call-to-action.",
      icon: Sparkles,
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
      <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-3xl">
        Want to build your <br className="sm:hidden" /> own website?
      </h2>
      <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-gray-300 mt-3 sm:mt-4 max-w-xl mx-auto px-1">
        Craft your website with AI and get it done in minutes
      </p>

      {/* Input box */}
      <div className="w-full max-w-2xl border mt-5 sm:mt-6 p-4 sm:p-5 rounded-2xl bg-black mx-auto">
        <textarea
          placeholder="Describe how your dream website should looks like"
          className="min-h-20 sm:min-h-24 w-full focus:outline-none focus:ring-0 resize-none text-white text-sm sm:text-base"
          onChange={(e) => setUserInput(e.target.value)}
          value={userInput}
        />
        <div className="flex justify-between items-center gap-2 mt-2">
          {/* Model Selector */}
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
          >
            <SelectTrigger
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
                      alt={model.name}
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
              <Button disabled={!userInput} className="shrink-0">
                <ArrowUp />
              </Button>
            </SignInButton>
          ) : (
            <Button disabled={!userInput} onClick={CreateNewProject} className="shrink-0">
              {loading ? <Loader2Icon className="animate-spin" /> : <ArrowUp />}
            </Button>
          )}
        </div>
      </div>

      {/* suggestions list */}
      <div className="w-full max-w-xl mx-auto   grid grid-cols-2 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mt-5 sm:mt-6">
        {suggestions.map((sug, index) => (
          <Button
            key={index}
            variant="heroButton"
            size="xs"
            className="w-full whitespace-normal text-left sm:text-center justify-center sm:justify-center h-auto min-h-8 py-2"
            onClick={() => setUserInput(sug.prompt)}
          >
            <sug.icon className="shrink-0" />
            {sug.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default Hero

const generateRandomFrameNumber = () => {
  const num = Math.floor(Math.random() * 10000);
  return num
}