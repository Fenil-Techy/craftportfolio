import { TooltipProvider } from "@/components/ui/tooltip"
import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/ui/themes'
import "./globals.css";
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "CraftPortfolio — AI Portfolio Builder",
  description:
    "Generate a stunning, professional portfolio website in seconds with AI. Describe your skills and let CraftPortfolio build a premium, recruiter-ready site instantly.",
  keywords: [
    "AI portfolio builder",
    "portfolio generator",
    "AI website builder",
    "developer portfolio",
    "professional portfolio",
    "CraftPortfolio",
  ],
  authors: [{ name: "CraftPortfolio" }],
  openGraph: {
    title: "CraftPortfolio — AI Portfolio Builder",
    description:
      "Generate a stunning, professional portfolio website in seconds with AI.",
    url: "https://www.craftportfolio.online",
    siteName: "CraftPortfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CraftPortfolio — AI Portfolio Builder",
    description:
      "Generate a stunning, professional portfolio website in seconds with AI.",
  },
  metadataBase: new URL("https://www.craftportfolio.online"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" style={{backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)'}}>
      <ClerkProvider
    appearance={{
    theme: dark,
    variables: {
      colorPrimary: '#fbbf24',
      colorBackground: '#0d0d0d',
      colorForeground: '#fafaf9',
      colorMutedForeground: '#a8a29e',
      colorNeutral: '#1c1c1c',
      borderRadius: '8px',
    },
    elements: {
      card:
        "bg-[#141414] border border-white/6 shadow-xl backdrop-blur-md",
      headerTitle: "text-[#fafaf9] font-semibold",
      headerSubtitle: "text-[#a8a29e]",
      formFieldLabel: "text-[#a8a29e] font-medium text-sm",
      footerActionText: "text-[#a8a29e]",
      footerActionLink: "text-[#fbbf24] hover:text-[#fcd34d]",
      formFieldInput:
        "bg-[#0d0d0d] border border-white/6 text-[#fafaf9] focus:border-[#fbbf24] rounded-lg",
      socialButtonsBlockButton:
        "bg-[#1c1c1c] border border-white/6 hover:bg-[#262626] hover:border-[#fbbf24]/30 transition-all duration-200",
      socialButtonsBlockButtonText: "!text-[#fafaf9] font-medium",
      dividerLine: "bg-white/6",
      dividerText: "text-[#57534e] font-medium text-xs tracking-wider uppercase",
      userButtonPopoverCard:
        "bg-[#141414] border border-white/6 shadow-lg",
      userButtonPopoverActionButton:
        "text-[#fafaf9] !text-[#fafaf9] hover:bg-[#fbbf24]/10 transition-colors",
      userButtonPopoverActionButtonText: "text-[#fafaf9] !text-[#fafaf9] font-medium",
      userButtonPopoverActionButtonIcon: "text-[#fafaf9] !text-[#fafaf9] opacity-70",
      userButtonPopoverFooter:
        "bg-[#0d0d0d] border-t border-white/6",
      formButtonPrimary:
        "bg-[#fbbf24] hover:bg-[#fcd34d] text-[#0d0d0d] font-semibold shadow-lg transition-all active:scale-[0.98]",
    },
  }}
>
          <Provider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </Provider>
        </ClerkProvider>
  <Analytics/>
  <SpeedInsights/>
      </body>
    </html>
  )
}