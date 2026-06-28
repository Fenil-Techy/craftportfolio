'use client'
import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { ArrowRight, Menu, X } from 'lucide-react';
import Image from 'next/image'
import Link from 'next/link';
import { useState } from 'react';

function Header() {
  const { user } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Navigation menu only contains Features and Pricing.
  // "Workspace" is only shown as a prominent Saffron action button on the right when logged in.
  const menu = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full"
      style={{
        backgroundColor: 'rgb(10 10 12 / 60%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgb(255 255 255 / 0.06)',
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3.5 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="CraftPortfolio home">
          <img src="/logo.png?v=3" alt="CraftPortfolio logo" width={32} height={32} className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-inter, sans-serif)' }}>
            Craft<span style={{ color: 'var(--color-brand)' }}>Portfolio</span>
          </span>
        </Link>

        <div className='flex justify-end'>
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {menu.map((item) => (
            <Link key={item.name} href={item.href}>
              <button
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(255 255 255 / 0.04)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                }}
              >
                {item.name}
              </button>
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/workspace">
                <button
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-150"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-text-invert)',
                    boxShadow: 'var(--shadow-brand)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand-hover)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px rgb(251 191 36 / 0.3)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-brand)';
                  }}
                >
                  Workspace
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Sign In */}
              <SignInButton mode="modal">
                <button
                  className="hidden sm:block px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(255 255 255 / 0.04)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  Sign in
                </button>
              </SignInButton>
              {/* Sign Up (Correct trigger for new registrations) */}
              <SignUpButton mode="modal" forceRedirectUrl="/workspace">
                <button
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-150"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-text-invert)',
                    boxShadow: 'var(--shadow-brand)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand-hover)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px rgb(251 191 36 / 0.3)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-brand)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-brand)';
                  }}
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </SignUpButton>
            </div>
          )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150"
            style={{ border: '1px solid rgb(255 255 255 / 0.08)', color: 'var(--color-text-secondary)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t animate-in fade-in duration-200"
          style={{ backgroundColor: 'rgb(15 15 17 / 95%)', backdropFilter: 'blur(12px)', borderColor: 'rgb(255 255 255 / 0.06)' }}
        >
          <nav className="mx-auto max-w-6xl flex flex-col px-6 py-4 gap-1">
            {menu.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-150"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(255 255 255 / 0.04)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                }}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgb(255 255 255 / 0.06)' }}>
                <Link href="/workspace" onClick={() => setMobileOpen(false)}>
                  <button
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-brand)',
                      color: 'var(--color-text-invert)',
                    }}
                  >
                    Workspace <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgb(255 255 255 / 0.06)' }}>
                <SignUpButton mode="modal" forceRedirectUrl="/workspace">
                  <button
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-brand)',
                      color: 'var(--color-text-invert)',
                    }}
                  >
                    Get Started <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </SignUpButton>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header