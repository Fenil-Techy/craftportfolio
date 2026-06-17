import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'

function AppHeader() {
  return (
  <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border/40 bg-background/80 px-3 py-3 backdrop-blur-sm sm:gap-3 sm:px-5 sm:py-4">
    <SidebarTrigger className="shrink-0" />
    <div className="flex min-w-0 items-center gap-1 sm:gap-3">
      <div className="hidden sm:flex">
        <Link href="/pricing">
          <Button variant="ghost" className="text-sm text-gray-300 px-3 py-2 hover:bg-zinc-800 hover:text-white sm:text-base sm:p-3">
            Pricing
          </Button>
        </Link>
        
      </div>
      <UserButton />
    </div>
  </header>
  )
}

export default AppHeader