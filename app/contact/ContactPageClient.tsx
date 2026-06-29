'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ContactPageClient() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('submitting')
    const subject = encodeURIComponent(formData.subject || 'Contact Form Inquiry')
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )
    window.location.href = `mailto:fenilkapopara34@gmail.com?subject=${subject}&body=${body}`
    setFormState('success')
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{ borderColor: 'var(--color-border-base)', backgroundColor: 'var(--color-bg-surface)' }}
      >
        <div className="mx-auto max-w-4xl px-6 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z" stroke="#fbbf24" strokeWidth="1.4"/>
                <path d="M3 5l7 6 7-6" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--color-brand)' }}>Support</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: 'var(--font-inter, sans-serif)' }}>
            Contact Us
          </h1>
          <p className="text-base max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
            Have a question, feedback, or need help? We&apos;re here to help. Reach out and we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">

          {/* Contact Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Get in Touch
              </h2>
              <p className="text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                We typically respond within 24–48 hours on business days.
              </p>
            </div>

            <ContactInfoCard
              icon={
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z" stroke="#fbbf24" strokeWidth="1.4"/>
                  <path d="M3 5l7 6 7-6" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              }
              label="Email"
              value="fenilkapopara34@gmail.com"
              href="mailto:fenilkapopara34@gmail.com"
            />

            <ContactInfoCard
              icon={
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="#fbbf24" strokeWidth="1.4"/>
                  <path d="M10 6v4l3 3" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              }
              label="Response Time"
              value="Within 24–48 hours"
            />

            <div
              className="p-4 rounded-xl text-sm"
              style={{
                backgroundColor: 'rgba(251,191,36,0.06)',
                border: '1px solid rgba(251,191,36,0.15)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <p className="font-medium mb-1" style={{ color: 'var(--color-brand)' }}>💡 Quick Links</p>
              <ul className="space-y-1.5 mt-2">
                <li>
                  <Link href="/privacy-policy" className="hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3">
            <div
              className="p-8 rounded-2xl"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-base)',
              }}
            >
              {formState === 'success' ? (
                <div className="text-center py-10">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)' }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Message Sent!
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Your email client has opened. We&apos;ll get back to you within 24–48 hours.
                  </p>
                  <button
                    onClick={() => setFormState('idle')}
                    className="mt-6 px-4 py-2 text-sm rounded-lg font-medium transition-all"
                    style={{ backgroundColor: 'var(--color-brand)', color: '#0d0d0d' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField label="Your Name" id="contact-name" required>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-3 py-2.5 rounded-lg text-sm transition-all outline-none"
                        style={{
                          backgroundColor: 'var(--color-bg-base)',
                          border: '1px solid var(--color-border-base)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                    </FormField>
                    <FormField label="Email Address" id="contact-email" required>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2.5 rounded-lg text-sm transition-all outline-none"
                        style={{
                          backgroundColor: 'var(--color-bg-base)',
                          border: '1px solid var(--color-border-base)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                    </FormField>
                  </div>

                  <FormField label="Subject" id="contact-subject" required>
                    <select
                      id="contact-subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-lg text-sm transition-all outline-none"
                      style={{
                        backgroundColor: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border-base)',
                        color: formData.subject ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                      }}
                    >
                      <option value="" disabled>Select a subject…</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing & Payments">Billing &amp; Payments</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Other">Other</option>
                    </select>
                  </FormField>

                  <FormField label="Message" id="contact-message" required>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your question or issue in detail…"
                      className="w-full px-3 py-2.5 rounded-lg text-sm transition-all outline-none resize-none"
                      style={{
                        backgroundColor: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border-base)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </FormField>

                  <button
                    id="contact-submit"
                    type="submit"
                    disabled={formState === 'submitting'}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold transition-all duration-150 disabled:opacity-60"
                    style={{
                      backgroundColor: 'var(--color-brand)',
                      color: '#0d0d0d',
                      boxShadow: '0 0 20px rgba(251,191,36,0.2)',
                    }}
                  >
                    {formState === 'submitting' ? 'Opening email…' : 'Send Message'}
                    {formState !== 'submitting' && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  <p className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                    This will open your email client with a pre-filled message.
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function ContactInfoCard({
  icon, label, value, href
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}) {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-base)',
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: 'rgba(251,191,36,0.08)' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{label}</p>
        {href ? (
          <a href={href} className="text-sm font-medium hover:underline" style={{ color: 'var(--color-text-primary)' }}>
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
        )}
      </div>
    </div>
  )
}

function FormField({
  label, id, required, children
}: {
  label: string
  id: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
        {label} {required && <span style={{ color: 'var(--color-brand)' }}>*</span>}
      </label>
      {children}
    </div>
  )
}
