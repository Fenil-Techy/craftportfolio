'use client'
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { ArrowRightIcon, Menu } from 'lucide-react';
import Image from 'next/image'
import Link from 'next/link';


function Header() {
  const { user } = useUser()

  const menu = [
    {
      name: 'Workspace',
      href: '/workspace'
    },
    {
      name: 'Pricing',
      href: '/pricing'
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6  lg:w-[90%] xl:w-[80%]">

        {/* logo & name */}
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <Image
            src="/logo.png"
            alt="logo"
            width={40}
            height={40}
            className="h-7 w-7 shrink-0 sm:h-9 sm:w-9 lg:h-10 lg:w-10"
          />
          <h2 className="truncate text-sm font-bold text-white sm:text-base md:text-xl lg:text-xl">
            <span className="text-blue-400">Craft</span><span className="text-purple-400">Portfolio</span>
          </h2>
        </Link>

        {/* desktop menu */}
        <nav className="hidden lg:flex gap-1 xl:gap-3">
          {menu.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" className="text-base text-gray-300 px-4 py-4 hover:bg-zinc-800 hover:text-white">
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>

        {/* CTA + mobile menu */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <Button size="xs">
                <span className="hidden sm:inline">Get Started </span>
                <ArrowRightIcon className="size-3 sm:ml-0" />
              </Button>
            </SignInButton>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,320px)]">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <nav className="mt-8 flex flex-col gap-2">
                {menu.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button variant="ghost" className="h-11 w-full justify-start text-base text-gray-300 hover:bg-zinc-800 hover:text-white">
                      {item.name}
                    </Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Header