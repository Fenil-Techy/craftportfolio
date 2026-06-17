import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'
import { AppSidebar } from './_components/app-sidebar'
import AppHeader from './_components/AppHeader'
import Hero from '../_components/Hero'

function WorkSpaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
  <AppSidebar />

  <div className="relative w-full overflow-hidden">
    {/* Background */}
    <AppHeader />
   

    <Hero/>
  </div>
</SidebarProvider>
  )
}

export default WorkSpaceLayout